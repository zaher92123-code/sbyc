// =============================================================================
// Marina Configuration — Edit company name and settings here
// =============================================================================

export const MARINA_CONFIG = {
  // Company identity — change this to update name across the whole app
  name: "Al Seeb Boat Club",
  shortName: "Al Seeb Boat Club",
  location: "Muscat, Sultanate of Oman",

  // Yard layout
  totalSpots: 45,
  leftColumnCount: 24,   // spots 1-24, numbered bottom to top
  rightColumnCount: 21,  // spots 25-45, numbered top to bottom

  // Financial
  currency: "OMR",
  currencyDecimals: 3,

  // Timezone
  timezone: "Asia/Muscat",

  // App version — bump this when updates are deployed
  version: "1.1.0",

  // Map labels
  mapSubtitle: "Yard Storage — 45 Spots",
  entrance: "Main Entrance (South Gate)",
} as const;

export type MarinaConfig = typeof MARINA_CONFIG;
