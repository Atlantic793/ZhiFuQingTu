import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { buildSystemPrompt } from './prompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function normalizeCoverUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `https://${url}`;
}

type Goal = 'career' | 'courses' | 'training' | 'free';
type ChatTurn = { role: 'user' | 'assistant' | 'tool' | 'system'; content?: string | null; tool_calls?: unknown; tool_call_id?: string; name?: string };

type SubjectPayload = { id?: string; name?: string; description?: string } | null;

type ClientAction =
  | { type: 'navigate'; path: string; label: string }
  | { type: 'open_resource'; url: string; title: string; requiresConfirm: true }
  | { type: 'start_quiz'; courseId: string; courseTitle: string; path: string; label: string }
  | { type: 'show_courses'; courses: Array<{ id: string; title: string; coverImage: string; rating: number }> };

type RequestBody = {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  goal?: Goal;
  subject?: SubjectPayload;
};

const GOAL_TOOL_ALLOWLIST: Record<Goal, string[]> = {
  career: [
    'search_careers',
    'get_career_detail',
    'recommend_learning_path',
    'search_courses',
    'navigate_app',
  ],
  courses: ['search_courses', 'open_resource', 'navigate_app', 'get_career_detail'],
  training: ['search_courses', 'start_quiz', 'navigate_app', 'open_resource'],
  free: ['search_careers', 'search_courses', 'get_career_detail', 'navigate_app'],
};

function normalizeGoal(goal: string | undefined): Goal {
  if (goal === 'career' || goal === 'courses' || goal === 'training' || goal === 'free') {
    return goal;
  }
  return 'free';
}

const ALL_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_careers',
      description: '按关键词检索平台内职业方向（软件工程师、数据分析师等）',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '职业相关关键词，可为空表示列出全部' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_career_detail',
      description: '获取某个职业的详情及其关联推荐课程',
      parameters: {
        type: 'object',
        properties: {
          career_id: { type: 'string', description: '职业 ID' },
          career_name: { type: 'string', description: '职业名称（不知道 ID 时可用）' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_courses',
      description: '检索平台内课程/实训（评分课与企业实训）',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '课程关键词' },
          company: { type: 'string', description: '企业名称过滤，可选' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommend_learning_path',
      description: '根据职业推荐一条学习路径（关联课程列表）',
      parameters: {
        type: 'object',
        properties: {
          career_id: { type: 'string' },
          career_name: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_app',
      description: '导航到站内页面：/、/agent、/rating、/training、/profile',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '站内路径，如 /training 或 /rating',
          },
          label: { type: 'string', description: '按钮文案，可选' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_resource',
      description: '打开课程外链学习资源（如 B 站视频页），需用户确认',
      parameters: {
        type: 'object',
        properties: {
          course_id: { type: 'string', description: '课程 ID，优先使用' },
          url: { type: 'string', description: '直接 URL，可选' },
          title: { type: 'string', description: '资源标题，可选' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'start_quiz',
      description: '为指定实训课程拉起测验（会跳转到职业实训页并自动开始测验）',
      parameters: {
        type: 'object',
        properties: {
          course_id: { type: 'string', description: '课程 ID，优先使用' },
          course_title: { type: 'string', description: '课程标题（不知道 ID 时可用）' },
        },
      },
    },
  },
];

function toolsForGoal(goal: Goal) {
  const allow = new Set(GOAL_TOOL_ALLOWLIST[goal]);
  return ALL_TOOLS.filter((t) => allow.has(t.function.name));
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function allowPath(path: string): string | null {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const allowed = ['/', '/agent', '/rating', '/training', '/profile'];
  const base = normalized.split('?')[0];
  return allowed.includes(base) ? base : null;
}

async function runTool(
  supabase: SupabaseClient,
  name: string,
  args: Record<string, unknown>,
  actions: ClientAction[]
): Promise<unknown> {
  switch (name) {
    case 'search_careers': {
      const query = String(args.query ?? '').trim();
      let q = supabase.from('careers').select('id, name, description, icon, color').limit(20);
      if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      const { data, error } = await q;
      if (error) return { error: error.message };
      return { careers: data ?? [] };
    }
    case 'get_career_detail':
    case 'recommend_learning_path': {
      const careerId = String(args.career_id ?? '').trim();
      const careerName = String(args.career_name ?? '').trim();
      let careerQuery = supabase.from('careers').select('id, name, description, icon, color').limit(1);
      if (careerId) careerQuery = careerQuery.eq('id', careerId);
      else if (careerName) careerQuery = careerQuery.ilike('name', `%${careerName}%`);
      else return { error: '需要 career_id 或 career_name' };

      const { data: careers, error: careerError } = await careerQuery;
      if (careerError) return { error: careerError.message };
      const career = careers?.[0];
      if (!career) return { error: '未找到该职业' };

      const { data: links } = await supabase
        .from('career_courses')
        .select('course_id')
        .eq('career_id', career.id);
      const courseIds = (links ?? []).map((l) => l.course_id);
      let courses: unknown[] = [];
      if (courseIds.length > 0) {
        const { data: courseRows } = await supabase
          .from('courses')
          .select('id, title, description, video_url, rating, company_id')
          .in('id', courseIds);
        courses = courseRows ?? [];
      }

      if (name === 'recommend_learning_path') {
        return {
          career,
          path: [
            { step: 1, action: '了解职业要求', detail: career.description },
            { step: 2, action: '完成关联课程', courses },
            { step: 3, action: '前往职业实训巩固', navigate: '/training' },
          ],
        };
      }
      return { career, related_courses: courses };
    }
    case 'search_courses': {
      const query = String(args.query ?? '').trim();
      const company = String(args.company ?? '').trim();
      let companyId: string | null = null;
      if (company) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name')
          .ilike('name', `%${company}%`)
          .limit(1);
        companyId = companies?.[0]?.id ?? null;
      }
      let q = supabase
        .from('courses')
        .select('id, title, description, video_url, rating, rating_count, company_id, cover_image')
        .limit(20);
      if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      if (companyId) q = q.eq('company_id', companyId);
      const { data, error } = await q;
      if (error) return { error: error.message };
      const courses = (data ?? []) as Array<Record<string, unknown>>;
      if (courses.length > 0) {
        actions.push({
          type: 'show_courses',
          courses: courses.slice(0, 5).map((c) => ({
            id: String(c.id ?? ''),
            title: String(c.title ?? ''),
            coverImage: normalizeCoverUrl(String(c.cover_image ?? '')),
            rating: Number(c.rating ?? 0),
          })),
        } as ClientAction);
      }
      return { courses };
    }
    case 'navigate_app': {
      const path = allowPath(String(args.path ?? ''));
      if (!path) return { error: '非法路径，仅支持 /, /agent, /rating, /training, /profile' };
      const label = String(args.label ?? `前往 ${path}`);
      actions.push({ type: 'navigate', path, label });
      return { ok: true, path, note: '已准备站内跳转，前端将自动执行' };
    }
    case 'open_resource': {
      const courseId = String(args.course_id ?? '').trim();
      let url = String(args.url ?? '').trim();
      let title = String(args.title ?? '学习资源');
      if (courseId) {
        const { data: course } = await supabase
          .from('courses')
          .select('id, title, video_url')
          .eq('id', courseId)
          .maybeSingle();
        if (!course) return { error: '课程不存在' };
        url = course.video_url;
        title = course.title;
      }
      if (!url || !/^https?:\/\//i.test(url)) {
        return { error: '缺少合法的 http(s) 资源链接' };
      }
      actions.push({ type: 'open_resource', url, title, requiresConfirm: true });
      return { ok: true, url, title, note: '已准备外链，需用户确认后打开' };
    }
    case 'start_quiz': {
      const courseId = String(args.course_id ?? '').trim();
      const courseTitle = String(args.course_title ?? '').trim();
      let courseQuery = supabase.from('courses').select('id, title').limit(1);
      if (courseId) courseQuery = courseQuery.eq('id', courseId);
      else if (courseTitle) courseQuery = courseQuery.ilike('title', `%${courseTitle}%`);
      else return { error: '需要 course_id 或 course_title' };

      const { data: courses, error } = await courseQuery;
      if (error) return { error: error.message };
      const course = courses?.[0];
      if (!course) return { error: '未找到可测验的课程' };

      const path = `/training?courseId=${encodeURIComponent(course.id)}&quiz=1`;
      const label = `开始「${course.title}」测验`;
      actions.push({
        type: 'start_quiz',
        courseId: course.id,
        courseTitle: course.title,
        path,
        label,
      });
      return { ok: true, course_id: course.id, title: course.title, path, note: '已准备拉起测验，前端将跳转实训页' };
    }
    default:
      return { error: `未知工具: ${name}` };
  }
}

type ToolCallAcc = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

function sseEncode(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function statusForToolNames(names: string[]): { status: string; label: string } {
  if (names.some((n) => n === 'recommend_learning_path')) {
    return { status: 'planning', label: '规划中…' };
  }
  if (names.some((n) => n.startsWith('search_') || n === 'get_career_detail')) {
    return { status: 'searching', label: '正在查阅平台资料…' };
  }
  if (names.some((n) => n === 'navigate_app' || n === 'open_resource' || n === 'start_quiz')) {
    return { status: 'planning', label: '正在准备操作…' };
  }
  return { status: 'thinking', label: '思考中…' };
}

async function consumeGlmStream(
  response: Response,
  onDelta: (text: string) => void
): Promise<{ content: string; toolCalls: ToolCallAcc[]; error?: string }> {
  if (!response.ok) {
    let detail = `GLM 请求失败（HTTP ${response.status}）`;
    try {
      const glmData = await response.json();
      detail = glmData?.error?.message || glmData?.msg || glmData?.message || detail;
    } catch {
      /* ignore */
    }
    return { content: '', toolCalls: [], error: detail };
  }

  if (!response.body) {
    return { content: '', toolCalls: [], error: 'GLM 未返回流式正文' };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  const toolCallsByIndex: Record<number, ToolCallAcc> = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta;
        if (!delta) continue;

        if (typeof delta.content === 'string' && delta.content) {
          content += delta.content;
          onDelta(delta.content);
        }

        if (Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const idx = typeof tc.index === 'number' ? tc.index : 0;
            if (!toolCallsByIndex[idx]) {
              toolCallsByIndex[idx] = {
                id: tc.id || `call_${idx}`,
                type: 'function',
                function: { name: '', arguments: '' },
              };
            }
            if (tc.id) toolCallsByIndex[idx].id = tc.id;
            if (tc.function?.name) toolCallsByIndex[idx].function.name += tc.function.name;
            if (tc.function?.arguments) {
              toolCallsByIndex[idx].function.arguments += tc.function.arguments;
            }
          }
        }
      } catch {
        /* ignore partial JSON */
      }
    }
  }

  return {
    content,
    toolCalls: Object.keys(toolCallsByIndex)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => toolCallsByIndex[Number(k)]),
  };
}

function dedupeActions(actions: ClientAction[]): ClientAction[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    let key: string;
    if (a.type === 'navigate') {
      key = `nav:${a.path}`;
    } else if (a.type === 'open_resource') {
      key = `open:${a.url}`;
    } else if (a.type === 'start_quiz') {
      key = `quiz:${a.courseId}`;
    } else if (a.type === 'show_courses') {
      const ids = a.courses.map((c) => c.id).sort().join(',');
      key = `courses:${ids}`;
    } else {
      key = `other:${a.type}`;
    }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: '未登录' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: '服务端缺少 Supabase 环境变量' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return jsonResponse({ error: '登录已失效，请重新登录' }, 401);

  const glmApiKey = Deno.env.get('GLM_API_KEY');
  if (!glmApiKey) {
    return jsonResponse({ error: '未配置 GLM_API_KEY' }, 500);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: '请求体无效' }, 400);
  }

  const message = body.message?.trim();
  if (!message) return jsonResponse({ error: '消息不能为空' }, 400);

  const goal: Goal = normalizeGoal(body.goal);
  const allowedTools = new Set(GOAL_TOOL_ALLOWLIST[goal]);
  const tools = toolsForGoal(goal);
  const history = Array.isArray(body.history) ? body.history : [];
  const subject = body.subject ?? null;
  const model = Deno.env.get('GLM_MODEL') || 'glm-5.2';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(sseEncode(payload));

      try {
        send({ type: 'status', status: 'thinking', label: '思考中…' });

        const messages: ChatTurn[] = [
          { role: 'system', content: buildSystemPrompt(goal, subject) },
          ...history.map((t) => ({ role: t.role, content: t.content })),
          { role: 'user', content: message },
        ];

        const actions: ClientAction[] = [];
        let finalContent = '';
        const maxRounds = 5;

        for (let round = 0; round < maxRounds; round++) {
          if (round > 0) {
            send({
              type: 'status',
              status: 'thinking',
              label: '思考中…',
              reset: true,
            });
          }

          const glmResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${glmApiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              tools,
              tool_choice: 'auto',
              temperature: 0.5,
              stream: true,
            }),
          });

          let emittedContent = false;
          const streamed = await consumeGlmStream(glmResponse, (delta) => {
            if (!emittedContent) {
              send({ type: 'status', status: 'writing', label: '正在组织回答…' });
              emittedContent = true;
            }
            send({ type: 'delta', text: delta });
          });

          if (streamed.error) {
            send({ type: 'error', error: streamed.error });
            return;
          }

          if (streamed.toolCalls.length > 0) {
            const toolNames = streamed.toolCalls.map((t) => t.function.name);
            const st = statusForToolNames(toolNames);
            send({ type: 'status', status: st.status, label: st.label, reset: true });

            messages.push({
              role: 'assistant',
              content: streamed.content || null,
              tool_calls: streamed.toolCalls,
            });

            for (const call of streamed.toolCalls) {
              let args: Record<string, unknown> = {};
              try {
                args = JSON.parse(call.function.arguments || '{}');
              } catch {
                args = {};
              }
              if (!allowedTools.has(call.function.name)) {
                messages.push({
                  role: 'tool',
                  tool_call_id: call.id,
                  name: call.function.name,
                  content: JSON.stringify({
                    error: `当前模式「${goal}」不允许使用工具 ${call.function.name}`,
                  }),
                });
                continue;
              }
              const result = await runTool(supabase, call.function.name, args, actions);
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                name: call.function.name,
                content: JSON.stringify(result),
              });
            }
            continue;
          }

          finalContent = streamed.content.trim();
          break;
        }

        if (!finalContent) {
          finalContent =
            actions.length > 0
              ? '我已根据平台数据为你准备好建议，并附上可执行操作。'
              : '抱歉，我这次没有生成有效回复，请再试一次。';
          send({ type: 'delta', text: finalContent });
        }

        send({
          type: 'done',
          content: finalContent,
          actions: dedupeActions(actions),
          userId: user.id,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : '未知错误';
        send({ type: 'error', error: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
});
