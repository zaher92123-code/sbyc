// =============================================================================
// SITE CONFIGURATION
// Change company name, contact info, and app settings here.
// This is the single source of truth for all branding.
// =============================================================================

export const SITE_CONFIG = {
  // ─── Company Identity ───────────────────────────────────────────────────────
  companyName: "Al Seeb Boat Club",
  companyFullName: "Al Seeb Boat Club",
  companyNameAr: "نادي السيب للقوارب",
  tagline: "Boat Parking Management System",
  location: "Muscat, Sultanate of Oman",

  // ─── Contact ────────────────────────────────────────────────────────────────
  phone: "+968 2200 0000",
  email: "info@alseebbay.om",
  address: "Al Seeb Boat Club, Muscat, Oman",

  // ─── Regional Settings ──────────────────────────────────────────────────────
  currency: "OMR",
  currencyDecimals: 3,
  timezone: "Asia/Muscat",
  locale: "en-OM",

  // ─── Parking Lot Layout ─────────────────────────────────────────────────────
  totalSpots: 45,
  leftColumnSpots: 24,   // spots 1–24, numbered bottom to top
  rightColumnSpots: 21,  // spots 25–45, numbered top to bottom

  // ─── App Meta ───────────────────────────────────────────────────────────────
  version: "1.0.0",
  appName: "Al Seeb Boat Club — Parking Management",
} as const;

export type SiteConfig = typeof SITE_CONFIG;
