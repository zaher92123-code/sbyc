import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spotNumber = searchParams.get("spot_number");

  if (!spotNumber) {
    return NextResponse.json({ error: "spot_number required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Find the parking spot, then find its active session's boat photo
  const { data: spot } = await supabase
    .from("parking_spots")
    .select("id")
    .eq("spot_number", spotNumber)
    .single();

  if (!spot) {
    return NextResponse.json({ photo_url: null });
  }

  const { data: session } = await supabase
    .from("parking_sessions")
    .select("boat:boats(photo_url)")
    .eq("parking_spot_id", spot.id)
    .in("status", ["active", "ending_soon", "overdue"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const photoUrl = (session as any)?.boat?.photo_url || null;

  return NextResponse.json({ photo_url: photoUrl });
}
