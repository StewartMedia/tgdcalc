// ─── Panel Types ─────────────────────────────────────────────────────────────

export interface PanelSize {
  /** Width in mm */
  width: number;
  /** Height in mm */
  height: number;
  /** Shopify product handle (e.g. "gp-12mm-1200mm") */
  handle: string;
  /** Panel category */
  type: 'standard' | 'gate' | 'hinge';
  /** Price in AUD (ex GST) — sourced from catalogue, updated via Storefront API at runtime */
  price: number;
}

// ─── Shape & Run Types ───────────────────────────────────────────────────────

export type ShapeType = 'inline' | 'l-shape' | 'rectangle';

export interface InlineConfig {
  shape: 'inline';
  length: number;
  gate?: GateConfig;
}

export interface LShapeConfig {
  shape: 'l-shape';
  side1Length: number;
  side2Length: number;
  gate?: GateConfig & { side: 1 | 2 };
}

export interface RectangleConfig {
  shape: 'rectangle';
  width: number;
  height: number;
  gate?: GateConfig & { side: 1 | 2 | 3 | 4 };
}

export type ShapeConfig = InlineConfig | LShapeConfig | RectangleConfig;

export interface GateConfig {
  /** Position in mm from start of the run the gate sits on */
  position: number;
  /** Gate panel width in mm */
  width: number;
  /** Gate panel type — defaults to 8mm standard */
  panelType?: 'standard-8mm' | 'hydraulic-wall-12mm' | 'hydraulic-120-12mm';
}

// ─── Run (a single straight section of fence) ───────────────────────────────

export interface Run {
  /** Unique ID for this run (e.g. "run-1", "side-north") */
  id: string;
  /** Total run length in mm */
  length: number;
  /** Gate config if this run has a gate */
  gate?: GateConfig;
  /** Start point for schematic rendering */
  start: Point;
  /** End point for schematic rendering */
  end: Point;
  /** Direction for rendering */
  direction: 'right' | 'down' | 'left' | 'up';
}

export interface Point {
  x: number;
  y: number;
}

// ─── Fitting Result ──────────────────────────────────────────────────────────

export interface FittingResult {
  /** The run this result applies to */
  runId: string;
  /** Whether the fitting is fully compliant */
  success: boolean;
  /** Ordered list of panel placements along the run */
  panels: PanelPlacement[];
  /** Gaps between and around panels */
  gaps: Gap[];
  /** Gate placement (if present) */
  gate?: GatePlacement;
  /** Spigot positions */
  spigots: SpigotPlacement[];
  /** Warnings and errors */
  warnings: ValidationWarning[];
}

export interface PanelPlacement {
  /** The panel size from catalogue */
  panel: PanelSize;
  /** Start position in mm from run start */
  startMm: number;
  /** End position in mm from run start */
  endMm: number;
}

export interface GatePlacement {
  /** Start position in mm from run start */
  startMm: number;
  /** End position in mm from run start */
  endMm: number;
  /** Gate width */
  width: number;
  /** Gate panel type */
  panelType: 'standard-8mm' | 'hydraulic-wall-12mm' | 'hydraulic-120-12mm';
}

export interface SpigotPlacement {
  /** Position in mm from run start (centre of spigot) */
  positionMm: number;
  /** Whether this spigot is shared with another run (corner) */
  shared: boolean;
}

export interface Gap {
  /** Start position in mm from run start */
  startMm: number;
  /** End position in mm from run start */
  endMm: number;
  /** Gap width in mm */
  width: number;
  /** Whether this gap is ≤ maxGapWidth (AS 1926.1 compliant) */
  compliant: boolean;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type WarningSeverity = 'error' | 'warning' | 'info';

export type WarningType =
  | 'GAP_EXCEEDS_LIMIT'
  | 'RUN_TOO_SHORT'
  | 'NO_VALID_FIT'
  | 'GAP_TOO_NARROW'
  | 'GATE_POSITION_INVALID';

export interface ValidationWarning {
  type: WarningType;
  severity: WarningSeverity;
  message: string;
  /** Position on the run where the issue occurs (mm) */
  positionMm?: number;
}

// ─── BOM (Bill of Materials) ─────────────────────────────────────────────────

export type BOMItemType = 'panel' | 'gate-panel' | 'hinge-panel' | 'spigot' | 'hinge' | 'latch' | 'fixing-kit';

export interface BOMLineItem {
  /** Product type category */
  type: BOMItemType;
  /** Shopify product handle */
  handle: string;
  /** Human-readable description */
  description: string;
  /** Quantity needed */
  quantity: number;
  /** Unit price in AUD (ex GST) */
  unitPrice: number;
  /** Line total (quantity × unitPrice) */
  lineTotal: number;
}

export interface BOMResult {
  /** All line items */
  items: BOMLineItem[];
  /** Subtotal ex GST */
  subtotal: number;
  /** GST amount (10%) */
  gst: number;
  /** Total inc GST */
  total: number;
  /** Warnings from fitting */
  warnings: ValidationWarning[];
}

// ─── Calculator Settings (admin-configurable) ────────────────────────────────

export interface CalculatorSettings {
  /** Spigot body width in mm (affects gap calculations) */
  spigotWidth: number;
  /** Maximum allowed gap in mm (AS 1926.1 = 100mm) */
  maxGapWidth: number;
  /** Whether to include spigots in BOM */
  includeSpigots: boolean;
  /** Default spigot type for BOM */
  defaultSpigotHandle?: string;
  /** Gate hardware defaults (pluggable — pending client config) */
  gateHardwareDefaults?: GateHardwareConfig;
}

export interface GateHardwareConfig {
  /** Gate panel handle override */
  gatePanelHandle?: string;
  /** Hinge pair handle */
  hingeHandle?: string;
  /** Latch kit handle */
  latchHandle?: string;
  /** Whether a hinge panel is required next to the gate */
  requiresHingePanel: boolean;
  /** Hinge panel handle override */
  hingePanelHandle?: string;
}

// ─── Full Calculator Input/Output ────────────────────────────────────────────

export interface CalculatorInput {
  /** Shape configuration with dimensions */
  shape: ShapeConfig;
  /** Admin settings */
  settings: CalculatorSettings;
}

export interface CalculatorOutput {
  /** Decomposed runs */
  runs: Run[];
  /** Fitting result per run */
  fittingResults: FittingResult[];
  /** Aggregated BOM across all runs */
  bom: BOMResult;
  /** Overall success */
  success: boolean;
}
