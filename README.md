# TGD Glass Fence Calculator

Private Shopify app for [Trade Glass Depot](https://tradeglassdepot.com.au) — a glass fence calculator that lets customers configure pool fence layouts, auto-select panels from TGD's catalogue, and add everything to cart.

## Status

**Phase 1 complete** — Calculator engine + SVG renderer built and tested.

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Calculator Engine | Done | Panel fitting, gap compliance, BOM generation |
| 2. SVG Renderer | Done | 2D top-down schematic for all shapes |
| 3. Shopify App Scaffold | Pending | Remix app, admin settings, API routes |
| 4. Theme Extension + Cart | Pending | Customer-facing UI, cart integration |

## Calculator Engine

Pure TypeScript with zero Shopify dependencies. Independently testable.

### Supported Shapes

- **Inline** — single straight run
- **L-shape** — two perpendicular runs (1 shared corner)
- **Rectangle** — four-sided enclosure (4 shared corners)

### How It Works

1. **Decompose** shape into independent straight runs
2. **Fit** panels using a greedy algorithm (largest-first, even gap distribution)
3. **Validate** all gaps comply with AS 1926.1 (100mm maximum)
4. **Generate** BOM with quantities, pricing, and GST
5. **Render** 2D top-down SVG schematic

### Catalogue

- **39 standard panels** — 100mm to 2000mm in 50mm increments (12mm glass, 1200mm height)
- **13 gate panels** — 8mm glass, 700–1000mm in 25mm increments
- **11 hinge panels** — 1000–2000mm in 100mm increments
- **8 spigot types** — core drilled + base plated, value + pro ranges

### Usage

```typescript
import { calculate, DEFAULT_SETTINGS } from './calculator/index.js';

const result = calculate({
  shape: { shape: 'inline', length: 5000 },
  settings: DEFAULT_SETTINGS,
});

// result.success        → true
// result.bom.items      → [{ handle: 'gp-12mm-1950mm', quantity: 2, ... }]
// result.bom.total      → 374.53 (inc GST)
```

With a gate:

```typescript
const result = calculate({
  shape: {
    shape: 'inline',
    length: 5000,
    gate: { position: 2000, width: 900 },
  },
  settings: DEFAULT_SETTINGS,
});
```

L-shape:

```typescript
const result = calculate({
  shape: {
    shape: 'l-shape',
    side1Length: 5000,
    side2Length: 3000,
    gate: { side: 1, position: 2000, width: 900 },
  },
  settings: DEFAULT_SETTINGS,
});
```

SVG rendering:

```typescript
import { renderSchematic } from './renderer/schematic.js';

const svg = renderSchematic(result.runs, result.fittingResults);
// Returns SVG markup string
```

## Development

```bash
npm install
npm test            # Run all tests (76 tests)
npm run test:watch  # Watch mode
npm run typecheck   # TypeScript type checking
```

### Project Structure

```
calculator/
  types.ts          # TypeScript interfaces
  catalogue.ts      # Panel, gate, hinge, spigot data
  geometry.ts       # Shape → runs decomposer
  fitter.ts         # Greedy panel-fitting algorithm
  gap-validator.ts  # AS 1926.1 compliance
  bom.ts            # Bill of materials generator
  index.ts          # Public API + calculate()
renderer/
  schematic.ts      # SVG 2D top-down renderer
tests/
  geometry.test.ts
  fitter.test.ts
  gap-validator.test.ts
  bom.test.ts
  schematic.test.ts
  integration.test.ts
```

## Tech Stack

- TypeScript (strict mode)
- Vitest (testing)
- Shopify Remix app (Phase 3)
- Theme App Extension (Phase 4)

## Team

| Role | Person |
|------|--------|
| Account Director | Jim Stewart |
| Technical Lead | Nick Young |
| Lead Developer | Laurince |

Built by [StewArt Media](https://stewartmedia.com.au)
