import type { Subject } from '../data/mockData';

interface GLMConfig {
  apiKey: string;
}

let config: GLMConfig = {
  apiKey: '',
};

export const setGLMConfig = (newConfig: Partial<GLMConfig>) => {
  config = { ...config, ...newConfig };
};

export const getGLMConfig = () => config;

const mockResponses: Record<string, string[]> = {
  '1': [
    'Python是一门非常流行的编程语言，您想了解哪方面的内容呢？',
    '机器学习是人工智能的核心领域，涉及监督学习、无监督学习等多种方法。',
    '数据结构和算法是编程的基础，建议从链表、树等基础概念开始学习。',
    '深度学习在图像识别、自然语言处理等领域有广泛应用。',
  ],
  '2': [
    '微积分是高等数学的基础，包括导数、积分等核心概念。',
    '线性代数在机器学习中应用广泛，建议重点学习矩阵运算。',
    '概率论是统计学的基础，涉及随机变量、概率分布等内容。',
    '数学建模是将实际问题转化为数学问题的过程。',
  ],
  default: [
    '我可以帮助您解答学习中遇到的问题，提供学习建议。',
    '请告诉我您感兴趣的学科或具体问题，我会尽力帮助您。',
    '学习是一个循序渐进的过程，保持耐心和坚持很重要！',
    '我可以提供学习资源推荐、问题解答和学习方法指导。',
  ],
};

export const chatWithGLM = async (
  message: string,
  subject: Subject | null,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> => {
  if (config.apiKey) {
    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-5.2',
          messages: [
            {
              role: 'system',
              content: `你是一个${subject?.name || '学习'}领域的AI助手，帮助用户解答相关问题。`,
            },
            ...history,
            { role: 'user', content: message },
          ],
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。';
    } catch {
      const responses = mockResponses[subject?.id || ''] || mockResponses.default;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  } else {
    const responses = mockResponses[subject?.id || ''] || mockResponses.default;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return responses[Math.floor(Math.random() * responses.length)];
  }
};
