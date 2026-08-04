import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Cpu,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  TrendingUp,
  Briefcase,
  Palette,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type Subject } from '../data/mockData';
import { fetchSubjects } from '../services/catalogService';
import { chatWithGLMStream } from '../services/glmService';
import {
  buildGroupTitle,
  conversationsInContext,
  createConversation,
  deleteConversation,
  insertMessage,
  listConversations,
  listMessages,
  sameContext,
} from '../services/conversationService';
import { useAuthStore } from '../store/authStore';
import {
  GOAL_OPTIONS,
  conversationTagLabel,
  goalLabel,
  modeIntro,
  subjectTagLabel,
  type ChatMessageRecord,
  type ClientAction,
  type Conversation,
  type ConversationGoal,
} from '../types/agent';
import { stripMarkdown } from '../utils/plainText';

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5" />,
  Calculator: <Calculator className="w-5 h-5" />,
  Atom: <Atom className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  Dna: <Dna className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
};

const SUGGESTIONS: Record<ConversationGoal, string[]> = {
  career: ['我适合哪些职业方向？', '计算机专业常见职业路径', '如何补齐实习能力缺口'],
  courses: ['推荐入门课程', '有没有财务报表相关课程', '帮我找数据分析课'],
  training: ['带我去职业实训看看', '推荐一门可测验的实训课', '开始财务报表分析测验'],
  free: ['介绍一下数据科学', '怎么开始学算法', '给我一份一周学习计划'],
};

function getMessageActions(message: ChatMessageRecord): ClientAction[] {
  const raw = message.payload?.actions;
  return Array.isArray(raw) ? (raw as ClientAction[]) : [];
}

type PendingSwitch = { goal: ConversationGoal; subjectId: string | null };

const Agent = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const subjectsRef = useRef<Subject[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [goal, setGoal] = useState<ConversationGoal>('career');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [contextReady, setContextReady] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState('思考中…');
  const [streamingText, setStreamingText] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');
  const [pendingOpen, setPendingOpen] = useState<Extract<ClientAction, { type: 'open_resource' }> | null>(
    null
  );

  const applyActions = useCallback(
    (actions: ClientAction[]) => {
      const openAction = actions.find((a) => a.type === 'open_resource');
      const quizAction = actions.find((a) => a.type === 'start_quiz');
      const navAction = actions.find((a) => a.type === 'navigate');

      if (openAction && openAction.type === 'open_resource') {
        setPendingOpen(openAction);
        return;
      }

      const targetPath =
        quizAction && quizAction.type === 'start_quiz'
          ? quizAction.path
          : navAction && navAction.type === 'navigate'
            ? navAction.path
            : null;

      if (targetPath) {
        window.setTimeout(() => navigate(targetPath), 500);
      }
    },
    [navigate]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId]
  );

  const displayGoal = pendingSwitch?.goal ?? goal;
  const displaySubjectId = pendingSwitch ? pendingSwitch.subjectId : selectedSubjectId;
  const subjectChipActive = contextReady || Boolean(pendingSwitch);
  const goalMeta = GOAL_OPTIONS.find((g) => g.id === displayGoal) ?? GOAL_OPTIONS[0];

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
    [messages]
  );

  const subjectNameOf = useCallback(
    (subjectId: string | null) => subjectsRef.current.find((s) => s.id === subjectId)?.name ?? null,
    []
  );

  const refreshConversations = useCallback(async () => {
    const list = await listConversations();
    setConversations(list);
    return list;
  }, []);

  const loadConversation = useCallback(async (conversation: Conversation) => {
    setActiveId(conversation.id);
    setGoal(conversation.goal);
    setSelectedSubjectId(conversation.subject_id);
    setContextReady(true);
    setPendingSwitch(null);
    setMessagesLoading(true);
    setMessages([]);
    try {
      const rows = await listMessages(conversation.id);
      setMessages(rows);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const ensureSession = useCallback(
    async (nextGoal: ConversationGoal, nextSubjectId: string | null, forceNew = false) => {
      if (!user) return null;

      const list = await refreshConversations();
      const group = conversationsInContext(list, nextGoal, nextSubjectId);
      if (!forceNew && group.length > 0) {
        await loadConversation(group[0]);
        return group[0];
      }

      const subjectName = subjectNameOf(nextSubjectId);
      const title = buildGroupTitle(nextGoal, subjectName, group.length + 1);
      const created = await createConversation({
        userId: user.id,
        goal: nextGoal,
        subjectId: nextSubjectId,
        title,
      });

      const intro = modeIntro(nextGoal, subjectName);
      await insertMessage({
        conversationId: created.id,
        userId: user.id,
        role: 'assistant',
        content: intro,
        payload: { intro: true },
      });

      await refreshConversations();
      await loadConversation(created);
      return created;
    },
    [user, refreshConversations, loadConversation, subjectNameOf]
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        setListLoading(true);
        setError('');

        const [subjectRows, list] = await Promise.all([fetchSubjects(), listConversations()]);
        if (cancelled) return;

        subjectsRef.current = subjectRows;
        setSubjects(subjectRows);
        setConversations(list);
        setListLoading(false);

        if (list.length > 0) {
          await loadConversation(list[0]);
        } else {
          setActiveId(null);
          setMessages([]);
          setGoal('career');
          setSelectedSubjectId(null);
          setContextReady(false);
          setMessagesLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载会话失败，请确认已执行 conversations 迁移 SQL');
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loadConversation]);

  const beginFirstSession = (nextGoal: ConversationGoal, nextSubjectId: string | null) => {
    void (async () => {
      try {
        setSwitching(true);
        setError('');
        setGoal(nextGoal);
        setSelectedSubjectId(nextSubjectId);
        await ensureSession(nextGoal, nextSubjectId);
      } catch (e) {
        setError(e instanceof Error ? e.message : '创建会话失败');
      } finally {
        setSwitching(false);
      }
    })();
  };

  const requestContextChange = (nextGoal: ConversationGoal, nextSubjectId: string | null) => {
    if (!contextReady || !activeConversation) {
      beginFirstSession(nextGoal, nextSubjectId);
      return;
    }

    if (sameContext(activeConversation, nextGoal, nextSubjectId)) {
      setPendingSwitch(null);
      return;
    }

    setPendingSwitch({ goal: nextGoal, subjectId: nextSubjectId });
  };

  const handleGoalClick = (nextGoal: ConversationGoal) => {
    if (!contextReady || !activeConversation) {
      setGoal(nextGoal);
      setPendingSwitch(null);
      return;
    }
    const subjectId = pendingSwitch ? pendingSwitch.subjectId : selectedSubjectId;
    requestContextChange(nextGoal, subjectId);
  };

  const handleSubjectClick = (nextSubjectId: string | null) => {
    if (!contextReady || !activeConversation) {
      beginFirstSession(goal, nextSubjectId);
      return;
    }
    const nextGoal = pendingSwitch ? pendingSwitch.goal : goal;
    requestContextChange(nextGoal, nextSubjectId);
  };

  const confirmSwitch = async () => {
    if (!pendingSwitch) return;
    try {
      setSwitching(true);
      setError('');
      await ensureSession(pendingSwitch.goal, pendingSwitch.subjectId);
    } catch (e) {
      setError(e instanceof Error ? e.message : '切换会话失败');
    } finally {
      setSwitching(false);
    }
  };

  const handleNewConversation = async () => {
    if (!user || !contextReady) return;
    try {
      setSwitching(true);
      setError('');
      await ensureSession(goal, selectedSubjectId, true);
      setInputMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建会话失败');
    } finally {
      setSwitching(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!user) return;
    try {
      await deleteConversation(id);
      const list = await refreshConversations();
      if (activeId === id) {
        if (list.length > 0) {
          await loadConversation(list[0]);
        } else {
          setActiveId(null);
          setMessages([]);
          setContextReady(false);
          setGoal('career');
          setSelectedSubjectId(null);
          setPendingSwitch(null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除会话失败');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !activeId || isLoading || !contextReady) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setStreamStatus('思考中…');
    setStreamingText('');
    setError('');

    try {
      const userRow = await insertMessage({
        conversationId: activeId,
        userId: user.id,
        role: 'user',
        content: text,
        payload: {},
      });
      setMessages((prev) => [...prev, userRow]);

      const history = [...messages, userRow]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .filter((m) => m.id !== userRow.id)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content ?? '',
        }));

      const reply = await chatWithGLMStream(text, selectedSubject, history, goal, {
        onStatus: (event) => {
          setStreamStatus(event.label || '思考中…');
          if (event.reset) {
            setStreamingText('');
          }
        },
        onDelta: (delta) => {
          setStreamingText((prev) => prev + delta);
        },
      });

      const plainContent = stripMarkdown(reply.content);
      setStreamingText(plainContent);

      const assistantRow = await insertMessage({
        conversationId: activeId,
        userId: user.id,
        role: 'assistant',
        content: plainContent,
        payload: { actions: reply.actions },
      });
      setMessages((prev) => [...prev, assistantRow]);
      setStreamingText('');
      applyActions(reply.actions);
      await refreshConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败');
      setStreamingText('');
    } finally {
      setIsLoading(false);
      setStreamStatus('思考中…');
    }
  };

  const pendingLabel = pendingSwitch
    ? conversationTagLabel(pendingSwitch.goal, subjectNameOf(pendingSwitch.subjectId))
    : '';

  return (
    <div className="pt-16 h-screen overflow-hidden relative">
      {/* Decorative shapes */}
      <div className="fixed top-20 right-4 w-48 h-48 rounded-kraken-half pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle at 40% 35%, rgba(113,50,245,0.12) 0%, transparent 65%)' }} />
      <div className="fixed bottom-8 left-4 w-40 h-40 rounded-kraken-half pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle at 35% 30%, rgba(87,65,216,0.10) 0%, transparent 60%)' }} />

      <div className="flex h-full relative z-10">
        <aside className="fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-kraken-border p-4 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-kraken-ink">会话</h2>
            <button
              type="button"
              onClick={() => void handleNewConversation()}
              disabled={!contextReady || switching}
              className="inline-flex items-center gap-1 h-9 rounded-kraken bg-kraken-primary px-3 text-sm text-white font-medium hover:bg-kraken-primary-deep disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {listLoading ? (
              <p className="text-sm text-kraken-muted px-2">加载中…</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-kraken-muted px-2">选择模式与学科后开始</p>
            ) : (
              conversations.map((c) => {
                const tag = conversationTagLabel(c.goal, subjectNameOf(c.subject_id));
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2 rounded-kraken-lg px-3 py-2 transition-colors ${
                      activeId === c.id
                        ? 'bg-kraken-primary-subtle text-kraken-ink'
                        : 'hover:bg-kraken-surface-soft text-kraken-neutral'
                    }`}
                  >
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left"
                      onClick={() => void loadConversation(c)}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span className="truncate text-sm font-medium">{c.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-kraken-muted truncate">{tag}</p>
                    </button>
                    <button
                      type="button"
                      title="删除会话"
                      onClick={() => void handleDeleteConversation(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-kraken-muted hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <p className="mt-6 text-xs text-kraken-muted leading-relaxed px-1">
            每个会话带「模式 · 学科」标签；切换标签会保留当前聊天。
          </p>
        </aside>

        <div className="flex-1 flex flex-col h-full ml-72">
          <div className="p-4 border-b border-kraken-border bg-white/90 backdrop-blur">
            <div className="flex flex-wrap gap-2 mb-3">
              {GOAL_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={switching}
                  onClick={() => handleGoalClick(item.id)}
                  className={`px-4 py-2 rounded-kraken-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    displayGoal === item.id
                      ? 'bg-kraken-primary-subtle text-kraken-ink'
                      : 'bg-transparent border border-kraken-border text-kraken-neutral'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-kraken-neutral mb-3">{goalMeta.hint}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={switching}
                onClick={() => handleSubjectClick(null)}
                className={`px-3 py-1.5 rounded-kraken-full text-xs disabled:opacity-50 ${
                  subjectChipActive && displaySubjectId === null
                    ? 'bg-kraken-primary-subtle text-kraken-ink ring-1 ring-kraken-primary'
                    : 'bg-kraken-surface-soft text-kraken-neutral hover:bg-kraken-primary/15'
                }`}
              >
                不限学科
              </button>
              {subjects.map((subject) => {
                const active = subjectChipActive && displaySubjectId === subject.id;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    disabled={switching}
                    onClick={() => handleSubjectClick(subject.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-kraken text-xs transition-colors disabled:opacity-50 ${
                      active
                        ? 'bg-kraken-primary-subtle text-kraken-ink ring-1 ring-kraken-primary'
                        : 'bg-kraken-surface-soft text-kraken-neutral hover:bg-kraken-surface-soft'
                    }`}
                  >
                    {iconMap[subject.icon]}
                    {subject.name}
                  </button>
                );
              })}
            </div>

            {pendingSwitch && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-kraken bg-kraken-surface-soft px-3 py-2 text-sm text-kraken-neutral">
                <span>
                  切换到「{pendingLabel}」？当前对话会保留在侧栏。
                </span>
                <button
                  type="button"
                  disabled={switching}
                  onClick={() => setPendingSwitch(null)}
                  className="rounded-kraken px-3 py-1 bg-white text-kraken-neutral hover:bg-white/80"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={switching}
                  onClick={() => void confirmSwitch()}
                  className="rounded-kraken px-3 py-1 bg-kraken-primary text-white hover:bg-kraken-primary-deep"
                >
                  {switching ? '切换中…' : '确认切换'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mt-3 p-3 rounded-kraken bg-red-50 text-kraken-error text-sm">{error}</div>
          )}

          {!contextReady ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-24 h-24 rounded-full bg-kraken-primary-subtle flex items-center justify-center mx-auto mb-6">
                  <Cpu className="w-10 h-10 text-kraken-primary" />
                </div>
                <h2 className="text-2xl font-bold text-kraken-ink mb-3">选择模式与学科</h2>
                <p className="text-kraken-neutral max-w-md mx-auto">
                  上方先选模式（默认职业规划），再点学科或「不限学科」，即可创建带标签的会话。
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 p-6 overflow-y-auto">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center text-kraken-muted">
                    正在加载消息…
                  </div>
                ) : visibleMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-kraken-primary-subtle flex items-center justify-center mb-6">
                      <MessageSquare className="w-8 h-8 text-kraken-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-kraken-ink mb-2">
                      {goalLabel(goal)} · {subjectTagLabel(selectedSubject?.name)}
                    </h3>
                    <p className="text-kraken-neutral mb-6 max-w-md">可以直接提问，或点下面的示例。</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {SUGGESTIONS[goal].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setInputMessage(q)}
                          className="px-4 py-2 rounded-kraken-full bg-kraken-canvas border border-kraken-border text-kraken-neutral text-sm hover:bg-kraken-surface-soft"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleMessages.map((message) => {
                      const actions = getMessageActions(message);
                      return (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-[70%] space-y-2">
                            <div
                              className={`p-4 rounded-kraken-xl whitespace-pre-wrap ${
                                message.role === 'user'
                                  ? 'bg-kraken-primary text-white'
                                  : 'text-kraken-neutral bg-kraken-surface-soft'
                              }`}
                            >
                              {message.role === 'assistant'
                                ? stripMarkdown(message.content ?? '')
                                : message.content}
                            </div>
                            {message.role === 'assistant' && actions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {actions.map((action) => {
                                  if (action.type === 'open_resource') {
                                    return (
                                      <button
                                        key={`open-${action.url}`}
                                        type="button"
                                        onClick={() => setPendingOpen(action)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-kraken-full bg-kraken-canvas border border-kraken-border text-sm text-kraken-neutral hover:bg-kraken-surface-soft"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        打开「{action.title}」
                                      </button>
                                    );
                                  }
                                  const path = action.path;
                                  const label =
                                    action.type === 'start_quiz'
                                      ? action.label || `开始「${action.courseTitle}」测验`
                                      : action.label || `前往 ${action.path}`;
                                  return (
                                    <button
                                      key={`${action.type}-${path}`}
                                      type="button"
                                      onClick={() => navigate(path)}
                                      className="px-3 py-1.5 rounded-kraken bg-kraken-canvas border border-kraken-border text-sm text-kraken-neutral hover:bg-kraken-surface-soft"
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%] space-y-2">
                          {streamingText ? (
                            <div className="text-kraken-neutral p-4 rounded-kraken-xl whitespace-pre-wrap bg-kraken-surface-soft">
                              {stripMarkdown(streamingText)}
                              <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-kraken-neutral animate-pulse" />
                            </div>
                          ) : (
                            <div className="bg-white text-kraken-neutral p-4 rounded-kraken-xl shadow-kraken">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <span className="w-2 h-2 bg-kraken-neutral rounded-full animate-bounce" />
                                  <span
                                    className="w-2 h-2 bg-kraken-neutral rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                  />
                                  <span
                                    className="w-2 h-2 bg-kraken-neutral rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                  />
                                </div>
                                <span className="text-sm text-kraken-neutral">{streamStatus}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-kraken-border bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder="试试：推荐软件工程师学习路径 / 开始财务报表分析测验"
                    className="flex-1 h-11 px-4 rounded-kraken bg-kraken-canvas border border-kraken-border outline-none focus:ring-2 focus:ring-kraken-primary/30 text-kraken-ink"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={
                      !inputMessage.trim() ||
                      isLoading ||
                      listLoading ||
                      messagesLoading ||
                      !activeId ||
                      Boolean(pendingSwitch)
                    }
                    className="h-11 px-6 rounded-kraken bg-kraken-primary text-white font-semibold flex items-center justify-center hover:bg-kraken-primary-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {pendingOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-kraken-xl border border-kraken-border bg-white p-6 shadow-kraken">
            <h3 className="text-lg font-bold text-kraken-ink">打开外部学习资源？</h3>
            <p className="mt-2 text-sm text-kraken-neutral">
              即将离开本站，打开「{pendingOpen.title}」：
            </p>
            <p className="mt-2 break-all text-xs text-kraken-muted">{pendingOpen.url}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingOpen(null)}
                className="flex-1 rounded-kraken bg-kraken-surface-soft py-3 text-kraken-ink font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(pendingOpen.url, '_blank', 'noopener,noreferrer');
                  setPendingOpen(null);
                }}
                className="flex-1 rounded-kraken bg-kraken-primary py-3 text-white font-semibold"
              >
                确认打开
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;
