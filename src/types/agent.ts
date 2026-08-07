export type ConversationGoal = 'career' | 'courses' | 'training' | 'free';

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
  | { type: 'start_quiz'; courseId: string; courseTitle: string; path: string; label: string }
  | { type: 'show_courses'; courses: Array<{ id: string; title: string; coverImage: string; rating: number }> };

export type AgentChatResult = {
  content: string;
  actions: ClientAction[];
};

export const GOAL_OPTIONS: Array<{ id: ConversationGoal; label: string; hint: string }> = [
  { id: 'career', label: '职业规划答疑', hint: '结合能力与约束，梳理职业方向与路径' },
  { id: 'courses', label: '找课', hint: '检索站内课程并打开学习资源' },
  { id: 'training', label: '实训', hint: '企业实训导览与拉起测验' },
  { id: 'free', label: '学科知识答疑', hint: '围绕学科的概念讲解与学习建议' },
];

export function goalLabel(goal: ConversationGoal): string {
  return GOAL_OPTIONS.find((g) => g.id === goal)?.label ?? goal;
}

/** Normalize legacy / unknown goal values from DB */
export function normalizeGoal(goal: string | null | undefined): ConversationGoal {
  if (goal === 'career' || goal === 'courses' || goal === 'training' || goal === 'free') {
    return goal;
  }
  return 'free';
}

export function subjectTagLabel(subjectName: string | null | undefined): string {
  return subjectName?.trim() ? subjectName : '不限学科';
}

export function conversationTagLabel(
  goal: ConversationGoal,
  subjectName: string | null | undefined
): string {
  return `${goalLabel(goal)} · ${subjectTagLabel(subjectName)}`;
}

export function modeIntro(goal: ConversationGoal, subjectName: string | null | undefined): string {
  const subject = subjectTagLabel(subjectName);
  switch (goal) {
    case 'career':
      return `你好，我是职业规划答疑助手（当前：${subject}）。可以先聊聊你的能力与约束，再一起看就业、考研读博或考公考编等路径；也可以问某个岗位实际在做什么。`;
    case 'courses':
      return `你好，我是找课助手（当前：${subject}）。可以帮你检索站内课程，并打开相关学习资源。`;
    case 'training':
      return `你好，我是实训助手（当前：${subject}）。可以带你去职业实训，或为某门课拉起测验。`;
    case 'free':
    default:
      return `你好，我是学科知识答疑助手（当前：${subject}）。我会按「讲解→例子→检查→练习」帮你真正搞懂，而不只是给标准答案。`;
  }
}
