import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ------------------------------------------------------------------ */
/*  Lazy-init clients (env vars not available at build time on Vercel) */
/* ------------------------------------------------------------------ */

// Use <any, any, any> to bypass strict table type inference
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient<any, any, any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabaseAdmin;
}

let _s3: S3Client | null = null;
function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _s3;
}

const BUCKET = process.env.S3_TRAINING_BUCKET ?? "rbs-training-media";

/* ------------------------------------------------------------------ */
/*  GET  /api/videos — list videos (with optional search)              */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("q");
  const category = searchParams.get("category");
  const duration = searchParams.get("duration");

  const supabaseAdmin = getSupabase();

  let query = supabaseAdmin
    .from("training_videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (duration) query = query.eq("duration_category", duration);

  // Full-text search via the fts tsvector column
  if (search) {
    const tsQuery = search
      .trim()
      .split(/\s+/)
      .map((w: string) => w + ":*")
      .join(" & ");
    query = query.textSearch("fts", tsQuery);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/* ------------------------------------------------------------------ */
/*  POST /api/videos — create video record + return presigned upload URL */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      category,
      sub_category,
      duration_category,
      confidentiality,
      priority,
      location,
      notes,
      date_recorded,
      fileName,
      fileType,
      fileSize,
    } = body;

    // Validate required fields
    if (!title || !category || !duration_category || !fileName) {
      return NextResponse.json(
        { error: "title, category, duration_category, and fileName are required" },
        { status: 400 },
      );
    }

    // Build S3 key: category/timestamp-filename
    const ts = Date.now();
    const safeCategory = category.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const s3Key = "videos/" + safeCategory + "/" + ts + "-" + safeName;

    const supabaseAdmin = getSupabase();

    // 1. Insert metadata into Supabase
    const { data: video, error: dbError } = await supabaseAdmin
      .from("training_videos")
      .insert({
        title,
        description: description || null,
        category,
        sub_category: sub_category || null,
        duration_category,
        s3_key: s3Key,
        s3_bucket: BUCKET,
        storage_class: "STANDARD",
        file_name: fileName,
        file_type: fileType || null,
        file_size_bytes: fileSize || null,
        confidentiality: confidentiality || "internal",
        priority: priority || "normal",
        location: location || null,
        notes: notes || null,
        date_recorded: date_recorded || null,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Generate presigned PUT URL for direct browser upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      ContentType: fileType || "video/mp4",
    });

    const s3Client = getS3();
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      videoId: video.id,
      uploadUrl,
      s3Key,
    });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
