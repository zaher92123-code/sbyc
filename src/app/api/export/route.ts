import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "sessions";

  let data: Record<string, unknown>[] = [];
  let filename = "export";

  if (type === "sessions") {
    const { data: rows } = await supabase
      .from("active_sessions_view")
      .select("*")
      .order("expected_end_date");

    data = (rows || []).map((s: any) => ({
      "Boat Name": s.boat_name,
      "Registration": s.registration_number,
      "Boat Type": s.boat_type || "",
      "Owner": s.owner_name || "",
      "Owner Phone": s.owner_phone || "",
      "Owner Email": s.owner_email || "",
      "Spot Number": s.spot_number,
      
      "Status": s.status,
      "Start Date": s.start_date,
      "Expected End": s.expected_end_date,
      "Days Remaining": s.days_remaining,
      "Pricing Model": s.pricing_model,
      "Total Due (OMR)": Number(s.total_due).toFixed(3),
      "Total Paid (OMR)": Number(s.total_paid).toFixed(3),
      "Balance (OMR)": Number(s.remaining_balance).toFixed(3),
      "Last Payment": s.last_payment_date || "",
    }));
    filename = "parking-sessions";

  } else if (type === "payments") {
    const { data: rows } = await supabase
      .from("payments")
      .select(`
        *,
        session:parking_sessions(
          boat:boats(name, registration_number),
          parking_spot:parking_spots(spot_number)
        )
      `)
      .order("payment_date", { ascending: false });

    data = (rows || []).map((p: any) => ({
      "Date": p.payment_date,
      "Boat": p.session?.boat?.name || "",
      "Registration": p.session?.boat?.registration_number || "",
      "Spot": p.session?.parking_spot?.spot_number || "",
      "Amount (OMR)": Number(p.amount).toFixed(3),
      "Method": p.payment_method || "",
      "Reference": p.reference_number || "",
      "Type": p.is_adjustment ? "Adjustment" : "Payment",
      "Notes": p.notes || p.adjustment_reason || "",
    }));
    filename = "payments";

  } else if (type === "owners") {
    const { data: rows } = await supabase
      .from("owners")
      .select("*, boat_owners(boat:boats(name))")
      .order("full_name");

    data = (rows || []).map((o: any) => ({
      "Full Name": o.full_name,
      "Phone": o.phone || "",
      "Email": o.email || "",
      "Alternate Contact": o.alternate_contact || "",
      "Boats": (o.boat_owners || []).map((bo: any) => bo.boat?.name).join("; "),
      "Billing Notes": o.billing_notes || "",
      "Member Since": o.created_at?.split("T")[0] || "",
    }));
    filename = "owners";
  }

  if (data.length === 0) {
    return NextResponse.json({ error: "No data to export" }, { status: 404 });
  }

  // Build CSV
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${date}.csv"`,
    },
  });
}
