import { describe, it, expect } from 'vitest';
import { validateGaps, validateRunLength, validateGatePosition } from '../calculator/gap-validator.js';
import type { Gap, GateConfig } from '../calculator/types.js';

describe('validateGaps', () => {
  it('passes when all gaps are within limit', () => {
    const gaps: Gap[] = [
      { startMm: 0, endMm: 80, width: 80, compliant: true },
      { startMm: 1880, endMm: 1960, width: 80, compliant: true },
      { startMm: 3760, endMm: 3840, width: 80, compliant: true },
    ];
    const warnings = validateGaps(gaps, 100);
    expect(warnings).toHaveLength(0);
  });

  it('flags gaps exceeding the limit', () => {
    const gaps: Gap[] = [
      { startMm: 0, endMm: 80, width: 80, compliant: true },
      { startMm: 1880, endMm: 2000, width: 120, compliant: false },
    ];
    const warnings = validateGaps(gaps, 100);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('GAP_EXCEEDS_LIMIT');
    expect(warnings[0].severity).toBe('error');
  });

  it('flags exactly 100mm as compliant', () => {
    const gaps: Gap[] = [
      { startMm: 0, endMm: 100, width: 100, compliant: true },
    ];
    const warnings = validateGaps(gaps, 100);
    expect(warnings).toHaveLength(0);
  });

  it('flags negative gaps (overlap)', () => {
    const gaps: Gap[] = [
      { startMm: 100, endMm: 90, width: -10, compliant: false },
    ];
    const warnings = validateGaps(gaps, 100);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('GAP_TOO_NARROW');
  });
});

describe('validateRunLength', () => {
  it('accepts valid run length', () => {
    const warnings = validateRunLength(3000, 60);
    expect(warnings).toHaveLength(0);
  });

  it('rejects zero length', () => {
    const warnings = validateRunLength(0, 60);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('RUN_TOO_SHORT');
  });

  it('rejects negative length', () => {
    const warnings = validateRunLength(-100, 60);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('RUN_TOO_SHORT');
  });

  it('rejects run shorter than min panel + 2 spigots', () => {
    // Min = 100mm panel + 2 × 60mm = 220mm
    const warnings = validateRunLength(200, 60);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('RUN_TOO_SHORT');
    expect(warnings[0].message).toContain('220mm');
  });

  it('accepts run exactly at minimum', () => {
    const warnings = validateRunLength(220, 60);
    expect(warnings).toHaveLength(0);
  });
});

describe('validateGatePosition', () => {
  it('accepts valid gate position', () => {
    const gate: GateConfig = { position: 2000, width: 900 };
    const warnings = validateGatePosition(gate, 5000);
    expect(warnings).toHaveLength(0);
  });

  it('rejects negative gate position', () => {
    const gate: GateConfig = { position: -100, width: 900 };
    const warnings = validateGatePosition(gate, 5000);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('GATE_POSITION_INVALID');
  });

  it('rejects gate extending beyond run', () => {
    const gate: GateConfig = { position: 4500, width: 900 };
    const warnings = validateGatePosition(gate, 5000);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('GATE_POSITION_INVALID');
    expect(warnings[0].message).toContain('5400mm');
  });

  it('rejects zero-width gate', () => {
    const gate: GateConfig = { position: 2000, width: 0 };
    const warnings = validateGatePosition(gate, 5000);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].type).toBe('GATE_POSITION_INVALID');
  });

  it('accepts gate at the very end of run', () => {
    const gate: GateConfig = { position: 4100, width: 900 };
    const warnings = validateGatePosition(gate, 5000);
    expect(warnings).toHaveLength(0);
  });
});
