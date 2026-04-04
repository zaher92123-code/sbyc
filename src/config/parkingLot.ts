// =============================================================================
// PARKING LOT LAYOUT CONFIGURATION
// Defines the exact position of every slot in the SVG coordinate system.
// SVG ViewBox: 0 0 520 1100
//
// Layout based on satellite image of Al Seeb Boat Club parking yard:
//   - Left column:  slots 1–24  (bottom → top)
//   - Right column: slots 25–45 (top → bottom)
//   - Central aisle between the two columns
//   - Building structure at bottom-right
// =============================================================================

export type SlotSide = "left" | "right";

export type SlotStatus =
  | "available"
  | "occupied"
  | "ending_soon"
  | "overdue"
  | "reserved"
  | "maintenance";

export interface ParkingSlot {
  number: number;       // Visual slot number (1–45)
  side: SlotSide;
  cx: number;           // Center X in SVG coords
  cy: number;           // Center Y in SVG coords
  boatFacingRight: boolean; // true = bow points right (left column faces aisle)
}

// ─── SVG Layout Constants ────────────────────────────────────────────────────
export const LOT = {
  viewBox: "0 0 520 1100",
  width: 520,
  height: 1100,

  // Space dimensions (each individual parking slot)
  slotDepth: 105,   // px, perpendicular to wall (x-axis)
  slotHeight: 40,   // px, along the wall (y-axis)
  slotGap: 2,       // px, gap between slots
  slotStride: 42,   // slotHeight + slotGap

  // Left column geometry
  leftWallX: 36,
  leftSlotRightX: 141,   // leftWallX + slotDepth
  leftCX: 88,            // center x of left slots

  // Right column geometry
  rightWallX: 484,
  rightSlotLeftX: 379,   // rightWallX - slotDepth
  rightCX: 431,          // center x of right slots

  // Vertical anchors
  topSlotCY: 68,        // center y of topmost slot (slots 24 and 25)
  bottomLeftCY: 1010,   // center y of slot 1 (bottom of left column)

  // Aisle
  aisleLeft: 141,
  aisleRight: 379,

  // Building (bottom-right structure)
  buildingX: 345,
  buildingY: 920,
  buildingW: 155,
  buildingH: 158,
} as const;

// ─── Generate Left Column (slots 1–24, bottom → top) ────────────────────────
const leftSlots: ParkingSlot[] = Array.from({ length: 24 }, (_, i) => ({
  number: i + 1,
  side: "left",
  cx: LOT.leftCX,
  cy: LOT.bottomLeftCY - i * LOT.slotStride,
  boatFacingRight: true,   // bow faces the aisle (right)
}));

// ─── Generate Right Column (slots 25–45, top → bottom) ──────────────────────
const rightSlots: ParkingSlot[] = Array.from({ length: 21 }, (_, i) => ({
  number: i + 25,
  side: "right",
  cx: LOT.rightCX,
  cy: LOT.topSlotCY + i * LOT.slotStride,
  boatFacingRight: false,  // bow faces the aisle (left)
}));

export const ALL_SLOTS: ParkingSlot[] = [...leftSlots, ...rightSlots];

// ─── Status Colors ────────────────────────────────────────────────────────────
export const STATUS_COLORS: Record<SlotStatus, {
  fill: string;
  stroke: string;
  boatFill: string;
  boatStroke: string;
  label: string;
  textColor: string;
}> = {
  available: {
    fill: "#f0fdf4",
    stroke: "#86efac",
    boatFill: "#4ade80",
    boatStroke: "#16a34a",
    label: "Available",
    textColor: "#166534",
  },
  occupied: {
    fill: "#f0fdfc",
    stroke: "#5eead4",
    boatFill: "#0E7490",
    boatStroke: "#0e4f5e",
    label: "Occupied",
    textColor: "#164e63",
  },
  ending_soon: {
    fill: "#fffbeb",
    stroke: "#fcd34d",
    boatFill: "#d97706",
    boatStroke: "#92400e",
    label: "Ending Soon",
    textColor: "#78350f",
  },
  overdue: {
    fill: "#fef2f2",
    stroke: "#fca5a5",
    boatFill: "#ef4444",
    boatStroke: "#991b1b",
    label: "Overdue",
    textColor: "#991b1b",
  },
  reserved: {
    fill: "#faf5ff",
    stroke: "#c4b5fd",
    boatFill: "#7c3aed",
    boatStroke: "#4c1d95",
    label: "Reserved",
    textColor: "#4c1d95",
  },
  maintenance: {
    fill: "#f8fafc",
    stroke: "#cbd5e1",
    boatFill: "#94a3b8",
    boatStroke: "#475569",
    label: "Maintenance",
    textColor: "#475569",
  },
};

// ─── Outer Boundary Path ─────────────────────────────────────────────────────
// Traced from the satellite image of Al Seeb Boat Club parking lot.
// The lot has a slightly irregular shape:
//   - Top: roughly horizontal, slight angle
//   - Left wall: straight vertical
//   - Right wall: straight, then building notch at bottom-right
//   - Bottom: roughly horizontal
export const BOUNDARY_PATH = `
  M 28 22
  L 492 18
  L 494 910
  L 494 910
  L 340 910
  L 340 1082
  L 494 1082
  L 494 1088
  L 26 1090
  Z
`.trim();

// ─── Surface / Ground Fill Path (inside boundary) ────────────────────────────
export const GROUND_PATH = BOUNDARY_PATH;

// ─── Aisle Centerline (decorative guide) ─────────────────────────────────────
export const AISLE_PATH = `M ${LOT.aisleLeft + (LOT.aisleRight - LOT.aisleLeft) / 2} 22 
                           L ${LOT.aisleLeft + (LOT.aisleRight - LOT.aisleLeft) / 2} 1090`;
