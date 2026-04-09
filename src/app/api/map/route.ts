import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: spots, error } = await supabase
    .from("parking_spots")
    .select(`
      id, spot_number, status, reserved_for_name, reserved_for_phone, reserved_until, reserved_notes,
      parking_sessions(
        id, status, start_date, expected_end_date, total_due, total_paid, remaining_balance, notes, pricing_model,
        boat:boats(id, name, type, color, length_meters, width_meters, registration_number, photo_url, insurance_company, insurance_expiry),
        boat_id
      )
    `)
    .order("spot_number");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mapData: Record<string, any> = {};

  for (const spot of (spots || [])) {
    const activeSession = spot.parking_sessions?.find(
      (s: any) => s.status === "active" || s.status === "ending_soon" || s.status === "overdue"
    );

    let ownerData = null;
    if (activeSession?.boat_id) {
      const { data: boatOwner } = await supabase
        .from("boat_owners")
        .select("owner:owners(full_name, phone, email)")
        .eq("boat_id", activeSession.boat_id)
        .eq("is_primary", true)
        .single();
      ownerData = (boatOwner as any)?.owner || null;
    }

    const boat = activeSession?.boat;
    const spotStatus = spot.status === "occupied" && activeSession
      ? (activeSession.status === "overdue" ? "expired" : "occupied")
      : spot.status === "reserved" ? "reserved" : "empty";

    mapData[spot.spot_number] = {
      spotDbId: spot.id,
      status: spotStatus,
      boatName: boat?.name || null,
      boatType: boat?.type || null,
      boatLength: boat?.length_meters ? `${boat.length_meters}m` : null,
      registrationNumber: boat?.registration_number || null,
      photoUrl: boat?.photo_url || null,
      boatWidth: boat?.width_meters ? `${boat.width_meters}m` : null,
      insuranceCompany: boat?.insurance_company || null,
      insuranceExpiry: boat?.insurance_expiry || null,
      insurancePolicyNumber: boat?.insurance_policy_number || null,
      ownerName: ownerData?.full_name || null,
      ownerPhone: ownerData?.phone || null,
      ownerEmail: ownerData?.email || null,
      entryDate: activeSession?.start_date || null,
      expiryDate: activeSession?.expected_end_date || null,
      totalDue: activeSession?.total_due ? Number(activeSession.total_due) : undefined,
      totalPaid: activeSession?.total_paid ? Number(activeSession.total_paid) : undefined,
      notes: activeSession?.notes || null,
      reservedForName: spot.reserved_for_name || null,
      reservedForPhone: spot.reserved_for_phone || null,
      reservedUntil: spot.reserved_until || null,
      reservedNotes: spot.reserved_notes || null,
    };
  }

  return NextResponse.json({ data: mapData });
}
