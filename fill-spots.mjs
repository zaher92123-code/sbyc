// fill-spots.mjs — Run: node fill-spots.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const env = {};
envContent.split("\n").forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const NAMES = [
  "Al Safina","Bahr Oman","Dhow Spirit","Gulf Runner","Musandam","Al Majd",
  "Jabal Akhdar","Wahiba","Nizwa Star","Sur Pearl","Qurm Breeze","Sohar Wind",
  "Bahla Dream","Rustaq Tide","Ibri Wave","Nakhal Sun","Samail Pearl","Yanqul Star",
  "Barka Moon","Shinas Gale","Tiwi Reef","Bidiyah Crest","Jalan Wind","Masirah Hawk",
  "Duqm Sailor","Ibra Coral","Adam Reef","Al Hamra Tide",
];
const TYPES = ["Dhow","Motorboat","Fishing Boat","Sailing Yacht","Speed Boat","Luxury Yacht"];
const COLORS = ["White","Blue","Grey","White/Blue","Beige","White/Red","Navy"];
const INSURANCE = ["Oman Insurance","Dhofar Insurance","National Life","Al Ahlia Insurance"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function run() {
  const { data: spots } = await supabase.from("parking_spots").select("id, spot_number, status").eq("status", "empty").order("spot_number");
  const { data: users } = await supabase.from("users").select("id").limit(1);
  const userId = users?.[0]?.id || null;

  const { data: existingBoats } = await supabase.from("boats").select("id").eq("status", "available");
  const availBoats = (existingBoats || []).map((b) => b.id);

  const { data: owners } = await supabase.from("owners").select("id");
  const ownerIds = (owners || []).map((o) => o.id);

  const emptySpots = spots || [];
  const target = 38; // 85% of 45
  const currentOccupied = 45 - emptySpots.length;
  const toFill = Math.min(target - currentOccupied, emptySpots.length);

  if (toFill <= 0) {
    console.log(`Already at ${currentOccupied}/45 occupied. Nothing to fill.`);
    return;
  }

  console.log(`Empty: ${emptySpots.length}, Occupied: ${currentOccupied}, Will fill: ${toFill}\n`);

  let filled = 0;
  for (let i = 0; i < toFill; i++) {
    const spot = emptySpots[i];
    let boatId = availBoats.shift();

    if (!boatId) {
      const nm = NAMES[i % NAMES.length];
      const yr = 20 + Math.floor(Math.random() * 5);
      const reg = `OM-MSC-${yr}-${String(200 + i).padStart(3, "0")}`;
      const length = +(8 + Math.random() * 14).toFixed(1);
      const width = +(2.5 + Math.random() * 3).toFixed(1);
      const insExpiry = new Date(Date.now() + (180 + Math.random() * 365) * 86400000).toISOString().split("T")[0];

      const { data: newBoat, error } = await supabase.from("boats").insert({
        name: nm, registration_number: reg, type: pick(TYPES),
        color: pick(COLORS), length_meters: length, width_meters: width,
        status: "available", insurance_company: pick(INSURANCE),
        insurance_expiry: insExpiry, created_by: userId,
      }).select("id").single();

      if (!newBoat) { console.error(`  Failed to create boat: ${error?.message}`); continue; }
      boatId = newBoat.id;

      // Link to a random owner
      if (ownerIds.length > 0) {
        await supabase.from("boat_owners").insert({
          boat_id: boatId, owner_id: ownerIds[i % ownerIds.length],
          is_primary: true, since_date: "2024-01-01",
        });
      }
    }

    // Create varied sessions
    const scenario = i % 6;
    let start, end, due;

    if (scenario <= 2) {
      // Active, well within period
      const startDays = 30 + Math.floor(Math.random() * 150);
      const endDays = 30 + Math.floor(Math.random() * 300);
      start = new Date(Date.now() - startDays * 86400000).toISOString().split("T")[0];
      end = new Date(Date.now() + endDays * 86400000).toISOString().split("T")[0];
      due = +(200 + Math.random() * 1200).toFixed(3);
    } else if (scenario === 3) {
      // Ending soon (within 7 days)
      const startDays = 60 + Math.floor(Math.random() * 120);
      const endDays = 1 + Math.floor(Math.random() * 7);
      start = new Date(Date.now() - startDays * 86400000).toISOString().split("T")[0];
      end = new Date(Date.now() + endDays * 86400000).toISOString().split("T")[0];
      due = +(150 + Math.random() * 600).toFixed(3);
    } else if (scenario === 4) {
      // Overdue
      const startDays = 120 + Math.floor(Math.random() * 180);
      const endDays = 3 + Math.floor(Math.random() * 45);
      start = new Date(Date.now() - startDays * 86400000).toISOString().split("T")[0];
      end = new Date(Date.now() - endDays * 86400000).toISOString().split("T")[0];
      due = +(300 + Math.random() * 800).toFixed(3);
    } else {
      // Long-term annual
      const startDays = 60 + Math.floor(Math.random() * 200);
      const endDays = 120 + Math.floor(Math.random() * 365);
      start = new Date(Date.now() - startDays * 86400000).toISOString().split("T")[0];
      end = new Date(Date.now() + endDays * 86400000).toISOString().split("T")[0];
      due = +(800 + Math.random() * 2000).toFixed(3);
    }

    const paidPct = Math.random() * 0.95;
    const paid = +(due * paidPct).toFixed(3);

    const { error: sessErr } = await supabase.from("parking_sessions").insert({
      boat_id: boatId, parking_spot_id: spot.id,
      start_date: start, expected_end_date: end,
      total_due: due, total_paid: paid,
      status: "active", pricing_model: pick(["monthly", "monthly", "daily", "custom"]),
      created_by: userId,
    });

    if (!sessErr) {
      await supabase.from("parking_spots").update({ status: "occupied" }).eq("id", spot.id);
      await supabase.from("boats").update({ status: "parked" }).eq("id", boatId);
      filled++;
      console.log(`  Spot ${spot.spot_number} filled`);
    } else {
      console.error(`  Spot ${spot.spot_number} failed: ${sessErr.message}`);
    }
  }

  // Refresh statuses (overdue, ending_soon)
  try { await supabase.rpc("refresh_session_statuses"); } catch {}

  console.log(`\nDone: filled ${filled} spots. Now ${currentOccupied + filled}/45 occupied.`);
}

run();
