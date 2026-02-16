import type {
  Run,
  GateConfig,
  FittingResult,
  PanelPlacement,
  GatePlacement,
  SpigotPlacement,
  Gap,
  ValidationWarning,
  PanelSize,
  CalculatorSettings,
} from './types.js';
import { PANELS_DESCENDING, MIN_PANEL_WIDTH, getPanelByWidth } from './catalogue.js';
import { validateGaps, validateRunLength, validateGatePosition } from './gap-validator.js';

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fit panels into a single straight run.
 *
 * If the run has a gate, the run is split into two sub-sections
 * (left of gate, right of gate) and each is fitted independently.
 */
export function fitRun(run: Run, settings: CalculatorSettings): FittingResult {
  const warnings: ValidationWarning[] = [];

  // Validate run length
  const lengthWarnings = validateRunLength(run.length, settings.spigotWidth);
  if (lengthWarnings.length > 0) {
    return {
      runId: run.id,
      success: false,
      panels: [],
      gaps: [],
      spigots: [],
      warnings: lengthWarnings,
    };
  }

  // If gate present, split into two sub-runs
  if (run.gate) {
    return fitRunWithGate(run, run.gate, settings);
  }

  // No gate — fit the whole run as one section
  return fitSection(run.id, run.length, 0, settings);
}

// ─── Gate Handling ───────────────────────────────────────────────────────────

function fitRunWithGate(
  run: Run,
  gate: GateConfig,
  settings: CalculatorSettings,
): FittingResult {
  const warnings: ValidationWarning[] = [];

  // Validate gate position
  const gateWarnings = validateGatePosition(gate, run.length);
  if (gateWarnings.length > 0) {
    return {
      runId: run.id,
      success: false,
      panels: [],
      gaps: [],
      spigots: [],
      warnings: gateWarnings,
    };
  }

  const gateStart = gate.position;
  const gateEnd = gate.position + gate.width;

  // Left section: from run start to gate start
  // The gate has a spigot on each side, so the left section ends at (gateStart - spigotWidth)
  // and the right section starts at (gateEnd + spigotWidth)
  // Actually, the spigots flanking the gate are part of their respective sections.
  const leftLength = gateStart;
  const rightLength = run.length - gateEnd;

  // Fit left section
  const leftResult = leftLength > 0
    ? fitSection(run.id + '-left', leftLength, 0, settings)
    : emptySection(run.id + '-left');

  // Fit right section (offset by gate end position)
  const rightResult = rightLength > 0
    ? fitSection(run.id + '-right', rightLength, gateEnd, settings)
    : emptySection(run.id + '-right');

  // Gate placement
  const gatePlacement: GatePlacement = {
    startMm: gateStart,
    endMm: gateEnd,
    width: gate.width,
    panelType: gate.panelType ?? 'standard-8mm',
  };

  // Merge results
  const allPanels = [...leftResult.panels, ...rightResult.panels];
  const allGaps = [...leftResult.gaps, ...rightResult.gaps];
  const allSpigots = [...leftResult.spigots, ...rightResult.spigots];
  const allWarnings = [...warnings, ...leftResult.warnings, ...rightResult.warnings];

  // Add gate-flanking spigots
  allSpigots.push(
    { positionMm: gateStart, shared: false },
    { positionMm: gateEnd, shared: false },
  );

  return {
    runId: run.id,
    success: leftResult.success && rightResult.success,
    panels: allPanels,
    gaps: allGaps,
    gate: gatePlacement,
    spigots: allSpigots,
    warnings: allWarnings,
  };
}

// ─── Section Fitting (core greedy algorithm) ─────────────────────────────────

/**
 * Fit panels into a straight section of fence (no gate).
 *
 * @param sectionId  Identifier for this section
 * @param length     Section length in mm
 * @param offset     Start position offset in mm (for right-of-gate sections)
 * @param settings   Calculator settings
 */
function fitSection(
  sectionId: string,
  length: number,
  offset: number,
  settings: CalculatorSettings,
): FittingResult {
  const { spigotWidth, maxGapWidth } = settings;

  // Try fitting with increasing panel counts until gaps are compliant
  // Start with the minimum panel count (greedy: fewest panels)
  const minPanels = Math.max(1, Math.ceil(length / (MAX_PANEL_WIDTH_WITH_GAP(maxGapWidth, spigotWidth))));
  const maxPanels = Math.ceil(length / (MIN_PANEL_WIDTH + spigotWidth));

  for (let numPanels = minPanels; numPanels <= maxPanels; numPanels++) {
    const result = tryFitWithPanelCount(sectionId, length, offset, numPanels, settings);
    if (result) {
      return result;
    }
  }

  // If we get here, no valid fit was found
  return {
    runId: sectionId,
    success: false,
    panels: [],
    gaps: [],
    spigots: [],
    warnings: [{
      type: 'NO_VALID_FIT',
      severity: 'error',
      message: `Cannot fit panels into ${length}mm section while keeping gaps ≤ ${maxGapWidth}mm. Try adjusting the run length.`,
    }],
  };
}

/**
 * Attempt to fit exactly N panels into the section.
 *
 * Strategy:
 * 1. Calculate total space available for panels (section length minus gap space)
 * 2. Divide evenly among N panels
 * 3. Snap each panel to the nearest catalogue size
 * 4. Distribute remaining space as gaps
 * 5. Validate all gaps ≤ maxGapWidth
 */
function tryFitWithPanelCount(
  sectionId: string,
  length: number,
  offset: number,
  numPanels: number,
  settings: CalculatorSettings,
): FittingResult | null {
  const { spigotWidth, maxGapWidth } = settings;
  const numGaps = numPanels + 1;

  // Total space that gaps+spigots occupy (minimum: one spigot per gap position)
  // Each gap position has a spigot in it. The gap is the clear space on either side.
  // For simplicity: gap = clear space between panel edge and spigot edge
  // Total gap allocation = section length - total panel width
  // Each gap position needs at least spigotWidth, and the clear space on each side ≤ maxGapWidth

  // Calculate ideal panel width if divided evenly
  // Minimum gap space: numGaps × spigotWidth (just the spigots, no extra clear gap)
  const minTotalGapSpace = numGaps * spigotWidth;
  const maxTotalPanelSpace = length - minTotalGapSpace;

  if (maxTotalPanelSpace <= 0) {
    return null; // Not enough room for panels
  }

  // Target width per panel (will be snapped to catalogue)
  const targetWidth = maxTotalPanelSpace / numPanels;

  // Select panels by snapping to nearest available catalogue size
  const selectedPanels = selectPanels(targetWidth, numPanels, maxTotalPanelSpace);
  if (!selectedPanels) {
    return null;
  }

  const totalPanelWidth = selectedPanels.reduce((sum, p) => sum + p.width, 0);
  const totalGapSpace = length - totalPanelWidth;

  if (totalGapSpace < 0) {
    return null; // Panels too wide
  }

  // Distribute gaps evenly
  const gapWidth = totalGapSpace / numGaps;

  if (gapWidth > maxGapWidth) {
    return null; // Gaps too large
  }

  if (gapWidth < 0) {
    return null; // Shouldn't happen, but safety check
  }

  // Build placement objects with positions
  const placements = buildPlacements(selectedPanels, gapWidth, offset);
  const gaps = buildGaps(selectedPanels, gapWidth, offset, length, maxGapWidth);
  const spigots = buildSpigots(gaps, offset);

  // Final gap validation
  const gapWarnings = validateGaps(gaps, maxGapWidth);

  return {
    runId: sectionId,
    success: gapWarnings.length === 0,
    panels: placements,
    gaps,
    spigots,
    warnings: gapWarnings,
  };
}

// ─── Panel Selection ─────────────────────────────────────────────────────────

/**
 * Select N panels that best fit the available space.
 *
 * Strategy: snap each panel to the nearest catalogue size (rounding down to avoid
 * exceeding available space), then adjust the last panel to absorb remainder.
 */
function selectPanels(
  targetWidth: number,
  count: number,
  maxTotalWidth: number,
): PanelSize[] | null {
  const panels: PanelSize[] = [];
  let remainingWidth = maxTotalWidth;

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const targetForThis = isLast ? remainingWidth : targetWidth;

    // Find the largest catalogue panel that doesn't exceed our target
    const panel = findBestPanel(targetForThis);
    if (!panel) {
      return null; // Can't find a panel small enough
    }

    panels.push(panel);
    remainingWidth -= panel.width;

    // If remaining width is negative, we've overshot
    if (remainingWidth < 0 && !isLast) {
      return null;
    }
  }

  // Check total doesn't exceed max
  const total = panels.reduce((sum, p) => sum + p.width, 0);
  if (total > maxTotalWidth) {
    // Try reducing the last panel
    const lastPanel = panels[panels.length - 1];
    const overshoot = total - maxTotalWidth;
    const adjustedWidth = lastPanel.width - overshoot;
    const adjusted = findBestPanel(adjustedWidth);
    if (!adjusted) {
      return null;
    }
    panels[panels.length - 1] = adjusted;
  }

  return panels;
}

/**
 * Find the largest catalogue panel with width ≤ targetWidth.
 * Falls back to the smallest panel if target is very small.
 */
function findBestPanel(targetWidth: number): PanelSize | null {
  if (targetWidth < MIN_PANEL_WIDTH) {
    return null;
  }

  // Snap down to nearest 50mm increment
  const snapped = Math.floor(targetWidth / 50) * 50;
  const clamped = Math.max(MIN_PANEL_WIDTH, Math.min(snapped, PANELS_DESCENDING[0].width));

  return getPanelByWidth(clamped) ?? null;
}

// ─── Placement Builders ──────────────────────────────────────────────────────

function buildPlacements(
  panels: PanelSize[],
  gapWidth: number,
  offset: number,
): PanelPlacement[] {
  const placements: PanelPlacement[] = [];
  let cursor = offset + gapWidth; // Start after first gap

  for (const panel of panels) {
    placements.push({
      panel,
      startMm: cursor,
      endMm: cursor + panel.width,
    });
    cursor += panel.width + gapWidth;
  }

  return placements;
}

function buildGaps(
  panels: PanelSize[],
  gapWidth: number,
  offset: number,
  sectionLength: number,
  maxGapWidth: number,
): Gap[] {
  const gaps: Gap[] = [];
  let cursor = offset;

  // Leading gap
  gaps.push({
    startMm: cursor,
    endMm: cursor + gapWidth,
    width: gapWidth,
    compliant: gapWidth <= maxGapWidth,
  });
  cursor += gapWidth;

  for (let i = 0; i < panels.length; i++) {
    cursor += panels[i].width;

    // Gap after this panel
    const isLast = i === panels.length - 1;
    // For the last gap, use remaining space to absorb rounding
    const thisGapWidth = isLast
      ? (offset + sectionLength) - cursor
      : gapWidth;

    gaps.push({
      startMm: cursor,
      endMm: cursor + thisGapWidth,
      width: thisGapWidth,
      compliant: thisGapWidth <= maxGapWidth,
    });
    cursor += thisGapWidth;
  }

  return gaps;
}

function buildSpigots(gaps: Gap[], _offset: number): SpigotPlacement[] {
  // A spigot sits in the centre of each gap
  return gaps.map(gap => ({
    positionMm: (gap.startMm + gap.endMm) / 2,
    shared: false,
  }));
}

function emptySection(sectionId: string): FittingResult {
  return {
    runId: sectionId,
    success: true,
    panels: [],
    gaps: [],
    spigots: [],
    warnings: [],
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maximum panel width considering that each panel has a gap on each side,
 * and the gap must be ≤ maxGapWidth. For a single-panel section:
 * length = gap + panel + gap = (2 × maxGapWidth) + panel
 * So max panel = length - 2 × minGap
 *
 * But for calculating minimum panel count:
 * maxSectionPerPanel = maxPanelWidth + maxGapWidth (one gap per panel, roughly)
 */
function MAX_PANEL_WIDTH_WITH_GAP(maxGap: number, spigotWidth: number): number {
  return PANELS_DESCENDING[0].width + maxGap + spigotWidth;
}
