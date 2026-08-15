import { supabase } from '../lib/supabase';
import type {
  InterviewCategory,
  InterviewDifficulty,
  InterviewQuestion,
} from '../types/interview';
import fixturePayload from '../data/fixtures/interview-smoke.json';
import universalPayload from '../data/fixtures/interview-universal.json';

type DbInterviewQuestion = {
  id: string;
  career_name: string;
  company: string;
  category: string;
  question: string;
  answer_hint: string;
  difficulty: string;
  tags: string[] | null;
  source: string;
  created_at: string;
  updated_at: string;
};

type FixtureQuestion = DbInterviewQuestion;

function mapQuestion(row: DbInterviewQuestion): InterviewQuestion {
  const category: InterviewCategory = ['technical', 'behavioral', 'situational', 'career'].includes(row.category)
    ? (row.category as InterviewCategory)
    : 'behavioral';
  const difficulty: InterviewDifficulty = ['easy', 'medium', 'hard'].includes(row.difficulty)
    ? (row.difficulty as InterviewDifficulty)
    : 'medium';
  return {
    id: row.id,
    careerName: row.career_name,
    company: row.company,
    category,
    question: row.question,
    answerHint: row.answer_hint,
    difficulty,
    tags: Array.isArray(row.tags) ? row.tags : [],
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fixtureQuestions(): InterviewQuestion[] {
  const payload = fixturePayload as { questions?: FixtureQuestion[] };
  return (payload.questions ?? []).map(mapQuestion);
}

function universalQuestions(): InterviewQuestion[] {
  const payload = universalPayload as { questions?: FixtureQuestion[] };
  const now = new Date().toISOString();
  return (payload.questions ?? []).map((row) =>
    mapQuestion({
      ...row,
      created_at: row.created_at || now,
      updated_at: row.updated_at || now,
    }),
  );
}

export function fetchUniversalInterviewQuestions(): InterviewQuestion[] {
  return universalQuestions();
}

export async function fetchInterviewQuestions(): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase.from('interview_questions').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) {
    console.warn('[interview] interview_questions fallback to fixture', error?.message);
    return fixtureQuestions();
  }
  return (data as DbInterviewQuestion[]).map(mapQuestion);
}
