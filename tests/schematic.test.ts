import { describe, it, expect } from 'vitest';
import { renderSchematic } from '../renderer/schematic.js';
import { calculate, DEFAULT_SETTINGS } from '../calculator/index.js';

describe('renderSchematic', () => {
  it('returns valid SVG for an inline run', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('contains panel rectangles', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    // Should contain blue panel rects
    expect(svg).toContain('fill="#2563eb"');
  });

  it('contains spigot circles', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    expect(svg).toContain('<circle');
    expect(svg).toContain('fill="#6b7280"');
  });

  it('shows gate in green when present', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000, gate: { position: 2000, width: 900 } },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    expect(svg).toContain('fill="#16a34a"');
    expect(svg).toContain('GATE');
  });

  it('renders L-shape with 2 runs', () => {
    const result = calculate({
      shape: { shape: 'l-shape', side1Length: 5000, side2Length: 3000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    expect(svg).toContain('<svg');
    // Should contain dimension labels for both sides
    expect(svg).toContain('5000mm');
    expect(svg).toContain('3000mm');
  });

  it('renders rectangle with 4 runs', () => {
    const result = calculate({
      shape: { shape: 'rectangle', width: 6000, height: 4000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    expect(svg).toContain('<svg');
    expect(svg).toContain('6000mm');
    expect(svg).toContain('4000mm');
  });

  it('respects custom options', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 3000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults, {
      canvasWidth: 1200,
      canvasHeight: 600,
      panelColor: '#ff0000',
    });

    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('fill="#ff0000"');
  });

  it('contains panel width labels', () => {
    const result = calculate({
      shape: { shape: 'inline', length: 5000 },
      settings: DEFAULT_SETTINGS,
    });
    const svg = renderSchematic(result.runs, result.fittingResults);

    // Panel labels should show widths
    for (const placement of result.fittingResults[0].panels) {
      expect(svg).toContain(`>${placement.panel.width}<`);
    }
  });
});
