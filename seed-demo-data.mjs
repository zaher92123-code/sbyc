// seed-demo-data.mjs
// Run: node seed-demo-data.mjs
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function randomDate(from, to) {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return new Date(f + Math.random() * (t - f)).toISOString().split("T")[0];
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function omr(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(3);
}

// ── Data ─────────────────────────────────────────────────────────────────────

const OWNERS = [
  { full_name: "Mohammed Al Balushi",   phone: "+968 9101 2345", email: "m.balushi@gmail.com",     owner_type: "individual", civil_id: "12345678" },
  { full_name: "Khalid Al Rawahi",      phone: "+968 9202 3456", email: "k.rawahi@hotmail.com",    owner_type: "individual", civil_id: "23456789" },
  { full_name: "Salim Al Kindi",        phone: "+968 9505 6789", email: "s.kindi@gmail.com",       owner_type: "individual", civil_id: "34567890" },
  { full_name: "Ahmed Al Habsi",        phone: "+968 9404 5678", email: "a.habsi@outlook.com",     owner_type: "individual", civil_id: "45678901" },
  { full_name: "Yusuf Al Busaidi",      phone: "+968 9909 0123", email: "y.busaidi@gmail.com",     owner_type: "individual", civil_id: "56789012" },
  { full_name: "Hanan Al Siyabi",       phone: "+968 9707 8901", email: "hanan.siyabi@gmail.com",  owner_type: "individual", civil_id: "67890123" },
  { full_name: "Fatima Al Mujaini",     phone: "+968 9303 4567", email: "f.mujaini@yahoo.com",     owner_type: "individual", civil_id: "78901234" },
  { full_name: "Ibrahim Al Maamari",    phone: "+968 9808 9012", email: "ibrahim.mm@outlook.com",  owner_type: "company",    civil_id: "89012345", company_name_ar: "شركة المعمري للتجارة", company_name_en: "Al Maamari Trading LLC", commercial_register_number: "CR-1234567" },
  { full_name: "Aisha Al Rashdi",       phone: "+968 9010 1234", email: "aisha.r@gmail.com",       owner_type: "individual", civil_id: "90123456" },
  { full_name: "Nasser Al Farsi",       phone: "+968 9606 7890", email: "n.farsi@gmail.com",       owner_type: "individual", civil_id: "01234567" },
  { full_name: "Rashid Al Kalbani",     phone: "+968 9212 6789", email: "r.kalbani@hotmail.com",   owner_type: "individual", civil_id: "11223344" },
  { full_name: "Badr Al Mashani",       phone: "+968 9512 9012", email: "badr.m@outlook.com",      owner_type: "company",    civil_id: "22334455", company_name_ar: "مجموعة المشاني البحرية", company_name_en: "Al Mashani Marine Group", commercial_register_number: "CR-7654321" },
];

const BOAT_TYPES = ["Dhow", "Motorboat", "Sailing Yacht", "Luxury Yacht", "Speed Boat", "Fishing Boat"];
const COLORS = ["White", "White/Blue", "Blue", "Grey", "White/Red", "Navy", "White/Green", "Beige"];
const INSURANCE_COS = ["Oman Insurance", "Dhofar Insurance", "National Life", "Al Ahlia Insurance", "Takaful Oman"];

const BOATS = [
  { name: "Al Nokhada",      type: "Dhow",          length: 14.5, width: 4.2,  color: "Beige",       reg: "OM-MSC-2019-001" },
  { name: "Sea Falcon",      type: "Motorboat",     length: 9.2,  width: 3.1,  color: "White/Blue",  reg: "OM-MSC-2020-042" },
  { name: "Gulf Pearl",      type: "Fishing Boat",  length: 11.0, width: 3.5,  color: "Blue",        reg: "OM-MSC-2022-055" },
  { name: "Desert Wind",     type: "Sailing Yacht", length: 12.0, width: 3.8,  color: "White",       reg: "OM-MSC-2021-033" },
  { name: "Al Baraka",       type: "Dhow",          length: 16.0, width: 4.8,  color: "Beige",       reg: "OM-MSC-2016-076" },
  { name: "Sunrise II",      type: "Speed Boat",    length: 7.0,  width: 2.4,  color: "White/Red",   reg: "OM-MSC-2023-012" },
  { name: "Blue Horizon",    type: "Luxury Yacht",  length: 18.5, width: 5.2,  color: "White",       reg: "OM-MSC-2019-204" },
  { name: "Muscat Pearl",    type: "Luxury Yacht",  length: 24.8, width: 6.0,  color: "White",       reg: "OM-MSC-2018-117" },
  { name: "Oman Pride",      type: "Motorboat",     length: 10.5, width: 3.3,  color: "Grey",        reg: "OM-MSC-2022-091" },
  { name: "Silver Mast",     type: "Sailing Yacht", length: 13.5, width: 3.7,  color: "White",       reg: "OM-MSC-2020-158" },
  { name: "Al Wajha",        type: "Fishing Boat",  length: 11.0, width: 3.4,  color: "Blue",        reg: "OM-MSC-2017-089" },
  { name: "Bahr Al Noor",    type: "Motorboat",     length: 8.0,  width: 2.8,  color: "White/Blue",  reg: "OM-MSC-2023-067" },
  { name: "Salalah Star",    type: "Luxury Yacht",  length: 20.0, width: 5.5,  color: "White",       reg: "OM-SAL-2020-009" },
  { name: "Al Dawha",        type: "Fishing Boat",  length: 11.0, width: 3.5,  color: "White/Green", reg: "OM-MSC-2018-077" },
  { name: "Nujoom",          type: "Sailing Yacht", length: 15.0, width: 4.0,  color: "White",       reg: "OM-MSC-2019-088" },
  { name: "Falak",           type: "Speed Boat",    length: 6.8,  width: 2.3,  color: "White/Red",   reg: "OM-MSC-2024-003" },
  { name: "Al Nakheel",      type: "Fishing Boat",  length: 13.0, width: 3.8,  color: "Navy",        reg: "OM-MSC-2018-044" },
  { name: "Al Aseel",        type: "Dhow",          length: 17.0, width: 5.0,  color: "Beige",       reg: "OM-MSC-2015-009" },
  { name: "Hayat Al Bahar",  type: "Motorboat",     length: 12.5, width: 3.6,  color: "Grey",        reg: "OM-MSC-2020-199" },
  { name: "Al Omani Pride",  type: "Luxury Yacht",  length: 22.0, width: 5.8,  color: "White",       reg: "OM-MSC-2017-200" },
];

const EMPLOYEES = [
  { name_en: "Saeed Al Harthi",   name_ar: "سعيد الحارثي",   position_en: "Marina Manager",   position_ar: "مدير المرسى",     department: "Management",  base_salary_omr: 850, allowances_omr: 150, deductions_omr: 50, phone: "+968 9111 0001", civil_id: "EMP001", bank_name: "Bank Muscat", bank_account_number: "0123456789" },
  { name_en: "Ali Al Wahaibi",    name_ar: "علي الوهيبي",    position_en: "Yard Supervisor",  position_ar: "مشرف الساحة",     department: "Operations", base_salary_omr: 550, allowances_omr: 100, deductions_omr: 30, phone: "+968 9111 0002", civil_id: "EMP002", bank_name: "Bank Muscat", bank_account_number: "0234567890" },
  { name_en: "Hassan Al Lawati",  name_ar: "حسن اللواتي",    position_en: "Crane Operator",   position_ar: "مشغل الرافعة",    department: "Operations", base_salary_omr: 480, allowances_omr: 80,  deductions_omr: 25, phone: "+968 9111 0003", civil_id: "EMP003", bank_name: "Bank Dhofar", bank_account_number: "0345678901" },
  { name_en: "Maryam Al Rashdi",  name_ar: "مريم الرشدي",    position_en: "Accountant",       position_ar: "محاسبة",          department: "Finance",    base_salary_omr: 650, allowances_omr: 120, deductions_omr: 40, phone: "+968 9111 0004", civil_id: "EMP004", bank_name: "National Bank", bank_account_number: "0456789012" },
  { name_en: "Hamad Al Shukaili", name_ar: "حمد الشكيلي",    position_en: "Security Guard",   position_ar: "حارس أمن",        department: "Security",   base_salary_omr: 350, allowances_omr: 60,  deductions_omr: 20, phone: "+968 9111 0005", civil_id: "EMP005", bank_name: "Bank Muscat", bank_account_number: "0567890123" },
  { name_en: "Khadija Al Amri",   name_ar: "خديجة العامري",  position_en: "Receptionist",     position_ar: "موظفة استقبال",   department: "Admin",      base_salary_omr: 400, allowances_omr: 70,  deductions_omr: 25, phone: "+968 9111 0006", civil_id: "EMP006", bank_name: "Bank Dhofar", bank_account_number: "0678901234" },
];

const EXPENSE_CATEGORIES = [
  { name_en: "Electricity", name_ar: "الكهرباء" },
  { name_en: "Water", name_ar: "المياه" },
  { name_en: "WiFi / Internet", name_ar: "الإنترنت" },
  { name_en: "Fuel", name_ar: "الوقود" },
  { name_en: "Maintenance", name_ar: "الصيانة" },
  { name_en: "Equipment", name_ar: "المعدات" },
  { name_en: "Office Supplies", name_ar: "مستلزمات المكتب" },
  { name_en: "Other", name_ar: "أخرى" },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌊 Seeding Al Seeb Boat Club demo data...\n");

  // Get first auth user for created_by
  const { data: users } = await supabase.from("users").select("id").limit(1);
  const userId = users?.[0]?.id || null;

  // ── 1. Ensure parking spots exist (1-45) ─────────────────────────────────
  console.log("📍 Creating parking spots...");
  const { data: existingSpots } = await supabase.from("parking_spots").select("spot_number");
  const existingNums = new Set((existingSpots || []).map(s => s.spot_number));

  const newSpots = [];
  for (let i = 1; i <= 45; i++) {
    if (!existingNums.has(String(i))) {
      newSpots.push({
        spot_number: String(i),
        status: "empty",
        max_length_meters: i <= 24 ? 20 : 25,
      });
    }
  }
  if (newSpots.length > 0) {
    await supabase.from("parking_spots").insert(newSpots);
    console.log(`   Created ${newSpots.length} new spots`);
  } else {
    console.log("   Spots already exist");
  }

  // Fetch all spots
  const { data: allSpots } = await supabase.from("parking_spots").select("id, spot_number, status").order("spot_number");
  const spotMap = {};
  allSpots.forEach(s => { spotMap[s.spot_number] = s; });

  // ── 2. Create owners ──────────────────────────────────────────────────────
  console.log("👤 Creating owners...");
  const ownerIds = [];
  for (const o of OWNERS) {
    const { data: existing } = await supabase.from("owners").select("id").eq("email", o.email).limit(1);
    if (existing && existing.length > 0) {
      ownerIds.push(existing[0].id);
      continue;
    }
    const { data, error } = await supabase.from("owners").insert({ ...o, created_by: userId }).select("id").single();
    if (error) { console.error(`   Error creating ${o.full_name}: ${error.message}`); continue; }
    ownerIds.push(data.id);
  }
  console.log(`   ${ownerIds.length} owners ready`);

  // ── 3. Create boats ───────────────────────────────────────────────────────
  console.log("⛵ Creating boats...");
  const boatIds = [];
  for (let i = 0; i < BOATS.length; i++) {
    const b = BOATS[i];
    const { data: existing } = await supabase.from("boats").select("id").eq("registration_number", b.reg).limit(1);
    if (existing && existing.length > 0) {
      boatIds.push(existing[0].id);
      continue;
    }
    const insExpiry = randomDate("2026-06-01", "2027-12-31");
    const { data, error } = await supabase.from("boats").insert({
      name: b.name,
      registration_number: b.reg,
      type: b.type,
      color: b.color,
      length_meters: b.length,
      width_meters: b.width,
      status: "available",
      insurance_company: pick(INSURANCE_COS),
      insurance_expiry: insExpiry,
      created_by: userId,
    }).select("id").single();

    if (error) { console.error(`   Error creating ${b.name}: ${error.message}`); continue; }
    boatIds.push(data.id);

    // Link to owner
    const ownerIdx = i % ownerIds.length;
    await supabase.from("boat_owners").insert({
      boat_id: data.id,
      owner_id: ownerIds[ownerIdx],
      is_primary: true,
      since_date: randomDate("2020-01-01", "2025-12-01"),
    });
  }
  console.log(`   ${boatIds.length} boats ready`);

  // ── 4. Create parking sessions ────────────────────────────────────────────
  console.log("🅿️  Creating parking sessions...");

  // Find empty spots
  const { data: emptySpots } = await supabase.from("parking_spots")
    .select("id, spot_number")
    .eq("status", "empty")
    .order("spot_number")
    .limit(20);

  // Find available boats (not already parked)
  const { data: parkedBoats } = await supabase.from("parking_sessions")
    .select("boat_id")
    .in("status", ["active", "ending_soon", "overdue"]);
  const parkedBoatIds = new Set((parkedBoats || []).map(p => p.boat_id));
  const availableBoatIds = boatIds.filter(id => !parkedBoatIds.has(id));

  const sessionCount = Math.min(availableBoatIds.length, (emptySpots || []).length, 16);
  let sessionsCreated = 0;

  for (let i = 0; i < sessionCount; i++) {
    const boatId = availableBoatIds[i];
    const spot = emptySpots[i];

    // Varied start/end dates for realistic mix
    let startDate, endDate, totalDue;
    const scenario = i % 5;

    if (scenario === 0) {
      // Active - well within period
      startDate = randomDate("2025-12-01", "2026-02-15");
      endDate = randomDate("2026-06-01", "2026-12-31");
      totalDue = omr(200, 800);
    } else if (scenario === 1) {
      // Ending soon (within 7 days)
      startDate = randomDate("2025-10-01", "2026-01-01");
      const daysAhead = Math.floor(Math.random() * 7) + 1;
      const end = new Date();
      end.setDate(end.getDate() + daysAhead);
      endDate = end.toISOString().split("T")[0];
      totalDue = omr(150, 500);
    } else if (scenario === 2) {
      // Overdue
      startDate = randomDate("2025-06-01", "2025-10-01");
      const daysAgo = Math.floor(Math.random() * 30) + 3;
      const end = new Date();
      end.setDate(end.getDate() - daysAgo);
      endDate = end.toISOString().split("T")[0];
      totalDue = omr(300, 900);
    } else if (scenario === 3) {
      // Long-term annual
      startDate = randomDate("2025-06-01", "2025-12-01");
      endDate = randomDate("2026-06-01", "2027-01-01");
      totalDue = omr(800, 2400);
    } else {
      // Medium term
      startDate = randomDate("2026-01-01", "2026-03-15");
      endDate = randomDate("2026-07-01", "2026-10-01");
      totalDue = omr(250, 600);
    }

    try {
      const { data: sessionId, error } = await supabase.rpc("create_session_atomic", {
        p_boat_id: boatId,
        p_spot_id: spot.id,
        p_start_date: startDate,
        p_end_date: endDate,
        p_pricing_model: pick(["monthly", "monthly", "monthly", "daily", "custom"]),
        p_base_fee: omr(30, 200),
        p_total_due: totalDue,
        p_notes: pick(["", "", "Regular customer", "Annual contract", "Seasonal storage", "First time", ""]),
        p_created_by: userId,
      });

      if (error) {
        // Fallback: insert directly
        const { data: sess, error: insertErr } = await supabase.from("parking_sessions").insert({
          boat_id: boatId,
          parking_spot_id: spot.id,
          start_date: startDate,
          expected_end_date: endDate,
          pricing_model: pick(["monthly", "daily", "custom"]),
          base_fee: omr(30, 200),
          total_due: totalDue,
          total_paid: 0,
          remaining_balance: totalDue,
          status: "active",
          created_by: userId,
        }).select("id").single();

        if (insertErr) { console.error(`   Session error: ${insertErr.message}`); continue; }

        // Update spot
        await supabase.from("parking_spots").update({ status: "occupied" }).eq("id", spot.id);
        // Update boat
        await supabase.from("boats").update({ status: "parked" }).eq("id", boatId);

        sessionsCreated++;
      } else {
        sessionsCreated++;
      }
    } catch (err) {
      console.error(`   Session creation failed: ${err.message}`);
    }
  }

  // Refresh statuses
  try { await supabase.rpc("refresh_session_statuses"); } catch {}

  console.log(`   ${sessionsCreated} sessions created`);

  // ── 5. Create payments ────────────────────────────────────────────────────
  console.log("💳 Creating payments...");
  const { data: activeSessions } = await supabase.from("parking_sessions")
    .select("id, total_due, remaining_balance, start_date")
    .in("status", ["active", "ending_soon", "overdue"])
    .gt("remaining_balance", 0);

  let paymentsCreated = 0;
  for (const sess of (activeSessions || [])) {
    // 70% chance of having at least one payment
    if (Math.random() > 0.7) continue;

    const payCount = Math.floor(Math.random() * 3) + 1;
    const maxPayable = Number(sess.total_due);
    let totalPaidSoFar = Number(sess.total_due) - Number(sess.remaining_balance);

    for (let p = 0; p < payCount && totalPaidSoFar < maxPayable; p++) {
      const remaining = maxPayable - totalPaidSoFar;
      const amount = Math.min(omr(50, 500), remaining);
      const payDate = randomDate(sess.start_date, new Date().toISOString().split("T")[0]);

      const { error } = await supabase.from("payments").insert({
        session_id: sess.id,
        amount,
        payment_date: payDate,
        payment_method: pick(["Bank Transfer", "Cash", "Cheque", "Online Payment"]),
        reference_number: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        created_by: userId,
      });

      if (!error) {
        totalPaidSoFar += amount;
        paymentsCreated++;
      }
    }
  }
  console.log(`   ${paymentsCreated} payments created`);

  // ── 6. Create employees ───────────────────────────────────────────────────
  console.log("👷 Creating employees...");
  let empsCreated = 0;
  for (const emp of EMPLOYEES) {
    const { data: existing } = await supabase.from("employees").select("id").eq("civil_id", emp.civil_id).limit(1);
    if (existing && existing.length > 0) continue;

    const { data, error } = await supabase.from("employees").insert({
      ...emp,
      hire_date: randomDate("2020-01-01", "2025-06-01"),
      employment_status: "active",
      email: `${emp.name_en.split(" ")[0].toLowerCase()}@alseebboatclub.om`,
    }).select("id").single();

    if (error) { console.error(`   Error: ${error.message}`); continue; }
    empsCreated++;

    // Add salary records for last 3 months
    const months = ["2026-01", "2026-02", "2026-03"];
    for (const month of months) {
      const bonus = Math.random() > 0.8 ? omr(20, 100) : 0;
      const net = emp.base_salary_omr + emp.allowances_omr - emp.deductions_omr + bonus;
      await supabase.from("salary_records").insert({
        employee_id: data.id,
        month,
        base_salary_omr: emp.base_salary_omr,
        allowances_omr: emp.allowances_omr,
        deductions_omr: emp.deductions_omr,
        bonus_omr: bonus,
        net_salary_omr: net,
        payment_status: month === "2026-03" ? "pending" : "paid",
        payment_date: month !== "2026-03" ? `${month}-28` : null,
      });
    }
  }
  console.log(`   ${empsCreated} employees created`);

  // ── 7. Create expense categories ──────────────────────────────────────────
  console.log("📂 Creating expense categories...");
  const catIds = {};
  for (const cat of EXPENSE_CATEGORIES) {
    const { data: existing } = await supabase.from("expense_categories").select("id").eq("name_en", cat.name_en).limit(1);
    if (existing && existing.length > 0) {
      catIds[cat.name_en] = existing[0].id;
      continue;
    }
    const { data } = await supabase.from("expense_categories").insert({ ...cat, is_active: true }).select("id").single();
    if (data) catIds[cat.name_en] = data.id;
  }
  console.log(`   ${Object.keys(catIds).length} categories ready`);

  // ── 8. Create expenses ────────────────────────────────────────────────────
  console.log("💸 Creating expenses...");
  const expenseData = [
    { cat: "Electricity",     amounts: [85, 92, 78],    months: ["2026-01", "2026-02", "2026-03"] },
    { cat: "Water",           amounts: [35, 38, 32],    months: ["2026-01", "2026-02", "2026-03"] },
    { cat: "WiFi / Internet", amounts: [45, 45, 45],    months: ["2026-01", "2026-02", "2026-03"] },
    { cat: "Fuel",            amounts: [120, 95, 135],   months: ["2026-01", "2026-02", "2026-03"] },
    { cat: "Maintenance",     amounts: [250, 0, 180],    months: ["2026-01", "2026-02", "2026-03"] },
    { cat: "Equipment",       amounts: [0, 450, 0],      months: ["2026-01", "2026-02", "2026-03"] },
    { cat: "Office Supplies",amounts: [25, 15, 30],     months: ["2026-01", "2026-02", "2026-03"] },
  ];

  let expCreated = 0;
  for (const exp of expenseData) {
    const catId = catIds[exp.cat];
    if (!catId) continue;

    for (let i = 0; i < exp.months.length; i++) {
      if (exp.amounts[i] === 0) continue;
      const { error } = await supabase.from("expenses").insert({
        category_id: catId,
        amount_omr: exp.amounts[i],
        description: `${exp.cat} - ${exp.months[i]}`,
        expense_date: `${exp.months[i]}-${pick(["05", "10", "15", "20", "25"])}`,
        recorded_by: userId,
      });
      if (!error) expCreated++;
    }
  }
  console.log(`   ${expCreated} expenses created`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n✅ Demo data seeded successfully!");
  console.log("   Refresh your browser to see the data.\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
