import type { PanelSize } from './types.js';

// ─── Standard Pool Fence Panels ──────────────────────────────────────────────
// 12mm toughened glass, 1200mm height, AS/NZS 2208 certified
// Widths: 100–2000mm in 50mm increments (39 sizes)
// Handle pattern: gp-12mm-{width}mm (zero-padded to 4 digits)
// Source: products_export.csv (Feb 2026)

export const STANDARD_PANELS: PanelSize[] = [
  { width: 100,  height: 1200, handle: 'gp-12mm-0100mm', type: 'standard', price: 31.05 },
  { width: 150,  height: 1200, handle: 'gp-12mm-0150mm', type: 'standard', price: 31.05 },
  { width: 200,  height: 1200, handle: 'gp-12mm-0200mm', type: 'standard', price: 31.05 },
  { width: 250,  height: 1200, handle: 'gp-12mm-0250mm', type: 'standard', price: 31.05 },
  { width: 300,  height: 1200, handle: 'gp-12mm-0300mm', type: 'standard', price: 31.05 },
  { width: 350,  height: 1200, handle: 'gp-12mm-0350mm', type: 'standard', price: 31.05 },
  { width: 400,  height: 1200, handle: 'gp-12mm-0400mm', type: 'standard', price: 34.69 },
  { width: 450,  height: 1200, handle: 'gp-12mm-0450mm', type: 'standard', price: 38.95 },
  { width: 500,  height: 1200, handle: 'gp-12mm-0500mm', type: 'standard', price: 43.35 },
  { width: 550,  height: 1200, handle: 'gp-12mm-0550mm', type: 'standard', price: 47.62 },
  { width: 600,  height: 1200, handle: 'gp-12mm-0600mm', type: 'standard', price: 52.03 },
  { width: 650,  height: 1200, handle: 'gp-12mm-0650mm', type: 'standard', price: 56.28 },
  { width: 700,  height: 1200, handle: 'gp-12mm-0700mm', type: 'standard', price: 60.69 },
  { width: 750,  height: 1200, handle: 'gp-12mm-0750mm', type: 'standard', price: 64.97 },
  { width: 800,  height: 1200, handle: 'gp-12mm-0800mm', type: 'standard', price: 69.36 },
  { width: 850,  height: 1200, handle: 'gp-12mm-0850mm', type: 'standard', price: 73.63 },
  { width: 900,  height: 1200, handle: 'gp-12mm-0900mm', type: 'standard', price: 78.03 },
  { width: 950,  height: 1200, handle: 'gp-12mm-0950mm', type: 'standard', price: 82.30 },
  { width: 1000, height: 1200, handle: 'gp-12mm-1000mm', type: 'standard', price: 86.70 },
  { width: 1050, height: 1200, handle: 'gp-12mm-1050mm', type: 'standard', price: 90.97 },
  { width: 1100, height: 1200, handle: 'gp-12mm-1100mm', type: 'standard', price: 95.38 },
  { width: 1150, height: 1200, handle: 'gp-12mm-1150mm', type: 'standard', price: 99.64 },
  { width: 1200, height: 1200, handle: 'gp-12mm-1200mm', type: 'standard', price: 104.05 },
  { width: 1250, height: 1200, handle: 'gp-12mm-1250mm', type: 'standard', price: 108.31 },
  { width: 1300, height: 1200, handle: 'gp-12mm-1300mm', type: 'standard', price: 112.71 },
  { width: 1350, height: 1200, handle: 'gp-12mm-1350mm', type: 'standard', price: 116.99 },
  { width: 1400, height: 1200, handle: 'gp-12mm-1400mm', type: 'standard', price: 121.25 },
  { width: 1450, height: 1200, handle: 'gp-12mm-1450mm', type: 'standard', price: 125.65 },
  { width: 1500, height: 1200, handle: 'gp-12mm-1500mm', type: 'standard', price: 129.92 },
  { width: 1550, height: 1200, handle: 'gp-12mm-1550mm', type: 'standard', price: 134.33 },
  { width: 1600, height: 1200, handle: 'gp-12mm-1600mm', type: 'standard', price: 138.58 },
  { width: 1650, height: 1200, handle: 'gp-12mm-1650mm', type: 'standard', price: 142.99 },
  { width: 1700, height: 1200, handle: 'gp-12mm-1700mm', type: 'standard', price: 147.27 },
  { width: 1750, height: 1200, handle: 'gp-12mm-1750mm', type: 'standard', price: 151.67 },
  { width: 1800, height: 1200, handle: 'gp-12mm-1800mm', type: 'standard', price: 155.93 },
  { width: 1850, height: 1200, handle: 'gp-12mm-1850mm', type: 'standard', price: 159.47 },
  { width: 1900, height: 1200, handle: 'gp-12mm-1900mm', type: 'standard', price: 164.61 },
  { width: 1950, height: 1200, handle: 'gp-12mm-1950mm', type: 'standard', price: 170.48 },
  { width: 2000, height: 1200, handle: 'gp-12mm-2000mm', type: 'standard', price: 173.27 },
];

// ─── 8mm Gate Panels ─────────────────────────────────────────────────────────
// 8mm toughened glass, 1200mm height, pre-drilled holes for hinge + latch
// Widths: 700–1000mm in 25mm increments (13 sizes)
// Handle pattern: gg-8mm-{width}mm

export const GATE_PANELS_8MM: PanelSize[] = [
  { width: 700,  height: 1200, handle: 'gg-8mm-0700mm', type: 'gate', price: 49.95 },
  { width: 725,  height: 1200, handle: 'gg-8mm-0725mm', type: 'gate', price: 51.72 },
  { width: 750,  height: 1200, handle: 'gg-8mm-0750mm', type: 'gate', price: 53.49 },
  { width: 775,  height: 1200, handle: 'gg-8mm-0775mm', type: 'gate', price: 55.27 },
  { width: 800,  height: 1200, handle: 'gg-8mm-0800mm', type: 'gate', price: 57.04 },
  { width: 825,  height: 1200, handle: 'gg-8mm-0825mm', type: 'gate', price: 58.82 },
  { width: 850,  height: 1200, handle: 'gg-8mm-0850mm', type: 'gate', price: 60.59 },
  { width: 875,  height: 1200, handle: 'gg-8mm-0875mm', type: 'gate', price: 62.36 },
  { width: 900,  height: 1200, handle: 'gg-8mm-0900mm', type: 'gate', price: 64.14 },
  { width: 925,  height: 1200, handle: 'gg-8mm-0925mm', type: 'gate', price: 65.91 },
  { width: 950,  height: 1200, handle: 'gg-8mm-0950mm', type: 'gate', price: 67.68 },
  { width: 975,  height: 1200, handle: 'gg-8mm-0975mm', type: 'gate', price: 69.46 },
  { width: 1000, height: 1200, handle: 'gg-8mm-1000mm', type: 'gate', price: 71.29 },
];

// ─── 12mm Hinge Panels ──────────────────────────────────────────────────────
// Mount next to gate on hinge side, 8mm holes for hinges
// Widths: 1000–2000mm in 100mm increments (11 sizes)
// Handle pattern: gh-12mm-{width}mm

export const HINGE_PANELS: PanelSize[] = [
  { width: 1000, height: 1200, handle: 'gh-12mm-1000mm', type: 'hinge', price: 89.29 },
  { width: 1100, height: 1200, handle: 'gh-12mm-1100mm', type: 'hinge', price: 97.40 },
  { width: 1200, height: 1200, handle: 'gh-12mm-1200mm', type: 'hinge', price: 106.14 },
  { width: 1300, height: 1200, handle: 'gh-12mm-1300mm', type: 'hinge', price: 114.24 },
  { width: 1400, height: 1200, handle: 'gh-12mm-1400mm', type: 'hinge', price: 122.98 },
  { width: 1500, height: 1200, handle: 'gh-12mm-1500mm', type: 'hinge', price: 131.09 },
  { width: 1600, height: 1200, handle: 'gh-12mm-1600mm', type: 'hinge', price: 139.83 },
  { width: 1700, height: 1200, handle: 'gh-12mm-1700mm', type: 'hinge', price: 147.93 },
  { width: 1800, height: 1200, handle: 'gh-12mm-1800mm', type: 'hinge', price: 156.68 },
  { width: 1900, height: 1200, handle: 'gh-12mm-1900mm', type: 'hinge', price: 170.25 },
  { width: 2000, height: 1200, handle: 'gh-12mm-2000mm', type: 'hinge', price: 177.62 },
];

// ─── Spigot Data ─────────────────────────────────────────────────────────────
// Used for gap calculations and optional BOM inclusion

export interface SpigotInfo {
  handle: string;
  description: string;
  mountType: 'core-drilled' | 'base-plated';
  range: 'value' | 'pro';
  shape: 'square' | 'round';
  price: number;
  /** Body width in mm — affects gap calculations */
  bodyWidth: number;
}

export const SPIGOTS: SpigotInfo[] = [
  // Value range
  { handle: 'spigot-value-core-drill-square-clear-coat',   description: 'Square Core Drilled - Value',    mountType: 'core-drilled', range: 'value', shape: 'square', price: 52.57, bodyWidth: 60 },
  { handle: 'spigot-value-core-drill-round-clear-coat',    description: 'Round Core Drilled - Value',     mountType: 'core-drilled', range: 'value', shape: 'round',  price: 52.57, bodyWidth: 60 },
  { handle: 'spigot-value-base-plated-square-clear-coat',  description: 'Square Base Plated - Value',     mountType: 'base-plated',  range: 'value', shape: 'square', price: 57.11, bodyWidth: 60 },
  { handle: 'spigot-value-base-plated-round-clear-coat',   description: 'Round Base Plated - Value',      mountType: 'base-plated',  range: 'value', shape: 'round',  price: 55.42, bodyWidth: 60 },
  // Pro range
  { handle: 'spigot-pro-core-drill-square-clear-coat',     description: 'Square Core Drilled - Pro',      mountType: 'core-drilled', range: 'pro',   shape: 'square', price: 64.75, bodyWidth: 60 },
  { handle: 'spigot-pro-core-drill-round-clear-coat',      description: 'Round Core Drilled - Pro',       mountType: 'core-drilled', range: 'pro',   shape: 'round',  price: 63.37, bodyWidth: 60 },
  { handle: 'spigot-pro-base-plated-square-clear-coat',    description: 'Square Base Plated - Pro',       mountType: 'base-plated',  range: 'pro',   shape: 'square', price: 66.94, bodyWidth: 60 },
  { handle: 'spigot-pro-base-plated-round-clear-coat',     description: 'Round Base Plated - Pro',        mountType: 'base-plated',  range: 'pro',   shape: 'round',  price: 65.51, bodyWidth: 60 },
];

// ─── Hardware Data (Stubs — pending client config) ───────────────────────────

export interface HardwareItem {
  handle: string;
  description: string;
  category: 'hinge' | 'latch' | 'fixing-kit';
  price: number;
}

export const SPRING_HINGES: HardwareItem[] = [
  { handle: 'spring-hinge-glass-to-glass-ss316-pair',   description: 'Spring Hinge G2G SS316 (pair)',  category: 'hinge', price: 64.42 },
  { handle: 'spring-hinge-glass-to-glass-black-pair',   description: 'Spring Hinge G2G Black (pair)',  category: 'hinge', price: 70.90 },
  { handle: 'spring-hinge-wall-to-glass-black-pair',    description: 'Spring Hinge W2G Black (pair)',  category: 'hinge', price: 70.71 },
  { handle: 'spring-hinge-wall-to-glass-silver-pair',   description: 'Spring Hinge W2G Silver (pair)', category: 'hinge', price: 81.29 },
];

export const LATCH_KITS: HardwareItem[] = [
  { handle: 'kit-g2g-std-latch-kit-s-s-polished-stainless-steel-glass-to-glass-standard-latch-kit', description: 'G2G Standard Latch Kit - SS Polished', category: 'latch', price: 120.17 },
  { handle: 'kit-g2g-std-latch-kit-black-glass-to-glass-standard-latch-kit',                        description: 'G2G Standard Latch Kit - Black',       category: 'latch', price: 131.43 },
  { handle: 'kit-w2g-std-latch-kit-s-s-polished-stainless-steel-wall-to-glass-standard-latch-kit',  description: 'W2G Standard Latch Kit - SS Polished', category: 'latch', price: 120.17 },
  { handle: 'kit-w2g-std-latch-kit-black-wall-to-glass-standard-latch-kit',                         description: 'W2G Standard Latch Kit - Black',       category: 'latch', price: 126.36 },
];

// ─── Catalogue Helpers ───────────────────────────────────────────────────────

/** Standard panels sorted largest to smallest (for greedy algorithm) */
export const PANELS_DESCENDING: PanelSize[] = [...STANDARD_PANELS].sort((a, b) => b.width - a.width);

/** Get a standard panel by width (mm). Returns undefined if not in catalogue. */
export function getPanelByWidth(width: number): PanelSize | undefined {
  return STANDARD_PANELS.find(p => p.width === width);
}

/** Get all available panel widths sorted descending */
export function getAvailableWidths(): number[] {
  return PANELS_DESCENDING.map(p => p.width);
}

/** Get the smallest panel width in the catalogue */
export const MIN_PANEL_WIDTH = STANDARD_PANELS[0].width; // 100mm

/** Get the largest panel width in the catalogue */
export const MAX_PANEL_WIDTH = STANDARD_PANELS[STANDARD_PANELS.length - 1].width; // 2000mm

/** Default spigot body width for calculations */
export const DEFAULT_SPIGOT_WIDTH = 60; // mm

/** AS 1926.1 maximum gap */
export const AS1926_MAX_GAP = 100; // mm
