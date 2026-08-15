import { supabase } from '../lib/supabase';
import {
  careers as mockCareers,
  catalogTopics as mockTopics,
  companies as mockCompanies,
  courses as mockCourses,
  subjects as mockSubjects,
  type Career,
  type CatalogTopic,
  type Company,
  type Course,
  type CourseChapter,
  type StudyPath,
  type StudyPathKind,
  type StudyPathTimeframeStep,
  type Subject,
} from '../data/mockData';
import { normalizeCoverUrl } from '../utils/media';

type DbCourse = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  cover_image: string;
  company_id: string | null;
  rating: number | string;
  rating_count: number;
  topic_id?: string | null;
  bvid?: string | null;
  owner_name?: string | null;
  chapters?: CourseChapter[] | null;
  intro?: string | null;
  platform_rating?: number | string | null;
  platform_rating_count?: number | null;
  source_score?: number | string | null;
  source_summary?: string | null;
  contributor_name?: string | null;
  view_count?: number | null;
  danmaku_count?: number | null;
  reply_count?: number | null;
};

type DbCompany = {
  id: string;
  name: string;
  sector: string;
  color: string;
};

type DbTopic = {
  id: string;
  domain_id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  sort_order: number;
};

type DbStudyPath = {
  id: string;
  subject_id: string;
  kind: string;
  name: string;
  description: string;
  exam_subjects: unknown;
  applicable_majors: unknown;
  timeframe: unknown;
  notes: string;
  sort_order: number;
};

const courseSelect =
  'id, title, description, video_url, cover_image, company_id, rating, rating_count, topic_id, bvid, owner_name, chapters, intro, platform_rating, platform_rating_count, source_score, source_summary, contributor_name, view_count, danmaku_count, reply_count';

function normalizeChapters(raw: unknown): CourseChapter[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const row = item as Partial<CourseChapter>;
      const page = Number(row.page) || index + 1;
      return {
        cid: String(row.cid ?? `p${page}`),
        title: String(row.title ?? `P${page}`),
        page,
        duration: row.duration != null ? Number(row.duration) || 0 : undefined,
      };
    })
    .sort((a, b) => a.page - b.page);
}

/** DB 若未跑全量分 P migration，用 mock 中更完整的目录回填 */
function preferRicherChapters(course: Course): Course {
  const mock = mockCourses.find((c) => c.id === course.id || (course.bvid && c.bvid === course.bvid));
  if (mock && mock.chapters.length > course.chapters.length) {
    return { ...course, chapters: mock.chapters };
  }
  return course;
}

function mapCourse(row: DbCourse): Course {
  const platformRating = Number(row.platform_rating ?? row.rating) || 0;
  const platformRatingCount = row.platform_rating_count ?? row.rating_count ?? 0;
  const course: Course = {
    id: row.id,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    coverImage: normalizeCoverUrl(row.cover_image),
    companyId: row.company_id ?? '',
    rating: platformRating,
    ratingCount: platformRatingCount,
    topicId: row.topic_id ?? '',
    bvid: row.bvid ?? null,
    intro: row.intro || row.description || '',
    chapters: normalizeChapters(row.chapters),
    platformRating,
    platformRatingCount,
    sourceScore: row.source_score == null || row.source_score === '' ? null : Number(row.source_score),
    sourceSummary: row.source_summary ?? '',
    ownerName: row.owner_name ?? '',
    contributorName: (row.contributor_name && String(row.contributor_name).trim()) || '开发团队',
    viewCount: row.view_count ?? undefined,
    danmakuCount: row.danmaku_count ?? undefined,
    replyCount: row.reply_count ?? undefined,
  };
  return preferRicherChapters(course);
}

function mapTopic(row: DbTopic): CatalogTopic {
  return {
    id: row.id,
    domainId: row.domain_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.cover_image,
    sortOrder: row.sort_order,
  };
}

function parseStringArray(raw: unknown): string[] {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value.map(String) : [];
}

function mapStudyPath(row: DbStudyPath): StudyPath {
  return {
    id: row.id,
    subjectId: row.subject_id,
    kind: row.kind as StudyPathKind,
    name: row.name,
    description: row.description,
    examSubjects: parseStringArray(row.exam_subjects),
    applicableMajors: parseStringArray(row.applicable_majors),
    timeframe: (Array.isArray(row.timeframe) ? row.timeframe : [])
      .map((item) => {
        const step = item as Partial<StudyPathTimeframeStep>;
        return {
          phase: String(step.phase ?? ''),
          content: String(step.content ?? ''),
        };
      })
      .filter((s) => s.phase || s.content),
    notes: row.notes,
    sortOrder: row.sort_order,
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

export async function fetchTopics(domainId?: string): Promise<CatalogTopic[]> {
  let query = supabase.from('catalog_topics').select('*').order('sort_order');
  if (domainId) query = query.eq('domain_id', domainId);

  const { data, error } = await query;
  if (error || !data?.length) {
    console.warn('[catalog] topics fallback to mock', error?.message);
    return domainId ? mockTopics.filter((t) => t.domainId === domainId) : mockTopics;
  }
  return (data as DbTopic[]).map(mapTopic);
}

export async function fetchTopicById(topicId: string): Promise<CatalogTopic | null> {
  const { data, error } = await supabase.from('catalog_topics').select('*').eq('id', topicId).maybeSingle();
  if (error || !data) {
    console.warn('[catalog] topic by id fallback to mock', error?.message);
    return mockTopics.find((t) => t.id === topicId) ?? null;
  }
  return mapTopic(data as DbTopic);
}

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select(courseSelect).order('id');
  if (error || !data?.length) {
    console.warn('[catalog] courses fallback to mock', error?.message);
    return mockCourses;
  }
  return (data as DbCourse[]).map(mapCourse);
}

export async function fetchCoursesByTopic(topicId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(courseSelect)
    .eq('topic_id', topicId)
    .order('id');
  if (error) {
    console.warn('[catalog] courses by topic fallback to mock', error.message);
    return mockCourses.filter((c) => c.topicId === topicId);
  }
  if (!data?.length) {
    return mockCourses.filter((c) => c.topicId === topicId);
  }
  return (data as DbCourse[]).map(mapCourse);
}

export async function fetchCourseById(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(courseSelect)
    .eq('id', courseId)
    .maybeSingle();
  if (error || !data) {
    console.warn('[catalog] course by id fallback to mock', error?.message);
    return mockCourses.find((c) => c.id === courseId) ?? null;
  }
  return mapCourse(data as DbCourse);
}

export async function fetchCompaniesWithCourses(): Promise<Company[]> {
  const [{ data: companyRows, error: companyError }, { data: courseRows, error: courseError }] =
    await Promise.all([
      supabase.from('companies').select('id, name, sector, color').order('id'),
      supabase.from('courses').select(courseSelect).order('id'),
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
    courses: courses.filter((c) => c.companyId === company.id),
  }));
}

export async function fetchStudyPaths(subjectId?: string): Promise<StudyPath[]> {
  let query = supabase.from('study_paths').select('*').order('sort_order');
  if (subjectId) query = query.eq('subject_id', subjectId);

  const { data, error } = await query;
  if (error || !data?.length) {
    console.warn('[catalog] study paths fallback to empty', error?.message);
    return [];
  }
  return (data as DbStudyPath[]).map(mapStudyPath);
}

export async function fetchStudyPathsByKind(kind: StudyPathKind): Promise<StudyPath[]> {
  const { data, error } = await supabase
    .from('study_paths')
    .select('*')
    .eq('kind', kind)
    .order('sort_order');

  if (error || !data?.length) {
    console.warn('[catalog] study paths by kind fallback to empty', error?.message);
    return [];
  }
  return (data as DbStudyPath[]).map(mapStudyPath);
}
