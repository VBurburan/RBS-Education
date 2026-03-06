import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://twhkpxvblrkwlezgluqf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aGtweHZibHJrd2xlemdsdXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjM0NzgsImV4cCI6MjA4NTU5OTQ3OH0.Dsn-fRV6ykhqC2ISyR3Z8OqdNjEWPJN8mz7MTK7RCW8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Course = {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  duration: string | null;
  prerequisites: string[];
  objectives: string[];
  cover_image_path: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  modules?: Module[];
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons?: Lesson[];
  quizzes?: Quiz[];
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  type: 'content' | 'video' | 'practical' | 'reference';
  duration: string | null;
  content: {
    sections?: {
      title: string;
      text: string;
      keyPoints?: string[];
    }[];
  };
  video_storage_path: string | null;
  video_url: string | null;
  sort_order: number;
};

export type Quiz = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  questions?: QuizQuestion[];
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  type: 'single' | 'multi' | 'sequence' | 'scenario';
  question_text: string;
  options: string[];
  correct_answer: number | number[];
  rationale: string | null;
  sort_order: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'team_lead' | 'member' | 'observer';
};

// Fetch courses with nested relations
export async function fetchCourses() {
  const { data, error } = await supabase
    .from('lms_courses')
    .select(`
      *,
      modules:lms_modules(
        *,
        lessons:lms_lessons(*),
        quizzes:lms_quizzes(
          *,
          questions:lms_quiz_questions(*)
        )
      )
    `)
    .order('sort_order');

  if (error) throw error;

  // Sort nested
  return (data || []).map((c: Course) => ({
    ...c,
    modules: (c.modules || [])
      .sort((a: Module, b: Module) => a.sort_order - b.sort_order)
      .map((m: Module) => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.sort_order - b.sort_order),
        quizzes: (m.quizzes || []).map((q: Quiz) => ({
          ...q,
          questions: (q.questions || []).sort((a: QuizQuestion, b: QuizQuestion) => a.sort_order - b.sort_order),
        })),
      })),
  }));
}

export async function fetchCourseById(id: string) {
  const { data, error } = await supabase
    .from('lms_courses')
    .select(`
      *,
      modules:lms_modules(
        *,
        lessons:lms_lessons(*),
        quizzes:lms_quizzes(
          *,
          questions:lms_quiz_questions(*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    modules: (data.modules || [])
      .sort((a: Module, b: Module) => a.sort_order - b.sort_order)
      .map((m: Module) => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.sort_order - b.sort_order),
        quizzes: (m.quizzes || []).map((q: Quiz) => ({
          ...q,
          questions: (q.questions || []).sort((a: QuizQuestion, b: QuizQuestion) => a.sort_order - b.sort_order),
        })),
      })),
  } as Course;
}

export async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data as Profile | null;
}

export async function fetchEnrollments(userId: string) {
  const { data } = await supabase
    .from('lms_enrollments')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function fetchLessonProgress(userId: string) {
  const { data } = await supabase
    .from('lms_lesson_progress')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}

export async function fetchQuizAttempts(userId: string) {
  const { data } = await supabase
    .from('lms_quiz_attempts')
    .select('*')
    .eq('user_id', userId);
  return data || [];
}
