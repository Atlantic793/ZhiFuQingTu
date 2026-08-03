import type { Subject } from '../data/mockData';
import { supabase } from '../lib/supabase';
import type { AgentChatResult, ClientAction, ConversationGoal } from '../types/agent';

type HistoryTurn = { role: 'user' | 'assistant'; content: string };

export type StreamStatusEvent = {
  type: 'status';
  status: string;
  label: string;
  reset?: boolean;
};

export type StreamHandlers = {
  onStatus?: (event: StreamStatusEvent) => void;
  onDelta?: (text: string) => void;
};

type StreamDoneEvent = {
  type: 'done';
  content?: string;
  actions?: ClientAction[];
};

type StreamErrorEvent = {
  type: 'error';
  error?: string;
};

type StreamDeltaEvent = {
  type: 'delta';
  text?: string;
};

type StreamEvent = StreamStatusEvent | StreamDoneEvent | StreamErrorEvent | StreamDeltaEvent;

/**
 * Streaming chat via Supabase Edge Function `agent-chat` (SSE).
 */
export async function chatWithGLMStream(
  message: string,
  subject: Subject | null,
  history: HistoryTurn[],
  goal: ConversationGoal = 'free',
  handlers: StreamHandlers = {}
): Promise<AgentChatResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('登录已失效，请重新登录');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('缺少 Supabase 环境变量，请检查 .env');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/agent-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: JSON.stringify({
      message,
      history,
      goal,
      subject: subject
        ? { id: subject.id, name: subject.name, description: subject.description }
        : null,
    }),
  });

  if (!response.ok) {
    let detail = `AI 服务请求失败（HTTP ${response.status}）`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) detail = payload.error;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error('AI 服务未返回流式内容');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assembled = '';
  let actions: ClientAction[] = [];
  let sawDone = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n');
    buffer = chunks.pop() ?? '';

    for (const line of chunks) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      let event: StreamEvent;
      try {
        event = JSON.parse(data) as StreamEvent;
      } catch {
        continue;
      }

      if (event.type === 'status') {
        handlers.onStatus?.(event);
        continue;
      }

      if (event.type === 'delta') {
        const text = event.text ?? '';
        if (text) {
          assembled += text;
          handlers.onDelta?.(text);
        }
        continue;
      }

      if (event.type === 'error') {
        throw new Error(event.error || 'AI 服务返回错误');
      }

      if (event.type === 'done') {
        sawDone = true;
        if (event.content) assembled = event.content;
        actions = Array.isArray(event.actions) ? event.actions : [];
      }
    }
  }

  if (!sawDone && !assembled.trim()) {
    throw new Error('AI 未返回有效内容');
  }

  return {
    content: assembled,
    actions,
  };
}

/** @deprecated Prefer chatWithGLMStream */
export const chatWithGLM = async (
  message: string,
  subject: Subject | null,
  history: HistoryTurn[],
  goal: ConversationGoal = 'free'
): Promise<AgentChatResult> => chatWithGLMStream(message, subject, history, goal);
