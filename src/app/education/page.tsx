"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BookOpen, Clock, BarChart3, ChevronRight, Video } from "lucide-react";

interface Course {
  id: string; title: string; description: string | null;
  difficulty: string; duration: string | null; status: string;
  objectives: any[]; sort_order: number;
}

const difficultyColor: Record<string, string> = {
  Foundation: "bg-slate-100 text-slate-700",
  Intermediate: "bg-slate-200 text-slate-700",
  Advanced: "bg-slate-700 text-white",
};

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("lms_courses").select("*").eq("status", "published").order("sort_order")
      .then(({ data }) => { setCourses(data || []); setLoading(false); });
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">Course Catalog</h1>
        <p className="text-navy-600 mt-2">Structured training progression for biostasis field operations</p>
      </div>

      {/* Quick link to training videos */}
      <Link href="/education/videos"
        className="flex items-center justify-between p-4 mb-8 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors group">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-slate-500" />
          <div>
            <p className="font-semibold text-sm">Training Video Library</p>
            <p className="text-navy-300 text-xs">Browse all training recordings by category</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-navy-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-navy-100 p-6 animate-pulse">
              <div className="h-5 bg-navy-100 rounded w-1/3 mb-3" />
              <div className="h-6 bg-navy-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-navy-50 rounded w-full mb-1" />
              <div className="h-4 bg-navy-50 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/education/course/${course.id}`}
              className="bg-white rounded-xl border border-navy-100 p-6 hover:border-navy-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyColor[course.difficulty] || "bg-gray-100 text-gray-700"}`}>
                  {course.difficulty}
                </span>
                {course.duration && (
                  <span className="flex items-center gap-1 text-xs text-navy-500">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-navy-900 text-lg mb-2 group-hover:text-navy-700 transition-colors">
                {course.title}
              </h3>
              <p className="text-navy-600 text-sm line-clamp-2">{course.description}</p>
              <div className="mt-4 flex items-center text-navy-700 text-sm font-medium">
                View Course <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
