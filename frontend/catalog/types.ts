export type PublicLesson = {
  ordinal?: number;
  id: string;
  number?: string;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  quiz_version?: number;
  lab?: { path: string };
};

export type PublicCourse = {
  id: string;
  title: string;
  display_title?: string;
  description?: string;
  home_description?: string;
  lessons: PublicLesson[];
};
