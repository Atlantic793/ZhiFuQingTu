import { supabase } from '../lib/supabase';
import {
  careers as mockCareers,
  companies as mockCompanies,
  courses as mockCourses,
  subjects as mockSubjects,
  type Career,
  type Company,
  type Course,
  type Subject,
} from '../data/mockData';

type DbCourse = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  cover_image: string;
  company_id: string | null;
  rating: number | string;
  rating_count: number;
};

type DbCompany = {
  id: string;
  name: string;
  sector: string;
  color: string;
};

function mapCourse(row: DbCourse): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    coverImage: row.cover_image,
    companyId: row.company_id ?? '',
    rating: Number(row.rating) || 0,
    ratingCount: row.rating_count ?? 0,
  };
}

export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('id');
  if (error || !data?.length) {
    console.warn('[catalog] subjects fallback to mock', error?.message);
    return mockSubjects;
  }
  return data as Subject[];
}

export async function fetchCareers(): Promise<Career[]> {
  const { data, error } = await supabase.from('careers').select('*').order('id');
  if (error || !data?.length) {
    console.warn('[catalog] careers fallback to mock', error?.message);
    return mockCareers;
  }
  return data as Career[];
}

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, video_url, cover_image, company_id, rating, rating_count')
    .order('id');
  if (error || !data?.length) {
    console.warn('[catalog] courses fallback to mock', error?.message);
    return mockCourses;
  }
  return (data as DbCourse[]).map(mapCourse);
}

export async function fetchCompaniesWithCourses(): Promise<Company[]> {
  const [{ data: companyRows, error: companyError }, { data: courseRows, error: courseError }] =
    await Promise.all([
      supabase.from('companies').select('id, name, sector, color').order('id'),
      supabase
        .from('courses')
        .select('id, title, description, video_url, cover_image, company_id, rating, rating_count')
        .order('id'),
    ]);

  if (companyError || courseError || !companyRows?.length) {
    console.warn('[catalog] companies fallback to mock', companyError?.message || courseError?.message);
    return mockCompanies;
  }

  const courses = (courseRows as DbCourse[] | null)?.map(mapCourse) ?? [];
  return (companyRows as DbCompany[]).map((company) => ({
    id: company.id,
    name: company.name,
    sector: company.sector,
    color: company.color,
    courses: courses.filter((c) => c.companyId === company.id),
  }));
}
