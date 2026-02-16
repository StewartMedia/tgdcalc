import { describe, it, expect } from 'vitest';
import { fitRun } from '../calculator/fitter.js';
import { DEFAULT_SETTINGS } from '../calculator/index.js';
import type { Run, CalculatorSettings } from '../calculator/types.js';

const settings: CalculatorSettings = { ...DEFAULT_SETTINGS };

function makeRun(length: number, gate?: { position: number; width: number }): Run {
  return {
    id: 'test-run',
    length,
    gate,
    start: { x: 0, y: 0 },
    end: { x: length, y: 0 },
    direction: 'right',
  };
}

describe('fitRun — basic inline runs', () => {
  it('fits a simple 3000mm run', () => {
    const run = makeRun(3000);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.panels.length).toBeGreaterThan(0);
    expect(result.warnings).toHaveLength(0);

    // All gaps should be ≤ 100mm
    for (const gap of result.gaps) {
      expect(gap.width).toBeLessThanOrEqual(100);
      expect(gap.width).toBeGreaterThanOrEqual(0);
    }

    // Total panel width + gap width should equal run length
    const totalPanelWidth = result.panels.reduce((sum, p) => sum + p.panel.width, 0);
    const totalGapWidth = result.gaps.reduce((sum, g) => sum + g.width, 0);
    expect(totalPanelWidth + totalGapWidth).toBeCloseTo(3000, 0);
  });

  it('fits a 5000mm run', () => {
    const run = makeRun(5000);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.panels.length).toBeGreaterThanOrEqual(2);

    for (const gap of result.gaps) {
      expect(gap.width).toBeLessThanOrEqual(100);
    }
  });

  it('fits a short 300mm run', () => {
    const run = makeRun(300);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.panels).toHaveLength(1);
    // Panel should be ≤ 300mm - gaps
    expect(result.panels[0].panel.width).toBeLessThanOrEqual(300);
  });

  it('fits a long 10000mm run', () => {
    const run = makeRun(10000);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.panels.length).toBeGreaterThanOrEqual(5);

    for (const gap of result.gaps) {
      expect(gap.width).toBeLessThanOrEqual(100);
    }
  });

  it('fits a very long 15000mm run', () => {
    const run = makeRun(15000);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    for (const gap of result.gaps) {
      expect(gap.width).toBeLessThanOrEqual(100);
    }
  });

  it('prefers fewer panels (efficiency)', () => {
    // 4000mm should need ~2 panels, not 4
    const run = makeRun(4000);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.panels.length).toBeLessThanOrEqual(3);
  });

  it('uses panels from the catalogue (valid handles)', () => {
    const run = makeRun(5000);
    const result = fitRun(run, settings);

    for (const placement of result.panels) {
      expect(placement.panel.handle).toMatch(/^gp-12mm-\d{4}mm$/);
      expect(placement.panel.width).toBeGreaterThanOrEqual(100);
      expect(placement.panel.width).toBeLessThanOrEqual(2000);
      // Width should be a multiple of 50
      expect(placement.panel.width % 50).toBe(0);
    }
  });

  it('has correct number of gaps (panels + 1)', () => {
    const run = makeRun(5000);
    const result = fitRun(run, settings);

    expect(result.gaps).toHaveLength(result.panels.length + 1);
  });

  it('has correct number of spigots (one per gap)', () => {
    const run = makeRun(5000);
    const result = fitRun(run, settings);

    expect(result.spigots).toHaveLength(result.gaps.length);
  });
});

describe('fitRun — edge cases', () => {
  it('rejects run that is too short', () => {
    const run = makeRun(100); // Less than min (220mm)
    const result = fitRun(run, settings);

    expect(result.success).toBe(false);
    expect(result.warnings.some(w => w.type === 'RUN_TOO_SHORT')).toBe(true);
  });

  it('rejects zero-length run', () => {
    const run = makeRun(0);
    const result = fitRun(run, settings);

    expect(result.success).toBe(false);
  });

  it('handles minimum valid run (220mm)', () => {
    const run = makeRun(220);
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.panels).toHaveLength(1);
    expect(result.panels[0].panel.width).toBe(100); // Smallest panel
  });

  it('panels are positioned sequentially (no overlaps)', () => {
    const run = makeRun(8000);
    const result = fitRun(run, settings);

    for (let i = 1; i < result.panels.length; i++) {
      expect(result.panels[i].startMm).toBeGreaterThanOrEqual(result.panels[i - 1].endMm);
    }
  });
});

describe('fitRun — with gate', () => {
  it('fits run with gate in the middle', () => {
    const run = makeRun(5000, { position: 2000, width: 900 });
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.gate).toBeDefined();
    expect(result.gate!.startMm).toBe(2000);
    expect(result.gate!.endMm).toBe(2900);
    expect(result.gate!.width).toBe(900);

    // All gaps should be compliant
    for (const gap of result.gaps) {
      expect(gap.width).toBeLessThanOrEqual(100);
    }
  });

  it('fits run with gate near the start', () => {
    const run = makeRun(5000, { position: 500, width: 900 });
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.gate).toBeDefined();
  });

  it('fits run with gate near the end', () => {
    const run = makeRun(5000, { position: 3600, width: 900 });
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.gate).toBeDefined();
  });

  it('rejects gate extending beyond run', () => {
    const run = makeRun(5000, { position: 4500, width: 900 });
    const result = fitRun(run, settings);

    expect(result.success).toBe(false);
    expect(result.warnings.some(w => w.type === 'GATE_POSITION_INVALID')).toBe(true);
  });

  it('handles gate at position 0 (no left section)', () => {
    const run = makeRun(5000, { position: 0, width: 900 });
    const result = fitRun(run, settings);

    expect(result.success).toBe(true);
    expect(result.gate).toBeDefined();
  });
});
