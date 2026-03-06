"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BookOpen, Play, FileText, ChevronRight, Clock, ArrowLeft } from "lucide-react";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("lms_courses").select("*").eq("id", courseId).single().then(({ data }) => setCourse(data));
    supabase.from("lms_modules").select("*").eq("course_id", courseId).order("sort_order").then(({ data }) => setModules(data || []));
    supabase.from("lms_lessons").select("*, module:lms_modules(title)").order("sort_order").then(({ data }) => {
      setLessons((data || []).filter((l: any) => modules.some((m) => m.id === l.module_id) || true));
    });
    supabase.from("lms_quizzes").select("*").order("sort_order").then(({ data }) => setQuizzes(data || []));
  }, [courseId]);

  if (!course) return <div className="p-8"><div className="animate-pulse h-8 bg-navy-100 rounded w-1/3" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link href="/education" className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">{course.title}</h1>
      <p className="text-navy-600 mb-8">{course.description}</p>

      <div className="space-y-6">
        {modules.map((mod) => {
          const modLessons = lessons.filter((l) => l.module_id === mod.id);
          const modQuizzes = quizzes.filter((q) => q.module_id === mod.id);
          return (
            <div key={mod.id} className="bg-white rounded-xl border border-navy-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-navy-50 bg-navy-50/50">
                <h3 className="font-display font-semibold text-navy-800">{mod.title}</h3>
                {mod.description && <p className="text-navy-500 text-sm mt-0.5">{mod.description}</p>}
              </div>
              <div className="divide-y divide-navy-50">
                {modLessons.map((lesson) => (
                  <Link key={lesson.id} href={`/education/course/${courseId}/lesson/${lesson.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-navy-50/50 transition-colors group">
                    {lesson.type === "video" ? <Play className="w-4 h-4 text-navy-600 shrink-0" /> : <FileText className="w-4 h-4 text-navy-400 shrink-0" />}
                    <span className="text-sm text-navy-700 flex-1">{lesson.title}</span>
                    {lesson.duration && <span className="text-xs text-navy-400 flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.duration}</span>}
                    <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-navy-500" />
                  </Link>
                ))}
                {modQuizzes.map((quiz) => (
                  <Link key={quiz.id} href={`/education/course/${courseId}/quiz/${quiz.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-navy-50/50 transition-colors group">
                    <BookOpen className="w-4 h-4 text-navy-500 shrink-0" />
                    <span className="text-sm text-navy-700 flex-1">{quiz.title}</span>
                    <span className="text-xs text-navy-400">Quiz Â· {quiz.passing_score}% to pass</span>
                    <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-navy-500" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
