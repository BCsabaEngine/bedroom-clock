# Design rules

PCB alignment rules for the **controller board** (`controller.circuit.tsx`). They do **not** apply to the digit panel (`seven-segment-display.circuit.tsx`, whose layout is fixed by the LED geometry in `lib/ledLayout.ts`) or to the `lib/` modules it uses.

## Alignment rules

1. **Share baselines:** Put pin rows of neighboring modules, headers, and connectors on one common top, bottom, or center line.
2. **Keep margins equal:** Give the left and right edges the same margin, and the top and bottom edges the same margin.
3. **Place on a grid:** Put every part on one grid, such as 1.27 mm or 2.54 mm.
4. **Use one orientation per part type:** Face all resistors, caps, and ICs the same way, and rotate parts only by 0° and 90°.
5. **Keep pitch constant:** Space equal parts and pads evenly, and use one pitch per connector row.
6. **Use one pad size per function:** Give all connector pads one diameter and one drill, and all header pads one diameter and one drill.
7. **Print labels on one baseline:** Use one text size and one baseline for pad labels, and one smaller size for designators.
8. **Place labels next to their parts:** Put each label directly beside its part, on the same side for every part, clear of pads, outlines, and vias.
9. **Label every pad:** Give each pad and connector a short, unambiguous label.
10. **Space blocks equally:** Keep the same gap between modules and between groups of parts.
11. **Distribute space evenly:** Spread the parts across the board, or shrink the board until the free space is balanced.
12. **Inset mounting holes equally:** Place all four the same distance from the corners, with clearance from pads.
13. **Align edge parts to one line:** Place parts near an edge at one shared distance from it, and put edge connectors flush with the edge on purpose.

## Routing rules

14. **Double width for power lines:** Draw the power lines (5V, GND) at least twice as wide as the standard (signal) trace.
15. **Avoid vias on power lines:** Try not to use vias on the power lines (5V, GND); route them on one layer where possible.

## Controller board status

Audited against rules 1..15 on `controller.circuit.tsx` (board 59.06 x 41.28 mm, grid origin = board centre, `g(n)` = n x 1.27 mm in the TSX). Numbers measured from `dist/controller/circuit.json`.

| # | Status | How |
| --- | --- | --- |
| 1 | pass | ESP32 and DFPlayer bottom pin rows both at y = -5.08; all connector pads at y = -16.51. |
| 2 | exception | Left: USB-C flush on purpose. Right 2.06 mm (DFPlayer). Top 1.08 mm (AMS1117 pad) vs bottom 2.93 mm to the pads (1.64 mm to the label text): the AMS1117 section above the ESP32 cannot move down. |
| 3 | pass | All through-hole pads (module pins, connectors) and the holes are on the 1.27 mm grid; part centres too, except `C3` (y on the half grid: the window between the ESP32 pads and the hole is 1.2 mm) and `U1` (centre at a half grid unit, its pins are on the grid). |
| 4 | pass | Modules 90 deg; every R, C and IC 0 deg. |
| 5 | pass | Signal connectors (`J3`, `J4`) 2.54 mm pitch, power connectors (`J1`, `J2`) 5.08 mm; 7.62 mm between the nearest pads of two groups. |
| 6 | pass | Signal pads 2.0 / 1.0 mm, power pads 2.4 / 1.2 mm, all module header pads 1.6 / 1.0 mm. |
| 7 | pass | Pad labels and module texts 1.0 mm on one baseline (y = -18.51); designators 0.5 mm. |
| 8 | pass | Pad labels all below their pads; no designator over a pad or trace (`U3` moved beside its tab with `pcbSx`). The silkscreen outlines of `C1`, `C3`, `C4` touch traces (part outlines, kept). |
| 9 | exception | Every connector pad is labelled (`SNZ`, `GND`, `DATA`, `5V`, `GND`, `5V`, `GND`, `SPK+`, `SPK-`). The 34 module header pins carry no label: the modules have their own pin names. |
| 10 | exception | The groups are 7.62 mm apart pad centre to pad centre (the pads stay on the grid), so the pad-edge gaps are 5.6 / 5.4 / 5.2 mm. |
| 11 | pass | 13.3 mm corridor between the modules; the free area above the DFPlayer is the price of the 7 mm AMS1117 strip above the ESP32. |
| 12 | pass | Holes at (+-25.4, +-16.51), 4.13 mm from every edge. Clearance to copper: bottom holes 2.1 mm, top right 3.9 mm, top left 0.58 mm to the `C3` pad and 0.49 mm to the 3V3 trace. |
| 13 | pass | Connector row on y = -16.51, the same line as the lower mounting holes; USB-C flush with the left edge on purpose. |
| 14 | pass | 5V and GND traces 0.8 mm (3.2 x the 0.25 mm signal), 0.5 mm (exactly double) only in the `U4` OE/GND link between its pad columns. The 3V3 line (0.6 mm) is not a covered net. |
| 15 | exception | No via on 5V. GND is a bottom copper pour, through-hole GND pins touch it directly and the SMD GND pins reach a through-hole GND pad on the top layer; the only GND via is `U3` GND (its path to the ESP32 GND pin would cross the 3V3 line). The two UART lines hop under the 5V riser with 4 vias (vias on signals are allowed). |

The build prints "routed thinner than requested" for three GND traces: it compares them with the 0.5 mm `U4` link on the same net. Known and harmless.
