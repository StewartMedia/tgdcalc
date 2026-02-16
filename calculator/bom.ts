import type {
  FittingResult,
  BOMLineItem,
  BOMResult,
  CalculatorSettings,
  ShapeConfig,
  ValidationWarning,
  GateHardwareConfig,
} from './types.js';
import { GATE_PANELS_8MM, SPIGOTS } from './catalogue.js';
import { getSharedCornerCount } from './geometry.js';

/**
 * Generate a complete Bill of Materials from fitting results across all runs.
 *
 * Aggregates panels, calculates spigot counts (accounting for shared corners),
 * and includes gate hardware (when configured).
 */
export function generateBOM(
  fittingResults: FittingResult[],
  shapeConfig: ShapeConfig,
  settings: CalculatorSettings,
): BOMResult {
  const items: BOMLineItem[] = [];
  const allWarnings: ValidationWarning[] = [];

  // ── 1. Panel line items (aggregate across all runs) ──────────────────────
  const panelCounts = new Map<string, { panel: FittingResult['panels'][0]['panel']; qty: number }>();

  for (const result of fittingResults) {
    allWarnings.push(...result.warnings);

    for (const placement of result.panels) {
      const key = placement.panel.handle;
      const existing = panelCounts.get(key);
      if (existing) {
        existing.qty += 1;
      } else {
        panelCounts.set(key, { panel: placement.panel, qty: 1 });
      }
    }
  }

  for (const [_handle, { panel, qty }] of panelCounts) {
    items.push({
      type: 'panel',
      handle: panel.handle,
      description: `12mm Glass Panel ${panel.width}mm × ${panel.height}mm`,
      quantity: qty,
      unitPrice: panel.price,
      lineTotal: roundCents(panel.price * qty),
    });
  }

  // ── 2. Gate hardware (per run that has a gate) ───────────────────────────
  for (const result of fittingResults) {
    if (result.gate) {
      const gateItems = generateGateHardwareBOM(result.gate, settings.gateHardwareDefaults);
      items.push(...gateItems);
    }
  }

  // ── 3. Spigots ──────────────────────────────────────────────────────────
  if (settings.includeSpigots) {
    const spigotItems = generateSpigotBOM(fittingResults, shapeConfig, settings);
    items.push(...spigotItems);
  }

  // ── 4. Totals ───────────────────────────────────────────────────────────
  const subtotal = roundCents(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const gst = roundCents(subtotal * 0.1);
  const total = roundCents(subtotal + gst);

  return {
    items,
    subtotal,
    gst,
    total,
    warnings: allWarnings,
  };
}

// ─── Gate Hardware BOM ───────────────────────────────────────────────────────

/**
 * Generate gate hardware line items.
 *
 * Currently a minimal implementation using 8mm standard gate panels.
 * Full hardware selection (hinge type, latch type, finish) pending client config.
 */
function generateGateHardwareBOM(
  gate: FittingResult['gate'],
  hardwareConfig?: GateHardwareConfig,
): BOMLineItem[] {
  if (!gate) return [];

  const items: BOMLineItem[] = [];

  // Gate panel
  const gatePanel = findGatePanel(gate.width, gate.panelType);
  if (gatePanel) {
    items.push({
      type: 'gate-panel',
      handle: gatePanel.handle,
      description: gatePanel.description,
      quantity: 1,
      unitPrice: gatePanel.price,
      lineTotal: gatePanel.price,
    });
  }

  // Hardware (hinges + latch) — stub pending client config
  if (hardwareConfig) {
    if (hardwareConfig.hingeHandle) {
      items.push({
        type: 'hinge',
        handle: hardwareConfig.hingeHandle,
        description: 'Gate Hinge (pair)',
        quantity: 1,
        unitPrice: 0, // Price resolved from Shopify at runtime
        lineTotal: 0,
      });
    }

    if (hardwareConfig.latchHandle) {
      items.push({
        type: 'latch',
        handle: hardwareConfig.latchHandle,
        description: 'Gate Latch Kit',
        quantity: 1,
        unitPrice: 0, // Price resolved from Shopify at runtime
        lineTotal: 0,
      });
    }

    if (hardwareConfig.requiresHingePanel && hardwareConfig.hingePanelHandle) {
      items.push({
        type: 'hinge-panel',
        handle: hardwareConfig.hingePanelHandle,
        description: 'Hinge Panel',
        quantity: 1,
        unitPrice: 0, // Price resolved from Shopify at runtime
        lineTotal: 0,
      });
    }
  }

  return items;
}

function findGatePanel(
  width: number,
  _panelType: string,
): { handle: string; description: string; price: number } | null {
  // Find closest 8mm gate panel
  const closest = GATE_PANELS_8MM
    .filter(p => p.width >= width)
    .sort((a, b) => a.width - b.width)[0];

  if (!closest) {
    // Fall back to largest available
    const largest = GATE_PANELS_8MM[GATE_PANELS_8MM.length - 1];
    return {
      handle: largest.handle,
      description: `8mm Glass Gate Panel ${largest.width}mm × ${largest.height}mm`,
      price: largest.price,
    };
  }

  return {
    handle: closest.handle,
    description: `8mm Glass Gate Panel ${closest.width}mm × ${closest.height}mm`,
    price: closest.price,
  };
}

// ─── Spigot BOM ──────────────────────────────────────────────────────────────

function generateSpigotBOM(
  fittingResults: FittingResult[],
  shapeConfig: ShapeConfig,
  settings: CalculatorSettings,
): BOMLineItem[] {
  // Count total spigots across all runs
  let totalSpigots = 0;
  for (const result of fittingResults) {
    totalSpigots += result.spigots.length;
  }

  // Subtract shared corners (counted once per corner, not twice)
  const sharedCorners = getSharedCornerCount(shapeConfig);
  totalSpigots -= sharedCorners; // Each shared corner was counted in both runs

  if (totalSpigots <= 0) return [];

  // Use default spigot handle or first in catalogue
  const spigotHandle = settings.defaultSpigotHandle ?? SPIGOTS[0].handle;
  const spigot = SPIGOTS.find(s => s.handle === spigotHandle) ?? SPIGOTS[0];

  return [{
    type: 'spigot',
    handle: spigot.handle,
    description: spigot.description,
    quantity: totalSpigots,
    unitPrice: spigot.price,
    lineTotal: roundCents(spigot.price * totalSpigots),
  }];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}
