/**
 * TGD Glass Fence Calculator Engine
 *
 * Pure TypeScript calculation engine with zero Shopify dependencies.
 * Handles panel fitting, gap compliance, and BOM generation for
 * Inline, L-shape, and Rectangle glass fence configurations.
 *
 * Usage:
 *   import { calculate, DEFAULT_SETTINGS } from './calculator/index.js';
 *
 *   const result = calculate({
 *     shape: { shape: 'inline', length: 5000 },
 *     settings: DEFAULT_SETTINGS,
 *   });
 */

export type {
  // Shape types
  ShapeConfig,
  InlineConfig,
  LShapeConfig,
  RectangleConfig,
  ShapeType,
  GateConfig,
  // Run types
  Run,
  Point,
  // Fitting types
  FittingResult,
  PanelPlacement,
  GatePlacement,
  SpigotPlacement,
  Gap,
  // Validation
  ValidationWarning,
  WarningSeverity,
  WarningType,
  // BOM types
  BOMLineItem,
  BOMResult,
  BOMItemType,
  // Settings
  CalculatorSettings,
  GateHardwareConfig,
  // Input/Output
  CalculatorInput,
  CalculatorOutput,
  // Catalogue types
  PanelSize,
} from './types.js';

export {
  STANDARD_PANELS,
  GATE_PANELS_8MM,
  HINGE_PANELS,
  SPIGOTS,
  SPRING_HINGES,
  LATCH_KITS,
  PANELS_DESCENDING,
  getPanelByWidth,
  getAvailableWidths,
  MIN_PANEL_WIDTH,
  MAX_PANEL_WIDTH,
  DEFAULT_SPIGOT_WIDTH,
  AS1926_MAX_GAP,
} from './catalogue.js';

export { decomposeShape, getSharedCornerCount } from './geometry.js';
export { fitRun } from './fitter.js';
export { validateGaps, validateRunLength, validateGatePosition } from './gap-validator.js';
export { generateBOM } from './bom.js';

import type { CalculatorInput, CalculatorOutput, CalculatorSettings } from './types.js';
import { decomposeShape } from './geometry.js';
import { fitRun } from './fitter.js';
import { generateBOM } from './bom.js';
import { DEFAULT_SPIGOT_WIDTH, AS1926_MAX_GAP } from './catalogue.js';

// ─── Default Settings ────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: CalculatorSettings = {
  spigotWidth: DEFAULT_SPIGOT_WIDTH, // 60mm
  maxGapWidth: AS1926_MAX_GAP,       // 100mm
  includeSpigots: false,
  // Gate hardware defaults: undefined (pending client config)
};

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Calculate a complete glass fence configuration.
 *
 * 1. Decomposes shape into independent straight runs
 * 2. Fits panels into each run (greedy algorithm)
 * 3. Validates gap compliance (AS 1926.1)
 * 4. Generates aggregated BOM with pricing
 *
 * @param input Shape configuration + settings
 * @returns Runs, fitting results, BOM, and overall success status
 */
export function calculate(input: CalculatorInput): CalculatorOutput {
  const { shape, settings } = input;

  // 1. Decompose shape into runs
  const runs = decomposeShape(shape);

  // 2. Fit panels into each run
  const fittingResults = runs.map(run => fitRun(run, settings));

  // 3. Generate BOM
  const bom = generateBOM(fittingResults, shape, settings);

  // 4. Determine overall success
  const success = fittingResults.every(r => r.success);

  return {
    runs,
    fittingResults,
    bom,
    success,
  };
}
