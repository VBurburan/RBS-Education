"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GraduationCap, BookOpen } from "lucide-react";

export default function MyCoursesPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
  }, []);

  if (!user) return (
    <div className="p-6 lg:p-8 max-w-4xl text-center py-16">
      <GraduationCap className="w-12 h-12 text-navy-300 mx-auto mb-4" />
      <h2 className="font-display font-semibold text-navy-700 text-lg">Sign in to track your progress</h2>
      <p className="text-navy-500 text-sm mt-1 mb-4">Your course progress and quiz scores will appear here.</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-6">My Courses</h1>
      <div className="bg-white rounded-xl border border-navy-100 p-8 text-center">
        <BookOpen className="w-10 h-10 text-navy-300 mx-auto mb-3" />
        <p className="text-navy-600 text-sm">Course enrollment tracking coming soon.</p>
        <Link href="/education" className="inline-block mt-4 text-navy-700 text-sm font-medium hover:underline">Browse courses</Link>
      </div>
    </div>
  );
}
