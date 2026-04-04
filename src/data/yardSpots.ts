// =============================================================================
//  YARD SPOT DATA  ·  Al Seeb Boat Club
// =============================================================================
//
//  PHYSICAL LAYOUT  (matches satellite reference image)
//  ┌───────────────── NORTH / TOP ──────────────────┐
//  │  [Workshop shed]    [Wooden boat frame storage]  │
//  │                                                  │
//  │  COL-A (left)        AISLE       COL-B (right)  │
//  │  bow → east                      bow ← west     │
//  │                                                  │
//  │  24 ▲  (top)         ·           25 ▲ (top)     │
//  │  23                  ·           26              │
//  │  ...                 ·           ...             │
//  │   2                  ·           44              │
//  │   1 ▼  (bottom)      ·           45 ▼ (bottom)  │
//  │                                                  │
//  │  Rocky seawall     [SERVICE BUILDING]           │
//  └───────────────── SOUTH / BOTTOM ───────────────┘
//                          ENTRANCE
//
//  Left column  (COL-A): spots  1 – 24, numbered BOTTOM → TOP
//  Right column (COL-B): spots 25 – 45, numbered TOP → BOTTOM
//  All 21 right spots are ABOVE the service building at bottom-right.
// =============================================================================

export type SpotStatus = "empty" | "occupied" | "expired" | "reserved";

export interface YardSpot {
  id: number;
  side: "left" | "right";
  status: SpotStatus;
  // ── Vessel ─────────────────────────────────────────────────────────────────
  boatName?: string;
  boatType?: string;
  boatLength?: string;
  registrationNumber?: string;
  // ── Owner ──────────────────────────────────────────────────────────────────
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  // ── Dates ──────────────────────────────────────────────────────────────────
  entryDate?: string;    // "YYYY-MM-DD"
  expiryDate?: string;   // "YYYY-MM-DD"
  // ── Billing (OMR) ──────────────────────────────────────────────────────────
  totalDue?: number;
  totalPaid?: number;
  // ── Misc ───────────────────────────────────────────────────────────────────
  notes?: string;
  photoUrl?: string;
  boatWidth?: string;
  insuranceCompany?: string;
  insuranceExpiry?: string;
  // ── Reservation ────────────────────────────────────────────────────────────
  spotDbId?: string;
  reservedForName?: string;
  reservedForPhone?: string;
  reservedUntil?: string;
  reservedNotes?: string;}

// =============================================================================
//  SVG LAYOUT CONSTANTS
//  viewBox: 0 0 500 1040
// =============================================================================
export const SVG_LAYOUT = {
  viewW: 500,
  viewH: 1040,

  // Slot dimensions (each slot holds one boat, oriented horizontally)
  slotW: 104,   // horizontal span of one slot
  slotH: 28,    // vertical height of one slot

  // COL-A (left) — spot 1 at bottom, spot 24 at top
  leftX: 58,           // slot left edge X
  leftBottomCY: 892,   // centre-Y of spot 1 (southernmost)
  leftStep: 34,        // px between consecutive slot centre-Ys (going north)

  // COL-B (right) — spot 25 at top, spot 45 at bottom
  rightX: 332,         // slot left edge X
  rightTopCY: 112,     // centre-Y of spot 25 (northernmost)
  rightStep: 33,       // px between consecutive slot centre-Ys (going south)

  // Service building (bottom-right, below all 21 right-column spots)
  buildingTopY: 808,
  buildingHeight: 132,
} as const;

// ── Position helper ───────────────────────────────────────────────────────────
export function getSpotSVGPosition(
  id: number
): { cx: number; cy: number; side: "left" | "right" } {
  const L = SVG_LAYOUT;
  if (id >= 1 && id <= 24) {
    return {
      cx: L.leftX + L.slotW / 2,
      cy: L.leftBottomCY - (id - 1) * L.leftStep,
      side: "left",
    };
  }
  return {
    cx: L.rightX + L.slotW / 2,
    cy: L.rightTopCY + (id - 25) * L.rightStep,
    side: "right",
  };
}

export function getStatusCounts(): Record<SpotStatus, number> {
  return YARD_SPOTS.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; },
    {} as Record<SpotStatus, number>
  );
}

export function getSpotById(id: number): YardSpot | undefined {
  return YARD_SPOTS.find((s) => s.id === id);
}

// =============================================================================
//  SPOT DATA
//  Edit this section to update vessel and owner information.
// =============================================================================
export const YARD_SPOTS: YardSpot[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  //  COL-A  LEFT  (spot 1 = south/bottom,  spot 24 = north/top)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:  1, side: "left", status: "occupied",
    boatName: "Al Nokhada", boatType: "Traditional Dhow", boatLength: "14.5m",
    registrationNumber: "OM-MSC-2019-001",
    ownerName: "Mohammed Al Balushi", ownerPhone: "+968 9101 2345", ownerEmail: "m.balushi@gmail.com",
    entryDate: "2025-01-15", expiryDate: "2026-04-15",
    totalDue: 450.000, totalPaid: 450.000,
    notes: "Traditional wooden dhow. Annual contract." },

  { id:  2, side: "left", status: "occupied",
    boatName: "Sea Falcon", boatType: "Motorboat", boatLength: "9.2m",
    registrationNumber: "OM-MSC-2020-042",
    ownerName: "Khalid Al Rawahi", ownerPhone: "+968 9202 3456", ownerEmail: "k.rawahi@hotmail.com",
    entryDate: "2026-01-10", expiryDate: "2026-07-10",
    totalDue: 240.000, totalPaid: 120.000 },

  { id:  3, side: "left", status: "occupied",
    boatName: "Gulf Star", boatType: "Motorboat", boatLength: "8.5m",
    registrationNumber: "OM-MSC-2022-055",
    ownerName: "Salim Al Kindi", ownerPhone: "+968 9505 6789",
    entryDate: "2025-12-01", expiryDate: "2026-06-01",
    totalDue: 180.000, totalPaid: 180.000 },

  { id:  4, side: "left", status: "empty" },

  { id:  5, side: "left", status: "occupied",
    boatName: "Desert Wind", boatType: "Sailing Yacht", boatLength: "12.0m",
    registrationNumber: "OM-MSC-2021-033",
    ownerName: "Ahmed Al Habsi", ownerPhone: "+968 9404 5678", ownerEmail: "a.habsi@outlook.com",
    entryDate: "2026-01-20", expiryDate: "2026-07-20",
    totalDue: 360.000, totalPaid: 360.000,
    notes: "Racing sailboat. Seasonal storage." },

  { id:  6, side: "left", status: "occupied",
    boatName: "Al Baraka", boatType: "Traditional Dhow", boatLength: "16.0m",
    registrationNumber: "OM-MSC-2016-076",
    ownerName: "Yusuf Al Busaidi", ownerPhone: "+968 9909 0123",
    entryDate: "2025-10-01", expiryDate: "2026-10-01",
    totalDue: 600.000, totalPaid: 450.000,
    notes: "Long-term annual contract." },

  { id:  7, side: "left", status: "occupied",
    boatName: "Sunrise II", boatType: "Speed Boat", boatLength: "7.0m",
    registrationNumber: "OM-MSC-2023-012",
    ownerName: "Hanan Al Siyabi", ownerPhone: "+968 9707 8901", ownerEmail: "hanan.siyabi@gmail.com",
    entryDate: "2026-02-05", expiryDate: "2026-08-05",
    totalDue: 180.000, totalPaid: 90.000 },

  { id:  8, side: "left", status: "reserved",
    ownerName: "Nasser Al Farsi", ownerPhone: "+968 9606 7890", ownerEmail: "n.farsi@gmail.com",
    entryDate: "2026-04-01", expiryDate: "2026-07-01",
    notes: "Reserved — vessel arriving April 2026." },

  { id:  9, side: "left", status: "occupied",
    boatName: "Blue Horizon", boatType: "Luxury Yacht", boatLength: "18.5m",
    registrationNumber: "OM-MSC-2019-204",
    ownerName: "Ibrahim Al Maamari", ownerPhone: "+968 9808 9012", ownerEmail: "ibrahim.mm@outlook.com",
    entryDate: "2026-01-01", expiryDate: "2027-01-01",
    totalDue: 1200.000, totalPaid: 1200.000,
    notes: "Corporate events vessel. Al Maamari Trading LLC." },

  { id: 10, side: "left", status: "empty" },

  { id: 11, side: "left", status: "occupied",
    boatName: "Oman Pride", boatType: "Motorboat", boatLength: "10.5m",
    registrationNumber: "OM-MSC-2022-091",
    ownerName: "Aisha Al Rashdi", ownerPhone: "+968 9010 1234",
    entryDate: "2026-02-20", expiryDate: "2026-08-20",
    totalDue: 240.000, totalPaid: 240.000 },

  { id: 12, side: "left", status: "occupied",
    boatName: "Silver Mast", boatType: "Sailing Yacht", boatLength: "13.5m",
    registrationNumber: "OM-MSC-2020-158",
    ownerName: "Hamood Al Ghafri", ownerPhone: "+968 9111 2345", ownerEmail: "h.ghafri@gmail.com",
    entryDate: "2026-01-25", expiryDate: "2026-04-25",
    totalDue: 180.000, totalPaid: 120.000,
    notes: "Mast repair in progress. ETA 2 weeks." },

  { id: 13, side: "left", status: "expired",
    boatName: "Al Wajha", boatType: "Fishing Boat", boatLength: "11.0m",
    registrationNumber: "OM-MSC-2017-089",
    ownerName: "Nasser Al Farsi", ownerPhone: "+968 9606 7890", ownerEmail: "n.farsi@gmail.com",
    entryDate: "2025-09-01", expiryDate: "2026-03-01",
    totalDue: 360.000, totalPaid: 120.000,
    notes: "EXPIRED — outstanding balance OMR 240.000. Second notice sent." },

  { id: 14, side: "left", status: "occupied",
    boatName: "Bahr Al Noor", boatType: "Motorboat", boatLength: "8.0m",
    registrationNumber: "OM-MSC-2023-067",
    ownerName: "Zainab Al Harthi", ownerPhone: "+968 9212 3456", ownerEmail: "z.harthi@yahoo.com",
    entryDate: "2026-01-10", expiryDate: "2026-07-10",
    totalDue: 360.000, totalPaid: 360.000,
    notes: "Paid 6 months upfront." },

  { id: 15, side: "left", status: "occupied",
    boatName: "Al Majd", boatType: "Motorboat", boatLength: "9.0m",
    registrationNumber: "OM-MSC-2021-077",
    ownerName: "Saif Al Zadjali", ownerPhone: "+968 9313 4567",
    entryDate: "2026-02-01", expiryDate: "2026-08-01",
    totalDue: 240.000, totalPaid: 240.000 },

  { id: 16, side: "left", status: "empty" },

  { id: 17, side: "left", status: "occupied",
    boatName: "Muscat Pearl", boatType: "Luxury Yacht", boatLength: "24.8m",
    registrationNumber: "OM-MSC-2018-117",
    ownerName: "Fatima Al Mujaini", ownerPhone: "+968 9303 4567", ownerEmail: "f.mujaini@yahoo.com",
    entryDate: "2025-10-01", expiryDate: "2026-10-01",
    totalDue: 2100.000, totalPaid: 2100.000,
    notes: "Annual VIP contract. Priority spot." },

  { id: 18, side: "left", status: "occupied",
    boatName: "Al Salam", boatType: "Motorboat", boatLength: "10.0m",
    registrationNumber: "OM-MSC-2021-144",
    ownerName: "Rashid Al Kalbani", ownerPhone: "+968 9212 6789",
    entryDate: "2026-03-01", expiryDate: "2026-09-01",
    totalDue: 240.000, totalPaid: 120.000 },

  { id: 19, side: "left", status: "empty" },

  { id: 20, side: "left", status: "occupied",
    boatName: "Falak", boatType: "Speed Boat", boatLength: "6.8m",
    registrationNumber: "OM-MSC-2024-003",
    ownerName: "Tariq Al Shanfari", ownerPhone: "+968 9414 5678",
    entryDate: "2026-03-10", expiryDate: "2026-06-10",
    totalDue: 135.000, totalPaid: 135.000 },

  { id: 21, side: "left", status: "occupied",
    boatName: "Al Nakheel", boatType: "Fishing Boat", boatLength: "13.0m",
    registrationNumber: "OM-MSC-2018-044",
    ownerName: "Hilal Al Shukaili", ownerPhone: "+968 9912 4567",
    entryDate: "2026-01-15", expiryDate: "2026-07-15",
    totalDue: 360.000, totalPaid: 180.000 },

  { id: 22, side: "left", status: "empty" },

  { id: 23, side: "left", status: "occupied",
    boatName: "Reem", boatType: "Sailing Yacht", boatLength: "14.0m",
    registrationNumber: "OM-MSC-2019-155",
    ownerName: "Abdullah Al Amri", ownerPhone: "+968 9714 8901",
    entryDate: "2026-02-12", expiryDate: "2026-05-12",
    totalDue: 270.000, totalPaid: 270.000 },

  { id: 24, side: "left", status: "occupied",
    boatName: "Al Aseel", boatType: "Traditional Dhow", boatLength: "17.0m",
    registrationNumber: "OM-MSC-2015-009",
    ownerName: "Khalfan Al Wahaibi", ownerPhone: "+968 9514 6789",
    entryDate: "2025-06-01", expiryDate: "2026-06-01",
    totalDue: 720.000, totalPaid: 720.000,
    notes: "Heritage vessel. Fishermen's cooperative." },

  // ═══════════════════════════════════════════════════════════════════════════
  //  COL-B  RIGHT  (spot 25 = north/top,  spot 45 = south/bottom)
  //  ALL spots are above the service building at the bottom-right.
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 25, side: "right", status: "occupied",
    boatName: "Al Faris", boatType: "Speed Boat", boatLength: "6.5m",
    registrationNumber: "OM-MSC-2023-088",
    ownerName: "Tariq Al Amrani", ownerPhone: "+968 9001 2345",
    entryDate: "2026-02-18", expiryDate: "2026-05-18",
    totalDue: 135.000, totalPaid: 135.000 },

  { id: 26, side: "right", status: "occupied",
    boatName: "Al Rayyan", boatType: "Fishing Boat", boatLength: "10.0m",
    registrationNumber: "OM-MSC-2020-133",
    ownerName: "Khalid Al Mamari", ownerPhone: "+968 9102 3456",
    entryDate: "2026-01-05", expiryDate: "2026-07-05",
    totalDue: 360.000, totalPaid: 180.000 },

  { id: 27, side: "right", status: "occupied",
    boatName: "Sama Al Bahr", boatType: "Motorboat", boatLength: "11.5m",
    registrationNumber: "OM-MSC-2021-099",
    ownerName: "Badria Al Hinai", ownerPhone: "+968 9203 4567", ownerEmail: "b.hinai@gmail.com",
    entryDate: "2026-01-30", expiryDate: "2026-06-30",
    totalDue: 300.000, totalPaid: 300.000 },

  { id: 28, side: "right", status: "empty" },

  { id: 29, side: "right", status: "occupied",
    boatName: "Majan", boatType: "Speed Boat", boatLength: "7.5m",
    registrationNumber: "OM-MSC-2023-021",
    ownerName: "Rashid Al Balushi", ownerPhone: "+968 9304 5678",
    entryDate: "2026-02-14", expiryDate: "2026-05-14",
    totalDue: 135.000, totalPaid: 90.000 },

  { id: 30, side: "right", status: "occupied",
    boatName: "Al Watan", boatType: "Motorboat", boatLength: "8.8m",
    registrationNumber: "OM-MSC-2022-066",
    ownerName: "Sulaiman Al Tobi", ownerPhone: "+968 9405 6789",
    entryDate: "2026-01-22", expiryDate: "2026-07-22",
    totalDue: 360.000, totalPaid: 360.000 },

  { id: 31, side: "right", status: "expired",
    boatName: "Al Khaleej", boatType: "Fishing Boat", boatLength: "12.0m",
    registrationNumber: "OM-MSC-2017-062",
    ownerName: "Mansoor Al Balushi", ownerPhone: "+968 9506 7890", ownerEmail: "mansoor.b@gmail.com",
    entryDate: "2025-08-10", expiryDate: "2026-02-10",
    totalDue: 420.000, totalPaid: 210.000,
    notes: "EXPIRED — overdue fees. Owner contacted 3× with no response." },

  { id: 32, side: "right", status: "occupied",
    boatName: "Hajar", boatType: "Motorboat", boatLength: "9.5m",
    registrationNumber: "OM-MSC-2021-110",
    ownerName: "Yaqoob Al Rawas", ownerPhone: "+968 9607 8901",
    entryDate: "2026-03-01", expiryDate: "2026-09-01",
    totalDue: 300.000, totalPaid: 300.000 },

  { id: 33, side: "right", status: "reserved",
    ownerName: "Omar Al Rashdi", ownerPhone: "+968 9812 3456", ownerEmail: "o.rashdi@hotmail.com",
    entryDate: "2026-04-15", expiryDate: "2026-07-15",
    notes: "Reserved — incoming vessel, expected April 2026." },

  { id: 34, side: "right", status: "occupied",
    boatName: "Salalah Star", boatType: "Luxury Yacht", boatLength: "20.0m",
    registrationNumber: "OM-SAL-2020-009",
    ownerName: "Badr Al Mashani", ownerPhone: "+968 9512 9012",
    entryDate: "2026-01-08", expiryDate: "2027-01-08",
    totalDue: 1500.000, totalPaid: 1500.000,
    notes: "Seasonal storage. Owner based in Salalah." },

  { id: 35, side: "right", status: "occupied",
    boatName: "Al Dawha", boatType: "Fishing Boat", boatLength: "11.0m",
    registrationNumber: "OM-MSC-2018-077",
    ownerName: "Qassim Al Harthi", ownerPhone: "+968 9612 0123",
    entryDate: "2026-02-01", expiryDate: "2026-08-01",
    totalDue: 300.000, totalPaid: 150.000 },

  { id: 36, side: "right", status: "occupied",
    boatName: "Bur Muscat", boatType: "Motorboat", boatLength: "10.0m",
    registrationNumber: "OM-MSC-2022-103",
    ownerName: "Faris Al Ghassani", ownerPhone: "+968 9712 1234",
    entryDate: "2026-02-28", expiryDate: "2026-05-28",
    totalDue: 180.000, totalPaid: 180.000 },

  { id: 37, side: "right", status: "empty" },

  { id: 38, side: "right", status: "occupied",
    boatName: "Nujoom", boatType: "Sailing Yacht", boatLength: "15.0m",
    registrationNumber: "OM-MSC-2019-088",
    ownerName: "Hassan Al Lawati", ownerPhone: "+968 9812 2345", ownerEmail: "h.lawati@gmail.com",
    entryDate: "2026-01-15", expiryDate: "2026-07-15",
    totalDue: 540.000, totalPaid: 540.000,
    notes: "Carbon fibre mast. Handle with care." },

  { id: 39, side: "right", status: "occupied",
    boatName: "Al Barq", boatType: "Speed Boat", boatLength: "7.2m",
    registrationNumber: "OM-MSC-2024-017",
    ownerName: "Saif Al Maskari", ownerPhone: "+968 9912 3456",
    entryDate: "2026-03-15", expiryDate: "2026-06-15",
    totalDue: 135.000, totalPaid: 67.500 },

  { id: 40, side: "right", status: "empty" },

  { id: 41, side: "right", status: "occupied",
    boatName: "Hayat Al Bahar", boatType: "Motorboat", boatLength: "12.5m",
    registrationNumber: "OM-MSC-2020-199",
    ownerName: "Ibrahim Al Zadjali", ownerPhone: "+968 9012 4567",
    entryDate: "2026-02-10", expiryDate: "2026-08-10",
    totalDue: 420.000, totalPaid: 420.000 },

  { id: 42, side: "right", status: "empty" },

  { id: 43, side: "right", status: "occupied",
    boatName: "Al Omani Pride", boatType: "Luxury Yacht", boatLength: "22.0m",
    registrationNumber: "OM-MSC-2017-200",
    ownerName: "Hamood Al Siyabi", ownerPhone: "+968 9112 5678", ownerEmail: "h.siyabi@yahoo.com",
    entryDate: "2025-12-01", expiryDate: "2026-12-01",
    totalDue: 2400.000, totalPaid: 2400.000,
    notes: "VIP annual contract. Notify owner 2 weeks before expiry." },

  { id: 44, side: "right", status: "occupied",
    boatName: "Dawhat Al Khair", boatType: "Fishing Boat", boatLength: "9.0m",
    registrationNumber: "OM-MSC-2021-055",
    ownerName: "Saeed Al Hashmi", ownerPhone: "+968 9212 6789",
    entryDate: "2026-03-05", expiryDate: "2026-09-05",
    totalDue: 270.000, totalPaid: 270.000 },

  { id: 45, side: "right", status: "empty" },
];
