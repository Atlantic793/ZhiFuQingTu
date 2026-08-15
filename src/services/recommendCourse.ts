import { supabase } from '../lib/supabase';
import { extractBvids } from '../utils/sourceSummary';

export type RecommendCourseResult = {
  ok: boolean;
  existed: boolean;
  courseId: string;
  title: string;
  contributorName: string;
  summaryOk: boolean | null;
  message?: string;
  topicName?: string;
  bvid?: string;
};

export type RecommendBatchItem = RecommendCourseResult & {
  bvid: string;
  error?: string;
};

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('登录已失效，请重新登录');
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('缺少 Supabase 环境变量，请检查 .env');
  }
  return {
    supabaseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
  };
}

/**
 * 用户推荐 B 站课程：定好专题后粘贴 BV/链接，走 recommend-course Edge Function。
 */
export async function recommendCourse(params: {
  topicId: string;
  urlOrBvid: string;
}): Promise<RecommendCourseResult> {
  const { supabaseUrl, headers } = await getAuthHeaders();

  const response = await fetch(`${supabaseUrl}/functions/v1/recommend-course`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      topicId: params.topicId,
      urlOrBvid: params.urlOrBvid,
    }),
  });

  let payload: RecommendCourseResult & { error?: string };
  try {
    payload = (await response.json()) as RecommendCourseResult & { error?: string };
  } catch {
    throw new Error(`推荐失败（HTTP ${response.status}）`);
  }

  if (!response.ok || payload.error) {
    throw new Error(payload.error || `推荐失败（HTTP ${response.status}）`);
  }
  if (!payload.ok || !payload.courseId) {
    throw new Error('推荐失败：服务未返回课程');
  }
  return payload;
}

/** 从文本解析多个 BV，逐个推荐（串行，避免 B 站限流） */
export async function recommendCoursesBatch(params: {
  topicId: string;
  text: string;
  onProgress?: (done: number, total: number, current: string) => void;
}): Promise<{ items: RecommendBatchItem[]; bvids: string[] }> {
  const bvids = extractBvids(params.text);
  if (!bvids.length) {
    throw new Error('未识别到 BV 号，请粘贴一个或多个 B 站链接 / BV');
  }

  const items: RecommendBatchItem[] = [];
  for (let i = 0; i < bvids.length; i++) {
    const bvid = bvids[i];
    params.onProgress?.(i, bvids.length, bvid);
    try {
      const result = await recommendCourse({ topicId: params.topicId, urlOrBvid: bvid });
      items.push({ ...result, bvid });
    } catch (e) {
      items.push({
        ok: false,
        existed: false,
        courseId: '',
        title: '',
        contributorName: '',
        summaryOk: null,
        bvid,
        error: e instanceof Error ? e.message : '推荐失败',
      });
    }
  }
  params.onProgress?.(bvids.length, bvids.length, '');
  return { items, bvids };
}

export { extractBvids };
