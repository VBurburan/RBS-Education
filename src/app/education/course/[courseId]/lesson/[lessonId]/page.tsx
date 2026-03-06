"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Play } from "lucide-react";

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const [lesson, setLesson] = useState<any>(null);

  useEffect(() => {
    supabase.from("lms_lessons").select("*").eq("id", lessonId).single().then(({ data }) => setLesson(data));
  }, [lessonId]);

  if (!lesson) return <div className="p-8"><div className="animate-pulse h-8 bg-navy-100 rounded w-1/3" /></div>;

  const content = lesson.content || {};

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link href={`/education/course/${courseId}`} className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Course
      </Link>
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-6">{lesson.title}</h1>

      {lesson.type === "video" && (lesson.video_url || lesson.video_storage_path) && (
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
          <video src={lesson.video_url || ""} controls className="w-full h-full" />
        </div>
      )}

      {lesson.type === "video" && !lesson.video_url && !lesson.video_storage_path && (
        <div className="aspect-video bg-navy-900 rounded-xl flex items-center justify-center mb-6">
          <div className="text-center">
            <Play className="w-12 h-12 text-navy-500 mx-auto mb-2" />
            <p className="text-navy-400 text-sm">Video content coming soon</p>
          </div>
        </div>
      )}

      {content.overview && (
        <div className="prose prose-navy max-w-none mb-6">
          <p className="text-navy-700 leading-relaxed">{content.overview}</p>
        </div>
      )}

      {content.sections?.map((section: any, i: number) => (
        <div key={i} className="mb-6">
          <h2 className="font-display font-semibold text-navy-800 text-lg mb-2">{section.title}</h2>
          {section.content && <p className="text-navy-600 text-sm leading-relaxed">{section.content}</p>}
          {section.items && (
            <ul className="mt-2 space-y-1">
              {section.items.map((item: string, j: number) => (
                <li key={j} className="text-navy-600 text-sm pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-400">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
