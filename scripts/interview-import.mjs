/**
 * Import harvested interview question stems into `interview_questions`.
 * answer_hint is always empty — UI uses AI 参考答案.
 *
 * Usage:
 *   npm run interview:import
 *   npm run interview:import -- --dry-run
 *
 * Requires:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './loadEnv.mjs';
import { createAdminClient, upsertInterviewQuestion } from './lib/supabaseAdmin.mjs';

loadEnvFile('.env');

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, '../src/data/fixtures/interview-smoke.json');

function parseArgs(argv) {
  const flags = new Set(argv.slice(2).filter((a) => a.startsWith('--')));
  return { dryRun: flags.has('--dry-run') };
}

function toRow(item) {
  return {
    id: item.id,
    career_name: item.career_name || '软件工程师',
    company: item.company || '',
    category: item.category || 'technical',
    question: item.question,
    answer_hint: '',
    difficulty: item.difficulty || 'medium',
    tags: Array.isArray(item.tags) ? item.tags : [],
    source: item.source || '0voice-campus-index',
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const { dryRun } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  const questions = Array.isArray(payload.questions) ? payload.questions : [];
  if (questions.length === 0) {
    throw new Error(`fixture 无题目：${FIXTURE}（先跑 npm run interview:harvest）`);
  }

  console.log(`[interview:import] questions=${questions.length} dryRun=${dryRun}`);

  if (dryRun) {
    for (const item of questions.slice(0, 20)) {
      const row = toRow(item);
      console.log(`  - ${row.company} · ${row.question}`);
    }
    if (questions.length > 20) console.log(`  … ${questions.length - 20} more`);
    console.log('[interview:import] dry-run done');
    return;
  }

  const supabase = createAdminClient();
  let ok = 0;
  for (const item of questions) {
    const row = toRow(item);
    await upsertInterviewQuestion(supabase, row);
    ok += 1;
    if (ok % 50 === 0) console.log(`[interview:import] upserted ${ok}/${questions.length}`);
  }

  const { count, error } = await supabase.from('interview_questions').select('id', { count: 'exact', head: true });
  if (error) throw new Error(`count interview_questions: ${error.message}`);
  console.log(`[interview:import] done upserted=${ok} table_count=${count}`);
}

main().catch((err) => {
  console.error('[interview:import] failed:', err.message || err);
  process.exit(1);
});
