import { supabase } from '../lib/supabase';

// ── 科目枚举（与迁移 20260814000003 的 check 约束保持一致）──

export const PAPER_SUBJECTS = ['政治', '数学', '英语', '专业课'] as const;

export type KaoyanSubject = (typeof PAPER_SUBJECTS)[number];
export type PaperStatus = 'pending' | 'approved' | 'rejected';

export type KaoyanPaper = {
  id: string;
  slug: string;
  title: string;
  year: number;
  subject: KaoyanSubject;
  category: string | null;
  content: string | null;
  filePaths: string[];
  fileSize: number;
  uploadedBy: string | null;
  status: PaperStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
};

// ── DB row types (snake_case as stored in Supabase) ──

type DbKaoyanPaper = {
  id: string;
  slug: string;
  title: string;
  year: number;
  subject: string;
  category: string | null;
  content: string | null;
  file_paths: string[] | string | null;
  file_size: number;
  uploaded_by: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
};

const PAPER_SELECT =
  'id, slug, title, year, subject, category, content, file_paths, file_size, uploaded_by, status, reviewed_by, reviewed_at, review_note, created_at';

const PAGE_SIZE = 500;

function normalizePaths(raw: string[] | string | null): string[] {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }
  return raw;
}

function mapPaper(row: DbKaoyanPaper): KaoyanPaper {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    year: row.year,
    subject: row.subject as KaoyanSubject,
    category: row.category ?? null,
    content: row.content ?? null,
    filePaths: normalizePaths(row.file_paths),
    fileSize: row.file_size,
    uploadedBy: row.uploaded_by ?? null,
    status: (row.status as PaperStatus) || 'pending',
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    reviewNote: row.review_note ?? null,
    createdAt: row.created_at,
  };
}

/** 分页拉全量（PostgREST 单次上限 1000 行）；RLS 已把可见范围过滤到 approved。 */
export async function fetchPapers(): Promise<KaoyanPaper[]> {
  const local = await fetchLocalPapers();
  if (local) return local;
  return fetchSupabasePapers();
}

// ── 本地测试数据（仅 dev 模式）：public/test-papers/manifest.json 存在时走本地静态文件，不碰数据库 ──

const LOCAL_MANIFEST_PATH = '/test-papers/manifest.json';

type LocalManifestItem = {
  title: string;
  year: number;
  subject: string;
  category?: string;
  content?: string;
  pages: string[];
};

async function fetchLocalPapers(): Promise<KaoyanPaper[] | null> {
  if (!import.meta.env.DEV) return null;
  try {
    const res = await fetch(LOCAL_MANIFEST_PATH);
    if (!res.ok) return null;
    const items = (await res.json()) as LocalManifestItem[];
    return items.map((item, i) => ({
      id: `local-${i}`,
      slug: `local-${i}`,
      title: item.title,
      year: item.year,
      subject: item.subject as KaoyanSubject,
      category: item.category ?? null,
      content: item.content ?? null,
      filePaths: item.pages.map((p) => `/${p}`),
      fileSize: 0,
      uploadedBy: null,
      status: 'approved' as const,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      createdAt: '',
    }));
  } catch {
    return null;
  }
}

async function fetchSupabasePapers(): Promise<KaoyanPaper[]> {
  const rows: DbKaoyanPaper[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kaoyan_papers')
      .select(PAPER_SELECT)
      .order('year', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.warn('[paper] fetch papers page error', error.message);
      break;
    }
    if (!data?.length) break;

    rows.push(...(data as unknown as DbKaoyanPaper[]));

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  // 站点只展示有图片的真题；纯文本条目（回忆版/真题分析）不显示
  return rows.map(mapPaper).filter((p) => p.filePaths.length > 0);
}

/** 私有桶看图：为一份真题的所有页面图生成签名 URL（有效期 1 小时），打开弹窗时调用。 */
export async function getPaperImageUrls(paper: KaoyanPaper): Promise<string[]> {
  // 本地 dev 测试数据：路径以 / 开头即为 dev server 静态文件，直接使用
  if (paper.filePaths[0]?.startsWith('/')) return paper.filePaths;

  const urls = await Promise.all(
    paper.filePaths.map(async (path) => {
      const { data, error } = await supabase.storage
        .from('kaoyan-papers')
        .createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) {
        throw new Error(`签名图片链接失败：${error?.message ?? '未知错误'}`);
      }
      return data.signedUrl;
    })
  );
  return urls;
}
