/**
 * Smoke trial: pull a small batch of public career-site jobs via jobhunt-cli,
 * attach coarse "suitable majors", write a local fixture (no Supabase write).
 *
 * Usage:
 *   npm run job:smoke
 *   node scripts/jobhunt-smoke.mjs
 *
 * Depends on local devDependency `jobhunt-cli` (see package.json).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { MAJOR_SEEDS, coarseSuitableMajors } from './lib/majorTag.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'src/data/fixtures/job-training-smoke.json');
const CLI_BIN = resolve(ROOT, 'node_modules/jobhunt-cli/bin/job.js');
const CLI_LABEL = 'jobhunt-cli@0.2.4 (local)';

/** @type {{ site: string, nature: 'intern' | 'campus', majorId: string, query: string, limit: number }[]} */
const TASKS = [
  { site: 'meituan', nature: 'intern', majorId: 'cs-se', query: '前端', limit: 3 },
  { site: 'bytedance', nature: 'campus', majorId: 'data', query: '数据分析', limit: 3 },
  { site: 'meituan', nature: 'intern', majorId: 'pm', query: '产品', limit: 3 },
];

/**
 * @param {string[]} args
 */
function runJobCli(args) {
  const result = spawnSync(process.execPath, [CLI_BIN, ...args], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
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

function seedById(id) {
  const seed = MAJOR_SEEDS.find((m) => m.id === id);
  if (!seed) throw new Error(`unknown major seed: ${id}`);
  return seed;
}

async function main() {
  console.log('[job:smoke] fetching public career APIs via jobhunt-cli…');

  /** @type {object[]} */
  const jobs = [];
  /** @type {{ task: object, ok: boolean, count?: number, error?: string }[]} */
  const runs = [];

  for (const task of TASKS) {
    const seed = seedById(task.majorId);
    const label = `${task.site}/${task.nature}/${task.query}`;
    try {
      console.log(`[job:smoke] ${label}`);
      const rows = runJobCli([
        task.site,
        'search',
        task.query,
        '--nature',
        task.nature,
        '--limit',
        String(task.limit),
        '--format',
        'json',
      ]);

      for (const row of rows) {
        jobs.push({
          source: 'jobhunt-cli',
          site: task.site,
          fetched_at: new Date().toISOString(),
          search: {
            query: task.query,
            nature: task.nature,
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

      runs.push({ task, ok: true, count: rows.length });
      console.log(`[job:smoke]   -> ${rows.length} jobs`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      runs.push({ task, ok: false, error: message });
      console.warn(`[job:smoke]   !! ${message}`);
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    purpose: 'training-job-library smoke (public APIs, no Boss crawl, no auto-apply)',
    cli: CLI_LABEL,
    major_seeds: MAJOR_SEEDS,
    runs,
    job_count: jobs.length,
    jobs,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`[job:smoke] wrote ${jobs.length} jobs -> ${OUT}`);
}

main().catch((err) => {
  console.error('[job:smoke] failed:', err);
  process.exit(1);
});
