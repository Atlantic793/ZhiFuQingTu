import { supabase } from '../lib/supabase';
import type { ChatMessageRecord, Conversation, ConversationGoal, MessageRole } from '../types/agent';

export async function listConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function createConversation(input: {
  userId: string;
  goal?: ConversationGoal;
  title?: string;
  subjectId?: string | null;
}): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: input.userId,
      goal: input.goal ?? 'free',
      title: input.title ?? '新对话',
      subject_id: input.subjectId ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function updateConversation(
  id: string,
  patch: Partial<Pick<Conversation, 'title' | 'goal' | 'subject_id'>>
): Promise<void> {
  const { error } = await supabase.from('conversations').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase.from('conversations').delete().eq('id', id);
  if (error) throw error;
}

export async function listMessages(conversationId: string): Promise<ChatMessageRecord[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChatMessageRecord[];
}

export async function insertMessage(input: {
  conversationId: string;
  userId: string;
  role: MessageRole;
  content?: string | null;
  payload?: Record<string, unknown>;
}): Promise<ChatMessageRecord> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      user_id: input.userId,
      role: input.role,
      content: input.content ?? null,
      payload: input.payload ?? {},
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ChatMessageRecord;
}

export function titleFromFirstMessage(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '新对话';
  return trimmed.length > 24 ? `${trimmed.slice(0, 24)}…` : trimmed;
}
