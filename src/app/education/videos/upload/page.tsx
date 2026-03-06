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
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file!.type }, body: file });
      setRecentUploads((prev) => [{ id: videoId, title: form.title, created_at: new Date().toISOString() }, ...prev]);
      setForm({ ...EMPTY_FORM }); setFile(null); setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Training Video</h1>
          <p className="text-base text-gray-500 mt-1">Add new training content to the video library</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Video
        </button>
      </div>

      {recentUploads.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <p className="text-base text-gray-500">No videos uploaded yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click &ldquo;New Video&rdquo; above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Recent Uploads</h2>
          {recentUploads.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <span className="text-base font-medium text-gray-800">{u.title}</span>
              <span className="text-sm text-gray-400">{new Date(u.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Upload Training Video</h2>
              <button onClick={() => { setShowModal(false); setError(""); }} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5 px-8 py-6">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

              {/* Title */}
              <Field label="Title" required>
                <input type="text" placeholder="e.g., Sterile Field Preparation Demo" value={form.title} onChange={(e) => set("title", e.target.value)} className="field-input" />
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea placeholder="Brief description of the training content..." rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className="field-input resize-none" />
              </Field>

              {/* Category + Duration side by side */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Category" required>
                  <select value={form.category} onChange={(e) => set("category", e.target.value as Category)} className="field-input">
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Duration" required>
                  <select value={form.duration_category} onChange={(e) => set("duration_category", e.target.value as DurationCategory)} className="field-input">
                    <option value="">Select duration...</option>
                    {DURATION_TIERS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* Sub-category */}
              <Field label="Sub-category" hint="Optional -- e.g., MHP-2 Washout, Femoral Approach">
                <input type="text" placeholder="e.g., MHP-2 Washout" value={form.sub_category} onChange={(e) => set("sub_category", e.target.value)} className="field-input" />
              </Field>

              {/* Confidentiality + Priority */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Confidentiality">
                  <select value={form.confidentiality} onChange={(e) => set("confidentiality", e.target.value as Confidentiality)} className="field-input">
                    {CONFIDENTIALITY_LEVELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)} className="field-input">
                    {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* Restricted warning */}
              {form.confidentiality === "restricted" && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                  <p className="text-sm text-red-700"><strong>Restricted video.</strong> This recording will not be visible to external partners or shared outside the RBS organization.</p>
                </div>
              )}

              {/* Location + Date */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Location" hint="Where was this recorded?">
                  <input type="text" placeholder="e.g., Oregon Training Facility" value={form.location} onChange={(e) => set("location", e.target.value)} className="field-input" />
                </Field>
                <Field label="Date Recorded">
                  <input type="date" value={form.date_recorded} onChange={(e) => set("date_recorded", e.target.value)} className="field-input" />
                </Field>
              </div>

              {/* Notes */}
              <Field label="Notes" hint="Internal notes for reference">
                <textarea placeholder="Any additional notes..." rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field-input resize-none" />
              </Field>

              {/* File Upload */}
              <Field label="Video File" required>
                <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-10 transition hover:border-blue-400 hover:bg-blue-50/30">
                  <input ref={fileRef} type="file" className="hidden" accept="video/*,.mxf,.prproj" onChange={onFileChange} />
                  {file ? (
                    <>
                      <svg className="mb-3 h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <p className="text-base font-medium text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-400 mt-1">{(file.size / 1_000_000).toFixed(1)} MB</p>
                    </>
                  ) : (
                    <>
                      <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-base font-medium text-gray-500">Click to browse or drag and drop</p>
                      <p className="text-sm text-gray-400 mt-1">MP4, MOV, WebM, Premiere Pro, or any format</p>
                    </>
                  )}
                </div>
              </Field>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-8 py-5 rounded-b-2xl">
              <button onClick={() => { setShowModal(false); setError(""); }} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel</button>
              <button disabled={!canSubmit || uploading} onClick={handleUpload} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                {uploading ? (
                  <><svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Uploadingâ¦</>
                ) : (
                  <><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>Upload</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Field wrapper ---------- */
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <style>{`
        .field-input {
          display: block;
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 1rem;
          line-height: 1.5;
          color: #111827;
          background-color: #fff;
          border: 1.5px solid #d1d5db;
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          cursor: text;
          caret-color: #1e293b;
        }
        .field-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .field-input::placeholder {
          color: #9ca3af;
          font-style: normal;
        }
        select.field-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem;
          padding-right: 2.5rem;
        }
        select.field-input option[value=""] {
          color: #9ca3af;
        }
      `}
      .modal-body::-webkit-scrollbar { width: 6px; }
      .modal-body::-webkit-scrollbar-track { background: transparent; }
      .modal-body::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
      .modal-body::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
    </style>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}