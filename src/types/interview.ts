export type InterviewCategory = 'technical' | 'behavioral' | 'situational' | 'career';
export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export interface InterviewExperience {
  id: string;
  careerName: string;
  company: string;
  title: string;
  tags: string[];
  content: string;
  source: string;
  sourceUrl: string;
  author: string;
  likeCount: number;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  careerName: string;
  company: string;
  category: InterviewCategory;
  question: string;
  answerHint: string;
  difficulty: InterviewDifficulty;
  tags: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
}

export const INTERVIEW_CATEGORY_LABELS: Record<InterviewCategory, string> = {
  technical: '技术面',
  behavioral: '行为面',
  situational: '情景面',
  career: '职业规划面',
};

export const INTERVIEW_CATEGORY_COLORS: Record<InterviewCategory, string> = {
  technical: '#a8d8ea',
  behavioral: '#f8e8a0',
  situational: '#fcc8a8',
  career: '#d4b8e0',
};

export const INTERVIEW_DIFFICULTY_LABELS: Record<InterviewDifficulty, string> = {
  easy: '入门',
  medium: '进阶',
  hard: '挑战',
};
