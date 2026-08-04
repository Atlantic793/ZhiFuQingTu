import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SERVICE_ROLE_KEY;

  if (!url) throw new Error('缺少 VITE_SUPABASE_URL / SUPABASE_URL');
  if (!key) {
    throw new Error(
      '缺少 SUPABASE_SERVICE_ROLE_KEY（Dashboard → Project Settings → API → service_role）。脚本写入需绕过 RLS，请勿把该 key 配成 VITE_ 前缀。'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function upsertCourse(supabase, row) {
  const { data, error } = await supabase.from('courses').upsert(row, { onConflict: 'id' }).select('id').single();
  if (error) throw new Error(`upsert courses: ${error.message}`);
  return data;
}

export async function upsertTrainingJob(supabase, row) {
  const { data, error } = await supabase
    .from('training_jobs')
    .upsert(row, { onConflict: 'id' })
    .select('id, title')
    .single();
  if (error) throw new Error(`upsert training_jobs: ${error.message}`);
  return data;
}

export async function ensureTopic(supabase, { topicId, topicName, domainId, coverImage, description }) {
  if (!topicId) throw new Error('topic_id 必填');
  const { data: existing } = await supabase
    .from('catalog_topics')
    .select('id')
    .eq('id', topicId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  if (!domainId) {
    throw new Error(`专题 ${topicId} 不存在，且未提供 domain_id，无法自动创建`);
  }

  const { error } = await supabase.from('catalog_topics').insert({
    id: topicId,
    domain_id: domainId,
    name: topicName || topicId,
    slug: topicId,
    description: description || '',
    cover_image: coverImage || '',
    sort_order: 0,
  });
  if (error) throw new Error(`insert catalog_topics: ${error.message}`);
  return topicId;
}
