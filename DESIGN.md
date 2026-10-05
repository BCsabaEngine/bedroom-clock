# Design rules

Schematic and PCB rules for the **controller board** (`controller.circuit.tsx`): alignment (1-13), routing (14-15 and 26), mounting (16), schematic (17-18) and placement (19-25). Rule 26 (corners) was added last and is listed with the routing rules; the numbers of the others did not change. They do **not** apply to the digit panel (`seven-segment-display.circuit.tsx`, whose layout is fixed by the LED geometry in `lib/ledLayout.ts`) or to the `lib/` modules it uses. Where two rules pull against each other the electrical one wins (decoupling, rule 22, over via avoidance, rule 15, and over equal spacing, rules 10 and 11); the table at the end records every such exception.

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
15. **Avoid vias on power lines:** Try not to use vias on the power lines (5V, GND); route them on one layer where possible. A via at the GND pad of a decoupling capacitor or of a regulator is accepted when the alternative is a longer path (rule 22 wins).
26. **Avoid 90 degree corners:** Try not to turn a trace by 90 degrees; make every corner two 45 degree bends instead. A T junction (a trace joining another one) is allowed. A short cut (down to 0.3 mm) where a pad is close, or a bend inside a pad, is accepted. In `controller.circuit.tsx` the `chamfer()`/`wire45()` helpers do this.

## Mounting rules

16. **Keep the screw head area free:** Around every mounting hole keep a free circle of twice the screw head width: 3.5 mm hole, 3 mm screw (5.5 mm head), 6 mm free diameter, concentric with the hole. Place no component, pad or silkscreen text inside it, as far as the board allows. Traces and the copper pour may run through it.

## Schematic rules

17. **Group by function:** Give every functional block (MCU, power, LED output, audio, input) its own `<schematicsection>` (`schSectionName`) on the one sheet and keep its parts clustered by `schX`/`schY`, with a clear gap between blocks. Add a second sheet only when a block no longer fits on one.
18. **Draw the signal path left to right:** Put the inputs (power in, snooze button) on the left, the MCU in the middle and the outputs (LED data, speaker) on the right, so the circuit reads from left to right. Keep the pins of one function on one side of a symbol (the MCU symbol has its input on the left, its outputs on the right, 3V3 on top, GND below).

## Placement rules

19. **Place the fixed parts first:** Connectors, the module headers and the power input (their positions come from the case and the pin rows) go first; then the power parts, then the small parts around them.
20. **Keep a function block together:** Put the parts of one block next to each other (the whole power supply, the whole level shifter section). A block may only split when a pin position forces it.
21. **Separate analog, digital and power:** Keep the audio side (DFPlayer, speaker lines with their current peaks), the digital side (MCU, level shifter, LED data) and the power parts in their own areas; no digital line runs alongside the speaker lines, and the supply parts sit on the supply path.
22. **Decouple at the pin:** Put the decoupling capacitor of every IC within 3 mm (pad centre to pad centre) of its power pin, or as close as physically possible, joined by a short, wide trace (at least the width of rule 14 for 5V and GND). This rule is a must. Modules (ESP32, DFPlayer) carry their own capacitors.
23. **Keep crystals close:** A crystal sits within 5 mm of the MCU or clock chip, and its clock traces are short, straight and of equal length.
24. **Keep the board edge free:** Keep every part body, pad and silkscreen text at least 1.27 mm (0.05 in) from the board edge, so nothing is damaged when the board is separated from a panel (5 mm if the board is cut from a panel by routed tabs; no panel is used here). Deliberate edge parts (rule 13) are the exception.
25. **Handle heat:** Put high-heat parts (regulators, MOSFETs, power resistors) in the airflow and give them copper to spread the heat: a dedicated pour on their tab, thermal vias, and wide traces.

## Controller board status

Audited against rules 1..26 on `controller.circuit.tsx` (board 60.31 x 41.28 mm, grid origin = 0.625 mm right of the board centre (the outline is offset with `outlineOffsetX`), `g(n)` = n x 1.27 mm in the TSX). Numbers measured from `dist/controller/circuit.json`.

| # | Status | How |
| --- | --- | --- |
| 1 | pass | ESP32 and DFPlayer bottom pin rows both at y = -5.08; all connector pads at y = -16.51. |
| 2 | exception | Left 2.04 mm (ESP32 pads), right 2.06 mm (DFPlayer pads); both module outlines 1.25 mm. Top 1.08 mm (AMS1117 pad) vs bottom 2.93 mm to the pads (1.64 mm to the label text): the AMS1117 section above the ESP32 cannot move down (see rule 24). |
| 3 | pass | All through-hole pads (module pins, connectors) and the holes are on the 1.27 mm grid (except the two left holes, x = -26.65, 0.02 mm off to keep the 4.13 mm inset equal on both sides); part centres too, except `U1` (centre at a half grid unit, its pins are on the grid) and `C4` (y on the half grid, so its courtyard clears `R2`). |
| 4 | pass | Modules 90 deg; every R, C and IC 0 deg. |
| 5 | pass | Signal connectors (`J3`, `J4`) 2.54 mm pitch, power connectors (`J1`, `J2`) 5.08 mm; 7.62 mm between the nearest pads of two groups. |
| 6 | pass | Signal pads 2.0 / 1.0 mm, power pads 2.4 / 1.2 mm, all module header pads 1.6 / 1.0 mm. |
| 7 | pass | Pad labels and module texts 1.0 mm on one baseline (y = -18.51); designators 0.5 mm. |
| 8 | pass | Pad labels all below their pads; no designator over a pad or trace (`U3` moved above its body with `pcbSx`). The silkscreen outlines of `C1`, `C3`, `C4` touch traces (part outlines, kept). |
| 9 | exception | Every connector pad is labelled (`SNZ`, `GND`, `DATA`, `5V`, `GND`, `5V`, `GND`, `SPK+`, `SPK-`). The 34 module header pins carry no label: the modules have their own pin names. |
| 10 | exception | The groups are 7.62 mm apart pad centre to pad centre (the pads stay on the grid), so the pad-edge gaps are 5.6 / 5.4 / 5.2 mm. |
| 11 | pass | 13.3 mm corridor between the modules; the free area above the DFPlayer is the price of the 7 mm AMS1117 strip above the ESP32. |
| 12 | pass | Holes at (-26.65 / +25.4, +-16.51), 4.13 mm from every edge. |
| 13 | pass | Connector row on y = -16.51, the same line as the lower mounting holes; the ESP32 is no longer flush: its outline is 1.25 mm from the left edge, like the DFPlayer on the right (the USB-C connector is on the module top). |
| 14 | pass | 5V and GND traces 0.8 mm (3.2 x the 0.25 mm signal), 0.5 mm (exactly double) only in the `U4` OE/GND link between its pad columns. The 3V3 line (0.6 mm) is not a covered net. |
| 15 | exception | No via on 5V. GND is a bottom copper pour, through-hole GND pins touch it directly and the SMD GND pins reach a through-hole GND pad on the top layer; the GND vias are `U3` GND (its path to the ESP32 GND pin would cross the 3V3 line), `C3` GND (the cap sits east of `U3`, out of the top left screw circle, so its GND cannot reach the ESP32 GND pin on one layer) and `C4` GND (rule 22: the cap sits next to `U4` VCC, the nearest through-hole GND pad (`J4`) is 6.4 mm away, across the 5V feed of `J4`). The two UART lines hop under the 5V riser with 4 vias (vias on signals are allowed). |
| 16 | pass | Free circle r = 3 mm around each hole centre, measured from `circuit.json`: nearest pad edge is 3.47 mm from the top left centre (`U3` pins), 3.88 mm bottom right (`J2`), 4.08 mm bottom left (`J3`), 5.68 mm top right; the DFPlayer silkscreen outline is 3.47 mm from the top right centre. `C3` was inside the top left circle and moved east of `U3`. Only traces run through the circles (3V3 and `U3` GND around the top left hole). |
| 17 | pass | Five sections on the one sheet `Controller`: MCU (`U1`), Power (`J1`, `C1`, `U3`, `C3`), LED output (`U4`, `C4`, `R2`, `J4`), Audio (`U2`, `R1`, `J2`), Input (`J3`); each block clustered, with a gap to the next. |
| 18 | pass | Left: `J1` power in, `J3` snooze; middle: `U1` (IO2 snooze in on the left; IO4, IO7, IO6 out on the right; V33 on top, GND and V5 below); right: the LED chain `U4` > `R2` > `J4` (top) and `R1` > `U2` > `J2` (bottom). |
| 19 | pass | Fixed first: both modules (`U1`, `U2`), the connector row on the bottom edge and the 5V riser from `J1`; then `U3`/`C3` (next to the 3V3 pin), `U4`/`C4`/`R2` (next to its connector `J4`) and `R1` (near its source pin). |
| 20 | exception | The power parts are split: the entry (`J1`, `C1`) at the bottom, the regulator (`U3`, `C3`) above the ESP32, because the module's 3V3 pin is on its top pin row and the 5V riser connects the two (DESIGN.md rule 11 note, README Decisions). The level shifter section (`U4`, `C4`, `R2`, `J4`) and the audio parts are together. |
| 21 | pass | Digital left (`U1`, level shifter, snooze, LED output), audio right (`U2`, speaker pads), the 5V riser between them, the regulator top left. The speaker lines leave the DFPlayer at its east end and the UART lines at its west end, so they never run alongside each other; the UART lines hop under the riser. No analog circuit besides the DFPlayer speaker output. |
| 22 | exception | `U4` VCC: `C4` is 2.4 mm away (pad centre to pad centre), 5V stub 0.8 mm, GND through a via at the cap (was 5.7 mm, moved). `U3` VOUT: `C3` is 2.3 mm from the tab, 0.6 mm 3V3. **`U3` VIN has no capacitor within 3 mm:** `C1` (100 uF) is 36 mm away (about 49 mm of 0.8 mm trace); the strip above the ESP32 has no room next to the VIN pad (hole circle, ESP32 pads, 5V line). If the 3V3 rail misbehaves, a 22 uF capacitor at VIN needs a taller board or another regulator package. |
| 23 | n/a | No crystal on the board (the modules carry their own). |
| 24 | exception | Pads and SMD parts: `U3` GND pad 1.08 mm from the top edge (0.19 mm short, same cause as rule 2); the ESP32 23.5 mm outline is 1.25 mm from the left edge and the DFPlayer 21 mm outline 1.25 mm from the right edge (0.02 mm short each, nominal vendor outlines; their pads are 2.04 / 2.06 mm); the connector pads are 2.93 mm and the pad labels 1.64 mm from the bottom edge, everything else further. |
| 25 | exception | Only `U3` (AMS1117, SOT-223) is warm: (5 V - 3.3 V) x the ESP32-S3 draw of roughly 0.1-0.2 A typical (Wi-Fi bursts above 0.3 A) is about 0.2-0.35 W (an estimate, not measured). Its tab is a 2 x 3.8 mm pad with a 0.6 mm trace, in the open top left corner; there is no dedicated pour or thermal via (the bottom layer is the GND pour, so the VOUT tab cannot use it). If the regulator runs hot: add a V33 `copperpour` with an `outline` round the tab on the top layer. |
| 26 | pass | Every corner is two 45 degree bends, written with `chamfer()`/`wire45()` in `controller.circuit.tsx` (cut 1.27 mm, smaller where a pad is close: 0.9 mm at the UART pins, 0.7 / 0.5 mm at the `U4` pads, 0.3 mm in the `U4` channel between its pad columns). Measured on `dist/controller/circuit.json`: the only 90 degree turns left are T junctions on the 5V riser (`V5` branches, `V5_C4`) and the end of the `U3` VIN feed inside its pad (0.24 mm jog). `SPK1`/`SPK2` were already exact 45 degree diagonals. Vias unchanged (rule 15 row). |

The build prints "routed thinner than requested" for one GND trace (`C1` to `J1`): it compares it with the 0.5 mm `U4` link on the same net. Known and harmless.
