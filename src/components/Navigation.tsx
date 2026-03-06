"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  BookOpen, Video, GraduationCap, Shield, LayoutDashboard, 
  LogOut, Menu, X, ChevronRight, ExternalLink
} from "lucide-react";

const navItems = [
  { href: "/education", label: "Course Catalog", icon: BookOpen },
  { href: "/education/videos", label: "Training Videos", icon: Video },
  { href: "/education/my-courses", label: "My Courses", icon: GraduationCap },
];

const adminItems = [
  { href: "/education/admin", label: "Content Manager", icon: Shield },
  { href: "/education/videos/upload", label: "Upload Videos", icon: Video },
];

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
          .then(({ data }) => setProfile(data));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = profile?.role === "admin" || profile?.role === "team_lead";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/education";
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-navy-100 min-h-screen fixed left-0 top-0 z-40">
        <div className="p-5 border-b border-navy-100">
          <Link href="/education" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-navy-900 text-sm leading-tight">RBS Education</p>
              <p className="text-[11px] text-navy-500 leading-tight">Training Platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-navy-400">Learning</p>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/education" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
                }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-navy-100" />
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-navy-400">Admin</p>
              {adminItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
                    }`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-navy-100 space-y-2">
          <a href="https://rbsops.org" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-500 hover:bg-navy-50 transition-colors">
            <ExternalLink className="w-4 h-4" />
            Operations Portal
          </a>
          {user ? (
            <button onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <Link href="/education" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-navy-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-navy-100 px-4 py-3 flex items-center justify-between">
        <Link href="/education" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-navy-900 text-sm">RBS Education</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-navy-50">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 right-0 w-72 bg-white rounded-bl-xl shadow-xl p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-700 hover:bg-navy-50">
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ))}
            {isAdmin && adminItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-700 hover:bg-navy-50">
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
