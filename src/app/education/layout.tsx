'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  GraduationCap, LogOut, ArrowLeft, BookOpen, Trophy, BarChart3,
  ChevronRight, Menu, X, Shield, Film,
} from 'lucide-react';

/* Ã¢ÂÂÃ¢ÂÂ Login Screen Ã¢ÂÂÃ¢ÂÂ */
function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const err = await signIn(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Ã¢ÂÂ branding panel */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-12 bg-slate-900">
        <div>
          <img src="https://twhkpxvblrkwlezgluqf.supabase.co/storage/v1/object/public/Logos/RBS%20logo.jpg" alt="RBS" className="h-12 rounded mb-2" />
        </div>
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-display)] leading-tight mb-3">
            Clinical Excellence Through Continuous Training
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Master cryopreservation protocols, perfusion techniques, and emergency response procedures.
          </p>
          <div className="flex items-center gap-5 mt-8">
            {[
              { icon: BookOpen, label: 'Expert Courses' },
              { icon: Trophy, label: 'Assessments' },
              { icon: Shield, label: 'Certifications' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">ÃÂ© 2026 Resurgence Biomedical Sciences</p>
      </div>

      {/* Right Ã¢ÂÂ login form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <img src="https://twhkpxvblrkwlezgluqf.supabase.co/storage/v1/object/public/Logos/RBS%20logo.jpg" alt="RBS" className="h-14 mx-auto mb-5 rounded" />
          </div>
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              Education Platform
            </h1>
            <p className="text-sm text-slate-500 mt-1">Clinical training &amp; assessment</p>
          </div>
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-display)]">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue your training</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600
                    transition placeholder:text-slate-400"
                  placeholder="you@resurgencebio.org" required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600
                    transition" required
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-lg border border-red-100">
                  <X className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg
                  hover:bg-slate-800 active:bg-slate-900 transition disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Signing inÃ¢ÂÂ¦
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">For authorized RBS personnel only</p>
        </div>
      </div>
    </div>
  );
}

/* Ã¢ÂÂÃ¢ÂÂ Sidebar Navigation Ã¢ÂÂÃ¢ÂÂ */
const sidebarNav = [
  { href: '/education', label: 'Course Catalog', icon: BookOpen, exact: true },
  { href: '/education/my-courses', label: 'My Progress', icon: BarChart3 },
  { href: '/education/videos', label: 'Training Videos', icon: Film },
  { href: '/education/admin', label: 'Admin Panel', icon: Shield, adminOnly: true },
];

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { profile, signOut, enrollments, progress, quizAttempts, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const completedLessons = progress?.length || 0;
  const passedQuizzes = quizAttempts?.filter(q => q.passed)?.length || 0;

  const filteredNav = sidebarNav.filter(item => !item.adminOnly || isAdmin);

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose?.();
  };

  return (
    <aside className={`
      ${mobile ? 'fixed inset-0 z-50 flex' : 'hidden lg:flex'}
      flex-col w-[260px] min-h-screen bg-slate-900
    `}>
      {mobile && <div className="fixed inset-0 bg-black/40 -z-10" onClick={onClose} />}

      <div className="flex flex-col h-full relative z-10 bg-slate-900">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <button onClick={() => handleNavigate('/education')} className="flex items-center gap-3">
              <img src="https://twhkpxvblrkwlezgluqf.supabase.co/storage/v1/object/public/Logos/RBS%20logo.jpg" alt="RBS" className="h-9 rounded" />
              <div>
                <span className="block text-sm font-semibold text-white leading-none">RBS Education</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Clinical Training</span>
              </div>
            </button>
            {mobile && (
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors lg:hidden">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4">
          <div className="rounded-lg p-3.5 border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-sm font-semibold text-white">
                {profile?.full_name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
                <p className="text-[10px] text-slate-500 capitalize">{profile?.role || 'member'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: enrollments?.length || 0, label: 'Courses' },
                { value: completedLessons, label: 'Lessons' },
                { value: passedQuizzes, label: 'Passed' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-base font-semibold text-white">{s.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="px-3 pt-2 pb-2 text-[10px] font-medium text-slate-600 uppercase tracking-wider">Navigation</p>
          {filteredNav.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <button key={item.href} onClick={() => handleNavigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Portal link + sign out */}
        <div className="px-3 pb-3 space-y-1 border-t border-white/[0.06] pt-3 mt-2">
          <a href="https://rbs-portal.vercel.app/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Employee Portal
          </a>
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

/* Ã¢ÂÂÃ¢ÂÂ Top Bar Ã¢ÂÂÃ¢ÂÂ */
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Education', href: '/education' }];
  if (segments.length > 1) {
    if (segments[1] === 'course') crumbs.push({ label: 'Course' });
    else if (segments[1] === 'my-courses') crumbs.push({ label: 'My Progress' });
    else if (segments[1] === 'videos') {
      crumbs.push({ label: 'Training Videos', href: '/education/videos' });
      if (segments[2] === 'upload') crumbs.push({ label: 'Upload' });
    }
    else if (segments[1] === 'admin') crumbs.push({ label: 'Admin' });
  }
  if (segments.includes('lesson')) crumbs.push({ label: 'Lesson' });
  if (segments.includes('quiz')) crumbs.push({ label: 'Quiz' });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center h-14 px-4 lg:px-8">
        <button onClick={onMenuClick} className="lg:hidden mr-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <nav className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
              {c.href ? (
                <a href={c.href} className="text-slate-500 hover:text-slate-800 transition-colors">{c.label}</a>
              ) : (
                <span className="text-slate-800 font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* Ã¢ÂÂÃ¢ÂÂ Shell Ã¢ÂÂÃ¢ÂÂ */
function AuthenticatedShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
          <p className="text-xs text-slate-400">LoadingÃ¢ÂÂ¦</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      {mobileMenuOpen && <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />}

      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1">
          <div className="max-w-5xl px-6 lg:px-10 py-6 lg:py-8">
            {children}
          </div>
        </main>
        <footer className="border-t border-slate-200 mt-auto">
          <div className="max-w-5xl px-6 lg:px-10 py-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">ÃÂ© 2026 Resurgence Biomedical Sciences</p>
            <img src="/rbs-logo-light.jpg" alt="" className="h-4 w-auto opacity-20" />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function EducationLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </AuthProvider>
  );
}
