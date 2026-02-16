import type { Gap, GateConfig, ValidationWarning } from './types.js';
import { MIN_PANEL_WIDTH } from './catalogue.js';

/**
 * Validate that all gaps in a fitting are AS 1926.1 compliant.
 *
 * AS 1926.1-2012 requires that no gap in a pool fence exceeds 100mm.
 * This is the critical safety check — non-compliant gaps could allow
 * a child to pass through the fence.
 */
export function validateGaps(gaps: Gap[], maxGapWidth: number): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const gap of gaps) {
    if (gap.width > maxGapWidth) {
      warnings.push({
        type: 'GAP_EXCEEDS_LIMIT',
        severity: 'error',
        message: `Gap of ${Math.round(gap.width)}mm at position ${Math.round(gap.startMm)}mm exceeds the ${maxGapWidth}mm maximum (AS 1926.1).`,
        positionMm: gap.startMm,
      });
    }

    if (gap.width < 0) {
      warnings.push({
        type: 'GAP_TOO_NARROW',
        severity: 'error',
        message: `Negative gap of ${Math.round(gap.width)}mm at position ${Math.round(gap.startMm)}mm — panels overlap.`,
        positionMm: gap.startMm,
      });
    }
  }

  return warnings;
}

/**
 * Validate that a run length is physically possible.
 *
 * Minimum run = smallest panel (100mm) + 2 gaps (at least spigotWidth each)
 */
export function validateRunLength(
  length: number,
  spigotWidth: number,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (length <= 0) {
    warnings.push({
      type: 'RUN_TOO_SHORT',
      severity: 'error',
      message: `Run length must be greater than 0mm.`,
    });
    return warnings;
  }

  const minLength = MIN_PANEL_WIDTH + 2 * spigotWidth;
  if (length < minLength) {
    warnings.push({
      type: 'RUN_TOO_SHORT',
      severity: 'error',
      message: `Run length of ${length}mm is too short. Minimum is ${minLength}mm (${MIN_PANEL_WIDTH}mm panel + 2× ${spigotWidth}mm spigots).`,
    });
  }

  return warnings;
}

/**
 * Validate gate position within a run.
 */
export function validateGatePosition(
  gate: GateConfig,
  runLength: number,
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (gate.position < 0) {
    warnings.push({
      type: 'GATE_POSITION_INVALID',
      severity: 'error',
      message: `Gate position (${gate.position}mm) cannot be negative.`,
    });
  }

  if (gate.position + gate.width > runLength) {
    warnings.push({
      type: 'GATE_POSITION_INVALID',
      severity: 'error',
      message: `Gate extends beyond run. Gate ends at ${gate.position + gate.width}mm but run is only ${runLength}mm.`,
    });
  }

  if (gate.width <= 0) {
    warnings.push({
      type: 'GATE_POSITION_INVALID',
      severity: 'error',
      message: `Gate width must be greater than 0mm.`,
    });
  }

  return warnings;
}
