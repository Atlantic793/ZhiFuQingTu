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
  ChevronDown,
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
  courses: [],
  training: [],
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
    setShowScrollButton(false);
  }, [messages, streamingText]);

  // 滚动时检查是否显示"回到底部"按钮
  const handleChatScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 30);
  }, []);

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
    const filtered = list.filter((c) => c.goal === 'career' || c.goal === 'free');
    setConversations(filtered);
    return filtered;
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
        const agentList = list.filter((c) => c.goal === 'career' || c.goal === 'free');
        setConversations(agentList);
        setListLoading(false);

        if (agentList.length > 0) {
          await loadConversation(agentList[0]);
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
      {/* Clay blobs */}
      <div className="fixed top-16 right-4 w-36 h-36 rounded-[50%_55%_45%_50%] pointer-events-none opacity-65"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-8 left-4 w-28 h-28 rounded-[55%_40%_55%_45%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-1/3 left-8 w-20 h-20 rounded-[45%_55%_55%_45%] pointer-events-none opacity-45"
        style={{ background: 'radial-gradient(circle at 40% 30%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-1/4 right-8 w-24 h-24 rounded-[55%_45%_50%_50%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-[50%] left-[45%] w-16 h-16 rounded-[50%_55%_50%_45%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #f8e8a0 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-[25%] right-[30%] w-14 h-14 rounded-[55%_45%_55%_45%] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 35% 30%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />

      <div className="flex h-full relative z-10">
        <aside className="fixed top-16 left-0 bottom-0 w-72 bg-white/50 border-r border-claude-hairline p-4 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-claude-ink">会话</h2>
            <button
              type="button"
              onClick={() => void handleNewConversation()}
              disabled={!contextReady || switching}
              className="inline-flex items-center gap-1 h-9 rounded-claude-md bg-claude-primary px-3 text-sm text-claude-on-primary hover:bg-opacity-90 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {listLoading ? (
              <p className="text-sm text-claude-muted-soft px-2">加载中…</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-claude-muted-soft px-2">选择模式与学科后开始</p>
            ) : (
              conversations.map((c) => {
                const tag = conversationTagLabel(c.goal, subjectNameOf(c.subject_id));
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2 rounded-claude-md px-3 py-2 transition-colors ${
                      activeId === c.id
                        ? 'bg-claude-surface-cream-strong text-claude-ink'
                        : 'hover:bg-claude-surface-soft text-claude-body'
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
                      <p className="mt-1 text-[11px] text-claude-muted-soft truncate">{tag}</p>
                    </button>
                    <button
                      type="button"
                      title="删除会话"
                      onClick={() => void handleDeleteConversation(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-claude-muted-soft hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <p className="mt-6 text-xs text-claude-muted-soft leading-relaxed px-1">
            每个会话带「模式 · 学科」标签；切换标签会保留当前聊天。
          </p>
        </aside>

        <div className="flex-1 flex flex-col h-full ml-72">
          <div className="p-4 border-b border-claude-hairline bg-white/80 backdrop-blur">
            <div className="flex flex-wrap gap-2 mb-3">
              {GOAL_OPTIONS.filter((g) => g.id === 'career' || g.id === 'free').map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={switching}
                  onClick={() => handleGoalClick(item.id)}
                  className={`px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors disabled:opacity-50 ${
                    displayGoal === item.id
                      ? 'bg-claude-surface-cream-strong text-claude-ink'
                      : 'bg-transparent border border-claude-hairline text-claude-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-claude-muted mb-3">{goalMeta.hint}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={switching}
                onClick={() => handleSubjectClick(null)}
                className={`px-3 py-1.5 rounded-claude-pill text-xs disabled:opacity-50 ${
                  subjectChipActive && displaySubjectId === null
                    ? 'bg-claude-surface-cream-strong text-claude-ink ring-1 ring-claude-primary'
                    : 'bg-claude-surface-card text-claude-muted hover:bg-claude-primary/15'
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 ${
                      active
                        ? 'bg-claude-surface-cream-strong text-claude-ink ring-1 ring-claude-primary'
                        : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft'
                    }`}
                  >
                    {iconMap[subject.icon]}
                    {subject.name}
                  </button>
                );
              })}
            </div>

            {pendingSwitch && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-claude-md bg-claude-surface-soft px-3 py-2 text-sm text-claude-body">
                <span>
                  切换到「{pendingLabel}」？当前对话会保留在侧栏。
                </span>
                <button
                  type="button"
                  disabled={switching}
                  onClick={() => setPendingSwitch(null)}
                  className="rounded-lg px-3 py-1 bg-white text-claude-muted hover:bg-white/80"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={switching}
                  onClick={() => void confirmSwitch()}
                  className="rounded-lg px-3 py-1 bg-claude-primary text-claude-on-primary hover:bg-opacity-90"
                >
                  {switching ? '切换中…' : '确认切换'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mt-3 p-3 rounded-claude-md bg-red-100 text-red-600 text-sm">{error}</div>
          )}

          {!contextReady ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-24 h-24 rounded-full bg-claude-surface-soft flex items-center justify-center mx-auto mb-6">
                  <Cpu className="w-10 h-10 text-claude-muted-soft" />
                </div>
                <h2 className="text-2xl font-bold text-claude-ink mb-3">选择模式与学科</h2>
                <p className="text-claude-muted max-w-md mx-auto">
                  上方先选模式（默认职业规划答疑），再点学科或「不限学科」，即可创建带标签的会话。
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 relative">
                <div ref={chatContainerRef} onScroll={handleChatScroll} className="absolute inset-0 overflow-y-auto p-6">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center text-claude-muted-soft">
                    正在加载消息…
                  </div>
                ) : visibleMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-claude-surface-card flex items-center justify-center mb-6">
                      <MessageSquare className="w-8 h-8 text-claude-muted-soft" />
                    </div>
                    <h3 className="text-2xl font-bold text-claude-ink mb-2">
                      {goalLabel(goal)} · {subjectTagLabel(selectedSubject?.name)}
                    </h3>
                    <p className="text-claude-muted mb-6 max-w-md">可以直接提问，或点下面的示例。</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {SUGGESTIONS[goal].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setInputMessage(q)}
                          className="px-4 py-2 rounded-claude-pill bg-claude-canvas border border-claude-hairline text-claude-body text-sm hover:bg-claude-surface-soft"
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
                              className={`p-4 rounded-[16px] whitespace-pre-wrap ${
                                message.role === 'user'
                                  ? 'bg-claude-primary text-claude-on-primary'
                                  : 'text-claude-body'
                              }`}
                              style={message.role === 'assistant' ? { backgroundColor: '#eef6fa', boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 2px 8px rgba(255,255,255,0.8), 0 3px 12px rgba(0,0,0,0.08)' } : undefined}
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
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-claude-pill bg-claude-canvas border border-claude-hairline text-sm text-claude-body hover:bg-claude-surface-soft"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        打开「{action.title}」
                                      </button>
                                    );
                                  }
                                  if (action.type === 'show_courses') return null;
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
                                      className="px-3 py-1.5 rounded-claude-md bg-claude-canvas border border-claude-hairline text-sm text-claude-body hover:bg-claude-surface-soft"
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
                            <div className="text-claude-body p-4 rounded-[16px] whitespace-pre-wrap"
                              style={{ backgroundColor: '#eef6fa', boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 2px 8px rgba(255,255,255,0.8), 0 3px 12px rgba(0,0,0,0.08)' }}>
                              {stripMarkdown(streamingText)}
                              <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-claude-muted animate-pulse" />
                            </div>
                          ) : (
                            <div className="bg-white text-claude-body p-4 rounded-[16px]"
                              style={{ boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.06), inset 0 2px 8px rgba(255,255,255,0.8), 0 3px 12px rgba(0,0,0,0.06)' }}>
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <span className="w-2 h-2 bg-claude-muted rounded-full animate-bounce" />
                                  <span
                                    className="w-2 h-2 bg-claude-muted rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                  />
                                  <span
                                    className="w-2 h-2 bg-claude-muted rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                  />
                                </div>
                                <span className="text-sm text-claude-muted">{streamStatus}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={chatEndRef} />
                </div>
                {showScrollButton && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-claude-primary text-white text-xs font-medium shadow-lg flex items-center gap-1.5 hover:bg-opacity-90 transition-all z-10"
                    style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    回到底部
                  </button>
                )}
              </div>

              <div className="p-4 border-t border-claude-hairline bg-white">
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
                    className="flex-1 h-11 px-4 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-body"
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
                    className="h-11 px-6 rounded-claude-md bg-claude-primary text-claude-on-primary font-medium flex items-center justify-center hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="w-full max-w-md rounded-claude-xl border border-claude-hairline bg-white p-6">
            <h3 className="text-lg font-bold text-claude-ink">打开外部学习资源？</h3>
            <p className="mt-2 text-sm text-claude-muted">
              即将离开本站，打开「{pendingOpen.title}」：
            </p>
            <p className="mt-2 break-all text-xs text-claude-muted-soft">{pendingOpen.url}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingOpen(null)}
                className="flex-1 rounded-claude-md bg-claude-surface-card py-3 text-claude-ink"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(pendingOpen.url, '_blank', 'noopener,noreferrer');
                  setPendingOpen(null);
                }}
                className="flex-1 rounded-claude-md bg-claude-primary py-3 text-claude-on-primary"
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
