import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const table = searchParams.get("table");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("audit_logs")
    .select("*, user:users(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (action) query = query.eq("action", action);
  if (table) query = query.eq("table_name", table);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      user_id: user?.id,
      action: body.action,
      table_name: body.table_name,
      record_id: body.record_id,
      old_values: body.old_values,
      new_values: body.new_values,
      description: body.description,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
