import { useState } from 'react';
import { Cpu, Calculator, Atom, FlaskConical, Dna, TrendingUp, Briefcase, Palette, Send, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { subjects, type Subject } from '../data/mockData';
import { chatWithGLM, setGLMConfig, getGLMConfig } from '../services/glmService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  Atom: <Atom className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
};

const Agent = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState(getGLMConfig().apiKey);

  const handleConfigSave = () => {
    setGLMConfig({ apiKey });
    setShowConfig(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSubject) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const history: Array<{ role: 'user' | 'assistant'; content: string }> = messages.map((msg) => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await chatWithGLM(inputMessage, selectedSubject, history);
    
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content: response,
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="pt-16 h-screen overflow-hidden">
      <div className="flex h-full">
        <div className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-morandi-light/50 p-4 overflow-y-auto flex flex-col">
          <h2 className="text-lg font-bold text-morandi-text mb-4">选择学科</h2>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => {
                  setSelectedSubject(subject);
                  setMessages([]);
                }}
                className={`w-full flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  selectedSubject?.id === subject.id
                    ? 'bg-morandi-pink/20 text-morandi-pink'
                    : 'hover:bg-morandi-light text-morandi-text'
                }`}
                style={{ backgroundColor: selectedSubject?.id === subject.id ? `${subject.color}20` : undefined }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedSubject?.id === subject.id ? subject.color : 'rgba(245, 245, 240, 1)' }}
                >
                  {iconMap[subject.icon]}
                </div>
                <span className="font-medium text-sm">{subject.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-morandi-light text-morandi-text hover:bg-morandi-pink/20 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>模型配置</span>
              {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showConfig && (
              <div className="mt-4 p-4 rounded-xl bg-morandi-light/50">
                <label className="block text-sm font-medium text-morandi-text mb-2">GLM-5.2 API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入API Key"
                  className="w-full px-4 py-2 rounded-xl bg-white border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text text-sm"
                />
                <button
                  onClick={handleConfigSave}
                  className="mt-3 w-full py-2 rounded-xl bg-morandi-pink text-white text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  保存配置
                </button>
                <p className="text-xs text-morandi-text/60 mt-2">
                  {apiKey ? '当前模式: GLM-5.2' : '当前模式: 模拟模式'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col h-full ml-64">
          {selectedSubject ? (
            <>
              <div
                className="p-4 border-b"
                style={{ backgroundColor: `${selectedSubject.color}20` }}
              >
                <h2 className="text-lg font-bold text-morandi-text">
                  {selectedSubject.name} - AI助手
                </h2>
                <p className="text-sm text-morandi-text/60">{selectedSubject.description}</p>
              </div>

              <div className="flex-1 p-6 overflow-y-auto relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div 
                    className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: selectedSubject.color }}
                  ></div>
                  <div 
                    className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-10 blur-2xl"
                    style={{ backgroundColor: selectedSubject.color }}
                  ></div>
                </div>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-lg"
                      style={{ backgroundColor: `${selectedSubject.color}20` }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${selectedSubject.color}40` }}
                      >
                        {iconMap[selectedSubject.icon]}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-morandi-text mb-3">准备好了，随时开始</h3>
                    <p className="text-morandi-text/60 mb-8 max-w-md">
                      我是您的{selectedSubject.name}专属AI助手，随时为您解答学科相关问题，帮助您更好地理解和掌握知识。
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      <button
                        onClick={() => {
                          setInputMessage(`请介绍一下${selectedSubject.name}学科`);
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-morandi-light/50 text-morandi-text text-sm hover:bg-morandi-light/50 transition-colors shadow-sm"
                      >
                        介绍学科
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage(`推荐一些${selectedSubject.name}的学习资源`);
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-morandi-light/50 text-morandi-text text-sm hover:bg-morandi-light/50 transition-colors shadow-sm"
                      >
                        推荐资源
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage(`学习${selectedSubject.name}需要掌握哪些技能`);
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-morandi-light/50 text-morandi-text text-sm hover:bg-morandi-light/50 transition-colors shadow-sm"
                      >
                        技能要求
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-4 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-morandi-pink text-white rounded-br-none'
                              : 'bg-morandi-light text-morandi-text rounded-bl-none'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-morandi-light text-morandi-text p-4 rounded-2xl rounded-bl-none">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-morandi-text/40 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-morandi-text/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-2 h-2 bg-morandi-text/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="有问题，尽管问"
                    className="flex-1 px-4 py-3 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 rounded-xl bg-morandi-pink text-white font-medium flex items-center justify-center hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-morandi-pink/5 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-morandi-blue/5 blur-3xl"></div>
              </div>
              <div className="text-center relative z-10">
                <div className="w-32 h-32 rounded-full bg-morandi-light/50 flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <div className="w-20 h-20 rounded-full bg-morandi-light flex items-center justify-center">
                    <Cpu className="w-10 h-10 text-morandi-text/50" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-morandi-text mb-4">选择一个学科</h2>
                <p className="text-morandi-text/60 text-lg mb-8 max-w-md">从左侧列表中选择您感兴趣的学科，开始与AI助手对话</p>
                <div className="flex justify-center gap-4">
                  {subjects.slice(0, 4).map((subject) => (
                    <div
                      key={subject.id}
                      className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${subject.color}30` }}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setMessages([]);
                      }}
                    >
                      {iconMap[subject.icon]}
                    </div>
                  ))}
                </div>
                <p className="text-morandi-text/40 text-sm mt-4">点击图标快速选择</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agent;
