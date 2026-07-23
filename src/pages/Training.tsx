import { useState } from 'react';
import { Code, BarChart2, Layout, PenTool, Brain, LineChart, Play, BookOpen, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { careers, courses, quizQuestions, type Career, type Course } from '../data/mockData';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code,
  BarChart2,
  Layout,
  PenTool,
  Brain,
  LineChart,
};

const Training = () => {
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const careerCourses = courses.filter((c) => c.careerId === selectedCareer?.id);
  const courseQuestions = quizQuestions.filter((q) => q.courseId === selectedCourse?.id);

  const handleVideoProgress = () => {
    if (videoProgress < 100) {
      setVideoProgress((prev) => Math.min(prev + 10, 100));
    } else {
      setShowQuiz(true);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < courseQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBackToCareers = () => {
    setSelectedCareer(null);
    setSelectedCourse(null);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setVideoProgress(0);
  };

  const calculateScore = () => {
    let correct = 0;
    courseQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / courseQuestions.length) * 100);
  };

  return (
    <div className="pt-16">
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-morandi-text font-display mb-4">
          职业导向实训模块
        </h1>
        <p className="text-morandi-text/70">
          选择感兴趣的职业方向，通过视频学习和答题测试掌握核心技能
        </p>
      </section>

      {!selectedCareer ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((career) => {
            const IconComponent = iconMap[career.icon];
            return (
              <div
                key={career.id}
                onClick={() => setSelectedCareer(career)}
                className="bg-white rounded-2xl shadow-soft p-6 cursor-pointer card-soft"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${career.color}30` }}
                >
                  {IconComponent && (
                    <IconComponent className="w-7 h-7" style={{ color: career.color }} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-morandi-text mb-2">{career.name}</h3>
                <p className="text-sm text-morandi-text/60">{career.description}</p>
              </div>
            );
          })}
        </div>
      ) : !selectedCourse ? (
        <div>
          <button
            onClick={handleBackToCareers}
            className="flex items-center gap-2 text-morandi-text hover:text-morandi-pink mb-6 transition-colors"
          >
            <span className="text-xl">&larr;</span>
            <span>返回职业选择</span>
          </button>
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${selectedCareer.color}30` }}
            >
              {(() => {
                const Icon = iconMap[selectedCareer.icon];
                return Icon ? <Icon className="w-8 h-8" style={{ color: selectedCareer.color }} /> : null;
              })()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-morandi-text">{selectedCareer.name}</h2>
              <p className="text-morandi-text/60">{selectedCareer.description}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {careerCourses.length > 0 ? (
              careerCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer card-soft"
                >
                  <div className="relative">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-morandi-pink ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-morandi-text mb-2">{course.title}</h3>
                    <p className="text-sm text-morandi-text/60 mb-3">{course.description}</p>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-morandi-pink" />
                      <span className="text-sm text-morandi-text/70">开始学习</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <div className="w-20 h-20 rounded-full bg-morandi-light flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-morandi-text/50" />
                </div>
                <p className="text-morandi-text/60">暂无相关课程</p>
              </div>
            )}
          </div>
        </div>
      ) : !showQuiz ? (
        <div>
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-morandi-text hover:text-morandi-pink mb-6 transition-colors"
          >
            <span className="text-xl">&larr;</span>
            <span>返回课程列表</span>
          </button>
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
            <div className="relative">
              <img
                src={selectedCourse.coverImage}
                alt={selectedCourse.title}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">{selectedCourse.title}</h2>
                <div className="w-64 bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-morandi-pink rounded-full transition-all duration-500"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
                <p className="mb-6">{videoProgress}% 已完成</p>
                <button
                  onClick={handleVideoProgress}
                  className="px-8 py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors"
                >
                  {videoProgress < 100 ? '继续学习' : '开始测试'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-morandi-text mb-2">课程介绍</h3>
              <p className="text-morandi-text/70">{selectedCourse.description}</p>
            </div>
          </div>
        </div>
      ) : !showResult ? (
        <div>
          <button
            onClick={() => {
              setShowQuiz(false);
              setVideoProgress(0);
            }}
            className="flex items-center gap-2 text-morandi-text hover:text-morandi-pink mb-6 transition-colors"
          >
            <span className="text-xl">&larr;</span>
            <span>返回课程</span>
          </button>
          <div className="bg-white rounded-3xl shadow-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-morandi-text">课程测验</h2>
              <span className="text-morandi-text/60">
                {currentQuestionIndex + 1} / {courseQuestions.length}
              </span>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-medium text-morandi-text mb-6">
                {courseQuestions[currentQuestionIndex]?.question}
              </h3>
              <div className="space-y-3">
                {courseQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'bg-morandi-pink text-white'
                        : 'bg-morandi-light hover:bg-morandi-pink/20'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}. </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className="w-full py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex < courseQuestions.length - 1 ? '下一题' : '提交答案'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleBackToCareers}
            className="flex items-center gap-2 text-morandi-text hover:text-morandi-pink mb-6 transition-colors"
          >
            <span className="text-xl">&larr;</span>
            <span>返回职业选择</span>
          </button>
          <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${calculateScore() >= 60 ? 'bg-morandi-green/30' : 'bg-morandi-coral/30'}`}>
              {calculateScore() >= 60 ? (
                <CheckCircle className="w-12 h-12 text-morandi-green" />
              ) : (
                <XCircle className="w-12 h-12 text-morandi-coral" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-morandi-yellow" />
              <h2 className="text-3xl font-bold text-morandi-text">测验完成</h2>
            </div>
            <p className="text-morandi-text/70 mb-8">您已完成该课程的测验</p>
            <div className="text-6xl font-bold text-morandi-pink mb-2">{calculateScore()}</div>
            <p className="text-morandi-text/60 mb-8">分</p>
            <div className="space-y-3 mb-8">
              {courseQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    selectedAnswers[index] === q.correctAnswer ? 'bg-morandi-green/20' : 'bg-morandi-coral/20'
                  }`}
                >
                  <span className="text-sm text-morandi-text">{q.question}</span>
                  {selectedAnswers[index] === q.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-morandi-green" />
                  ) : (
                    <XCircle className="w-5 h-5 text-morandi-coral" />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleBackToCareers}
              className="px-8 py-3 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors"
            >
              继续学习
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
