import { describe, it, expect } from 'vitest';
import { calculate, DEFAULT_SETTINGS } from '../calculator/index.js';
import type { CalculatorSettings } from '../calculator/types.js';

describe('BOM generation — inline', () => {
  it('generates panel line items for a simple run', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.bom.items.length).toBeGreaterThan(0);

    // All items should be panels (no spigots by default)
    for (const item of result.bom.items) {
      expect(item.type).toBe('panel');
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.unitPrice).toBeGreaterThan(0);
      expect(item.lineTotal).toBe(item.unitPrice * item.quantity);
    }
  });

  it('calculates correct subtotal', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 3000 },
      settings: DEFAULT_SETTINGS,
    });

    const expectedSubtotal = result.bom.items.reduce((sum, item) => sum + item.lineTotal, 0);
    expect(result.bom.subtotal).toBeCloseTo(expectedSubtotal, 2);
  });

  it('calculates GST at 10%', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 3000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.bom.gst).toBeCloseTo(result.bom.subtotal * 0.1, 2);
    expect(result.bom.total).toBeCloseTo(result.bom.subtotal + result.bom.gst, 2);
  });

  it('aggregates duplicate panels', () => {
    // A long run should use multiple panels of the same size
    const result = calculate({
      shape: { shape: 'inline', length: 10000 },
      settings: DEFAULT_SETTINGS,
    });

    // Check that BOM has fewer line items than total panels (due to aggregation)
    const totalPanelQty = result.bom.items
      .filter(i => i.type === 'panel')
      .reduce((sum, i) => sum + i.quantity, 0);

    const totalFittedPanels = result.fittingResults.reduce(
      (sum, r) => sum + r.panels.length, 0
    );

    expect(totalPanelQty).toBe(totalFittedPanels);
  });
});

describe('BOM generation — with spigots', () => {
  const settingsWithSpigots: CalculatorSettings = {
    ...DEFAULT_SETTINGS,
    includeSpigots: true,
  };

  it('includes spigots when enabled', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: settingsWithSpigots,
    });

    const spigotItems = result.bom.items.filter(i => i.type === 'spigot');
    expect(spigotItems).toHaveLength(1);
    expect(spigotItems[0].quantity).toBeGreaterThan(0);
  });

  it('has correct spigot count for inline (panels + 1)', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: settingsWithSpigots,
    });

    const totalPanels = result.fittingResults[0].panels.length;
    const spigotItem = result.bom.items.find(i => i.type === 'spigot');
    // Inline: spigots = panels + 1 (one in each gap)
    expect(spigotItem!.quantity).toBe(totalPanels + 1);
  });
});

describe('BOM generation — L-shape', () => {
  it('generates BOM across both sides', () => {
    const result = calculate({
      shape: { shape: 'l-shape', side1Length: 5000, side2Length: 3000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.fittingResults).toHaveLength(2);
    expect(result.bom.items.length).toBeGreaterThan(0);
  });

  it('accounts for shared corner in spigot count', () => {
    const result = calculate({
      shape: { shape: 'l-shape', side1Length: 5000, side2Length: 3000 },
      settings: { ...DEFAULT_SETTINGS, includeSpigots: true },
    });

    const totalPanelsRun1 = result.fittingResults[0].panels.length;
    const totalPanelsRun2 = result.fittingResults[1].panels.length;
    const spigotItem = result.bom.items.find(i => i.type === 'spigot');

    // L-shape: (panels1 + 1) + (panels2 + 1) - 1 shared corner
    const expectedSpigots = (totalPanelsRun1 + 1) + (totalPanelsRun2 + 1) - 1;
    expect(spigotItem!.quantity).toBe(expectedSpigots);
  });
});

describe('BOM generation — rectangle', () => {
  it('generates BOM across all 4 sides', () => {
    const result = calculate({
      shape: { shape: 'rectangle', width: 6000, height: 4000 },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    expect(result.fittingResults).toHaveLength(4);
    expect(result.bom.items.length).toBeGreaterThan(0);
    expect(result.bom.subtotal).toBeGreaterThan(0);
  });

  it('accounts for 4 shared corners in spigot count', () => {
    const result = calculate({
      shape: { shape: 'rectangle', width: 6000, height: 4000 },
      settings: { ...DEFAULT_SETTINGS, includeSpigots: true },
    });

    const totalSpigots = result.fittingResults.reduce(
      (sum, r) => sum + r.spigots.length, 0
    );
    const spigotItem = result.bom.items.find(i => i.type === 'spigot');

    // Rectangle: total spigots - 4 shared corners
    expect(spigotItem!.quantity).toBe(totalSpigots - 4);
  });
});

describe('BOM generation — with gate', () => {
  it('includes gate panel in BOM', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000, gate: { position: 2000, width: 900 } },
      settings: DEFAULT_SETTINGS,
    });

    expect(result.success).toBe(true);
    const gateItems = result.bom.items.filter(i => i.type === 'gate-panel');
    expect(gateItems).toHaveLength(1);
    expect(gateItems[0].handle).toMatch(/^gg-8mm/);
  });
});
