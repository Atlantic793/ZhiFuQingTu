import { useMemo, useRef, useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import type { PortraitPatch, SubjectTier, UserPortrait } from '../types/portrait';

const GRADES = ['大一', '大二', '大三', '大四', '硕士研究生', '博士研究生'];

const WEEKLY_HOURS_OPTIONS = ['<5小时', '5-10小时', '10-20小时', '20-30小时', '30小时以上'];

type Props = {
  initial: UserPortrait | null;
  tiers: SubjectTier[];
  saving: boolean;
  error: string;
  onSave: (patch: PortraitPatch) => void;
  onCancel: () => void;
};

const PortraitEditor = ({ initial, tiers, saving, error, onSave, onCancel }: Props) => {
  const [major, setMajor] = useState(initial?.major ?? '');
  const [majorCustom, setMajorCustom] = useState(false);
  const [grade, setGrade] = useState(initial?.grade ?? '');
  const [gradeCustom, setGradeCustom] = useState(false);
  const [mathBasis, setMathBasis] = useState(initial?.math_basis ?? '');
  const [programmingBasis, setProgrammingBasis] = useState(initial?.programming_basis ?? '');
  const [englishLevel, setEnglishLevel] = useState(initial?.english_level ?? '');
  const [targetUniversity, setTargetUniversity] = useState(initial?.target_university ?? '');
  const [targetCareers, setTargetCareers] = useState<string[]>(initial?.target_careers ?? []);
  const [learnedCourses, setLearnedCourses] = useState<string[]>(initial?.learned_courses ?? []);
  const [weakPoints, setWeakPoints] = useState<string[]>(initial?.weak_points ?? []);
  const [weeklyHours, setWeeklyHours] = useState(initial?.weekly_hours ?? '');
  const [weeklyHoursCustom, setWeeklyHoursCustom] = useState(
    initial?.weekly_hours ? !WEEKLY_HOURS_OPTIONS.includes(initial.weekly_hours) : false
  );
  const [careerQuery, setCareerQuery] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [courseDraft, setCourseDraft] = useState('');
  const [careerDraft, setCareerDraft] = useState('');
  const [weakDraft, setWeakDraft] = useState('');
  const weakInputRef = useRef<HTMLInputElement>(null);

  const majorOptions = useMemo(() => tiers.map((t) => t.subject), [tiers]);
  const currentTier = useMemo(
    () => tiers.find((t) => t.subject === major),
    [tiers, major]
  );

  const careerCandidates = useMemo(() => {
    const base = currentTier?.careers ?? [];
    const q = careerQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((c) => c.toLowerCase().includes(q));
  }, [currentTier, careerQuery]);

  const courseCandidates = useMemo(() => {
    const base = currentTier?.courses ?? [];
    const q = courseQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((c) => c.toLowerCase().includes(q));
  }, [currentTier, courseQuery]);

  const visibleCourses = useMemo(() => {
    if (showAllCourses) return courseCandidates;
    return courseCandidates.slice(0, 30);
  }, [courseCandidates, showAllCourses]);

  const toggleInList = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    setList(
      list.includes(trimmed)
        ? list.filter((i) => i !== trimmed)
        : [...list, trimmed]
    );
  };

  const addDraft = (
    list: string[],
    setList: (v: string[]) => void,
    draft: string,
    setDraft: (v: string) => void
  ) => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!list.includes(trimmed)) setList([...list, trimmed]);
    setDraft('');
  };

  const handleSave = () => {
    const patch: PortraitPatch = {
      major: major.trim(),
      grade: grade.trim(),
      math_basis: mathBasis.trim(),
      programming_basis: programmingBasis.trim(),
      english_level: englishLevel.trim(),
      target_university: targetUniversity.trim(),
      target_careers: targetCareers,
      learned_courses: learnedCourses,
      weak_points: weakPoints,
      weekly_hours: weeklyHoursCustom ? weeklyHours.trim() : weeklyHours,
    };
    onSave(patch);
  };

  const inputCls =
    'w-full px-3 py-2 rounded-claude-md bg-claude-surface-card border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-sm';
  const labelCls = 'block text-xs font-medium text-claude-muted mb-1';

  return (
    <div className="bg-white rounded-claude-2xl p-6 max-h-[85vh] overflow-y-auto"
      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-claude-ink">
          {initial ? '编辑个人画像' : '完善个人画像'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="p-1.5 rounded-claude-md text-claude-muted-soft hover:text-claude-body hover:bg-claude-surface-card"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* 基本情况 */}
        <section>
          <h3 className="text-sm font-semibold text-claude-ink mb-3">基本情况</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`${labelCls} flex items-center gap-0.5`}>
                专业 <span className="text-claude-error">*</span>
              </label>
              {majorCustom ? (
                <input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="请输入你的专业"
                  className={inputCls}
                />
              ) : (
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className={inputCls}
                >
                  <option value="">请选择专业</option>
                  {majorOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="__custom__">其他（自定义）</option>
                </select>
              )}
              {major === '__custom__' && !majorCustom && (
                <input
                  autoFocus
                  value={majorCustom ? major : ''}
                  onChange={(e) => setMajor(e.target.value)}
                  onBlur={() => { setMajorCustom(true); }}
                  placeholder="请输入专业名称"
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>

            <div>
              <label className={`${labelCls} flex items-center gap-0.5`}>
                当前年级 <span className="text-claude-error">*</span>
              </label>
              {gradeCustom ? (
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="请输入你的年级"
                  className={inputCls}
                />
              ) : (
                <select
                  value={grade}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setGradeCustom(true);
                      setGrade('');
                    } else {
                      setGrade(e.target.value);
                    }
                  }}
                  className={inputCls}
                >
                  <option value="">请选择年级</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="__custom__">其他（自定义）</option>
                </select>
              )}
            </div>

            <div>
              <label className={labelCls}>数学基础</label>
              <input
                value={mathBasis}
                onChange={(e) => setMathBasis(e.target.value)}
                placeholder="如：微积分较好，线性代数一般"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>编程基础</label>
              <input
                value={programmingBasis}
                onChange={(e) => setProgrammingBasis(e.target.value)}
                placeholder="如：Python 入门"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>英语水平</label>
              <input
                value={englishLevel}
                onChange={(e) => setEnglishLevel(e.target.value)}
                placeholder="如：CET-6 600 分"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>目标院校</label>
              <input
                value={targetUniversity}
                onChange={(e) => setTargetUniversity(e.target.value)}
                placeholder="如：某大学应用经济学"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* 目标岗位 */}
        <section>
          <h3 className="text-sm font-semibold text-claude-ink mb-1">
            目标岗位
            <span className="ml-1 text-xs font-normal text-claude-muted-soft">（可多选，支持自定义）</span>
          </h3>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted-soft" />
            <input
              value={careerQuery}
              onChange={(e) => setCareerQuery(e.target.value)}
              placeholder="搜索目标岗位…"
              className={`${inputCls} pl-9`}
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {targetCareers.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-claude-pill bg-claude-primary/10 text-claude-primary text-sm">
                {c}
                <button
                  type="button"
                  onClick={() => toggleInList(targetCareers, setTargetCareers, c)}
                  className="hover:text-claude-error"
                  aria-label={`移除 ${c}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={careerDraft}
              onChange={(e) => setCareerDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDraft(targetCareers, setTargetCareers, careerDraft, setCareerDraft);
                }
              }}
              placeholder="输入自定义岗位，回车添加"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => addDraft(targetCareers, setTargetCareers, careerDraft, setCareerDraft)}
              className="shrink-0 inline-flex items-center gap-1 px-3 rounded-claude-md bg-claude-surface-cream-strong text-claude-ink text-sm hover:bg-claude-surface-cream"
            >
              <Plus className="w-4 h-4" /> 添加
            </button>
          </div>
          {currentTier ? (
            <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {careerCandidates.slice(0, 60).map((c) => {
                const active = targetCareers.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleInList(targetCareers, setTargetCareers, c)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-claude-pill text-sm border transition-colors ${
                      active
                        ? 'border-claude-primary bg-claude-primary/10 text-claude-primary'
                        : 'border-claude-hairline text-claude-body hover:border-claude-primary/40'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    {c}
                  </button>
                );
              })}
              {careerCandidates.length > 60 && (
                <p className="w-full text-xs text-claude-muted-soft">
                  已显示前 60 个，请用搜索缩小范围
                </p>
              )}
              {careerCandidates.length === 0 && (
                <p className="text-xs text-claude-muted-soft">
                  暂无候选岗位，可直接在上方输入自定义岗位
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-claude-muted-soft">
              选择专业后可查看该学科的目标岗位候选
            </p>
          )}
        </section>

        {/* 学习情况 */}
        <section>
          <h3 className="text-sm font-semibold text-claude-ink mb-3">学习情况</h3>
          <div className="space-y-4">
            <div>
              <label className={`${labelCls} mb-1`}>
                已学课程
                <span className="ml-1 text-claude-muted-soft">（可多选，支持搜索与自定义）</span>
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted-soft" />
                <input
                  value={courseQuery}
                  onChange={(e) => {
                    setCourseQuery(e.target.value);
                    setShowAllCourses(false);
                  }}
                  placeholder="搜索已学课程…"
                  className={`${inputCls} pl-9`}
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  value={courseDraft}
                  onChange={(e) => setCourseDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDraft(learnedCourses, setLearnedCourses, courseDraft, setCourseDraft);
                    }
                  }}
                  placeholder="输入自定义课程，回车添加"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => addDraft(learnedCourses, setLearnedCourses, courseDraft, setCourseDraft)}
                  className="shrink-0 inline-flex items-center gap-1 px-3 rounded-claude-md bg-claude-surface-cream-strong text-claude-ink text-sm hover:bg-claude-surface-cream"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              {learnedCourses.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {learnedCourses.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-claude-pill bg-claude-accent-teal/10 text-claude-accent-teal text-sm">
                      {c}
                      <button
                        type="button"
                        onClick={() => toggleInList(learnedCourses, setLearnedCourses, c)}
                        className="hover:text-claude-error"
                        aria-label={`移除 ${c}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {currentTier ? (
                <>
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto border border-claude-hairline rounded-claude-lg p-3">
                    {visibleCourses.map((c) => {
                      const active = learnedCourses.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleInList(learnedCourses, setLearnedCourses, c)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-claude-pill text-sm border transition-colors ${
                            active
                              ? 'border-claude-accent-teal bg-claude-accent-teal/10 text-claude-accent-teal'
                              : 'border-claude-hairline text-claude-body hover:border-claude-accent-teal/40'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5" />}
                          {c}
                        </button>
                      );
                    })}
                    {courseCandidates.length === 0 && (
                      <p className="text-xs text-claude-muted-soft">
                        暂无候选课程，可直接在上方输入自定义课程
                      </p>
                    )}
                  </div>
                  {courseCandidates.length > 30 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCourses(!showAllCourses)}
                      className="mt-2 text-sm text-claude-primary hover:underline"
                    >
                      {showAllCourses ? '收起' : `展开全部（共 ${courseCandidates.length} 门）`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-claude-muted-soft">
                  选择专业后可查看该学科的已学课程候选
                </p>
              )}
            </div>

            <div>
              <label className={`${labelCls} mb-1`}>
                薄弱内容
                <span className="ml-1 text-claude-muted-soft">（支持自己添加）</span>
              </label>
              <div className="flex gap-2">
                <input
                  ref={weakInputRef}
                  value={weakDraft}
                  onChange={(e) => setWeakDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDraft(weakPoints, setWeakPoints, weakDraft, setWeakDraft);
                    }
                  }}
                  placeholder="如：内生性、时间序列"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => addDraft(weakPoints, setWeakPoints, weakDraft, setWeakDraft)}
                  className="shrink-0 inline-flex items-center gap-1 px-3 rounded-claude-md bg-claude-surface-cream-strong text-claude-ink text-sm hover:bg-claude-surface-cream"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              {weakPoints.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {weakPoints.map((w) => (
                    <span key={w} className="inline-flex items-center gap-1 px-3 py-1 rounded-claude-pill bg-amber-50 text-claude-accent-amber text-sm border border-claude-accent-amber/20">
                      {w}
                      <button
                        type="button"
                        onClick={() => toggleInList(weakPoints, setWeakPoints, w)}
                        className="hover:text-claude-error"
                        aria-label={`移除 ${w}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={`${labelCls} mb-1`}>
                每周可投入时间
                <span className="ml-1 text-claude-muted-soft">（可选手动输入）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKLY_HOURS_OPTIONS.map((opt) => {
                  const active = !weeklyHoursCustom && weeklyHours === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setWeeklyHoursCustom(false);
                        setWeeklyHours(opt);
                      }}
                      className={`px-3 py-1.5 rounded-claude-pill text-sm border transition-colors ${
                        active
                          ? 'border-claude-primary bg-claude-primary/10 text-claude-primary'
                          : 'border-claude-hairline text-claude-body hover:border-claude-primary/40'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setWeeklyHoursCustom(true)}
                  className={`px-3 py-1.5 rounded-claude-pill text-sm border transition-colors ${
                    weeklyHoursCustom
                      ? 'border-claude-primary bg-claude-primary/10 text-claude-primary'
                      : 'border-claude-hairline text-claude-body hover:border-claude-primary/40'
                  }`}
                >
                  自定义
                </button>
              </div>
              {weeklyHoursCustom && (
                <input
                  autoFocus
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  placeholder="如：20小时"
                  className={`${inputCls} mt-2 max-w-xs`}
                />
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="p-3 rounded-claude-md bg-red-50 text-claude-error border border-claude-error/20 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !major.trim() || !grade.trim()}
            className="flex-1 h-11 rounded-claude-md bg-claude-primary text-white text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {saving ? '保存中…' : '保存画像'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 h-11 rounded-claude-md border border-claude-hairline text-sm text-claude-body hover:bg-claude-surface-card disabled:opacity-60"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortraitEditor;
