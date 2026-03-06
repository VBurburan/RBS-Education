'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  CATEGORIES,
  DURATION_TIERS,
  CONFIDENTIALITY_LEVELS,
  type TrainingVideo,
  type Category,
} from '@/lib/video-constants';

function fmtSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [durFilter, setDurFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('training_videos')
        .select('*')
        .order('created_at', { ascending: false });
      setVideos((data as TrainingVideo[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = videos;
    if (catFilter !== 'all') list = list.filter((v) => v.category === catFilter);
    if (durFilter !== 'all') list = list.filter((v) => v.duration_category === durFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.sub_category?.toLowerCase().includes(q) ||
          v.location?.toLowerCase().includes(q) ||
          v.notes?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [videos, catFilter, durFilter, search]);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = { all: videos.length };
    CATEGORIES.forEach((c) => {
      m[c] = videos.filter((v) => v.category === c).length;
    });
    return m;
  }, [videos]);

  const confBadge = (level: string | null) => {
    const entry = CONFIDENTIALITY_LEVELS.find((c) => c.value === level);
    if (!entry) return null;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${entry.color}`}>
        {entry.value === 'restricted' && (
          <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-7V7a5 5 0 00-10 0v4a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z" />
          </svg>
        )}
        {entry.label}
      </span>
    );
  };

  const durLabel = (val: string) =>
    DURATION_TIERS.find((d) => d.value === val)?.label ?? val;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Training Video Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse, search, and watch training recordings by category
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:border-[#2C3E50] focus:outline-none focus:ring-1 focus:ring-[#2C3E50]"
          />
        </div>
        <select
          value={durFilter}
          onChange={(e) => setDurFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#2C3E50] focus:outline-none focus:ring-1 focus:ring-[#2C3E50]"
        >
          <option value="all">All Durations</option>
          {DURATION_TIERS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCatFilter('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            catFilter === 'all' ? 'bg-[#2C3E50] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({catCounts.all})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              catFilter === cat ? 'bg-[#2C3E50] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat} ({catCounts[cat] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No videos uploaded yet</h3>
          <p className="mt-1 text-sm text-gray-400">Training videos will appear here once uploaded.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div key={v.id} className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{v.title}</h3>
                {confBadge(v.confidentiality)}
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded bg-[#2C3E50]/10 px-2 py-0.5 text-xs font-medium text-[#2C3E50]">{v.category}</span>
                {v.sub_category && (
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{v.sub_category}</span>
                )}
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{durLabel(v.duration_category)}</span>
              </div>
              {v.description && (
                <p className="mb-3 text-xs text-gray-500 line-clamp-2">{v.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{fmtSize(v.file_size_bytes)}</span>
                <span>{new Date(v.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
