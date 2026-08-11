import { supabase } from '../lib/supabase';

export type InterviewAnswerHandlers = {
  onStatus?: (label: string) => void;
  onDelta?: (text: string) => void;
};

type StreamEvent =
  | { type: 'status'; label?: string }
  | { type: 'delta'; text?: string }
  | { type: 'done'; content?: string }
  | { type: 'error'; error?: string };

/**
 * Stream an AI-generated reference answer for an interview question
 * via the `interview-answer` Edge Function (SSE).
 */
export async function streamInterviewAnswer(
  params: { question: string; context?: string; careerName?: string },
  handlers: InterviewAnswerHandlers = {}
): Promise<string> {
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

  const response = await fetch(`${supabaseUrl}/functions/v1/interview-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: JSON.stringify(params),
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
        handlers.onStatus?.(event.label ?? '');
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
      }
    }
  }

  if (!sawDone && !assembled.trim()) {
    throw new Error('AI 未返回有效内容');
  }

  return assembled.trim();
}
