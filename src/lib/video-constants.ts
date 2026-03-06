// lib/video-constants.ts
// Shared constants for the Training Video Library — matches Supabase constraints

export const CATEGORIES = [
  'Perfusion',
  'IO/Vascular Access',
  'Isolated Procedures',
  'Logistics/Simulations',
  'Stabilization',
  'Equipment',
  'General/Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DURATION_TIERS = [
  { value: 'under_10min', label: '< 10 min' },
  { value: '10_to_30min', label: '10–30 min' },
  { value: '30_to_60min', label: '30–60 min' },
  { value: '1_to_2hr', label: '1–2 hours' },
  { value: '2_to_4hr', label: '2–4 hours' },
  { value: 'over_4hr', label: '> 4 hours' },
] as const;

export type DurationCategory = (typeof DURATION_TIERS)[number]['value'];

export const CONFIDENTIALITY_LEVELS = [
  { value: 'internal', label: 'Internal Only', color: 'bg-gray-100 text-gray-700' },
  { value: 'restricted', label: 'Restricted — No Distribution', color: 'bg-red-100 text-red-700' },
  { value: 'shareable', label: 'Shareable with Partners', color: 'bg-green-100 text-green-700' },
] as const;

export type Confidentiality = (typeof CONFIDENTIALITY_LEVELS)[number]['value'];

export const PRIORITY_OPTIONS = [
  { value: 'upload_first', label: 'Upload First' },
  { value: 'upload_soon', label: 'Upload Soon' },
  { value: 'normal', label: 'Normal' },
  { value: 'archive', label: 'Archive' },
] as const;

export type Priority = (typeof PRIORITY_OPTIONS)[number]['value'];

export interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  sub_category: string | null;
  duration_category: DurationCategory;
  duration_seconds: number | null;
  s3_key: string;
  s3_bucket: string;
  storage_class: string | null;
  file_name: string;
  file_type: string | null;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  lesson_id: string | null;
  date_recorded: string | null;
  location: string | null;
  confidentiality: Confidentiality;
  notes: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
}
