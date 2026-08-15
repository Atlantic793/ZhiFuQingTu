import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestBody = {
  question: string;
  context?: string;
  careerName?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sseEncode(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function buildSystemPrompt(): string {
  return [
    '你是一名资深的大学生求职面试辅导老师，面向应届生/实习生。',
    '请针对用户给出的面试题写参考回答。',
    '回答结构：',
    '1. 答题思路：先复述并澄清题意，说明面试官想考察什么；',
    '2. 回答要点：给出可直接组织语言的要点，结合 STAR / 岗位能力模型；',
    '3. 示例框架：给出一段口语化的示范表达（用「可以这样说…」引导）；',
    '4. 避坑提醒：常见错误与加分项（一句话即可）。',
    '要求：语气自然、不背稿；强调结合个人真实经历；结尾注明「参考答案仅供参考，请结合自身经历与岗位要求调整」。',
    '输出纯文本，不要 Markdown。',
  ].join('\n');
}

function buildUserPrompt(body: RequestBody): string {
  const { question, careerName, context } = body;
  const parts = [`题目：${question}`];
  if (careerName) parts.push(`面试岗位：${careerName}`);
  if (context) parts.push(`背景：${context}`);
  return parts.join('\n');
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
  if (!glmApiKey) return jsonResponse({ error: '未配置 GLM_API_KEY' }, 500);

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: '请求体无效' }, 400);
  }

  const question = body.question?.trim();
  if (!question) return jsonResponse({ error: '题目不能为空' }, 400);

  const model = Deno.env.get('GLM_MODEL') || 'glm-5.2';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(sseEncode(payload));

      try {
        send({ type: 'status', status: 'thinking', label: '正在构思参考答案…' });

        const glmResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${glmApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: buildSystemPrompt() },
              { role: 'user', content: buildUserPrompt(body) },
            ],
            temperature: 0.5,
            stream: true,
          }),
        });

        if (!glmResponse.ok) {
          let detail = `GLM 请求失败（HTTP ${glmResponse.status}）`;
          try {
            const data = await glmResponse.json();
            detail = data?.error?.message || data?.msg || data?.message || detail;
          } catch {
            /* ignore */
          }
          send({ type: 'error', error: detail });
          return;
        }

        if (!glmResponse.body) {
          send({ type: 'error', error: 'GLM 未返回流式正文' });
          return;
        }

        const reader = glmResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let content = '';
        let emitted = false;

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
              if (typeof delta?.content === 'string' && delta.content) {
                if (!emitted) {
                  send({ type: 'status', status: 'writing', label: '正在生成参考答案…' });
                  emitted = true;
                }
                content += delta.content;
                send({ type: 'delta', text: delta.content });
              }
            } catch {
              /* ignore partial JSON */
            }
          }
        }

        if (!content.trim()) {
          send({ type: 'error', error: '未生成有效回答，请重试' });
          return;
        }

        send({ type: 'done', content: content.trim(), userId: user.id });
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
