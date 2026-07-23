import { useState } from 'react';
import { Cpu, Calculator, Atom, FlaskConical, Dna, TrendingUp, Briefcase, Palette, Send, Bot, MessageSquare } from 'lucide-react';
import { subjects, mockAiResponses, type Subject, type Message } from '../data/mockData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  TrendingUp,
  Briefcase,
  Palette,
};

const Agent = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setMessages([]);
    const responses = mockAiResponses[subject.id] || mockAiResponses.default;
    const welcomeMessage: Message = {
      id: '1',
      sender: 'ai',
      content: responses[0],
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = selectedSubject
        ? mockAiResponses[selectedSubject.id] || mockAiResponses.default
        : mockAiResponses.default;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="pt-16">
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-morandi-text font-display mb-4">
          多学科AI Agent
        </h1>
        <p className="text-morandi-text/70">
          选择您所在的学科，获取专属AI学习助手
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h2 className="text-lg font-bold text-morandi-text mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-morandi-pink" />
              选择学科
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => {
                const IconComponent = iconMap[subject.icon];
                return (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject)}
                    className={`p-4 rounded-2xl transition-all duration-300 text-left ${
                      selectedSubject?.id === subject.id
                        ? 'bg-morandi-pink text-white shadow-md scale-105'
                        : 'bg-morandi-light hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`w-8 h-8 mb-2 ${
                          selectedSubject?.id === subject.id ? 'text-white' : 'text-morandi-pink'
                        }`}
                      />
                    )}
                    <span className={`font-medium text-sm ${selectedSubject?.id === subject.id ? 'text-white' : 'text-morandi-text'}`}>
                      {subject.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSubject ? (
            <div className="bg-white rounded-3xl shadow-soft overflow-hidden flex flex-col h-[500px]">
              <div
                className="p-4 flex items-center gap-3"
                style={{ backgroundColor: `${selectedSubject.color}30` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedSubject.color }}
                >
                  {(() => {
                    const Icon = iconMap[selectedSubject.icon];
                    return Icon ? <Icon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-morandi-text">{selectedSubject.name}助手</h3>
                  <p className="text-sm text-morandi-text/60">{selectedSubject.description}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        message.sender === 'user' ? 'bg-morandi-pink' : 'bg-morandi-blue'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <span className="text-white text-xs">我</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-morandi-pink text-white rounded-tr-sm'
                          : 'bg-morandi-light text-morandi-text rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-morandi-blue flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-morandi-light p-4 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-morandi-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-morandi-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-morandi-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-morandi-light">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-3 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text"
                  />
                  <button
                    onClick={handleSend}
                    className="w-12 h-12 rounded-xl bg-morandi-pink text-white flex items-center justify-center hover:bg-opacity-90 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-soft p-12 flex flex-col items-center justify-center h-[500px] text-center">
              <div className="w-20 h-20 rounded-full bg-morandi-light flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-morandi-pink" />
              </div>
              <h3 className="text-xl font-bold text-morandi-text mb-2">选择一个学科开始</h3>
              <p className="text-morandi-text/60">
                点击左侧学科卡片，获取专属AI学习助手
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agent;
