export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
}

export interface Career {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
}

export interface CourseChapter {
  cid: string;
  title: string;
  page: number;
  duration?: number;
}

export interface CatalogTopic {
  id: string;
  domainId: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  companyId: string;
  /** @deprecated 使用 platformRating；保留以兼容 Training/旧代码 */
  rating: number;
  /** @deprecated 使用 platformRatingCount */
  ratingCount: number;
  topicId: string;
  bvid: string | null;
  intro: string;
  chapters: CourseChapter[];
  platformRating: number;
  platformRatingCount: number;
  sourceScore: number | null;
  sourceSummary: string;
  ownerName?: string;
  viewCount?: number;
  danmakuCount?: number;
  replyCount?: number;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  color?: string;
  courses: Course[];
}

export type StudyPathKind = 'kaoyan' | 'civil' | 'public' | 'soe';

export interface StudyPathTimeframeStep {
  phase: string;
  content: string;
}

export interface StudyPath {
  id: string;
  subjectId: string;
  kind: StudyPathKind;
  name: string;
  description: string;
  examSubjects: string[];
  applicableMajors: string[];
  timeframe: StudyPathTimeframeStep[];
  notes: string;
  sortOrder: number;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  score: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}
