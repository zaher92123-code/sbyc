import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ data: { boats: [], owners: [], sessions: [], employees: [] } });
  }

  const pattern = `%${q}%`;

  const [
    { data: boats },
    { data: owners },
    { data: sessions },
    { data: employees },
  ] = await Promise.all([
    supabase
      .from("boats")
      .select("id, name, registration_number, status, type, color")
      .or(`name.ilike.${pattern},registration_number.ilike.${pattern}`)
      .limit(5),

    supabase
      .from("owners")
      .select("id, full_name, phone, email, owner_type, civil_id")
      .or(`full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},civil_id.ilike.${pattern}`)
      .limit(5),

    supabase
      .from("active_sessions_view")
      .select("session_id, boat_name, registration_number, spot_number, owner_name, status")
      .or(`boat_name.ilike.${pattern},registration_number.ilike.${pattern},spot_number.ilike.${pattern},owner_name.ilike.${pattern}`)
      .limit(5),

    supabase
      .from("employees")
      .select("id, name_en, name_ar, position_en, phone, employment_status")
      .or(`name_en.ilike.${pattern},name_ar.ilike.${pattern},civil_id.ilike.${pattern},phone.ilike.${pattern}`)
      .limit(5),
  ]);

  return NextResponse.json({
    data: {
      boats: boats || [],
      owners: owners || [],
      sessions: sessions || [],
      employees: employees || [],
    },
  });
}
