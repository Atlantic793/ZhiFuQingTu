/**
 * Batch pull public career-site jobs via jobhunt-cli, attach coarse "suitable majors",
 * dedupe by site:externalId, write a local fixture (no Supabase write).
 *
 * Usage:
 *   npm run job:smoke
 *   npm run job:smoke -- --limit 50
 *
 * Depends on local devDependency `jobhunt-cli` (see package.json).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { MAJOR_SEEDS, coarseSuitableMajors, heuristicMajors } from './lib/majorTag.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'src/data/fixtures/job-training-smoke.json');
const CLI_BIN = resolve(ROOT, 'node_modules/jobhunt-cli/bin/job.js');
const CLI_LABEL = 'jobhunt-cli@0.2.4 (local)';

/** 每个站点 × 专业 × 实习/校招 的采集任务 */
/**
 * mode:
 *   - 'search'：按专业关键词 search（默认）
 *   - 'all'：不按关键词，拉全量（腾讯 search 接口返回空，需用 all）
 */
const ALL_MAJORS = [
  'cs-se',
  'data',
  'pm',
  'marketing',
  'design',
  'finance',
  'hr',
];

/** @type {{ site: string, natures: ('intern' | 'campus')[], majorIds?: string[], limit: number, mode?: 'search' | 'all' }[]} */
const COLLECT_PLAN = [
  // ---- 原有 5 站 ----
  {
    site: 'meituan',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 50,
  },
  {
    site: 'bytedance',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 50,
  },
  {
    site: 'tencent',
    natures: ['intern', 'campus'],
    mode: 'all',
    limit: 100,
  },
  {
    site: 'baidu',
    natures: ['intern', 'campus'],
    majorIds: ['cs-se', 'data', 'pm'],
    limit: 20,
  },
  {
    site: 'xiaomi',
    natures: ['intern', 'campus'],
    majorIds: ['cs-se', 'data', 'pm'],
    limit: 20,
  },
  // ---- A 波新增：稳定中文 JD 站（search 双 nature）----
  {
    site: 'didi',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'kuaishou',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'jd',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'xiaohongshu',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'bilibili',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'netease',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'mihoyo',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'minimax',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  {
    site: 'zhipu',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 30,
  },
  // ---- A 波新增：部分 nature ----
  {
    site: 'ctrip',
    natures: ['intern'],
    majorIds: ['cs-se', 'data', 'pm', 'marketing', 'finance'],
    limit: 20,
  },
  {
    site: 'huawei',
    natures: ['campus'],
    majorIds: ['cs-se', 'data', 'pm', 'ee'],
    limit: 30,
  },
  {
    site: 'ant',
    natures: ['intern', 'campus'],
    majorIds: ALL_MAJORS,
    limit: 20,
  },
  {
    site: 'dewu',
    natures: ['intern'],
    majorIds: ['cs-se', 'data', 'pm', 'marketing', 'design'],
    limit: 20,
  },
  {
    site: 'moonshot',
    natures: ['campus'],
    majorIds: ['cs-se', 'data', 'pm'],
    limit: 20,
  },
  {
    site: 'quark',
    natures: ['campus'],
    majorIds: ['cs-se', 'data', 'pm'],
    limit: 20,
  },
  {
    site: 'dingtalk',
    natures: ['campus'],
    majorIds: ['cs-se', 'data', 'pm'],
    limit: 20,
  },
  {
    site: 'alihealth',
    natures: ['campus'],
    majorIds: ['cs-se', 'data', 'pm', 'bio'],
    limit: 20,
  },
  {
    site: 'taotian',
    natures: ['campus'],
    majorIds: ['cs-se', 'data', 'pm', 'marketing'],
    limit: 20,
  },
  // ---- A 波新增：all 模式 ----
  {
    site: 'dji',
    natures: ['intern'],
    mode: 'all',
    limit: 50,
  },
];

function parseArgs(argv) {
  const flags = new Set(argv.slice(2).filter((a) => a.startsWith('--')));
  const limitFlag = argv.find((a) => a.startsWith('--limit='));
  return { limit: limitFlag ? Number(limitFlag.split('=')[1]) || 50 : 50 };
}

function seedById(id) {
  const seed = MAJOR_SEEDS.find((m) => m.id === id);
  if (!seed) throw new Error(`unknown major seed: ${id}`);
  return seed;
}

function runJobCli(args) {
  const result = spawnSync(process.execPath, [CLI_BIN, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || '').trim();
    throw new Error(`jobhunt-cli failed (${args.join(' ')}): ${err.slice(0, 500)}`);
  }

  const text = (result.stdout || '').trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end < start) {
    throw new Error(`no JSON array in CLI output for: ${args.join(' ')}`);
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function main() {
  const { limit } = parseArgs(process.argv);
  console.log(`[job:smoke] fetching public career APIs via jobhunt-cli… (limit=${limit})`);

  /** @type {object[]} */
  const jobs = [];
  /** @type {Map<string, { task: object, ok: boolean, count?: number, error?: string }>} */
  const runMap = new Map();
  /** @type {Set<string>} */
  const seen = new Set();
  let dupes = 0;
  let failCount = 0;

  for (const plan of COLLECT_PLAN) {
    for (const nature of plan.natures) {
      const mode = plan.mode ?? 'search';

      if (mode === 'all') {
        const task = { site: plan.site, nature, mode, query: '(all)' };
        const label = `${plan.site}/${nature}/all`;
        try {
          console.log(`[job:smoke] ${label}`);
          const rows = runJobCli([
            plan.site,
            'all',
            '--nature',
            nature,
            '--max',
            String(plan.limit),
            '--format',
            'json',
          ]);

          let added = 0;
          for (const row of rows) {
            const key = `${plan.site}:${row.id}`;
            if (seen.has(key)) {
              dupes += 1;
              continue;
            }
            seen.add(key);
            added += 1;
            jobs.push({
              source: 'jobhunt-cli',
              site: plan.site,
              fetched_at: new Date().toISOString(),
              search: {
                query: '(all)',
                nature,
                major_seed_id: '',
                major_seed_name: '',
              },
              job: {
                id: row.id,
                code: row.code ?? null,
                name: row.name,
                url: row.url,
                category_name: row.category_name,
                nature_code: row.nature_code,
                nature_name: row.nature_name,
                location_names: row.location_names,
                department_name: row.department_name,
                updated_at: row.updated_at,
                description: row.description,
                requirement: row.requirement,
              },
              suitable_majors: heuristicMajors(row),
              suitable_majors_note:
                'coarse only (all-mode keyword heuristic); GLM refine TBD',
            });
          }

          runMap.set(label, { task, ok: true, count: rows.length });
          console.log(`[job:smoke]   -> ${rows.length} rows, +${added} new`);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          runMap.set(label, { task, ok: false, error: message });
          failCount += 1;
          console.warn(`[job:smoke]   !! ${message}`);
        }
        continue;
      }

      for (const majorId of plan.majorIds ?? []) {
        const seed = seedById(majorId);
        const query = seed.searchTerms?.[0] ?? seed.name;
        const task = { site: plan.site, nature, majorId, query, limit };
        const label = `${plan.site}/${nature}/${seed.name}`;
        try {
          console.log(`[job:smoke] ${label}`);
          const rows = runJobCli([
            plan.site,
            'search',
            query,
            '--nature',
            nature,
            '--limit',
            String(limit),
            '--format',
            'json',
          ]);

          let added = 0;
          for (const row of rows) {
            const key = `${plan.site}:${row.id}`;
            if (seen.has(key)) {
              dupes += 1;
              continue;
            }
            seen.add(key);
            added += 1;
            jobs.push({
              source: 'jobhunt-cli',
              site: plan.site,
              fetched_at: new Date().toISOString(),
              search: {
                query,
                nature,
                major_seed_id: seed.id,
                major_seed_name: seed.name,
              },
              job: {
                id: row.id,
                code: row.code ?? null,
                name: row.name,
                url: row.url,
                category_name: row.category_name,
                nature_code: row.nature_code,
                nature_name: row.nature_name,
                location_names: row.location_names,
                department_name: row.department_name,
                updated_at: row.updated_at,
                description: row.description,
                requirement: row.requirement,
              },
              suitable_majors: coarseSuitableMajors(row, seed),
              suitable_majors_note:
                'coarse only (search seed + keyword heuristic); GLM refine TBD',
            });
          }

          runMap.set(label, { task, ok: true, count: rows.length });
          console.log(`[job:smoke]   -> ${rows.length} rows, +${added} new`);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          runMap.set(label, { task, ok: false, error: message });
          failCount += 1;
          console.warn(`[job:smoke]   !! ${message}`);
        }
      }
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    purpose: 'training-job-library batch (public APIs, no Boss crawl, no auto-apply)',
    cli: CLI_LABEL,
    collect_plan: COLLECT_PLAN,
    major_seeds: MAJOR_SEEDS,
    runs: [...runMap.values()],
    job_count: jobs.length,
    duplicate_skipped: dupes,
    failed_tasks: failCount,
    jobs,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `[job:smoke] wrote ${jobs.length} jobs (skipped ${dupes} dupes, ${failCount} failed tasks) -> ${OUT}`,
  );
}

main().catch((err) => {
  console.error('[job:smoke] failed:', err);
  process.exit(1);
});
