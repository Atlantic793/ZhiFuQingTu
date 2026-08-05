import { supabase } from '../lib/supabase';
import type { SuitableMajor, TrainingJob } from '../types/training';
import fixturePayload from '../data/fixtures/job-training-smoke.json';

type DbTrainingJob = {
  id: string;
  source: string;
  site: string;
  external_id: string;
  job_code: string | null;
  title: string;
  url: string;
  category_name: string;
  nature_code: string;
  nature_name: string;
  location_names: string;
  department_name: string;
  description: string;
  requirement: string;
  source_updated_at: string;
  search_query: string;
  search_nature: string;
  major_seed_id: string;
  major_seed_name: string;
  suitable_majors: SuitableMajor[] | string | null;
  suitable_majors_note: string;
  fetched_at: string | null;
  created_at: string;
  updated_at: string;
};

type FixtureItem = {
  source: string;
  site: string;
  fetched_at: string;
  search?: {
    query?: string;
    nature?: string;
    major_seed_id?: string;
    major_seed_name?: string;
  };
  job?: {
    id: string;
    code?: string | null;
    name: string;
    url: string;
    category_name?: string;
    nature_code?: string;
    nature_name?: string;
    location_names?: string;
    department_name?: string;
    updated_at?: string;
    description?: string;
    requirement?: string;
  };
  suitable_majors?: SuitableMajor[];
  suitable_majors_note?: string;
};

function normalizeMajors(raw: SuitableMajor[] | string | null): SuitableMajor[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as SuitableMajor[];
    } catch {
      return [];
    }
  }
  return raw;
}

function mapJob(row: DbTrainingJob): TrainingJob {
  return {
    id: row.id,
    source: row.source,
    site: row.site,
    externalId: row.external_id,
    jobCode: row.job_code,
    title: row.title,
    url: row.url,
    categoryName: row.category_name,
    natureCode: row.nature_code,
    natureName: row.nature_name,
    locationNames: row.location_names,
    departmentName: row.department_name,
    description: row.description,
    requirement: row.requirement,
    sourceUpdatedAt: row.source_updated_at,
    searchQuery: row.search_query,
    searchNature: row.search_nature,
    majorSeedId: row.major_seed_id,
    majorSeedName: row.major_seed_name,
    suitableMajors: normalizeMajors(row.suitable_majors),
    suitableMajorsNote: row.suitable_majors_note,
    fetchedAt: row.fetched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 本地 fixture 兜底：与 scripts/jobhunt-import.mjs 的 toRow 同构映射 */
function mapFixtureItem(item: FixtureItem): TrainingJob {
  const job = item.job;
  const search = item.search ?? {};
  return {
    id: `${item.site}:${job?.id ?? ''}`,
    source: item.source,
    site: item.site,
    externalId: String(job?.id ?? ''),
    jobCode: job?.code ?? null,
    title: job?.name ?? '',
    url: job?.url ?? '',
    categoryName: job?.category_name ?? '',
    natureCode: job?.nature_code ?? '',
    natureName: job?.nature_name ?? '',
    locationNames: job?.location_names ?? '',
    departmentName: job?.department_name ?? '',
    description: job?.description ?? '',
    requirement: job?.requirement ?? '',
    sourceUpdatedAt: job?.updated_at ?? '',
    searchQuery: search.query ?? '',
    searchNature: search.nature ?? '',
    majorSeedId: search.major_seed_id ?? '',
    majorSeedName: search.major_seed_name ?? '',
    suitableMajors: item.suitable_majors ?? [],
    suitableMajorsNote: item.suitable_majors_note ?? '',
    fetchedAt: item.fetched_at ?? null,
    createdAt: item.fetched_at ?? '',
    updatedAt: item.fetched_at ?? '',
  };
}

function fixtureJobs(): TrainingJob[] {
  const jobs = (fixturePayload as { jobs?: FixtureItem[] }).jobs ?? [];
  return jobs.map(mapFixtureItem);
}

const PAGE_SIZE = 1000;

/**
 * PostgREST 单次查询默认最多返回 1000 行，分页拉全量避免截断。
 * 返回 null 表示查询出错。
 */
async function fetchAllTrainingJobs(
  query: {
    range: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>;
  },
): Promise<DbTrainingJob[] | null> {
  const all: DbTrainingJob[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) {
      console.warn('[training] range query failed');
      return null;
    }
    if (!data?.length) break;
    all.push(...(data as DbTrainingJob[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

export async function fetchTrainingJobs(): Promise<TrainingJob[]> {
  const rows = await fetchAllTrainingJobs(supabase.from('training_jobs').select('*').order('title'));
  if (!rows?.length) {
    console.warn('[training] training_jobs fallback to fixture');
    return fixtureJobs();
  }
  return rows.map(mapJob);
}

export async function fetchTrainingJobsByMajor(majorId: string): Promise<TrainingJob[]> {
  const rows = await fetchAllTrainingJobs(
    supabase.from('training_jobs').select('*').contains('suitable_majors', [{ id: majorId }]).order('title'),
  );
  if (!rows) {
    console.warn('[training] jobs by major fallback to fixture');
    return fixtureJobs().filter((j) => j.suitableMajors.some((m) => m.id === majorId));
  }
  if (!rows.length) return [];
  return rows.map(mapJob);
}

export async function fetchTrainingJobById(jobId: string): Promise<TrainingJob | null> {
  const { data, error } = await supabase
    .from('training_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();
  if (error || !data) {
    console.warn('[training] job by id fallback to fixture', error?.message);
    return fixtureJobs().find((j) => j.id === jobId) ?? null;
  }
  return mapJob(data as DbTrainingJob);
}
