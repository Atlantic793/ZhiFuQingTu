import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, BookOpen, ChevronRight, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { quizQuestions, type Company, type Course, type QuizQuestion } from '../data/mockData';
import { fetchCompaniesWithCourses } from '../services/catalogService';
import JobLibrary from '../components/JobLibrary';
import TrainingChat from '../components/TrainingChat';

type TrainingTab = 'courses' | 'jobs';

interface QuizState {
  question: QuizQuestion;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  isCorrect: boolean;
  isExpanded: boolean;
}

function buildQuizState(course: Course): QuizState[] {
  let courseQuestions = quizQuestions.filter((q) => q.courseId === course.id);
  if (courseQuestions.length === 0) {
    courseQuestions = quizQuestions.slice(0, 10);
  }
  return courseQuestions.map((q, index) => ({
    question: q,
    selectedAnswer: null,
    isSubmitted: false,
    isCorrect: false,
    isExpanded: index === 0,
  }));
}

const Training = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const autoStartedRef = useRef(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState<QuizState[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState<TrainingTab>(
    searchParams.get('tab') === 'jobs' ? 'jobs' : 'courses',
  );

  const switchTab = (tab: TrainingTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchCompaniesWithCourses();
        if (!cancelled) setCompanies(rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStartQuiz = (course?: Course | null) => {
    const target = course ?? selectedCourse;
    if (!target) return;
    setSelectedCourse(target);
    setQuizState(buildQuizState(target));
    setShowQuiz(true);
    setIsQuizCompleted(false);
    setScore(0);
  };

  // Agent start_quiz deep-link: /training?courseId=xxx&quiz=1
  useEffect(() => {
    if (loading || companies.length === 0 || autoStartedRef.current) return;
    if (activeTab !== 'courses') return;

    const courseId = searchParams.get('courseId');
    if (!courseId) return;

    const course = companies.flatMap((c) => c.courses).find((c) => c.id === courseId);
    if (!course) return;

    autoStartedRef.current = true;
    const shouldQuiz = searchParams.get('quiz') === '1';
    if (shouldQuiz) {
      handleStartQuiz(course);
    } else {
      setSelectedCourse(course);
    }
    setSearchParams({}, { replace: true });
  }, [loading, companies, searchParams, setSearchParams, activeTab]);

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setQuizState((prev) => {
      const currentIndex = prev.findIndex((q) => q.question.id === questionId);
      return prev.map((q, index) => {
        if (q.question.id === questionId) {
          return { ...q, selectedAnswer: answerIndex, isExpanded: false };
        }
        if (index === currentIndex + 1) {
          return { ...q, isExpanded: true };
        }
        return q;
      });
    });
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const updatedState = quizState.map((q) => {
      const isCorrect = q.selectedAnswer === q.question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        isSubmitted: true,
        isCorrect,
      };
    });
    setQuizState(updatedState);
    setScore(correctCount);
    setIsQuizCompleted(true);
  };

  const wrongAnswers = quizState.filter((q) => q.isSubmitted && !q.isCorrect);

  const toggleExpand = (questionId: string) => {
    setQuizState((prev) =>
      prev.map((q) =>
        q.question.id === questionId ? { ...q, isExpanded: !q.isExpanded } : q
      )
    );
  };

  const isViewingCourse = Boolean(selectedCourse);

  return (
    <div className="pt-16 mt-4 relative">
      {/* Clay blobs */}
      <div className="fixed top-24 right-8 w-36 h-36 rounded-[55%_45%_50%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-16 left-6 w-28 h-28 rounded-[45%_55%_55%_45%] pointer-events-none opacity-55"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8e8a0 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-1/2 right-12 w-24 h-24 rounded-[50%_55%_45%_50%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-1/3 left-8 w-20 h-20 rounded-[55%_45%_40%_60%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-[35%] left-[40%] w-14 h-14 rounded-[50%_50%_45%_55%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-[40%] right-[30%] w-16 h-16 rounded-[55%_45%_50%_50%] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />

      <div className={`${isViewingCourse ? 'w-full' : 'max-w-[calc(100%-24rem)]'} min-w-0 pl-4 sm:pl-6 lg:pl-8`}>

      {loading && <p className="mb-4 text-sm text-claude-muted-soft">正在加载实训编目…</p>}

      <div className="flex justify-center gap-2 mb-10 relative z-10">
        <button
          type="button"
          onClick={() => switchTab('courses')}
          className={`px-5 py-2 rounded-claude-md text-sm font-medium transition-colors ${
            activeTab === 'courses'
              ? 'bg-claude-primary text-white'
              : 'bg-white text-claude-muted hover:text-claude-ink border border-claude-hairline'
          }`}
        >
          课程实训
        </button>
        <button
          type="button"
          onClick={() => switchTab('jobs')}
          className={`px-5 py-2 rounded-claude-md text-sm font-medium transition-colors ${
            activeTab === 'jobs'
              ? 'bg-claude-primary text-white'
              : 'bg-white text-claude-muted hover:text-claude-ink border border-claude-hairline'
          }`}
        >
          岗位库
        </button>
      </div>

      {activeTab === 'jobs' && <JobLibrary />}

      {activeTab === 'courses' && !selectedCourse && !showQuiz && (
        <div className="space-y-8">
          {companies.map((company) => (
            // [+] 公司区块交错入场
            <div
              key={company.id}
              className="bg-macaron-mint/50 rounded-[24px] overflow-hidden"
              style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="p-6 border-b border-claude-hairline">
                <h2 className="text-xl font-bold text-claude-ink flex items-center gap-2">
                  <span>{company.name}</span>
                  <span className="text-sm font-normal text-claude-muted">· {company.sector}</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {company.courses.map((course) => (
                    // [+] 课程缩略图入场，在公司区块到达后依次出现
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="group cursor-pointer rounded-[16px] overflow-hidden bg-white transition-all duration-300 hover:scale-[1.02]"
                      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
                    >
                      <div className="relative aspect-video">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-claude-ink mb-1">{course.title}</h3>
                        <p className="text-sm text-claude-muted line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'courses' && selectedCourse && !showQuiz && (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-claude-muted hover:text-claude-ink mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            返回课程列表
          </button>

          <div className="bg-macaron-peach/40 rounded-[24px] overflow-hidden"
            style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="relative aspect-video">
              <img
                src={selectedCourse.coverImage}
                alt={selectedCourse.title}
                className="w-full h-full object-cover"
              />
              <a
                href={selectedCourse.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                <Play className="w-16 h-16 text-white" />
              </a>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-claude-ink mb-4">{selectedCourse.title}</h2>
              <p className="text-claude-muted mb-8">{selectedCourse.description}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={selectedCourse.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-claude-md bg-claude-primary text-white font-medium hover:bg-opacity-90"
                >
                  <ExternalLink className="w-5 h-5" />
                  观看视频
                </a>
                <button
                  onClick={() => handleStartQuiz(selectedCourse)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-claude-md bg-claude-accent-teal text-white font-medium hover:bg-opacity-90"
                >
                  <BookOpen className="w-5 h-5" />
                  开始测验
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && showQuiz && selectedCourse && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-macaron-lavender/50 rounded-[24px] p-8"
            style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-claude-ink">{selectedCourse.title} - 测验</h2>
                <p className="text-claude-muted mt-1">
                  {isQuizCompleted
                    ? `得分：${score} / ${quizState.length}`
                    : `共 ${quizState.length} 题`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setSelectedCourse(null);
                }}
                className="px-3 py-1.5 rounded-claude-md bg-claude-surface-card text-claude-muted hover:bg-claude-hairline hover:text-claude-ink text-sm whitespace-nowrap"
              >
                退出测验
              </button>
            </div>

            <div className="space-y-4">
              {quizState.map((item, index) => (
                <div
                  key={item.question.id}
                  className={`rounded-claude-lg border transition-all ${
                    item.isSubmitted
                      ? item.isCorrect
                        ? 'border-claude-success/40 bg-green-50'
                        : 'border-claude-error/40 bg-red-50'
                      : 'border-claude-hairline'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.question.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-claude-ink">
                      {index + 1}. {item.question.question}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isSubmitted &&
                        (item.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-claude-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-claude-error" />
                        ))}
                      {item.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-claude-muted-soft" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-claude-muted-soft" />
                      )}
                    </div>
                  </button>

                  {item.isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {item.question.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          type="button"
                          disabled={item.isSubmitted}
                          onClick={() => handleSelectAnswer(item.question.id, optIndex)}
                          className={`w-full text-left px-4 py-3 rounded-claude-md transition-colors ${
                            item.selectedAnswer === optIndex
                              ? item.isSubmitted
                                ? item.isCorrect
                                  ? 'bg-green-100 text-claude-success'
                                  : 'bg-red-100 text-claude-error'
                                : 'bg-claude-surface-card ring-1 ring-claude-primary text-claude-body'
                              : item.isSubmitted && optIndex === item.question.correctAnswer
                                ? 'bg-green-50 text-claude-success'
                                : 'bg-claude-surface-card text-claude-body hover:bg-claude-hairline'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      {item.isSubmitted && (
                        <p className="text-sm text-claude-muted mt-3 p-3 rounded-claude-lg bg-white/60">
                          {item.question.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isQuizCompleted && (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={quizState.some((q) => q.selectedAnswer === null)}
                className="mt-8 w-full h-11 rounded-claude-md bg-claude-primary text-white font-medium hover:bg-opacity-90 disabled:opacity-50 inline-flex items-center justify-center"
              >
                提交测验
              </button>
            )}

            {isQuizCompleted && wrongAnswers.length > 0 && (
              <div className="mt-8 p-4 rounded-claude-lg bg-claude-surface-card border border-claude-hairline">
                <h3 className="font-medium text-claude-ink mb-2">错题回顾</h3>
                <ul className="space-y-1 text-sm text-claude-muted">
                  {wrongAnswers.map((q) => (
                    <li key={q.question.id}>· {q.question.question}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
        </div>

      {!isViewingCourse && (
        <aside className="hidden lg:block fixed top-20 right-4 w-80 h-[calc(100vh-6rem)]">
          <TrainingChat />
        </aside>
      )}
    </div>
  );
};

export default Training;
