import { useState } from 'react';
import { Play, BookOpen, ChevronRight, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { companies, quizQuestions, type Course, type QuizQuestion } from '../data/mockData';

interface QuizState {
  question: QuizQuestion;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  isCorrect: boolean;
  isExpanded: boolean;
}

const Training = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState<QuizState[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleStartQuiz = () => {
    if (!selectedCourse) return;
    const courseQuestions = quizQuestions.filter((q) => q.courseId === selectedCourse.id);
    if (courseQuestions.length === 0) {
      courseQuestions.push(...quizQuestions.slice(0, 10));
    }
    setQuizState(
      courseQuestions.map((q, index) => ({
        question: q,
        selectedAnswer: null,
        isSubmitted: false,
        isCorrect: false,
        isExpanded: index === 0,
      }))
    );
    setShowQuiz(true);
    setIsQuizCompleted(false);
    setScore(0);
  };

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
                      className="relative overflow-hidden rounded-xl cursor-pointer group"
                    >
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-morandi-pink ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-medium">{course.title}</h3>
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
            className="flex items-center gap-2 text-morandi-text hover:text-morandi-pink transition-colors mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>返回课程列表</span>
          </button>

          <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            <div className="relative">
              <img
                src={selectedCourse.coverImage}
                alt={selectedCourse.title}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <a
                  href={selectedCourse.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 text-morandi-pink ml-2" />
                </a>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-morandi-light text-morandi-text text-sm">
                  课程
                </span>
                <span className="text-morandi-text/60 text-sm">2024-01-15</span>
              </div>

              <h2 className="text-2xl font-bold text-morandi-text mb-4">{selectedCourse.title}</h2>
              <p className="text-morandi-text/70 mb-8">{selectedCourse.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-morandi-pink" />
                    <span className="text-morandi-text">课程学习</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-morandi-blue" />
                    <a
                      href={selectedCourse.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-morandi-blue hover:underline"
                    >
                      观看视频
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="px-6 py-3 rounded-xl bg-morandi-pink text-white font-medium flex items-center gap-2 hover:bg-opacity-90 transition-colors"
                >
                  <span>开始课后习题</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuiz && !isQuizCompleted && (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowQuiz(false)}
            className="flex items-center gap-2 text-morandi-text hover:text-morandi-pink transition-colors mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>返回课程详情</span>
          </button>

          <div className="bg-white rounded-3xl shadow-soft p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-morandi-text">课后习题</h2>
              <span className="text-morandi-text/60">共 {quizState.length} 题</span>
            </div>
          </div>

          <div className="space-y-4">
            {quizState.map((item, index) => (
              <div
                key={item.question.id}
                className="bg-white rounded-2xl shadow-soft overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpand(item.question.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.selectedAnswer !== null
                          ? 'bg-morandi-green/20 text-morandi-green'
                          : 'bg-morandi-light text-morandi-text'
                      }`}
                    >
                      {item.selectedAnswer !== null ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-morandi-text">{item.question.question}</p>
                    </div>
                    {item.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-morandi-text/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-morandi-text/60" />
                    )}
                  </div>
                </div>

                {item.isExpanded && (
                  <div className="px-6 pb-6 border-t">
                    <div className="pt-4 space-y-3">
                      {item.question.options.map((option, optionIndex) => {
                        let optionClass = 'bg-morandi-light text-morandi-text';
                        if (optionIndex === item.selectedAnswer) {
                          optionClass = 'bg-morandi-pink/20 text-morandi-pink';
                        }
                        return (
                          <button
                            key={optionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAnswer(item.question.id, optionIndex);
                            }}
                            className={`w-full p-4 rounded-xl text-left transition-colors ${optionClass} cursor-pointer hover:bg-morandi-light`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                              <span>{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleSubmitQuiz}
                disabled={quizState.some((q) => q.selectedAnswer === null)}
                className="w-full py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交答案
              </button>
            </div>
          </div>

          <div className="h-16"></div>
        </div>
      )}

      {showQuiz && isQuizCompleted && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-soft p-8 text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-morandi-green/20 flex items-center justify-center mx-auto mb-6">
              {score >= quizState.length * 0.8 ? (
                <CheckCircle className="w-12 h-12 text-morandi-green" />
              ) : (
                <XCircle className="w-12 h-12 text-morandi-pink" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-morandi-text mb-2">测试完成</h2>
            <p className="text-morandi-text/70">
              您的成绩：<span className="text-3xl font-bold text-morandi-pink">{score}</span> / {quizState.length}
            </p>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h3 className="text-xl font-bold text-morandi-text mb-6">错题解析</h3>
              <div className="space-y-4">
                {wrongAnswers.map((item) => {
                    const questionIndex = quizState.findIndex(q => q.question.id === item.question.id);
                    return (
                      <div key={item.question.id} className="p-4 rounded-xl bg-morandi-light">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-morandi-pink">第 {questionIndex + 1} 题</span>
                        </div>
                    <p className="text-morandi-text/70 mb-3">选择答案：{String.fromCharCode(65 + (item.selectedAnswer || 0))}</p>
                        <p className="text-morandi-text/70 mb-3">正确答案：{String.fromCharCode(65 + item.question.correctAnswer)}</p>
                        <p className="text-morandi-text/70">答案解析：{item.question.explanation}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {wrongAnswers.length === 0 && (
            <div className="bg-white rounded-3xl shadow-soft p-8 text-center">
              <CheckCircle className="w-12 h-12 text-morandi-green mx-auto mb-4" />
              <p className="text-morandi-text">恭喜！全部正确</p>
            </div>
          )}

          <button
            onClick={() => {
              setShowQuiz(false);
              setQuizState([]);
            }}
            className="mt-8 w-full py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            返回课程
          </button>
        </div>
      )}
    </div>
  );
};

export default Training;
