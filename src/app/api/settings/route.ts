import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

async function requireAdmin(supabase: any): Promise<{ isAdmin: boolean; userId?: string; error?: NextResponse }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user.id)
    .single();

  if (profile?.role?.name !== "admin") {
    return { isAdmin: false, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { isAdmin: true, userId: user.id };
}

// GET all settings (admin only, secrets masked)
export async function GET() {
  const supabase = await createClient();
  const { isAdmin, error } = await requireAdmin(supabase);
  if (!isAdmin) return error;

  const { data, error: dbError } = await supabase
    .from("app_settings")
    .select("*")
    .order("key");

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  const masked = data?.map(s => ({
    ...s,
    value: s.is_secret && s.value ? "••••••••" : s.value,
    has_value: !!s.value,
  }));

  return NextResponse.json({ data: masked });
}

// PATCH - update settings (admin only)
const UpdateSchema = z.record(z.string(), z.string());

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { isAdmin, userId, error } = await requireAdmin(supabase);
  if (!isAdmin) return error;

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const results = [];
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === "••••••••") continue;

    const { error: updateError } = await supabase
      .from("app_settings")
      .update({ value, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("key", key);

    if (updateError) {
      results.push({ key, error: updateError.message });
    } else {
      results.push({ key, success: true });
    }
  }

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action: "settings_updated",
    table_name: "app_settings",
    description: `Updated settings: ${Object.keys(parsed.data).join(", ")}`,
  });

  return NextResponse.json({ results });
}
