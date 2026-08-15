import { supabase } from '../lib/supabase';
import type { CatalogTopic, Subject } from '../types/catalog';

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

async function postCatalogAdmin(body: Record<string, unknown>) {
  const { supabaseUrl, headers } = await getAuthHeaders();
  const response = await fetch(`${supabaseUrl}/functions/v1/catalog-admin`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: string; ok?: boolean; subject?: Subject; topic?: CatalogTopic };
  if (!response.ok || payload.error) {
    throw new Error(payload.error || `操作失败（HTTP ${response.status}）`);
  }
  return payload;
}

export async function createSubject(params: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Subject> {
  const payload = await postCatalogAdmin({
    action: 'create_subject',
    name: params.name,
    description: params.description || '',
    icon: params.icon || 'Cpu',
    color: params.color || '#B8C4C4',
  });
  if (!payload.subject) throw new Error('未返回学科');
  return payload.subject;
}

export async function createTopic(params: {
  domainId: string;
  name: string;
  description?: string;
  coverImage?: string;
}): Promise<CatalogTopic> {
  const payload = await postCatalogAdmin({
    action: 'create_topic',
    domainId: params.domainId,
    name: params.name,
    description: params.description || '',
    coverImage: params.coverImage || '',
  });
  if (!payload.topic) throw new Error('未返回类别');
  return payload.topic;
}
