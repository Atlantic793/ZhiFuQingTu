import { supabase } from '../lib/supabase';
import type { BaoyanProgram, BaoyanUniversity } from '../types/catalog';

// ── DB row types (snake_case as stored in Supabase) ──

type DbBaoyanUniversity = {
  id: string;
  name: string;
  tier: string | null;
  region: string | null;
  sort_order: number | null;
};

type DbBaoyanProgram = {
  id: string;
  university_id: string;
  program_name: string;
  url: string;
  category: string;
  deadline_status: string;
  deadline: string | null;
  deadline_raw: string;
  source_url: string;
  published_at: string | null;
};

const PROGRAM_SELECT =
  'id, university_id, program_name, url, category, deadline_status, deadline, deadline_raw, source_url, published_at';

const PAGE_SIZE = 900;

// ── Helpers ──

function mapUniversity(row: DbBaoyanUniversity): BaoyanUniversity {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier ?? null,
    region: row.region ?? null,
  };
}

function mapProgram(row: DbBaoyanProgram, uniMap: Map<string, BaoyanUniversity>): BaoyanProgram {
  const uni = uniMap.get(row.university_id);
  return {
    id: row.id,
    universityId: row.university_id,
    universityName: uni?.name ?? '',
    programName: row.program_name,
    url: row.url,
    category: row.category,
    deadlineStatus: (row.deadline_status as BaoyanProgram['deadlineStatus']) || 'tba',
    deadline: row.deadline ?? null,
    deadlineRaw: row.deadline_raw,
    sourceUrl: row.source_url,
    publishedAt: row.published_at ?? null,
  };
}

// ── Internal helpers ──

async function fetchUniversityMap(): Promise<Map<string, BaoyanUniversity>> {
  const { data, error } = await supabase
    .from('baoyan_universities')
    .select('id, name, tier, region, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false });

  if (error || !data?.length) {
    console.warn('[pathway] fetch universities fallback', error?.message);
    return new Map();
  }

  const map = new Map<string, BaoyanUniversity>();
  for (const row of data as unknown as DbBaoyanUniversity[]) {
    map.set(row.id, mapUniversity(row));
  }
  return map;
}

/** Fetch all programs across multiple pages (Supabase caps at 1000 rows/request). */
async function fetchAllProgramRows(): Promise<DbBaoyanProgram[]> {
  const rows: DbBaoyanProgram[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('baoyan_programs')
      .select(PROGRAM_SELECT)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.warn('[pathway] fetch programs page error', error.message);
      break;
    }

    if (!data?.length) break;

    rows.push(...(data as unknown as DbBaoyanProgram[]));

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

// ── Public API ──

/** Fetch all universities sorted by source-data order. */
export async function fetchBaoyanUniversities(): Promise<BaoyanUniversity[]> {
  const { data, error } = await supabase
    .from('baoyan_universities')
    .select('id, name, tier, region, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false });

  if (error || !data?.length) {
    console.warn('[pathway] fetchBaoyanUniversities fallback', error?.message);
    return [];
  }

  return (data as unknown as DbBaoyanUniversity[]).map(mapUniversity);
}

export async function fetchBaoyanPrograms(): Promise<BaoyanProgram[]> {
  const [uniMap, rows] = await Promise.all([fetchUniversityMap(), fetchAllProgramRows()]);
  return rows.map((row) => mapProgram(row, uniMap));
}

export async function fetchBaoyanProgramsByCategory(category: string): Promise<BaoyanProgram[]> {
  const [uniMap, rows] = await Promise.all([
    fetchUniversityMap(),
    (async (): Promise<DbBaoyanProgram[]> => {
      const all: DbBaoyanProgram[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from('baoyan_programs')
          .select(PROGRAM_SELECT)
          .eq('category', category)
          .order('created_at', { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          console.warn('[pathway] fetch by category page error', error.message);
          break;
        }
        if (!data?.length) break;
        all.push(...(data as unknown as DbBaoyanProgram[]));
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }
      return all;
    })(),
  ]);

  return rows.map((row) => mapProgram(row, uniMap));
}
