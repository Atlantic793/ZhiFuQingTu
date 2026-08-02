export type ConversationGoal = 'career' | 'courses' | 'free';

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  goal: ConversationGoal;
  subject_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Structured chat message stored for replay / future tool loops */
export type ChatMessageRecord = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type ClientAction =
  | { type: 'navigate'; path: string; label: string }
  | { type: 'open_resource'; url: string; title: string; requiresConfirm: true }
  | { type: 'start_quiz'; courseId: string; courseTitle: string; path: string; label: string };

export type AgentChatResult = {
  content: string;
  actions: ClientAction[];
};

export const GOAL_OPTIONS: Array<{ id: ConversationGoal; label: string; hint: string }> = [
  { id: 'career', label: '职业规划', hint: '探索方向、能力缺口与学习建议' },
  { id: 'courses', label: '找课与实训', hint: '推荐站内课程、实训并协助跳转' },
  { id: 'free', label: '自由提问', hint: '学科答疑与综合问题' },
];
