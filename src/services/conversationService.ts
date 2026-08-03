import { supabase } from '../lib/supabase';
import {
  conversationTagLabel,
  normalizeGoal,
  type ChatMessageRecord,
  type Conversation,
  type ConversationGoal,
  type MessageRole,
} from '../types/agent';

function mapConversation(row: Conversation): Conversation {
  return { ...row, goal: normalizeGoal(row.goal) };
}

export async function listConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapConversation(row as Conversation));
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
  return mapConversation(data as Conversation);
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

export function sameContext(
  conversation: Pick<Conversation, 'goal' | 'subject_id'>,
  goal: ConversationGoal,
  subjectId: string | null
): boolean {
  return conversation.goal === goal && conversation.subject_id === subjectId;
}

export function conversationsInContext(
  list: Conversation[],
  goal: ConversationGoal,
  subjectId: string | null
): Conversation[] {
  return list.filter((c) => sameContext(c, goal, subjectId));
}

export function buildGroupTitle(
  goal: ConversationGoal,
  subjectName: string | null | undefined,
  index: number
): string {
  const base = conversationTagLabel(goal, subjectName);
  return index <= 1 ? base : `${base} #${index}`;
}
