'use client';

import { useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  CATEGORIES,
  DURATION_TIERS,
  CONFIDENTIALITY_LEVELS,
  PRIORITY_OPTIONS,
  type Category,
  type DurationCategory,
  type Confidentiality,
  type Priority,
} from "@/lib/video-constants";

interface FormState {
  title: string; description: string; category: Category | "";
  sub_category: string; duration_category: DurationCategory | "";
  confidentiality: Confidentiality; priority: Priority;
  location: string; notes: string; date_recorded: string;
}

const EMPTY_FORM: FormState = {
  title: "", description: "", category: "", sub_category: "",
  duration_category: "", confidentiality: "internal", priority: "normal",
  location: "", notes: "", date_recorded: "",
};

export default function UploadPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [recentUploads, setRecentUploads] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = useCallback(
    <K extends keyof FormState>(key: K, val: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: val })),
    [],
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }, []);

  const canSubmit = form.title.trim() !== "" && form.category !== "" && form.duration_category !== "" && file !== null && !uploading;

  const handleUpload = async () => {
    if (!canSubmit) return;
    setUploading(true); setError("");
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file!.name, fileType: file!.type, fileSize: file!.size, ...form }),
      });
      if (!res.ok) { const msg = await res.text(); throw new Error(msg || "Upload failed"); }
      const { uploadUrl, videoId } = await res.json();
      if (uploadUrl) {
        const up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file!.type }, body: file });
        if (!up.ok) throw new Error("S3 upload failed");
      }
      setRecentUploads((prev) => [{ id: videoId, title: form.title, created_at: new Date().toISOString() }, ...prev]);
      setForm({ ...EMPTY_FORM }); setFile(null); setShowModal(false);
    } catch (err: any) { setError(err.message ?? "Something went wrong"); }
    finally { setUploading(false); }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Videos</h1>
          <p className="mt-1 text-sm text-gray-500">Add training recordings to the video library</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#2C3E50] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1a252f]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Video
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Recent Uploads</h2>
        {recentUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="text-sm text-gray-500">No videos uploaded yet. Click &ldquo;New Video&rdquo; to start.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentUploads.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm font-medium text-gray-800">{u.title}</span>
                <span className="text-xs text-gray-400">{new Date(u.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Upload Training Video</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

              <Field label="Title" required><input type="text" placeholder="e.g., Sterile Field Preparation Demo" value={form.title} onChange={(e) => set("title", e.target.value)} className="input" /></Field>
              <Field label="Description"><textarea placeholder="Brief description..." rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className="input" /></Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" required><select value={form.category} onChange={(e) => set("category", e.target.value as Category)} className="input"><option value="">Select…</option>{CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}</select></Field>
                <Field label="Duration" required><select value={form.duration_category} onChange={(e) => set("duration_category", e.target.value as DurationCategory)} className="input"><option value="">Select…</option>{DURATION_TIERS.map((d) => (<option key={d.value} value={d.value}>{d.label}</option>))}</select></Field>
              </div>

              <Field label="Sub-category" hint="Optional — e.g., MHP-2 Washout, Femoral Approach"><input type="text" placeholder="e.g., MHP-2 Washout" value={form.sub_category} onChange={(e) => set("sub_category", e.target.value)} className="input" /></Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Confidentiality"><select value={form.confidentiality} onChange={(e) => set("confidentiality", e.target.value as Confidentiality)} className="input">{CONFIDENTIALITY_LEVELS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}</select></Field>
                <Field label="Priority"><select value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)} className="input">{PRIORITY_OPTIONS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}</select></Field>
              </div>

              {form.confidentiality === "restricted" && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                  <p className="text-xs text-red-700"><strong>Restricted video.</strong> This recording will not be visible to external partners or shared outside the RBS organization.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Location" hint="Where was this recorded?"><input type="text" placeholder="e.g., Oregon Training Facility" value={form.location} onChange={(e) => set("location", e.target.value)} className="input" /></Field>
                <Field label="Date Recorded"><input type="date" value={form.date_recorded} onChange={(e) => set("date_recorded", e.target.value)} className="input" /></Field>
              </div>

              <Field label="Notes" hint="Internal notes for reference"><textarea placeholder="Any additional notes..." rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="input" /></Field>

              <Field label="Video File" required>
                <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-8 transition hover:border-[#2C3E50] hover:bg-gray-100">
                  <input ref={fileRef} type="file" className="hidden" accept="video/*,.mxf,.prproj" onChange={onFileChange} />
                  {file ? (<><svg className="mb-2 h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><p className="text-sm font-medium text-gray-700">{file.name}</p><p className="text-xs text-gray-400">{(file.size / 1_000_000).toFixed(1)} MB</p></>) : (<><svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><p className="text-sm text-gray-500">Click to browse or drag and drop</p><p className="text-xs text-gray-400">MP4, MOV, WebM, Premiere Pro, or any format</p></>)}
                </div>
              </Field>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <button onClick={() => { setShowModal(false); setError(""); }} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button disabled={!canSubmit} onClick={handleUpload} className="inline-flex items-center gap-2 rounded-lg bg-[#2C3E50] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1a252f] disabled:cursor-not-allowed disabled:opacity-40">
                {uploading ? (<><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Uploading…</>) : (<><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>Upload</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-400">*</span>}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}