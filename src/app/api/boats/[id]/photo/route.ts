import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const formData = await request.formData();
  const file = formData.get("photo") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  // Get existing boat to check for old photo
  const { data: boat } = await supabase
    .from("boats")
    .select("photo_url")
    .eq("id", id)
    .single();

  // Delete old photo if exists
  if (boat?.photo_url) {
    const oldPath = boat.photo_url.split("/boat-photos/")[1];
    if (oldPath) {
      await supabase.storage.from("boat-photos").remove([oldPath]);
    }
  }

  // Upload new photo
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("boat-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("boat-photos")
    .getPublicUrl(fileName);

  // Update boat record
  const { error: updateError } = await supabase
    .from("boats")
    .update({ photo_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ photo_url: urlData.publicUrl });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: boat } = await supabase
    .from("boats")
    .select("photo_url")
    .eq("id", id)
    .single();

  if (boat?.photo_url) {
    const oldPath = boat.photo_url.split("/boat-photos/")[1];
    if (oldPath) {
      await supabase.storage.from("boat-photos").remove([oldPath]);
    }
  }

  await supabase
    .from("boats")
    .update({ photo_url: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
