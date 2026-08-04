/**
 * Import job-training smoke fixture into Supabase `training_jobs`.
 *
 * Usage:
 *   npm run job:import
 *   npm run job:import -- --dry-run
 *
 * Requires:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './loadEnv.mjs';
import { createAdminClient, upsertTrainingJob } from './lib/supabaseAdmin.mjs';

loadEnvFile('.env');

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, '../src/data/fixtures/job-training-smoke.json');

function parseArgs(argv) {
  const flags = new Set(argv.slice(2).filter((a) => a.startsWith('--')));
  return { dryRun: flags.has('--dry-run') };
}

/**
 * @param {object} item fixture job entry
 */
function toRow(item) {
  const job = item.job;
  const search = item.search || {};
  const site = item.site;
  const externalId = String(job.id);
  return {
    id: `${site}:${externalId}`,
    source: item.source || 'jobhunt-cli',
    site,
    external_id: externalId,
    job_code: job.code || null,
    title: job.name,
    url: job.url || '',
    category_name: job.category_name || '',
    nature_code: job.nature_code || '',
    nature_name: job.nature_name || '',
    location_names: job.location_names || '',
    department_name: job.department_name || '',
    description: job.description || '',
    requirement: job.requirement || '',
    source_updated_at: job.updated_at || '',
    search_query: search.query || '',
    search_nature: search.nature || '',
    major_seed_id: search.major_seed_id || '',
    major_seed_name: search.major_seed_name || '',
    suitable_majors: item.suitable_majors || [],
    suitable_majors_note: item.suitable_majors_note || '',
    raw: { job, search },
    fetched_at: item.fetched_at || null,
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const { dryRun } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
  if (jobs.length === 0) {
    throw new Error(`fixture 无岗位：${FIXTURE}（先跑 npm run job:smoke）`);
  }

  console.log(`[job:import] fixture jobs=${jobs.length} dryRun=${dryRun}`);

  if (dryRun) {
    for (const item of jobs) {
      const row = toRow(item);
      console.log(`  - ${row.id} · ${row.title}`);
    }
    console.log('[job:import] dry-run done');
    return;
  }

  const supabase = createAdminClient();
  let ok = 0;
  for (const item of jobs) {
    const row = toRow(item);
    const saved = await upsertTrainingJob(supabase, row);
    ok += 1;
    console.log(`[job:import] upsert ${saved.id} · ${saved.title}`);
  }

  const { count, error } = await supabase
    .from('training_jobs')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(`count training_jobs: ${error.message}`);

  console.log(`[job:import] done upserted=${ok} table_count=${count}`);
}

main().catch((err) => {
  console.error('[job:import] failed:', err.message || err);
  process.exit(1);
});
