import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_TRAINING_BUCKET ?? "rbs-training-media";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("q");
  const category = searchParams.get("category");
  const duration = searchParams.get("duration");

  let query = supabaseAdmin
    .from("training_videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (duration) query = query.eq("duration_category", duration);

  if (search) {
    const tsQuery = search.trim().split(/\s+/).map((w) => w + ":*").join(" & ");
    query = query.textSearch("fts", tsQuery);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, sub_category, duration_category, confidentiality, priority, location, notes, date_recorded, fileName, fileType, fileSize } = body;

    if (!title || !category || !duration_category || !fileName) {
      return NextResponse.json({ error: "title, category, duration_category, and fileName are required" }, { status: 400 });
    }

    const ts = Date.now();
    const safeCategory = category.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const s3Key = "videos/" + safeCategory + "/" + ts + "-" + safeName;

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

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      ContentType: fileType || "video/mp4",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ videoId: video.id, uploadUrl, s3Key });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}