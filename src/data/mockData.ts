export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Career {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  careerId: string;
  rating: number;
  ratingCount: number;
}

export interface QuizQuestion {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const subjects: Subject[] = [
  { id: '1', name: '计算机科学', icon: 'Cpu', description: '人工智能、编程、数据科学', color: '#B8C4C4' },
  { id: '2', name: '数学', icon: 'Calculator', description: '代数、几何、微积分', color: '#B8C9B5' },
  { id: '3', name: '物理', icon: 'Atom', description: '力学、电磁学、量子物理', color: '#D4C9B5' },
  { id: '4', name: '化学', icon: 'FlaskConical', description: '有机化学、无机化学', color: '#C4B8C9' },
  { id: '5', name: '生物', icon: 'Dna', description: '分子生物学、遗传学', color: '#C9B8B5' },
  { id: '6', name: '经济学', icon: 'TrendingUp', description: '宏观经济、微观经济', color: '#D4A5A5' },
  { id: '7', name: '管理学', icon: 'Briefcase', description: '市场营销、人力资源', color: '#B8C4C4' },
  { id: '8', name: '设计', icon: 'Palette', description: '平面设计、UI设计', color: '#B8C9B5' },
];

export const careers: Career[] = [
  { id: '1', name: '软件工程师', icon: 'Code', description: '从事软件开发、系统架构设计', color: '#B8C4C4' },
  { id: '2', name: '数据分析师', icon: 'BarChart2', description: '数据分析、数据可视化、商业智能', color: '#B8C9B5' },
  { id: '3', name: '产品经理', icon: 'Layout', description: '产品设计、需求分析、项目管理', color: '#D4C9B5' },
  { id: '4', name: 'UI/UX设计师', icon: 'PenTool', description: '用户界面设计、用户体验优化', color: '#C4B8C9' },
  { id: '5', name: '人工智能工程师', icon: 'Brain', description: '机器学习、深度学习、NLP', color: '#C9B8B5' },
  { id: '6', name: '金融分析师', icon: 'LineChart', description: '投资分析、风险评估、财务建模', color: '#D4A5A5' },
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'Python基础入门',
    description: '从零开始学习Python编程语言，掌握基础语法和编程思维',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20programming%20code%20abstract%20background%20soft%20pastel%20colors&image_size=square_hd',
    careerId: '1',
    rating: 4.8,
    ratingCount: 1256,
  },
  {
    id: '2',
    title: '机器学习入门',
    description: '学习机器学习基础知识和常用算法，构建AI思维',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=machine%20learning%20neural%20network%20abstract%20soft%20morandi%20colors&image_size=square_hd',
    careerId: '5',
    rating: 4.6,
    ratingCount: 892,
  },
  {
    id: '3',
    title: '数据可视化实战',
    description: '使用Python进行数据可视化，讲述数据背后的故事',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20visualization%20charts%20graphs%20soft%20pastel%20morandi%20style&image_size=square_hd',
    careerId: '2',
    rating: 4.7,
    ratingCount: 654,
  },
  {
    id: '4',
    title: '产品设计方法论',
    description: '学习产品设计的核心方法，打造用户喜爱的产品',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20design%20wireframe%20mockup%20soft%20morandi%20colors%20minimal&image_size=square_hd',
    careerId: '3',
    rating: 4.9,
    ratingCount: 423,
  },
  {
    id: '5',
    title: 'UI设计原理',
    description: '用户界面设计的基本原则，提升设计审美和技能',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ui%20design%20interface%20mockup%20soft%20pastel%20colors%20modern&image_size=square_hd',
    careerId: '4',
    rating: 4.8,
    ratingCount: 789,
  },
  {
    id: '6',
    title: '金融数据分析',
    description: '金融数据分析入门，掌握投资分析方法',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=financial%20analysis%20charts%20stocks%20soft%20morandi%20blue%20colors&image_size=square_hd',
    careerId: '6',
    rating: 4.5,
    ratingCount: 342,
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    courseId: '1',
    question: 'Python中如何定义一个函数？',
    options: ['def func():', 'function func():', 'func = function():', 'def func[]:'],
    correctAnswer: 0,
  },
  {
    id: '2',
    courseId: '1',
    question: 'Python中的列表用什么符号表示？',
    options: ['{}', '[]', '()', '<>'],
    correctAnswer: 1,
  },
  {
    id: '3',
    courseId: '1',
    question: '以下哪个不是Python的内置数据类型？',
    options: ['list', 'tuple', 'array', 'dict'],
    correctAnswer: 2,
  },
  {
    id: '4',
    courseId: '2',
    question: '以下哪个不是监督学习算法？',
    options: ['线性回归', '决策树', 'K-means', '支持向量机'],
    correctAnswer: 2,
  },
  {
    id: '5',
    courseId: '2',
    question: '神经网络中常用的激活函数是？',
    options: ['Sigmoid', 'Linear', 'Absolute', 'Square'],
    correctAnswer: 0,
  },
];

export const comments: Comment[] = [
  { id: '1', userId: '1', userName: '小明', content: '课程讲解清晰，非常适合入门学习！', createdAt: '2024-01-15 10:30' },
  { id: '2', userId: '2', userName: '小红', content: '老师讲得很好，希望能更新更多内容。', createdAt: '2024-01-14 15:20' },
  { id: '3', userId: '3', userName: '小李', content: '学习了很多，推荐给大家！', createdAt: '2024-01-13 09:15' },
];

export const mockAiResponses: Record<string, string[]> = {
  '1': [
    '您好！我是计算机科学领域的AI助手。请问有什么我可以帮您的？',
    'Python是一门非常流行的编程语言，您想了解哪方面的内容呢？',
    '机器学习是人工智能的核心领域，涉及监督学习、无监督学习等多种方法。',
    '数据结构和算法是编程的基础，建议从链表、树等基础概念开始学习。',
  ],
  '2': [
    '您好！我是数学领域的AI助手。请问有什么数学问题需要解答？',
    '微积分是高等数学的基础，包括导数、积分等核心概念。',
    '线性代数在机器学习中应用广泛，建议重点学习矩阵运算。',
    '概率论是统计学的基础，涉及随机变量、概率分布等内容。',
  ],
  default: [
    '您好！我是您的AI学习助手。请问有什么我可以帮您的？',
    '我可以帮助您解答学习中遇到的问题，提供学习建议。',
    '请告诉我您感兴趣的学科或具体问题，我会尽力帮助您。',
    '学习是一个循序渐进的过程，保持耐心和坚持很重要！',
  ],
};
