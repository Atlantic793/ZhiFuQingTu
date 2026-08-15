import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CreateSubjectBody = {
  action: 'create_subject';
  name: string;
  description?: string;
  icon?: string;
  color?: string;
};

type CreateTopicBody = {
  action: 'create_topic';
  domainId: string;
  name: string;
  description?: string;
  coverImage?: string;
};

type RequestBody = CreateSubjectBody | CreateTopicBody;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function slugify(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .slice(0, 40);
  return base || `item-${Date.now()}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: '未登录' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return jsonResponse({ error: '服务端缺少 Supabase 环境变量' }, 500);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return jsonResponse({ error: '登录已失效，请重新登录' }, 401);

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: '请求体无效' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (body.action === 'create_subject') {
    const name = String(body.name || '').trim();
    if (!name) return jsonResponse({ error: '学科名称不能为空' }, 400);

    const { data: existing } = await admin.from('subjects').select('id,name').eq('name', name).maybeSingle();
    if (existing) return jsonResponse({ error: `学科「${name}」已存在` }, 409);

    const { data: rows } = await admin.from('subjects').select('id');
    const nums = (rows || [])
      .map((r) => Number(r.id))
      .filter((n) => Number.isFinite(n));
    const nextId = String((nums.length ? Math.max(...nums) : 0) + 1);

    const row = {
      id: nextId,
      name,
      icon: String(body.icon || 'Cpu').trim() || 'Cpu',
      description: String(body.description || '').trim(),
      color: String(body.color || '#B8C4C4').trim() || '#B8C4C4',
    };

    const { error } = await admin.from('subjects').insert(row);
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ ok: true, subject: row });
  }

  if (body.action === 'create_topic') {
    const domainId = String(body.domainId || '').trim();
    const name = String(body.name || '').trim();
    if (!domainId) return jsonResponse({ error: '请选择所属学科' }, 400);
    if (!name) return jsonResponse({ error: '类别名称不能为空' }, 400);

    const { data: domain } = await admin.from('subjects').select('id').eq('id', domainId).maybeSingle();
    if (!domain) return jsonResponse({ error: '学科不存在' }, 404);

    const { data: sameName } = await admin
      .from('catalog_topics')
      .select('id')
      .eq('domain_id', domainId)
      .eq('name', name)
      .maybeSingle();
    if (sameName) return jsonResponse({ error: `该学科下已有类别「${name}」` }, 409);

    const { data: topicRows } = await admin.from('catalog_topics').select('id,sort_order');
    const topicId = `topic-${slugify(name)}-${Date.now().toString(36).slice(-4)}`;
    const maxSort = Math.max(0, ...(topicRows || []).map((t) => Number(t.sort_order) || 0));

    const row = {
      id: topicId,
      domain_id: domainId,
      name,
      slug: topicId,
      description: String(body.description || '').trim(),
      cover_image: String(body.coverImage || '').trim(),
      sort_order: maxSort + 1,
    };

    const { error } = await admin.from('catalog_topics').insert(row);
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({
      ok: true,
      topic: {
        id: row.id,
        domainId: row.domain_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        coverImage: row.cover_image,
        sortOrder: row.sort_order,
      },
    });
  }

  return jsonResponse({ error: '未知 action' }, 400);
});
