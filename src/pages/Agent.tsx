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
  createConversation,
  deleteConversation,
  insertMessage,
  listConversations,
  listMessages,
  titleFromFirstMessage,
  updateConversation,
} from '../services/conversationService';
import { useAuthStore } from '../store/authStore';
import {
  GOAL_OPTIONS,
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

function getMessageActions(message: ChatMessageRecord): ClientAction[] {
  const raw = message.payload?.actions;
  return Array.isArray(raw) ? (raw as ClientAction[]) : [];
}

const Agent = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const subjectsRef = useRef<Subject[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [goal, setGoal] = useState<ConversationGoal>('career');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState('思考中…');
  const [streamingText, setStreamingText] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingOpen, setPendingOpen] = useState<Extract<ClientAction, { type: 'open_resource' }> | null>(
    null
  );
  const hasEnteredRef = useRef(false);

  const applyActions = useCallback(
    (actions: ClientAction[]) => {
      const openAction = actions.find((a) => a.type === 'open_resource');
      const quizAction = actions.find((a) => a.type === 'start_quiz');
      const navAction = actions.find((a) => a.type === 'navigate');

      // Prefer confirm dialog first; avoid navigating away and losing the modal
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

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (m) =>
          (m.role === 'user' || m.role === 'assistant') &&
          (m.payload as any)?._subjectId === (selectedSubject?.id ?? null)
      ),
    [messages, selectedSubject]
  );

  const refreshConversations = useCallback(async () => {
    const list = await listConversations();
    setConversations(list);
    return list;
  }, []);

  const loadConversation = useCallback(async (conversation: Conversation) => {
    setActiveId(conversation.id);
    setGoal(conversation.goal);
    setSelectedSubject(
      subjectsRef.current.find((s) => s.id === conversation.subject_id) ?? null
    );
    setMessagesLoading(true);
    setMessages([]);
    try {
      const rows = await listMessages(conversation.id);
      setMessages(rows);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        setListLoading(true);
        setMessagesLoading(true);
        setError('');

        // Parallel: subjects are not on the critical path of conversation list
        const [subjectRows, list] = await Promise.all([fetchSubjects(), listConversations()]);
        if (cancelled) return;

        subjectsRef.current = subjectRows;
        setSubjects(subjectRows);
        setConversations(list);
        setListLoading(false);

        let target = list[0];
        if (!target) {
          target = await createConversation({ userId: user.id, goal: 'career' });
          if (cancelled) return;
          setConversations([target]);
        }

        setActiveId(target.id);
        setGoal(target.goal);
        setSelectedSubject(subjectRows.find((s) => s.id === target.subject_id) ?? null);

        const rows = await listMessages(target.id);
        if (cancelled) return;
        setMessages(rows);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载会话失败，请确认已执行 conversations 迁移 SQL');
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
          setMessagesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleNewConversation = async () => {
    if (!user) return;
    try {
      const created = await createConversation({
        userId: user.id,
        goal: 'career',
        subjectId: null,
      });
      await refreshConversations();
      await loadConversation(created);
      setInputMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建会话失败');
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
          const created = await createConversation({ userId: user.id, goal: 'career' });
          await refreshConversations();
          await loadConversation(created);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除会话失败');
    }
  };

  const handleGoalChange = async (next: ConversationGoal) => {
    setGoal(next);
    if (!activeId) return;
    try {
      await updateConversation(activeId, { goal: next });
      setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, goal: next } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新目标失败');
    }
  };

  const handleSubjectChange = async (subject: Subject | null) => {
    hasEnteredRef.current = true;
    setSelectedSubject(subject);
    if (!activeId) return;
    try {
      await updateConversation(activeId, { subject_id: subject?.id ?? null });
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, subject_id: subject?.id ?? null } : c))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新学科失败');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !activeId || isLoading) return;

    hasEnteredRef.current = true;
    const text = inputMessage.trim();
    const subjectId = selectedSubject?.id ?? null;
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
        payload: { _subjectId: subjectId },
      });
      setMessages((prev) => [...prev, userRow]);

      if (activeConversation?.title === '新对话') {
        const title = titleFromFirstMessage(text);
        await updateConversation(activeId, { title });
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, title, updated_at: new Date().toISOString() } : c))
        );
      }

      const history = [...messages, userRow]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .filter((m) => m.id !== userRow.id)
        .filter((m) => (m.payload as { _subjectId?: string | null })?._subjectId === subjectId)
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
        payload: { actions: reply.actions, _subjectId: subjectId },
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

  const goalMeta = GOAL_OPTIONS.find((g) => g.id === goal) ?? GOAL_OPTIONS[2];

  return (
    <div className="pt-16 h-screen overflow-hidden">
      <div className="flex h-full">
        <aside className="fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-morandi-light/50 p-4 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-morandi-text">会话</h2>
            <button
              type="button"
              onClick={handleNewConversation}
              className="inline-flex items-center gap-1 rounded-xl bg-morandi-pink px-3 py-1.5 text-sm text-white hover:bg-opacity-90"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {listLoading ? (
              <p className="text-sm text-morandi-text/50 px-2">加载中…</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                    activeId === c.id ? 'bg-morandi-pink/15 text-morandi-pink' : 'hover:bg-morandi-light text-morandi-text'
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
                    <p className="mt-1 text-xs text-morandi-text/50 truncate">
                      {GOAL_OPTIONS.find((g) => g.id === c.goal)?.label ?? '自由提问'}
                    </p>
                  </button>
                  <button
                    type="button"
                    title="删除会话"
                    onClick={() => void handleDeleteConversation(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-morandi-text/40 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <p className="mt-6 text-xs text-morandi-text/45 leading-relaxed px-1">
            模型由服务端 Edge Function 调用，API Key 不再保存在浏览器。
          </p>
        </aside>

        <div className="flex-1 flex flex-col h-full ml-72">
          {/* [+] 未选择学科且未曾进入对话时显示欢迎界面 */}
          {!selectedSubject && !hasEnteredRef.current && !listLoading && conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-morandi-pink/5 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-morandi-blue/5 blur-3xl"></div>
              </div>
              <div className="text-center relative z-10">
                <div className="w-32 h-32 rounded-full bg-morandi-light/50 flex items-center justify-center mx-auto mb-8 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-20 h-20 rounded-full bg-morandi-light grid place-items-center [&>svg]:block">
                    <Cpu className="w-10 h-10 text-morandi-text/50" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-morandi-text mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>选择一个学科</h2>
                <p className="text-morandi-text/60 text-lg mb-8 max-w-md animate-slide-up" style={{ animationDelay: '0.25s' }}>从下方选择您感兴趣的学科，开始与AI助手对话</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {subjects.slice(0, 6).map((subject, index) => (
                    <div
                      key={subject.id}
                      className="w-12 h-12 rounded-xl grid place-items-center cursor-pointer hover:scale-110 transition-transform opacity-0 animate-card-enter [&>svg]:block"
                      style={{ backgroundColor: `${subject.color}30`, animationDelay: `${0.3 + index * 0.06}s` }}
                      onClick={() => { hasEnteredRef.current = true; setSelectedSubject(subject); setMessages([]); }}
                    >
                      {iconMap[subject.icon]}
                    </div>
                  ))}
                </div>
                <p className="text-morandi-text/40 text-sm mt-4 animate-slide-up" style={{ animationDelay: '0.55s' }}>点击图标快速选择</p>
              </div>
            </div>
          ) : (
            <>
          {/* [+] 目标选择 + 学科筛选 */}
          <div className="p-4 border-b bg-white/80 backdrop-blur">
            <div className="flex flex-wrap gap-2 mb-3">
              {GOAL_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void handleGoalChange(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    goal === item.id
                      ? 'bg-morandi-pink text-white'
                      : 'bg-morandi-light text-morandi-text hover:bg-morandi-pink/15'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-morandi-text/60 mb-3">{goalMeta.hint}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSubjectChange(null)}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  !selectedSubject ? 'bg-morandi-blue/20 text-morandi-text' : 'bg-morandi-light text-morandi-text/70'
                }`}
              >
                不限学科
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => void handleSubjectChange(subject)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedSubject?.id === subject.id
                      ? 'text-morandi-text'
                      : 'bg-morandi-light text-morandi-text/70 hover:bg-morandi-light/80'
                  }`}
                  style={{
                    backgroundColor:
                      selectedSubject?.id === subject.id ? `${subject.color}35` : undefined,
                  }}
                >
                  {iconMap[subject.icon]}
                  {subject.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-red-100 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex-1 p-6 overflow-y-auto">
            {messagesLoading ? (
              <div className="h-full flex items-center justify-center text-morandi-text/50">正在加载消息…</div>
            ) : visibleMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-morandi-light flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-morandi-text/40" />
                </div>
                <h3 className="text-2xl font-bold text-morandi-text mb-2">开始新的对话</h3>
                <p className="text-morandi-text/60 mb-6 max-w-md">
                  当前目标：{goalMeta.label}。可以直接提问；学科为可选上下文。
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {(goal === 'career'
                    ? ['我适合哪些职业方向？', '计算机专业常见职业路径', '如何补齐实习能力缺口']
                    : goal === 'courses'
                      ? ['推荐入门实训课程', '有没有财务报表相关课程', '带我去职业实训看看']
                      : ['介绍一下数据科学', '怎么开始学算法', '给我一份一周学习计划']
                  ).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInputMessage(q)}
                      className="px-4 py-2 rounded-xl bg-white border border-morandi-light/50 text-morandi-text text-sm hover:bg-morandi-light/50 shadow-sm"
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
                          className={`p-4 rounded-2xl whitespace-pre-wrap ${
                            message.role === 'user'
                              ? 'bg-morandi-pink text-white rounded-br-none'
                              : 'bg-morandi-light text-morandi-text rounded-bl-none'
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
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-morandi-light text-sm text-morandi-text hover:bg-morandi-pink/10"
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
                                  className="px-3 py-1.5 rounded-xl bg-white border border-morandi-light text-sm text-morandi-text hover:bg-morandi-pink/10"
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
                        <div className="bg-morandi-light text-morandi-text p-4 rounded-2xl rounded-bl-none whitespace-pre-wrap">
                          {stripMarkdown(streamingText)}
                          <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-morandi-text/40 animate-pulse" />
                        </div>
                      ) : (
                        <div className="bg-morandi-light text-morandi-text p-4 rounded-2xl rounded-bl-none">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-morandi-text/40 rounded-full animate-bounce" />
                              <span
                                className="w-2 h-2 bg-morandi-text/40 rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                              />
                              <span
                                className="w-2 h-2 bg-morandi-text/40 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                              />
                            </div>
                            <span className="text-sm text-morandi-text/70">{streamStatus}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
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
                className="flex-1 px-4 py-3 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text"
              />
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading || listLoading || messagesLoading}
                className="px-6 py-3 rounded-xl bg-morandi-pink text-white font-medium flex items-center justify-center hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-morandi-text">打开外部学习资源？</h3>
            <p className="mt-2 text-sm text-morandi-text/70">
              即将离开本站，打开「{pendingOpen.title}」：
            </p>
            <p className="mt-2 break-all text-xs text-morandi-text/50">{pendingOpen.url}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingOpen(null)}
                className="flex-1 rounded-xl bg-morandi-light py-3 text-morandi-text"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(pendingOpen.url, '_blank', 'noopener,noreferrer');
                  setPendingOpen(null);
                }}
                className="flex-1 rounded-xl bg-morandi-pink py-3 text-white"
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
