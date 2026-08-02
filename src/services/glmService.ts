import type { Subject } from '../data/mockData';
import { supabase } from '../lib/supabase';
import type { AgentChatResult, ClientAction, ConversationGoal } from '../types/agent';

type HistoryTurn = { role: 'user' | 'assistant'; content: string };

type AgentChatResponse = {
  content?: string;
  actions?: ClientAction[];
  error?: string;
};

/**
 * Chat via Supabase Edge Function `agent-chat` (tool-calling enabled).
 */
export const chatWithGLM = async (
  message: string,
  subject: Subject | null,
  history: HistoryTurn[],
  goal: ConversationGoal = 'free'
): Promise<AgentChatResult> => {
  const { data, error } = await supabase.functions.invoke<AgentChatResponse>('agent-chat', {
    body: {
      message,
      history,
      goal,
      subject: subject
        ? { id: subject.id, name: subject.name, description: subject.description }
        : null,
    },
  });

  if (data?.content) {
    return {
      content: data.content,
      actions: Array.isArray(data.actions) ? data.actions : [],
    };
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const payload = (await context.clone().json()) as AgentChatResponse;
        if (payload?.content) {
          return {
            content: payload.content,
            actions: Array.isArray(payload.actions) ? payload.actions : [],
          };
        }
        if (payload?.error) throw new Error(payload.error);
      } catch (inner) {
        if (inner instanceof Error && inner.message && inner.message !== error.message) {
          throw inner;
        }
      }
    }
    throw new Error(
      error.message.includes('Failed to send') || error.message.includes('not found')
        ? 'AI 服务未就绪：请先部署 Edge Function agent-chat 并配置 GLM_API_KEY'
        : error.message || '调用 AI 服务失败'
    );
  }

  throw new Error('AI 未返回有效内容');
};
