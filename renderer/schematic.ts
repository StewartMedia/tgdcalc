import type { Run, FittingResult, PanelPlacement, GatePlacement, SpigotPlacement, Gap } from '../calculator/types.js';

// ─── Configuration ───────────────────────────────────────────────────────────

export interface SchematicOptions {
  /** Canvas width in px */
  canvasWidth: number;
  /** Canvas height in px */
  canvasHeight: number;
  /** Padding around the schematic in px */
  padding: number;
  /** Show dimension labels */
  showDimensions: boolean;
  /** Show gap measurements */
  showGaps: boolean;
  /** Panel fill colour */
  panelColor: string;
  /** Gate fill colour */
  gateColor: string;
  /** Non-compliant gap colour */
  warningColor: string;
  /** Spigot colour */
  spigotColor: string;
  /** Background colour */
  backgroundColor: string;
  /** Text colour */
  textColor: string;
  /** Fence thickness in px (visual width of panels in top-down view) */
  fenceThickness: number;
}

export const DEFAULT_OPTIONS: SchematicOptions = {
  canvasWidth: 800,
  canvasHeight: 500,
  padding: 60,
  showDimensions: true,
  showGaps: true,
  panelColor: '#2563eb',      // TGD blue
  gateColor: '#16a34a',       // Green
  warningColor: '#dc2626',    // Red
  spigotColor: '#6b7280',     // Grey
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fenceThickness: 20,
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Render a 2D top-down SVG schematic of the fence layout.
 *
 * @param runs       The decomposed runs from geometry
 * @param results    Fitting results for each run (same order as runs)
 * @param options    Rendering options
 * @returns          SVG markup as a string
 */
export function renderSchematic(
  runs: Run[],
  results: FittingResult[],
  options: Partial<SchematicOptions> = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Calculate the bounding box of all runs (in mm)
  const bounds = calculateBounds(runs);

  // Calculate scale to fit within canvas
  const drawWidth = opts.canvasWidth - 2 * opts.padding;
  const drawHeight = opts.canvasHeight - 2 * opts.padding;
  const scaleX = drawWidth / Math.max(bounds.width, 1);
  const scaleY = drawHeight / Math.max(bounds.height || 1, bounds.width * 0.3); // Ensure aspect for inline
  const scale = Math.min(scaleX, scaleY);

  // Transform: mm → px
  const toX = (mm: number) => opts.padding + (mm - bounds.minX) * scale;
  const toY = (mm: number) => opts.padding + (mm - bounds.minY) * scale;

  // Build SVG elements
  const elements: string[] = [];

  // Background
  elements.push(`<rect width="${opts.canvasWidth}" height="${opts.canvasHeight}" fill="${opts.backgroundColor}" />`);

  // Render each run
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    const result = results[i];
    if (!result) continue;

    elements.push(...renderRun(run, result, opts, toX, toY, scale));
  }

  // Wrap in SVG
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${opts.canvasWidth} ${opts.canvasHeight}" width="${opts.canvasWidth}" height="${opts.canvasHeight}">`,
    `  <style>`,
    `    .panel-label { font: 10px Inter, sans-serif; fill: white; text-anchor: middle; dominant-baseline: central; }`,
    `    .dim-label { font: 9px Inter, sans-serif; fill: ${opts.textColor}; text-anchor: middle; dominant-baseline: auto; }`,
    `    .gap-label { font: 8px Inter, sans-serif; fill: ${opts.warningColor}; text-anchor: middle; dominant-baseline: central; }`,
    `    .run-label { font: bold 11px Inter, sans-serif; fill: ${opts.textColor}; }`,
    `  </style>`,
    ...elements,
    `</svg>`,
  ].join('\n');
}

// ─── Run Rendering ───────────────────────────────────────────────────────────

function renderRun(
  run: Run,
  result: FittingResult,
  opts: SchematicOptions,
  toX: (mm: number) => number,
  toY: (mm: number) => number,
  scale: number,
): string[] {
  const elements: string[] = [];
  const isHorizontal = run.direction === 'right' || run.direction === 'left';
  const thickness = opts.fenceThickness;

  // Render panels
  for (const placement of result.panels) {
    elements.push(...renderPanel(run, placement, opts, toX, toY, scale, thickness, isHorizontal));
  }

  // Render gate
  if (result.gate) {
    elements.push(...renderGate(run, result.gate, opts, toX, toY, scale, thickness, isHorizontal));
  }

  // Render spigots
  for (const spigot of result.spigots) {
    elements.push(...renderSpigot(run, spigot, opts, toX, toY, scale, thickness, isHorizontal));
  }

  // Render gap indicators
  if (opts.showGaps) {
    for (const gap of result.gaps) {
      if (!gap.compliant) {
        elements.push(...renderGapWarning(run, gap, opts, toX, toY, scale, thickness, isHorizontal));
      }
    }
  }

  // Run dimension label
  if (opts.showDimensions) {
    elements.push(renderRunDimension(run, opts, toX, toY, scale, thickness, isHorizontal));
  }

  return elements;
}

// ─── Element Renderers ───────────────────────────────────────────────────────

function renderPanel(
  run: Run,
  placement: PanelPlacement,
  opts: SchematicOptions,
  toX: (mm: number) => number,
  toY: (mm: number) => number,
  scale: number,
  thickness: number,
  isHorizontal: boolean,
): string[] {
  const elements: string[] = [];

  if (isHorizontal) {
    const x = toX(run.start.x + placement.startMm);
    const y = toY(run.start.y) - thickness / 2;
    const w = placement.panel.width * scale;

    elements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${thickness}" fill="${opts.panelColor}" rx="2" />`,
    );

    // Panel width label
    if (opts.showDimensions && w > 30) {
      elements.push(
        `<text x="${x + w / 2}" y="${y + thickness / 2}" class="panel-label">${placement.panel.width}</text>`,
      );
    }
  } else {
    const x = toX(run.start.x) - thickness / 2;
    const y = toY(run.start.y + placement.startMm);
    const h = placement.panel.width * scale;

    elements.push(
      `<rect x="${x}" y="${y}" width="${thickness}" height="${h}" fill="${opts.panelColor}" rx="2" />`,
    );

    if (opts.showDimensions && h > 30) {
      elements.push(
        `<text x="${x + thickness / 2}" y="${y + h / 2}" class="panel-label" transform="rotate(-90, ${x + thickness / 2}, ${y + h / 2})">${placement.panel.width}</text>`,
      );
    }
  }

  return elements;
}

function renderGate(
  run: Run,
  gate: GatePlacement,
  opts: SchematicOptions,
  toX: (mm: number) => number,
  toY: (mm: number) => number,
  scale: number,
  thickness: number,
  isHorizontal: boolean,
): string[] {
  const elements: string[] = [];

  if (isHorizontal) {
    const x = toX(run.start.x + gate.startMm);
    const y = toY(run.start.y) - thickness / 2;
    const w = gate.width * scale;

    elements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${thickness}" fill="${opts.gateColor}" rx="2" stroke="${opts.gateColor}" stroke-dasharray="4,2" />`,
    );

    if (opts.showDimensions && w > 30) {
      elements.push(
        `<text x="${x + w / 2}" y="${y + thickness / 2}" class="panel-label">GATE ${gate.width}</text>`,
      );
    }
  } else {
    const x = toX(run.start.x) - thickness / 2;
    const y = toY(run.start.y + gate.startMm);
    const h = gate.width * scale;

    elements.push(
      `<rect x="${x}" y="${y}" width="${thickness}" height="${h}" fill="${opts.gateColor}" rx="2" stroke="${opts.gateColor}" stroke-dasharray="4,2" />`,
    );

    if (opts.showDimensions && h > 30) {
      elements.push(
        `<text x="${x + thickness / 2}" y="${y + h / 2}" class="panel-label" transform="rotate(-90, ${x + thickness / 2}, ${y + h / 2})">GATE ${gate.width}</text>`,
      );
    }
  }

  return elements;
}

function renderSpigot(
  run: Run,
  spigot: SpigotPlacement,
  opts: SchematicOptions,
  toX: (mm: number) => number,
  toY: (mm: number) => number,
  _scale: number,
  thickness: number,
  isHorizontal: boolean,
): string[] {
  const radius = thickness / 3;

  if (isHorizontal) {
    const cx = toX(run.start.x + spigot.positionMm);
    const cy = toY(run.start.y);
    return [`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${opts.spigotColor}" />`];
  } else {
    const cx = toX(run.start.x);
    const cy = toY(run.start.y + spigot.positionMm);
    return [`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${opts.spigotColor}" />`];
  }
}

function renderGapWarning(
  run: Run,
  gap: Gap,
  opts: SchematicOptions,
  toX: (mm: number) => number,
  toY: (mm: number) => number,
  scale: number,
  thickness: number,
  isHorizontal: boolean,
): string[] {
  const midMm = (gap.startMm + gap.endMm) / 2;

  if (isHorizontal) {
    const x = toX(run.start.x + gap.startMm);
    const y = toY(run.start.y) + thickness / 2 + 12;
    return [
      `<text x="${toX(run.start.x + midMm)}" y="${y}" class="gap-label">⚠ ${Math.round(gap.width)}mm</text>`,
    ];
  } else {
    const x = toX(run.start.x) + thickness / 2 + 5;
    const y = toY(run.start.y + midMm);
    return [
      `<text x="${x}" y="${y}" class="gap-label">⚠ ${Math.round(gap.width)}mm</text>`,
    ];
  }
}

function renderRunDimension(
  run: Run,
  opts: SchematicOptions,
  toX: (mm: number) => number,
  toY: (mm: number) => number,
  scale: number,
  thickness: number,
  isHorizontal: boolean,
): string {
  if (isHorizontal) {
    const x1 = toX(run.start.x);
    const x2 = toX(run.end.x);
    const y = toY(run.start.y) - thickness / 2 - 15;
    const mid = (x1 + x2) / 2;
    return `<text x="${mid}" y="${y}" class="dim-label">${run.length}mm</text>`;
  } else {
    const x = toX(run.start.x) - thickness / 2 - 10;
    const y1 = toY(run.start.y);
    const y2 = toY(run.end.y);
    const mid = (y1 + y2) / 2;
    return `<text x="${x}" y="${mid}" class="dim-label" transform="rotate(-90, ${x}, ${mid})">${run.length}mm</text>`;
  }
}

// ─── Bounds Calculation ──────────────────────────────────────────────────────

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

function calculateBounds(runs: Run[]): Bounds {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const run of runs) {
    minX = Math.min(minX, run.start.x, run.end.x);
    minY = Math.min(minY, run.start.y, run.end.y);
    maxX = Math.max(maxX, run.start.x, run.end.x);
    maxY = Math.max(maxY, run.start.y, run.end.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
