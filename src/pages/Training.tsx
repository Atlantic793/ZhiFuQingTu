import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, BookOpen, ChevronRight, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { quizQuestions, type Company, type Course, type QuizQuestion } from '../data/mockData';
import { fetchCompaniesWithCourses } from '../services/catalogService';

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
  }, [loading, companies, searchParams, setSearchParams]);

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

  return (
    <div className="pt-16 mt-4 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="fixed top-24 right-8 w-64 h-64 rounded-kraken-half pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 40% 35%, rgba(113,50,245,0.15) 0%, transparent 65%)' }} />
      <div className="fixed bottom-16 left-6 w-48 h-48 rounded-kraken-half pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle at 35% 30%, rgba(87,65,216,0.12) 0%, transparent 60%)' }} />

      <section className="text-center mb-12 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-kraken-ink font-display mb-4" style={{ letterSpacing: '-0.5px' }}>
          职业导向实训模块
        </h1>
        <p className="text-kraken-neutral">
          为用户提供场景化学习与模拟任务挑战，掌握核心竞争力
        </p>
        {loading && <p className="mt-3 text-sm text-kraken-muted">正在加载实训编目…</p>}
      </section>

      {!selectedCourse && !showQuiz && (
        <div className="space-y-8">
          {companies.map((company, companyIndex) => (
            <div
              key={company.id}
              className="bg-white rounded-kraken-xl overflow-hidden shadow-kraken"
            >
              <div className="p-6 border-b border-kraken-border">
                <h2 className="text-xl font-bold text-kraken-ink flex items-center gap-2">
                  <span>{company.name}</span>
                  <span className="text-sm font-normal text-kraken-neutral">· {company.sector}</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {company.courses.map((course, courseIndex) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="group cursor-pointer rounded-kraken-xl overflow-hidden bg-white transition-all duration-300 hover:scale-[1.02] shadow-kraken-micro"
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
                        <h3 className="font-medium text-kraken-ink mb-1">{course.title}</h3>
                        <p className="text-sm text-kraken-neutral line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && !showQuiz && (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-kraken-neutral hover:text-kraken-ink mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            返回课程列表
          </button>

          <div className="bg-white rounded-kraken-xl overflow-hidden shadow-kraken">
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
              <h2 className="text-2xl font-bold text-kraken-ink mb-4">{selectedCourse.title}</h2>
              <p className="text-kraken-neutral mb-8">{selectedCourse.description}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={selectedCourse.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-kraken bg-kraken-primary text-white font-semibold hover:bg-kraken-primary-deep transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  观看视频
                </a>
                <button
                  onClick={() => handleStartQuiz(selectedCourse)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-kraken bg-kraken-primary-dark text-white font-semibold hover:bg-kraken-primary-deep transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  开始测验
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuiz && selectedCourse && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-kraken-xl p-8 shadow-kraken">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-kraken-ink">{selectedCourse.title} - 测验</h2>
                <p className="text-kraken-neutral mt-1">
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
                className="text-kraken-neutral hover:text-kraken-ink"
              >
                退出测验
              </button>
            </div>

            <div className="space-y-4">
              {quizState.map((item, index) => (
                <div
                  key={item.question.id}
                  className={`rounded-kraken-lg border transition-all ${
                    item.isSubmitted
                      ? item.isCorrect
                        ? 'border-kraken-success/40 bg-green-50'
                        : 'border-kraken-error/40 bg-red-50'
                      : 'border-kraken-border'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.question.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-kraken-ink">
                      {index + 1}. {item.question.question}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isSubmitted &&
                        (item.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-kraken-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-kraken-error" />
                        ))}
                      {item.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-kraken-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-kraken-muted" />
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
                          className={`w-full text-left px-4 py-3 rounded-kraken transition-colors ${
                            item.selectedAnswer === optIndex
                              ? item.isSubmitted
                                ? item.isCorrect
                                  ? 'bg-green-100 text-kraken-success'
                                  : 'bg-red-100 text-kraken-error'
                                : 'bg-kraken-surface-soft ring-1 ring-kraken-primary text-kraken-neutral'
                              : item.isSubmitted && optIndex === item.question.correctAnswer
                                ? 'bg-green-50 text-kraken-success'
                                : 'bg-kraken-surface-soft text-kraken-neutral hover:bg-kraken-border'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      {item.isSubmitted && (
                        <p className="text-sm text-kraken-neutral mt-3 p-3 rounded-kraken-lg bg-kraken-surface-soft">
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
                className="mt-8 w-full h-11 rounded-kraken bg-kraken-primary text-white font-semibold hover:bg-kraken-primary-deep disabled:opacity-50 inline-flex items-center justify-center transition-colors"
              >
                提交测验
              </button>
            )}

            {isQuizCompleted && wrongAnswers.length > 0 && (
              <div className="mt-8 p-4 rounded-kraken-lg bg-kraken-surface-soft border border-kraken-border">
                <h3 className="font-medium text-kraken-ink mb-2">错题回顾</h3>
                <ul className="space-y-1 text-sm text-kraken-neutral">
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
  );
};

export default Training;
