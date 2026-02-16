import { describe, it, expect } from 'vitest';
import { decomposeShape, getSharedCornerCount } from '../calculator/geometry.js';
import type { InlineConfig, LShapeConfig, RectangleConfig } from '../calculator/types.js';

describe('decomposeShape', () => {
  describe('Inline', () => {
    it('decomposes into 1 run', () => {
      const config: InlineConfig = { shape: 'inline', length: 5000 };
      const runs = decomposeShape(config);

      expect(runs).toHaveLength(1);
      expect(runs[0].id).toBe('run-1');
      expect(runs[0].length).toBe(5000);
      expect(runs[0].direction).toBe('right');
    });

    it('passes gate config to the run', () => {
      const config: InlineConfig = {
        shape: 'inline',
        length: 5000,
        gate: { position: 2000, width: 900 },
      };
      const runs = decomposeShape(config);

      expect(runs[0].gate).toBeDefined();
      expect(runs[0].gate!.position).toBe(2000);
      expect(runs[0].gate!.width).toBe(900);
    });
  });

  describe('L-Shape', () => {
    it('decomposes into 2 runs', () => {
      const config: LShapeConfig = {
        shape: 'l-shape',
        side1Length: 5000,
        side2Length: 3000,
      };
      const runs = decomposeShape(config);

      expect(runs).toHaveLength(2);
      expect(runs[0].length).toBe(5000);
      expect(runs[0].direction).toBe('right');
      expect(runs[1].length).toBe(3000);
      expect(runs[1].direction).toBe('down');
    });

    it('places gate on correct side', () => {
      const config: LShapeConfig = {
        shape: 'l-shape',
        side1Length: 5000,
        side2Length: 3000,
        gate: { side: 2, position: 1000, width: 900 },
      };
      const runs = decomposeShape(config);

      expect(runs[0].gate).toBeUndefined();
      expect(runs[1].gate).toBeDefined();
      expect(runs[1].gate!.position).toBe(1000);
    });

    it('connects side 2 start to side 1 end (shared corner)', () => {
      const config: LShapeConfig = {
        shape: 'l-shape',
        side1Length: 5000,
        side2Length: 3000,
      };
      const runs = decomposeShape(config);

      expect(runs[1].start.x).toBe(runs[0].end.x);
      expect(runs[1].start.y).toBe(runs[0].end.y);
    });
  });

  describe('Rectangle', () => {
    it('decomposes into 4 runs', () => {
      const config: RectangleConfig = {
        shape: 'rectangle',
        width: 6000,
        height: 4000,
      };
      const runs = decomposeShape(config);

      expect(runs).toHaveLength(4);
      expect(runs[0].length).toBe(6000); // top
      expect(runs[1].length).toBe(4000); // right
      expect(runs[2].length).toBe(6000); // bottom
      expect(runs[3].length).toBe(4000); // left
    });

    it('places gate on the specified side', () => {
      const config: RectangleConfig = {
        shape: 'rectangle',
        width: 6000,
        height: 4000,
        gate: { side: 3, position: 2000, width: 900 },
      };
      const runs = decomposeShape(config);

      expect(runs[0].gate).toBeUndefined();
      expect(runs[1].gate).toBeUndefined();
      expect(runs[2].gate).toBeDefined();
      expect(runs[2].gate!.position).toBe(2000);
      expect(runs[3].gate).toBeUndefined();
    });

    it('forms a closed loop (corners connect)', () => {
      const config: RectangleConfig = {
        shape: 'rectangle',
        width: 6000,
        height: 4000,
      };
      const runs = decomposeShape(config);

      // Side 1 end → Side 2 start
      expect(runs[0].end).toEqual(runs[1].start);
      // Side 2 end → Side 3 start
      expect(runs[1].end).toEqual(runs[2].start);
      // Side 3 end → Side 4 start
      expect(runs[2].end).toEqual(runs[3].start);
      // Side 4 end → Side 1 start
      expect(runs[3].end).toEqual(runs[0].start);
    });

    it('has correct directions', () => {
      const config: RectangleConfig = {
        shape: 'rectangle',
        width: 6000,
        height: 4000,
      };
      const runs = decomposeShape(config);

      expect(runs[0].direction).toBe('right');
      expect(runs[1].direction).toBe('down');
      expect(runs[2].direction).toBe('left');
      expect(runs[3].direction).toBe('up');
    });
  });
});

describe('getSharedCornerCount', () => {
  it('returns 0 for inline', () => {
    expect(getSharedCornerCount({ shape: 'inline', length: 5000 })).toBe(0);
  });

  it('returns 1 for L-shape', () => {
    expect(getSharedCornerCount({ shape: 'l-shape', side1Length: 5000, side2Length: 3000 })).toBe(1);
  });

  it('returns 4 for rectangle', () => {
    expect(getSharedCornerCount({ shape: 'rectangle', width: 6000, height: 4000 })).toBe(4);
  });
});
