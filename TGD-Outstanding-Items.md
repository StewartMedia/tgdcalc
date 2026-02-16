# TGD Calculator — Outstanding Items

**Last updated:** 2026-02-08

---

## Resolved Items

| # | Item | Resolution |
|---|------|------------|
| 3 | **Product catalogue export** | ✅ Received `products_export.csv` — fully analysed |
| 5 | **Panel size chart** | ✅ Extracted from catalogue. Standard pool panels: 100–2000mm in 50mm increments (39 sizes). All 1200mm height. |

---

## Catalogue Summary (from analysis)

### Standard Pool Fence Panels (`gp-12mm-{width}mm`)
- **39 sizes:** 100mm to 2000mm in 50mm increments
- **Height:** Fixed 1200mm
- **Price range:** $31.05 (100–350mm floor) to $173.27 (2000mm)
- **Note:** Build plan says 100–1800mm but catalogue goes to 2000mm — need to confirm if 1850–2000mm should be included

### Gate Panels
- **8mm standard gates** (`gg-8mm-{width}mm`): 700–1000mm in 25mm increments, 1200H, $49.95–$71.29
- **12mm hydraulic wall mount** (`gghydw-12mm-{width}mm`): 800, 900, 1000mm, 1200H, $84.24–$105.34
- **12mm hydraulic 120 series** (`gghyd120-12mm-{width}mm`): 800, 850, 900mm, 1200H, $84.24–$94.72

### Hinge Panels (mount next to gate on hinge side)
- **Standard** (`gh-12mm-{width}mm`): 1000–2000mm in 100mm increments, 1200H
- **Hydraulic 120 series** (`ghhyd120-12mm-{width}mm`): 1200–1800mm in 100mm increments, 1200H

### Spigots/Posts
- **Core drilled:** Square/Round, Value ($52.57) and Pro ($63–65) ranges
- **Base plated:** Square/Round, Value ($55–57) and Pro ($65–67) ranges
- **Non-conductive:** Core drilled and base plated, multiple colours ($72–88)
- **Posts (full height):** 1300mm base plated ($177–192), 1800mm core drilled ($89)

### Gate Hardware
- **Spring hinges (pairs):** Glass-to-glass, wall-to-glass, round post — $64–81
- **Hydraulic hinges (pairs):** Atlantic 530, Surf 155, 120 series — $269–400
- **Latch kits:** Glass-to-glass, wall-to-glass, corner in/out — $113–150
- **D&D hinge/latch kit combo:** $122.18

### Key Finding: No SKUs
- **All Variant SKU fields are empty** — the Handle is the de facto identifier
- This means cart integration will use Shopify product handles, not SKUs

---

## Still Awaiting from Client / Team

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | **Nick's revised quote** | Nick | Overdue (was due Feb 4) | Confirmed Feb 6 proceeding as private app |
| 2 | **Gate configuration for calculator** | Jim/Matt | Pending | See detailed questions below |
| 4 | **AS 1926.1 rule specifics** | Jim/Nick | Discovery phase | 100mm max gap confirmed. Any other compliance rules? |
| 6 | **Spigot/post selection for calculator** | Jim/Matt | Pending | See detailed questions below |
| 8 | **Existing store URL** | Jim | Pending | For reviewing theme, layout, and storefront |
| 9 | **Shopify store access** | Jim | Pending | Partner/collaborator access for app dev |

---

## Detailed Questions (from Catalogue Analysis)

### Gate Configuration — What goes in the BOM?

The catalogue has **3 types of gate panels** and **multiple hinge/latch combinations**. Need to define what the calculator recommends:

| Question | Options Found in Catalogue |
|----------|---------------------------|
| **Which gate panel type is default?** | 8mm standard? 12mm hydraulic wall mount? 12mm hydraulic 120 series? |
| **Which hinge type is default?** | Spring (from $64/pair) vs Hydraulic soft-close (from $269/pair)? |
| **Glass-to-glass or wall-to-glass?** | Determines both hinge and latch selection |
| **Colour/finish default?** | SS Polished, Black, Silver, White? Or user-selectable? |
| **Does the gate require a hinge panel?** | The catalogue has specific hinge-side panels (`gh-12mm-*`) — is one always needed next to the gate? |
| **Latch type?** | Standard, corner-in, corner-out — depends on configuration? |

### Spigot/Post Selection

| Question | Options Found in Catalogue |
|----------|---------------------------|
| **Core drilled or base plated?** | User-selectable or default? |
| **Value or Pro range?** | Price difference ~$10–12 per spigot |
| **Non-conductive option?** | Show as upgrade? |
| **How many spigots per panel?** | Typically 2 per panel, but shared at joins — need to confirm |
| **Do spigots go in the BOM?** | Or just panels + gate hardware? |

### Panel Range Clarification

| Question | Context |
|----------|---------|
| **Include 1850–2000mm panels?** | Build plan says "100–1800mm" but catalogue has panels up to 2000mm |
| **Include Pinned Pool Panels?** | 12 products, 1460mm height, 950–1500mm widths — different mounting system |
| **Include Raked Panels?** | 8 products for sloped ground — likely Phase 2? |
| **Balustrade panels in scope?** | 970mm height, different use case — assume NO |

---

## Decisions Needed Before Development

| # | Decision | Context |
|---|----------|---------|
| A | **Panel fitting priority** | When multiple layouts work, prefer: fewest panels? Largest panels? Smallest total gap? Most even distribution? |
| B | **Edge cases for L-shape / Rectangle** | How are corner posts handled? Shared between runs or separate? |
| C | **Error vs warning behaviour** | When a run can't meet the 100mm gap rule — hard block or warning with override? |
| D | **Price display** | Show ex-GST, inc-GST, or both? |
| E | **Mobile experience** | Calculator must work on mobile? (Likely yes — need to confirm priority) |
| F | **Hardware finish selection** | Single default finish or let user choose colour? (Affects BOM complexity significantly) |
| G | **Spigot mounting type** | Single default or user-selectable? (Core drilled vs base plated) |

---

## Suggested Next Steps

1. **Jim to answer gate + spigot questions above** — this defines the BOM complexity
2. **Share store URL** — so I can review the existing theme and product pages
3. **Once gate config is defined** — I can build the full panel selection algorithm + BOM generator
4. **Algorithm can start now** for the panel-fitting logic (panels are fully defined)

---

## Document References

- Build Plan: `TGD-Build-Plan-2026.md`
- Original Quote: `TGD _ Calculator.md`
- Product Export: `products_export.csv`
