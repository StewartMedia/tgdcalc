import type { ShapeConfig, Run, InlineConfig, LShapeConfig, RectangleConfig } from './types.js';

/**
 * Decompose a shape configuration into independent straight runs.
 *
 * - Inline  → 1 run
 * - L-shape → 2 runs (corner shared)
 * - Rectangle → 4 runs (4 corners shared)
 *
 * Each run can be solved independently by the fitter.
 * Corner spigots are marked as shared to avoid double-counting in BOM.
 */
export function decomposeShape(config: ShapeConfig): Run[] {
  switch (config.shape) {
    case 'inline':
      return decomposeInline(config);
    case 'l-shape':
      return decomposeLShape(config);
    case 'rectangle':
      return decomposeRectangle(config);
    default:
      throw new Error(`Unknown shape: ${(config as ShapeConfig).shape}`);
  }
}

function decomposeInline(config: InlineConfig): Run[] {
  return [
    {
      id: 'run-1',
      length: config.length,
      gate: config.gate,
      start: { x: 0, y: 0 },
      end: { x: config.length, y: 0 },
      direction: 'right',
    },
  ];
}

function decomposeLShape(config: LShapeConfig): Run[] {
  const { side1Length, side2Length, gate } = config;

  return [
    {
      id: 'run-1',
      length: side1Length,
      gate: gate?.side === 1 ? { position: gate.position, width: gate.width, panelType: gate.panelType } : undefined,
      start: { x: 0, y: 0 },
      end: { x: side1Length, y: 0 },
      direction: 'right',
    },
    {
      id: 'run-2',
      length: side2Length,
      gate: gate?.side === 2 ? { position: gate.position, width: gate.width, panelType: gate.panelType } : undefined,
      start: { x: side1Length, y: 0 },
      end: { x: side1Length, y: side2Length },
      direction: 'down',
    },
  ];
}

function decomposeRectangle(config: RectangleConfig): Run[] {
  const { width, height, gate } = config;

  const gateForSide = (side: 1 | 2 | 3 | 4) => {
    if (gate?.side === side) {
      return { position: gate.position, width: gate.width, panelType: gate.panelType };
    }
    return undefined;
  };

  return [
    {
      id: 'side-1',
      length: width,
      gate: gateForSide(1),
      start: { x: 0, y: 0 },
      end: { x: width, y: 0 },
      direction: 'right',
    },
    {
      id: 'side-2',
      length: height,
      gate: gateForSide(2),
      start: { x: width, y: 0 },
      end: { x: width, y: height },
      direction: 'down',
    },
    {
      id: 'side-3',
      length: width,
      gate: gateForSide(3),
      start: { x: width, y: height },
      end: { x: 0, y: height },
      direction: 'left',
    },
    {
      id: 'side-4',
      length: height,
      gate: gateForSide(4),
      start: { x: 0, y: height },
      end: { x: 0, y: 0 },
      direction: 'up',
    },
  ];
}

/**
 * Calculate shared corner count for spigot BOM adjustment.
 * L-shape has 1 shared corner, Rectangle has 4.
 */
export function getSharedCornerCount(config: ShapeConfig): number {
  switch (config.shape) {
    case 'inline':
      return 0;
    case 'l-shape':
      return 1;
    case 'rectangle':
      return 4;
    default:
      return 0;
  }
}
