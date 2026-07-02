export const REGIONS = [
  "Hikkaduwa",
  "Galle",
  "Unawatuna",
  "Mirissa",
  "Ella",
  "Colombo",
  "Kandy",
  "Arugam Bay",
  "Other",
] as const;

export type Region = typeof REGIONS[number];
