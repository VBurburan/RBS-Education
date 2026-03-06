'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, fetchProfile, fetchEnrollments, fetchLessonProgress, fetchQuizAttempts, type Profile } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  profile: Profile | null;
  enrollments: { course_id: string; status: string }[];
  progress: { lesson_id: string; completed_at: string }[];
  quizAttempts: { quiz_id: string; score: number; passed: boolean }[];
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
  enroll: (courseId: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  submitQuiz: (quizId: string, score: number, passed: boolean, answers: Record<string, unknown>) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<AuthState['enrollments']>([]);
  const [progress, setProgress] = useState<AuthState['progress']>([]);
  const [quizAttempts, setQuizAttempts] = useState<AuthState['quizAttempts']>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'team_lead';

  const loadUserData = useCallback(async (u: User) => {
    const [prof, enr, prog, qa] = await Promise.all([
      fetchProfile(u.id),
      fetchEnrollments(u.id),
      fetchLessonProgress(u.id),
      fetchQuizAttempts(u.id),
    ]);
    setProfile(prof);
    setEnrollments(enr);
    setProgress(prog);
    setQuizAttempts(qa);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setProfile(null);
        setEnrollments([]);
        setProgress([]);
        setQuizAttempts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message || null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshData = async () => {
    if (user) await loadUserData(user);
  };

  const enroll = async (courseId: string) => {
    if (!user) return;
    await supabase.from('lms_enrollments').insert({ user_id: user.id, course_id: courseId });
    await refreshData();
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;
    await supabase.from('lms_lesson_progress').upsert(
      { user_id: user.id, lesson_id: lessonId },
      { onConflict: 'user_id,lesson_id' }
    );
    await refreshData();
  };

  const submitQuiz = async (quizId: string, score: number, passed: boolean, answers: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('lms_quiz_attempts').insert({
      user_id: user.id, quiz_id: quizId, score, passed, answers,
    });
    await refreshData();
  };

  return (
    <AuthContext.Provider value={{
      user, profile, enrollments, progress, quizAttempts, loading, isAdmin,
      signIn, signOut, refreshData, enroll, completeLesson, submitQuiz,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
