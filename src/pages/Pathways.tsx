import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  School,
  Sparkles,
} from 'lucide-react';
import {
  fetchStudyPaths,
  fetchSubjects,
} from '../services/catalogService';
import type { StudyPath, Subject } from '../types/catalog';
import { subjectIconMap } from '../utils/subjectIcons';
import { SkeletonTopicGrid } from '../components/Skeleton';

type GradTab = 'kaoyan' | 'baoyan';

function PathCard({ path, subject }: { path: StudyPath; subject?: Subject }) {
  return (
    <div
      className="rounded-claude-xl bg-white border border-claude-hairline p-5 transition-all hover:shadow-md"
      style={{ boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.04), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-claude-pill text-xs font-medium"
              style={{ backgroundColor: '#a8d8ea55', color: '#4a4a4a' }}
            >
              <GraduationCap className="w-4 h-4" />
              考研
            </span>
            {subject && (
              <span className="text-xs text-claude-muted">{subject.name}</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-claude-ink">{path.name}</h3>
        </div>
      </div>

      <p className="text-sm text-claude-body leading-relaxed mb-4">{path.description}</p>

      {path.examSubjects.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-claude-muted mb-2">考试科目</p>
          <div className="flex flex-wrap gap-1.5">
            {path.examSubjects.map((subjectName) => (
              <span
                key={subjectName}
                className="px-2 py-1 rounded-claude-sm bg-claude-canvas border border-claude-hairline text-xs text-claude-body"
              >
                {subjectName}
              </span>
            ))}
          </div>
        </div>
      )}

      {path.applicableMajors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-claude-muted mb-2">对口专业</p>
          <div className="flex flex-wrap gap-1.5">
            {path.applicableMajors.map((major) => (
              <span key={major} className="px-2 py-1 rounded-claude-sm bg-claude-surface-blue text-xs text-claude-body">
                {major}
              </span>
            ))}
          </div>
        </div>
      )}

      {path.timeframe.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-claude-muted mb-2">备考时间线</p>
          <div className="space-y-1.5">
            {path.timeframe.map((step) => (
              <div key={step.phase} className="flex items-start gap-2 text-xs text-claude-body">
                <span
                  className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-claude-sm font-medium text-claude-muted whitespace-nowrap"
                  style={{ backgroundColor: '#a8d8ea30' }}
                >
                  {step.phase}
                </span>
                <span className="leading-snug">{step.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {path.notes && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-claude-md bg-amber-50 border border-amber-100">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">{path.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoPlaceholder({
  icon,
  title,
  hint,
  highlights,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  highlights: string[];
}) {
  return (
    <div
      className="rounded-[24px] overflow-hidden bg-white"
      style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div className="p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-[18px] bg-claude-surface-cream-strong flex items-center justify-center text-claude-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-claude-ink mb-2">{title}</h3>
        <p className="text-sm text-claude-muted max-w-lg mx-auto mb-5 leading-relaxed">{hint}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {highlights.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-claude-pill bg-claude-surface-soft text-claude-body"
            >
              <Sparkles className="w-3.5 h-3.5 text-claude-primary" />
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const Pathways = () => {
  const [tab, setTab] = useState<GradTab>('kaoyan');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [paths, setPaths] = useState<StudyPath[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [subjectRows, pathRows] = await Promise.all([fetchSubjects(), fetchStudyPaths()]);
        if (cancelled) return;
        setSubjects(subjectRows);
        setPaths(pathRows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载升学规划失败，请确认已执行 study_paths 迁移 SQL');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const kaoyanPaths = useMemo(() => paths.filter((p) => p.kind === 'kaoyan'), [paths]);

  const filteredPaths = useMemo(() => {
    if (!selectedSubjectId) return kaoyanPaths;
    return kaoyanPaths.filter((p) => p.subjectId === selectedSubjectId);
  }, [kaoyanPaths, selectedSubjectId]);

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors ${
      active
        ? 'bg-claude-surface-cream-strong text-claude-ink ring-1 ring-claude-primary'
        : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft'
    }`;

  return (
    <div className="pt-16 min-h-screen relative">
      {/* Clay blobs */}
      <div className="fixed top-16 right-4 w-36 h-36 rounded-[50%_55%_45%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-8 left-4 w-28 h-28 rounded-[55%_40%_55%_45%] pointer-events-none opacity-50"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-1/3 left-8 w-20 h-20 rounded-[45%_55%_55%_45%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 30%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题区 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-claude-ink mb-2">升学规划</h1>
          <p className="text-claude-muted text-base max-w-2xl">
            查询考研、保研相关的院校与时间信息。院校招生数据正在整理中，先提供备考路径参考；具体时间节点以研招网与院校官网当年发布为准。
          </p>
        </div>

        {/* 主 tab：考研信息 / 保研信息 */}
        <div className="flex items-center gap-3 mb-8">
          <button type="button" onClick={() => setTab('kaoyan')} className={tabClass(tab === 'kaoyan')}>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              考研信息
            </span>
          </button>
          <button type="button" onClick={() => setTab('baoyan')} className={tabClass(tab === 'baoyan')}>
            <span className="inline-flex items-center gap-1.5">
              <School className="w-4 h-4" />
              保研信息
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-claude-md bg-red-100 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <SkeletonTopicGrid />
        ) : tab === 'kaoyan' ? (
          <div className="space-y-10">
            {/* 院校信息占位 */}
            <InfoPlaceholder
              icon={<CalendarClock className="w-7 h-7" />}
              title="考研院校信息整理中"
              hint="我们正在整理各院校的招生简章、初试时间与报名截止节点，上线后将支持「报名倒计时」提醒，方便你按时间规划备考节奏。"
              highlights={['招生信息', '分数线', '报名倒计时', '初试时间']}
            />

            {/* 考研路径建议 */}
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-claude-ink">考研路径建议</h2>
                  <span className="text-xs text-claude-muted-soft">{filteredPaths.length} 条路径</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectId(null)}
                    className={`px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors ${
                      selectedSubjectId === null
                        ? 'bg-claude-surface-cream-strong text-claude-ink ring-1 ring-claude-primary'
                        : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft'
                    }`}
                  >
                    全部学科
                  </button>
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors ${
                        selectedSubjectId === subject.id
                          ? 'text-claude-ink ring-1 ring-claude-primary'
                          : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft'
                      }`}
                      style={{
                        backgroundColor: selectedSubjectId === subject.id ? `${subject.color}35` : undefined,
                      }}
                    >
                      {subjectIconMap[subject.icon]}
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPaths.length === 0 ? (
                <div className="text-center py-16 text-claude-muted">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
                  <p>该学科暂无考研路径数据，请先确认已执行 study_paths 迁移 SQL。</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPaths.map((path) => (
                    <PathCard key={path.id} path={path} subject={subjects.find((s) => s.id === path.subjectId)} />
                  ))}
                </div>
              )}

              {/* 免责说明 */}
              <div className="flex items-start gap-2 px-4 py-3 rounded-claude-md bg-claude-surface-soft mt-8">
                <CheckCircle2 className="w-4 h-4 text-claude-muted mt-0.5 flex-shrink-0" />
                <p className="text-xs text-claude-muted leading-relaxed">
                  本页信息为结构性参考（考试科目、对口专业、备考时间线），属于稳定内容；具体分数线、招生人数与政策以研招网及院校官网当年发布为准。
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-10">
            <InfoPlaceholder
              icon={<School className="w-7 h-7" />}
              title="保研院校信息整理中"
              hint="我们正在整理各院校的保研名额、夏令营 / 预推免时间线与申请要求，上线后将支持关键节点提醒，帮你不错过申请窗口。"
              highlights={['夏令营', '预推免', '申请要求', '名额信息']}
            />

            {/* 免责说明 */}
            <div className="flex items-start gap-2 px-4 py-3 rounded-claude-md bg-claude-surface-soft">
              <CheckCircle2 className="w-4 h-4 text-claude-muted mt-0.5 flex-shrink-0" />
              <p className="text-xs text-claude-muted leading-relaxed">
                保研信息以各院校研究生院官网当年发布的推免章程为准，本页内容为整理汇总参考。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pathways;
