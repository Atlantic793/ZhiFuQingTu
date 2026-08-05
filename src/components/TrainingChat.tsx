import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Send, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSubjects } from '../services/catalogService';
import { chatWithGLMStream } from '../services/glmService';
import {
  buildGroupTitle,
  conversationsInContext,
  createConversation,
  insertMessage,
  listConversations,
  listMessages,
} from '../services/conversationService';
import { useAuthStore } from '../store/authStore';
import {
  modeIntro,
  type ChatMessageRecord,
  type ClientAction,
  type Conversation,
} from '../types/agent';
import { stripMarkdown } from '../utils/plainText';
import type { Subject } from '../data/mockData';

const SUGGESTIONS = [
  '推荐一门可测验的实训课',
  '开始财务报表分析测验',
  '有哪些企业实训课程',
  '带我去职业实训看看',
];

function getMessageActions(message: ChatMessageRecord): ClientAction[] {
  const raw = message.payload?.actions;
  return Array.isArray(raw) ? (raw as ClientAction[]) : [];
}

const TrainingChat = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamStatus, setStreamStatus] = useState('');
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [switching, setSwitching] = useState(false);
  const convsRef = useRef<Conversation[]>([]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  );

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
    [messages],
  );

  const switchToContext = useCallback(
    async (subjectId: string | null) => {
      if (!user) return;
      setSwitching(true);
      setError('');
      try {
        const list = await listConversations();
        convsRef.current = list;

        const group = conversationsInContext(list, 'training', subjectId);
        let conv: Conversation;

        if (group.length > 0) {
          conv = group[0];
        } else {
          const subjectName = subjects.find((s) => s.id === subjectId)?.name ?? null;
          const title = buildGroupTitle('training', subjectName, group.length + 1);
          conv = await createConversation({
            userId: user.id,
            goal: 'training',
            subjectId,
            title,
          });
          await insertMessage({
            conversationId: conv.id,
            userId: user.id,
            role: 'assistant',
            content: modeIntro('training', subjectName),
            payload: { intro: true },
          });
        }

        setConvId(conv.id);
        setSelectedSubjectId(subjectId);
        const msgs = await listMessages(conv.id);
        setMessages(msgs);
      } catch (e) {
        setError(e instanceof Error ? e.message : '切换失败');
      } finally {
        setSwitching(false);
      }
    },
    [user, subjects],
  );

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchSubjects();
        if (cancelled) return;
        setSubjects(rows);
        await switchToContext(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '初始化失败');
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleSubjectChange = (subjectId: string | null) => {
    if (subjectId === selectedSubjectId) return;
    void switchToContext(subjectId);
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !user || !convId || isLoading) return;
    const text = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setStreamStatus('思考中…');
    setStreamingText('');
    setError('');

    try {
      const userRow = await insertMessage({
        conversationId: convId,
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

      const reply = await chatWithGLMStream(text, selectedSubject, history, 'training', {
        onStatus: (event) => {
          setStreamStatus(event.label || '思考中…');
          if (event.reset) setStreamingText('');
        },
        onDelta: (delta) => {
          setStreamingText((prev) => prev + delta);
        },
      });

      const plainContent = stripMarkdown(reply.content);
      setStreamingText(plainContent);

      const assistantRow = await insertMessage({
        conversationId: convId,
        userId: user.id,
        role: 'assistant',
        content: plainContent,
        payload: { actions: reply.actions },
      });
      setMessages((prev) => [...prev, assistantRow]);
      setStreamingText('');

      const actions: ClientAction[] = reply.actions || [];
      for (const action of actions) {
        if (action.type === 'navigate') {
          window.setTimeout(() => navigate(action.path), 300);
        } else if (action.type === 'start_quiz') {
          window.setTimeout(() => navigate(action.path), 300);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送失败');
      setStreamingText('');
    } finally {
      setIsLoading(false);
      setStreamStatus('');
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sticky top-20 bg-white rounded-claude-xl border border-claude-hairline overflow-hidden"
      style={{ boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.04), inset 0 2px 8px rgba(255,255,255,0.7), 0 4px 16px rgba(0,0,0,0.06)' }}>
      <div className="px-4 py-3 border-b border-claude-hairline bg-claude-surface-soft/50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎯</span>
          <h3 className="font-semibold text-sm text-claude-ink">AI 实训助手</h3>
        </div>
        <div className="relative">
          <select
            value={selectedSubjectId ?? ''}
            onChange={(e) => handleSubjectChange(e.target.value || null)}
            disabled={switching || initializing}
            className="w-full text-xs pl-2 pr-7 py-1.5 rounded-claude-sm bg-white border border-claude-hairline text-claude-body outline-none focus:ring-1 focus:ring-claude-primary/30 appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">不限学科</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-claude-muted-soft absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {initializing || switching ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-claude-muted-soft">{initializing ? '初始化中…' : '切换中…'}</p>
          </div>
        ) : visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <p className="text-xs text-claude-muted-soft">直接提问或点下方建议</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInputMessage(q)}
                  className="px-2.5 py-1.5 rounded-claude-pill bg-claude-canvas border border-claude-hairline text-claude-body text-xs hover:bg-claude-surface-soft transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {visibleMessages.map((msg) => {
              const actions = getMessageActions(msg);
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] space-y-1.5`}>
                    <div
                      className={`px-3 py-2 rounded-[12px] text-xs whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-claude-primary text-claude-on-primary'
                          : 'bg-claude-surface-blue text-claude-body'
                      }`}
                      style={msg.role === 'assistant' ? {
                        boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.05), inset 0 1px 4px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.05)',
                      } : undefined}
                    >
                      {msg.role === 'assistant' ? stripMarkdown(msg.content ?? '') : msg.content}
                    </div>
                    {msg.role === 'assistant' && actions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {actions.map((action) => {
                          if (action.type === 'open_resource') {
                            return (
                              <a
                                key={`open-${action.url}`}
                                href={action.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-claude-pill bg-claude-canvas border border-claude-hairline text-xs text-claude-body hover:bg-claude-surface-soft"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {action.title}
                              </a>
                            );
                          }
                          const label = action.type === 'start_quiz'
                            ? action.label || `测验「${action.courseTitle}」`
                            : action.label || `前往 ${action.path}`;
                          return (
                            <button
                              key={`${action.type}-${action.path}`}
                              type="button"
                              onClick={() => navigate(action.path)}
                              className="px-2 py-1 rounded-claude-sm bg-claude-canvas border border-claude-hairline text-xs text-claude-body hover:bg-claude-surface-soft"
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
                <div className="max-w-[90%]">
                  {streamingText ? (
                    <div
                      className="px-3 py-2 rounded-[12px] text-xs whitespace-pre-wrap leading-relaxed bg-claude-surface-blue text-claude-body"
                      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.05), inset 0 1px 4px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                      {stripMarkdown(streamingText)}
                      <span className="inline-block w-1 h-3 ml-0.5 align-middle bg-claude-primary animate-pulse" />
                    </div>
                  ) : (
                    <div
                      className="px-3 py-2 rounded-[12px] bg-white text-xs text-claude-muted"
                      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.05), inset 0 1px 4px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                      <span>{streamStatus || '思考中…'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 text-xs text-red-500 bg-red-50 border-t border-red-100 flex-shrink-0">
          {error}
          <button type="button" onClick={() => setError('')} className="ml-2 underline">关闭</button>
        </div>
      )}

      <div className="p-3 border-t border-claude-hairline bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="输入实训问题…"
            disabled={isLoading || initializing}
            className="flex-1 h-9 px-3 rounded-claude-sm bg-claude-canvas border border-claude-hairline outline-none focus:ring-1 focus:ring-claude-primary/30 text-xs text-claude-body disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!inputMessage.trim() || isLoading || initializing || !convId}
            className="h-9 w-9 rounded-claude-sm bg-claude-primary text-white flex items-center justify-center hover:bg-opacity-90 disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingChat;
