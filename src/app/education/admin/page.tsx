"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shield, BookOpen, Video, FileText, Users } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState({ courses: 0, modules: 0, lessons: 0, quizzes: 0, videos: 0, users: 0 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => setProfile(data));
      }
    });
    Promise.all([
      supabase.from("lms_courses").select("id", { count: "exact", head: true }),
      supabase.from("lms_modules").select("id", { count: "exact", head: true }),
      supabase.from("lms_lessons").select("id", { count: "exact", head: true }),
      supabase.from("lms_quizzes").select("id", { count: "exact", head: true }),
      supabase.from("training_videos").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]).then(([c, m, l, q, v, u]) => {
      setStats({ courses: c.count || 0, modules: m.count || 0, lessons: l.count || 0, quizzes: q.count || 0, videos: v.count || 0, users: u.count || 0 });
    });
  }, []);

  const isAdmin = profile?.role === "admin" || profile?.role === "team_lead";
  if (!isAdmin) return (
    <div className="p-8 text-center py-16">
      <Shield className="w-12 h-12 text-navy-300 mx-auto mb-4" />
      <h3 className="font-display font-semibold text-navy-700">Admin Access Required</h3>
    </div>
  );

  const cards = [
    { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-slate-500" },
    { label: "Modules", value: stats.modules, icon: FileText, color: "text-slate-500" },
    { label: "Lessons", value: stats.lessons, icon: FileText, color: "text-slate-500" },
    { label: "Quizzes", value: stats.quizzes, icon: Shield, color: "text-slate-500" },
    { label: "Training Videos", value: stats.videos, icon: Video, color: "text-slate-500" },
    { label: "Users", value: stats.users, icon: Users, color: "text-slate-500" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-6">Content Manager</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-navy-100 p-4">
            <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
            <p className="text-2xl font-bold text-navy-900">{c.value}</p>
            <p className="text-sm text-navy-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Link href="/education/videos/upload" className="flex items-center justify-between p-4 bg-white rounded-xl border border-navy-100 hover:border-navy-300 transition-colors">
          <div className="flex items-center gap-3"><Video className="w-5 h-5 text-navy-600" /><span className="font-medium text-navy-800 text-sm">Upload Training Videos</span></div>
        </Link>
      </div>
    </div>
  );
}
