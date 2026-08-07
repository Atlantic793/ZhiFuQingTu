export type UserPortrait = {
  user_id: string;
  major: string;
  grade: string;
  math_basis: string;
  programming_basis: string;
  english_level: string;
  target_university: string;
  target_careers: string[];
  learned_courses: string[];
  weak_points: string[];
  weekly_hours: string;
  updated_at: string | null;
};

export type PortraitPatch = Partial<
  Pick<
    UserPortrait,
    | 'major'
    | 'grade'
    | 'math_basis'
    | 'programming_basis'
    | 'english_level'
    | 'target_university'
    | 'target_careers'
    | 'learned_courses'
    | 'weak_points'
    | 'weekly_hours'
  >
>;

export type SubjectTier = {
  subject: string;
  careers: string[];
  courses: string[];
};
