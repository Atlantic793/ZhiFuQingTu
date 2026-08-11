import { supabase } from '../lib/supabase';
import type {
  InterviewCategory,
  InterviewDifficulty,
  InterviewExperience,
  InterviewQuestion,
} from '../types/interview';
import fixturePayload from '../data/fixtures/interview-smoke.json';

type DbInterviewExperience = {
  id: string;
  career_name: string;
  company: string;
  title: string;
  tags: string[] | null;
  content: string;
  source: string;
  source_url: string;
  author: string;
  like_count: number;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
};

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

type FixtureExperience = DbInterviewExperience;
type FixtureQuestion = DbInterviewQuestion;

function mapExperience(row: DbInterviewExperience): InterviewExperience {
  return {
    id: row.id,
    careerName: row.career_name,
    company: row.company,
    title: row.title,
    tags: Array.isArray(row.tags) ? row.tags : [],
    content: row.content,
    source: row.source,
    sourceUrl: row.source_url,
    author: row.author,
    likeCount: row.like_count,
    collectedAt: row.collected_at ?? row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

function fixtureExperiences(): InterviewExperience[] {
  const payload = fixturePayload as { experiences?: FixtureExperience[] };
  return (payload.experiences ?? []).map(mapExperience);
}

function fixtureQuestions(): InterviewQuestion[] {
  const payload = fixturePayload as { questions?: FixtureQuestion[] };
  return (payload.questions ?? []).map(mapQuestion);
}

export async function fetchInterviewExperiences(): Promise<InterviewExperience[]> {
  const { data, error } = await supabase.from('interview_experiences').select('*').order('like_count', { ascending: false });
  if (error || !data?.length) {
    console.warn('[interview] interview_experiences fallback to fixture', error?.message);
    return fixtureExperiences();
  }
  return (data as DbInterviewExperience[]).map(mapExperience);
}

export async function fetchInterviewQuestions(): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase.from('interview_questions').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) {
    console.warn('[interview] interview_questions fallback to fixture', error?.message);
    return fixtureQuestions();
  }
  return (data as DbInterviewQuestion[]).map(mapQuestion);
}
