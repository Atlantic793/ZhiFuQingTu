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
    <div className="pt-16">
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-morandi-text font-display mb-4">
          职业导向实训模块
        </h1>
        <p className="text-morandi-text/70">
          为用户提供场景化学习与模拟任务挑战，掌握核心竞争力
        </p>
        {loading && <p className="mt-3 text-sm text-morandi-text/50">正在加载实训编目…</p>}
      </section>

      {!selectedCourse && !showQuiz && (
        <div className="space-y-8">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl shadow-soft overflow-hidden"
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: `${company.color}40` }}
              >
                <h2 className="text-xl font-bold text-morandi-text flex items-center gap-2">
                  <span>{company.name}</span>
                  <span className="text-sm font-normal text-morandi-text/60">· {company.sector}</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {company.courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="group cursor-pointer rounded-xl overflow-hidden bg-morandi-light/30 hover:shadow-soft transition-all"
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
                        <h3 className="font-medium text-morandi-text mb-1">{course.title}</h3>
                        <p className="text-sm text-morandi-text/60 line-clamp-2">{course.description}</p>
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
            className="flex items-center gap-2 text-morandi-text/60 hover:text-morandi-text mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            返回课程列表
          </button>

          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
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
              <h2 className="text-2xl font-bold text-morandi-text mb-4">{selectedCourse.title}</h2>
              <p className="text-morandi-text/70 mb-8">{selectedCourse.description}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={selectedCourse.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90"
                >
                  <ExternalLink className="w-5 h-5" />
                  观看视频
                </a>
                <button
                  onClick={() => handleStartQuiz(selectedCourse)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-morandi-blue text-white font-medium hover:bg-opacity-90"
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
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-morandi-text">{selectedCourse.title} - 测验</h2>
                <p className="text-morandi-text/60 mt-1">
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
                className="text-morandi-text/60 hover:text-morandi-text"
              >
                退出测验
              </button>
            </div>

            <div className="space-y-4">
              {quizState.map((item, index) => (
                <div
                  key={item.question.id}
                  className={`rounded-xl border transition-all ${
                    item.isSubmitted
                      ? item.isCorrect
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                      : 'border-morandi-light'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.question.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-morandi-text">
                      {index + 1}. {item.question.question}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isSubmitted &&
                        (item.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ))}
                      {item.isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-morandi-text/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-morandi-text/40" />
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
                          className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                            item.selectedAnswer === optIndex
                              ? item.isSubmitted
                                ? item.isCorrect
                                  ? 'bg-green-200 text-green-900'
                                  : 'bg-red-200 text-red-900'
                                : 'bg-morandi-pink/20 text-morandi-text'
                              : item.isSubmitted && optIndex === item.question.correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-morandi-light/50 text-morandi-text hover:bg-morandi-light'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      {item.isSubmitted && (
                        <p className="text-sm text-morandi-text/70 mt-3 p-3 rounded-xl bg-white/60">
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
                className="mt-8 w-full py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 disabled:opacity-50"
              >
                提交测验
              </button>
            )}

            {isQuizCompleted && wrongAnswers.length > 0 && (
              <div className="mt-8 p-4 rounded-xl bg-morandi-light/50">
                <h3 className="font-medium text-morandi-text mb-2">错题回顾</h3>
                <ul className="space-y-1 text-sm text-morandi-text/70">
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
