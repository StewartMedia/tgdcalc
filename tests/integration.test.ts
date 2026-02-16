import { describe, it, expect } from 'vitest';
import { calculate, DEFAULT_SETTINGS } from '../calculator/index.js';
import { renderSchematic } from '../renderer/schematic.js';
import type { CalculatorSettings } from '../calculator/types.js';

/**
 * Full integration tests — exercise the complete pipeline:
 * Shape config → Decompose → Fit → Validate → BOM → Render
 */

describe('Integration: Inline configurations', () => {
  it('3000mm basic fence', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 3000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.runs).toHaveLength(1);
    expect(result.bom.subtotal).toBeGreaterThan(0);
    expect(result.bom.total).toBeGreaterThan(result.bom.subtotal); // GST added

    // Verify all gaps compliant
    for (const r of result.fittingResults) {
      for (const g of r.gaps) {
        expect(g.compliant).toBe(true);
      }
    }

    // Verify SVG renders
    const svg = renderSchematic(result.runs, result.fittingResults);
    expect(svg).toContain('<svg');
  });

  it('5000mm with 900mm gate', () => {
    const result = calculate({
      shape: {
        shape: 'inline',
        length: 5000,
        gate: { position: 2000, width: 900 },
      },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);

    // Should have panels on both sides of gate
    const fittingResult = result.fittingResults[0];
    expect(fittingResult.gate).toBeDefined();
    expect(fittingResult.gate!.width).toBe(900);

    // BOM should include gate panel
    const gateItem = result.bom.items.find(i => i.type === 'gate-panel');
    expect(gateItem).toBeDefined();

    // Panel items should exist
    const panelItems = result.bom.items.filter(i => i.type === 'panel');
    expect(panelItems.length).toBeGreaterThan(0);

    // All gaps compliant
    for (const g of fittingResult.gaps) {
      expect(g.width).toBeLessThanOrEqual(100);
    }
  });

  it('10000mm long fence (5 panels minimum)', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 10000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);

    const totalPanels = result.fittingResults[0].panels.length;
    expect(totalPanels).toBeGreaterThanOrEqual(5);

    // Verify the total panel width + gaps = run length
    const totalPanelWidth = result.fittingResults[0].panels.reduce(
      (sum, p) => sum + p.panel.width, 0
    );
    const totalGapWidth = result.fittingResults[0].gaps.reduce(
      (sum, g) => sum + g.width, 0
    );
    expect(totalPanelWidth + totalGapWidth).toBeCloseTo(10000, 0);
  });
});

describe('Integration: L-shape configurations', () => {
  it('5000mm × 3000mm L-shape', () => {
    const result = calculate({
      shape: { shape: 'l-shape', side1Length: 5000, side2Length: 3000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.runs).toHaveLength(2);
    expect(result.fittingResults).toHaveLength(2);

    // Both sides should be compliant
    expect(result.fittingResults[0].success).toBe(true);
    expect(result.fittingResults[1].success).toBe(true);

    // BOM should have panels from both sides
    expect(result.bom.items.length).toBeGreaterThan(0);
    expect(result.bom.subtotal).toBeGreaterThan(0);
  });

  it('L-shape with gate on side 1', () => {
    const result = calculate({
      shape: {
        shape: 'l-shape',
        side1Length: 5000,
        side2Length: 3000,
        gate: { side: 1, position: 2000, width: 900 },
      },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);

    // Gate should be on run-1 only
    expect(result.fittingResults[0].gate).toBeDefined();
    expect(result.fittingResults[1].gate).toBeUndefined();
  });

  it('L-shape with spigots in BOM (shared corner deducted)', () => {
    const settingsWithSpigots: CalculatorSettings = {
      ...DEFAULT_SETTINGS,
      includeSpigots: true,
    };

    const result = calculate({
      shape: { shape: 'l-shape', side1Length: 5000, side2Length: 3000 },
      settings: settingsWithSpigots,
    });

    const spigotItem = result.bom.items.find(i => i.type === 'spigot');
    expect(spigotItem).toBeDefined();

    // Should be (side1_spigots + side2_spigots - 1 shared corner)
    const side1Spigots = result.fittingResults[0].spigots.length;
    const side2Spigots = result.fittingResults[1].spigots.length;
    expect(spigotItem!.quantity).toBe(side1Spigots + side2Spigots - 1);
  });
});

describe('Integration: Rectangle configurations', () => {
  it('6000mm × 4000mm rectangle', () => {
    const result = calculate({
      shape: { shape: 'rectangle', width: 6000, height: 4000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.runs).toHaveLength(4);
    expect(result.fittingResults).toHaveLength(4);

    // All sides should be compliant
    for (const r of result.fittingResults) {
      expect(r.success).toBe(true);
    }

    // Opposite sides should have similar (not necessarily identical) panel counts
    const side1Panels = result.fittingResults[0].panels.length;
    const side3Panels = result.fittingResults[2].panels.length;
    expect(side1Panels).toBe(side3Panels); // Same length → same panel count

    const side2Panels = result.fittingResults[1].panels.length;
    const side4Panels = result.fittingResults[3].panels.length;
    expect(side2Panels).toBe(side4Panels); // Same length → same panel count

    // BOM should be substantial
    expect(result.bom.subtotal).toBeGreaterThan(500);
  });

  it('rectangle with gate on side 3', () => {
    const result = calculate({
      shape: {
        shape: 'rectangle',
        width: 6000,
        height: 4000,
        gate: { side: 3, position: 2500, width: 900 },
      },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);

    // Gate only on side 3
    expect(result.fittingResults[0].gate).toBeUndefined();
    expect(result.fittingResults[1].gate).toBeUndefined();
    expect(result.fittingResults[2].gate).toBeDefined();
    expect(result.fittingResults[3].gate).toBeUndefined();
  });

  it('rectangle with spigots (4 shared corners deducted)', () => {
    const result = calculate({
      shape: { shape: 'rectangle', width: 6000, height: 4000 },
      settings: { ...DEFAULT_SETTINGS, includeSpigots: true },
    });

    const spigotItem = result.bom.items.find(i => i.type === 'spigot');
    expect(spigotItem).toBeDefined();

    const totalFromRuns = result.fittingResults.reduce(
      (sum, r) => sum + r.spigots.length, 0
    );
    expect(spigotItem!.quantity).toBe(totalFromRuns - 4);
  });
});

describe('Integration: Edge cases', () => {
  it('minimum valid run (220mm)', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 220 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.fittingResults[0].panels).toHaveLength(1);
    expect(result.fittingResults[0].panels[0].panel.width).toBe(100);
  });

  it('run too short (100mm) returns failure', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 100 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(false);
    expect(result.bom.warnings.length).toBeGreaterThan(0);
  });

  it('BOM handles are valid product handles', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: DEFAULT_SETTINGS,
    });

    for (const item of result.bom.items) {
      if (item.type === 'panel') {
        expect(item.handle).toMatch(/^gp-12mm-\d{4}mm$/);
      }
    }
  });

  it('full pipeline produces renderable SVG', () => {
    const configs = [
      { shape: 'inline' as const, length: 5000 },
      { shape: 'l-shape' as const, side1Length: 4000, side2Length: 3000 },
      { shape: 'rectangle' as const, width: 6000, height: 4000 },
    ];

    for (const shape of configs) {
      const result = calculate({ shape, settings: DEFAULT_SETTINGS });
      const svg = renderSchematic(result.runs, result.fittingResults);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    }
  });
});
