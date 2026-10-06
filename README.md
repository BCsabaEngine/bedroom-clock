# Bedroom clock

Digit panel (`seven-segment-display.circuit.tsx`):

![Digit panel schematic](__snapshots__/seven-segment-display.circuit-schematic.snap.svg)

![Digit panel PCB layout](docs/images/display-pcb.png)

![Digit panel 3D view](docs/images/display-3d.png)

Controller board (`controller.circuit.tsx`):

![Controller schematic](__snapshots__/controller.circuit-schematic.snap.svg)

![Controller PCB layout](docs/images/controller-pcb.png)

![Controller 3D view](docs/images/controller-3d.png)

A bedroom clock that shows the time in 24 h format on four large 7-segment digits and plays a song as an alarm with slowly rising volume. PCB design written in [tscircuit](https://tscircuit.com) (React/TSX, compiled by the `tsci` CLI). This file is the project doc: the brief (requirements), then design decisions and status, kept current as the design evolves.

## System overview

Two boards:

1. **Digit panel** (this repo, `seven-segment-display.circuit.tsx`): one 7-segment digit. Four identical panels are built into a 3D printed case (hh:mm) and chained with wires: DOUT of one panel to DIN of the next, so all four LED chains form one data line. A digit is 7 segments (bars) of 10 WS2812-type LEDs in a line; a bar is 50 mm long, a digit is about 120 mm high and 62 mm wide (bars separated by ~3 mm gaps, like discrete bars on a sign). Each panel has wire pads on **both side edges**, hand-soldered: DIN, 5V, GND on the left and DOUT, 5V, GND on the right (5V and GND of the two sides are the same nets, so power wires can go to either side). Four 3.5 mm mounting holes sit near the corners and the silkscreen says TOP at the top edge and names every pad.
2. **Controller board** (`controller.circuit.tsx`, 60 x 44 mm): ESP32-S3 SuperMini dev module at the left edge (USB-C end towards the edge, 1.1 mm edge margin like the DFPlayer; the USB-C connector sits on top of the module, not at the board edge) and the DFPlayer (HW-247A, 16P) next to it on the same baseline, 5V input pads with a P-MOSFET reverse polarity protection, an AP7361C-3.3 LDO for the ESP32, a 74AHCT1G125 level shifter (10 kohm pull-down on its input) plus 330 ohm series resistor for the WS2812 data line, speaker pads, a snooze button input and four 3.5 mm corner holes; all connectors are in one row along the bottom edge with equal gaps between the groups. The layout follows the shared rules in [DESIGN.md](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md) (not copied into this repo). Details under "Controller board" below.

Firmware (not in this repo): custom, web UI written in Svelte and embedded with the `svelteesp32` library, with a Wi-Fi settings portal (time, alarm, song, volume ramp, brightness).

## Status

- Digit panel: **one digit** (70 LEDs) with wire pads on both sides (left DIN/5V/GND, right DOUT/5V/GND, both top to down), four 3.5 mm corner holes pad labels and a TOP mark, 76 x 124 mm; order four of them. `check:wiring:display`, `tsci build` and `tsci check shorts` pass. Fabrication outputs export (BOM: 70 LEDs + 1 capacitor).
- Controller board: **compact design** (`controller.circuit.tsx`, 60 x 44 mm, connectors on the bottom edge plus four light-sensor wire pads on the top edge), explicitly routed, GND as a bottom copper pour, checked against all 43 rules of [DESIGN.md](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md) (see "Design rules status (controller)" below: 7 documented exceptions, among them no input capacitor within 3 mm of the AP7361C VIN pin). `tsc`/eslint/prettier, netlist, schematic-placement, placement, `tsci build` and `tsci check shorts` pass (`npm run check:full:controller`). BOM: 12 SMD parts (C1, C3, C4, U3, U4, Q1, R1, R2, R3, R4, R5, R6); the ESP32 module, the DFPlayer and the wire pads are hand-soldered (`doNotPlace`). Not yet verified against the real modules (see Open questions).
- Next: verify the module footprints against the real boards, decide case fit of the holes (Open questions).

## Requirements

- **Purpose:** one 7-segment digit panel built from WS2812-type RGB LEDs (2.0 x 1.8 mm), 10 LEDs per segment, 5 cm segment length, bars not overlapping (horizontals between the vertical columns, verticals between the horizontals, ~3 mm gaps), so about 120 mm digit height, one data chain. Four panels are ordered and built into a 3D printed case; the panels are chained with wires (DOUT to DIN). Brightness/colour set by firmware.
- **Board size / form factor:** one digit per board, 76 x 124 mm with 2 mm rounded corners, 2 layers, all SMD parts on the top side.
- **Power sources and rails:** 5 V only, fed through the 5V and GND wire pads of each panel from the controller board / supply. Current budget: see Design notes.
- **I/O (connectors, headers, mounting holes):** plated wire pads (hand-soldered, no connector) on both side edges, 2.54 mm pitch: `J1` on the left, DIN (top), 5V (middle), GND (bottom); `J2` on the right, DOUT (top, level with the end of the middle bar), 5V (middle), GND (bottom); both sides read data, 5V, GND from top to down. The right pads sit about 5.6 mm lower than the left ones. Left and right 5V/GND are the same nets (wire power to either side). Four 3.5 mm non-plated holes at (+-34, +-58) mm from the board centre. A small `TOP` silkscreen text above the top bar marks the top edge, and every wire pad has its name (DIN, 5V, GND, DOUT) on the silkscreen on its inboard side (on the left the DIN and 5V names sit just above their traces).
- **Mechanical constraints:** the digit outline is fixed by the 5 cm bars: LED rows of the horizontal bars at y = +57.6 / 0 / -57.1 mm (x = -22.5..22.5), vertical bars at x = +-28.5 mm (centre lines), upper LEDs y = 6.6..51.6, lower -51.1..-6.1. Enclosure not defined yet.
- **Manufacturer and constraints:** JLCPCB; basic parts where one exists; Economic assembly (only parts marked "PCBA Type: Economic and Standard", never "Standard Only"; top side only).

### Controller board requirements

- **Purpose:** drive the four chained digit panels (one WS2812 data line, 280 LEDs), play the alarm song through a DFPlayer, take one snooze button, and run the firmware on an ESP32-S3.
- **Board size / form factor:** 60 x 44 mm (whole millimetres, user decision 2026-10-06; it was 60.31 x 43.82 mm) with 2 mm rounded corners = 2640 mm2, 2 layers, SMD parts on the top side only, GND is a copper pour on the bottom layer. 60 x 44 is the smallest whole-mm size that keeps the shared rules: 59 mm wide would put the module outlines 0.6 mm from the edge (DESIGN.md rule 26 wants 1.25 mm; now 1.095 mm, the pads are 1.9 mm from the edge), 43 mm high would leave 0.88 mm between the group labels and the edge (rule 43 / 26 want 1.27 mm). The part coordinates stay on the 1.27 mm grid of [DESIGN.md](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md), origin = the DFPlayer-side grid, and the board outline is offset by -0.625 mm in x (`outlineOffsetX`, board x = -30.625..29.375 mm): both module outlines are 1.095 mm from their board edge. Four 3.5 mm non-plated holes at (-26.495 / +25.245, +-17.87) mm (equal 4.13 mm from all edges, rule 12; this puts all four 0.09-0.15 mm off the 1.27 mm grid, rule 3 exception). **Every connector (power, LED output, snooze, speaker) is a plated pad in one row along the bottom edge** (y = -16.51 mm), labelled on the silkscreen on one baseline, in four groups 7.62 mm apart pad centre to pad centre (snooze, LED output, power, speaker). The size follows from the parts: width = ESP32 module 23.5 + DFPlayer 21 + a 13.3 mm corridor between them (5V riser, UART hops, `R1` is left of it; the antenna end of the ESP32 faces it) + 2 x 1.095 mm margins, and it also has to hold the 40.6 mm connector row clear of the holes; height = connector row and level shifter section below the module pins (about 11 mm), the 18/21 mm module bodies, and the LDO section above the ESP32 (about 8 mm).
- **Power:** 5 V only, through two plated solder pads **5.08 mm apart** (`J1`: 5V, GND; 1.2 mm drill, 2.4 mm pad, the same size as the speaker pads: the power class of [DESIGN.md](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md) rules 5 and 6). **Reverse polarity protection:** a P-MOSFET `Q1` (AO3401A, 50 mohm) right above the `J1` 5V pad, drain to the pad, source to the board's 5V rail, gate through 1 kohm (`R6`) to GND; with a swapped supply its body diode blocks. The fuse is not on the board: use a fused supply cable (about 3 A) or an inline fuse. A 100 uF ceramic bulk capacitor `C1` sits behind `Q1` (about 49 mm of 0.8 mm trace from the regulator, see the circuit rules audit). **LED supply capacitor (CIRCUIT_RULES LED-5):** solder a 470-1000 uF, 10 V or higher electrolytic (5 mm lead pitch, observe polarity: the pad labelled `5V` is +) across the two `J1` pads, or at the first panel; it is not an SMD part and not in the BOM. The ESP32 gets 3.3 V from an AP7361C-3.3 LDO (3V3 pin of the module); the DFPlayer and the level shifter run from 5 V.
- **ESP32:** ESP32-S3 SuperMini (Hestore 10051729), soldered on its header pins at the left board edge, **1.095 mm from it** (the same margin as the DFPlayer; the USB-C connector is on top of the module, so the module does not have to be flush for the plug to be reachable; user: the antenna no longer has to be at the edge). The antenna end points to the board centre; nothing is placed within about 3 mm of it except the two UART lines (1.3 mm below the module edge) and the 5V line (1.7 mm above the pins, 3.4 mm above the module body); the bottom copper pour has a keep-out under the 7 mm antenna end and 2 mm beyond the module end (DESIGN.md rule 16; the 7 mm is an estimate, verify with the real module). The module and the DFPlayer share one baseline: their bottom pin rows (the ones facing the connectors) are at the same y.
- **Level shifting:** the ESP32 data pin (3.3 V) goes through a 74AHCT1G125 (powered from 5 V, VIH about 2 V) and a 330 ohm series resistor to the `LED DATA` pad; the first panel's DIN takes it.
- **Audio:** DFPlayer (Hestore 10038040, HW-247A DFPlayer-16P) on 2 x 8 pin rows; speaker (SPK1/SPK2, mono, up to 3 W) on two solder pads (`J2`, 5.08 mm apart, 1.2 mm drill, 2.4 mm pad).
- **Input:** one button on solder pads (`J3`, two pads labelled `SNZ` and `GND`, 2.54 mm apart, 1.0 mm drill, 2.0 mm pad); the other side of the button goes to GND, the ESP32 uses its internal pull-up.
- **Light sensor (ambient light for the future firmware brightness control):** a GY-302 module (BH1750, [Hestore 10047998](https://www.hestore.hu/prod_10047998.html), 3-5 V on VIN through its own LDO, I2C address 0x23 with ADDR open, 0.12 mA) is wired to four plated solder pads `J5` on the **top edge above the DFPlayer** (same signal pad class as `J3`/`J4`: 2.0 mm pad, 1.0 mm drill, 2.54 mm pitch), in the pin order of the module: 5V, GND, SCL, SDA, so one 4-wire cable fits. SDA = ESP32 IO9, SCL = ESP32 IO8 (any GPIO can be I2C on the S3; these are the free header pins nearest to the pads, firmware: `Wire.begin(9, 8)`, SDA first). Two 4.7 kohm pull-ups to 3V3 (`R3`, `R4`) are on the board, west of the 5V riser above the 5V line.
- **Data and power to the panels:** `J4`, three pads in a row (west to east) in the same order as `J1` of the digit panels: DATA (to DIN of panel 1), 5V, GND, so one 3-wire cable fits. 5V is the board's 5V rail (1 mm trace from `J1`, about 2 A at most); the other panels can be powered from the supply directly (see Open questions).

## Design notes

### Parts

| Ref | Part | JLCPCB | Why |
| --- | --- | --- | --- |
| U1..U70 | XL-0807RGBC-2812B (XINGLIGHT), 2.0 x 1.8 mm, 5 V, WS2812B protocol | C3646929 | Chosen by the user. Economic and Standard, ~58 k in stock. (Other 2020 WS2812 variants such as WS2812C-2020-V1, C2976072, are "Standard Only".) |
| C1 | 22 uF 25 V X5R 0805 | C45783 | Bulk capacitor at the wire entry. Basic, Economic. |
| J1, J2 | 3 plated holes each (1.0 mm drill, 2.0 mm pad, 2.54 mm pitch): J1 DIN/5V/GND on the left edge, J2 DOUT/5V/GND on the right edge | - | Wire pads; `doNotPlace`, not in BOM. |

LED pinout (verified from the EasyEDA symbol/footprint): pin1 DOUT, pin2 GND, pin3 DIN, pin4 VDD; pads 0.8 x 0.8 mm at +-0.889 / +-0.575 mm. The footprint is a local `<footprint>` copied from that part (`lib/Ws2812Led.tsx`), because `jlcpcb:` footprints hit EasyEDA 403 rate limits.

### Digit geometry and data chain

Digit frame: origin = digit centre, x right, y up (the PCB image is in this orientation).

The bars are chained so the data enters at the middle left and leaves at the middle right (good for chaining digits left to right):

| Order | Bar | LEDs | First LED at (x, y) mm | Direction |
| --- | --- | --- | --- | --- |
| 1 | f (upper left) | U1-U10 | (-28.5, 6.6) | up |
| 2 | a (top) | U11-U20 | (-22.5, 57.6) | right |
| 3 | b (upper right) | U21-U30 | (28.5, 51.6) | down |
| 4 | c (lower right) | U31-U40 | (28.5, -6.1) | down |
| 5 | d (bottom) | U41-U50 | (22.5, -57.1) | left |
| 6 | e (lower left) | U51-U60 | (-28.5, -51.1) | up |
| 7 | g (middle) | U61-U70 | (-22.5, 0) | right |

LED pitch 5 mm, so a bar is 10 LEDs over 50 mm. **Firmware segment map** (LED index = U number - 1): a = 10..19, b = 20..29, c = 30..39, d = 40..49, e = 50..59, f = 0..9, g = 60..69. DIN = U1.DIN (J1.DIN), DOUT = U70.DOUT (J1.DOUT, to the next panel's DIN). 70 LEDs x 24 bit at 800 kbit/s = 2.1 ms per frame per digit; four chained panels (280 LEDs) are 8.4 ms per frame, the firmware sees one chain of 280 LEDs, panel 1 first (index = panel * 70 + the digit map above).

### FastLED helper (C++)

`cpp/SevenSegLayout.h` is a header-only helper for the firmware, generated from `lib/ledLayout.ts` (the same module the PCB code uses for the segment order, so the two cannot drift): `npm run export:cpp` (needs Bun on PATH). The whole chain is `CRGB leds[SevenSeg::NUM_LEDS]` (4 x 70 = 280); digit 0 is the panel at the controller (hour tens), digit 3 the last. A segment is 10 consecutive LEDs, so it switches with one `fill_solid`:

```cpp
#include "SevenSegLayout.h"
CRGB leds[SevenSeg::NUM_LEDS];
SevenSeg::setDigit(leds, 2, 7, CRGB::White);               // digit 2 shows a 7 (value 0..9, anything else blanks it)
SevenSeg::setSegment(leds, 0, SevenSeg::SEG_G, CRGB::Red);  // one segment (SEG_A..SEG_G) of digit 0
// firstLed(digit, segment) gives the first LED index; DIGIT_MASK[0..9] holds the lit segments (bit 0 = a ... bit 6 = g)
```

Segments are named a..g (a top, b upper right, c lower right, d bottom, e lower left, f upper left, g middle); their chain order is f, a, b, c, d, e, g (`CHAIN_INDEX`), see the table above. The digit font is the standard one (6 with the top bar, 7 as a-b-c, 9 with the bottom bar); change `DIGIT_SEGMENTS` in `lib/ledLayout.ts` and re-export to alter it. The header compiles warning-free as C++11/C++17 (checked against a minimal FastLED stub, not on a device).

### Power

- 5 V rail on each bar: a 0.5 mm trace on the inner side of the LED row joins the VDD pads; 0.5 mm links join the bars at the corners, following the data chain. The 5V wire pad feeds the start of the chain (U1, bar f) and the other bars are powered in series along the chain, every link following the data order (the 5V links run through the gaps between the bars). Estimated worst-case drop at full white along the whole digit is well below 0.3 V; the firmware limits brightness anyway.
- GND: bottom layer is a solid GND pour (`<copperpour>`), every LED GND pad has its own via (0.3/0.6 mm) next to it; the GND wire pad sits in the pour.
- LED current is **not yet verified** against the XL-0807 datasheet; assuming up to ~20 mA per LED at full white: ~1.4 A per digit, ~5.6 A for four digits. A single 0.5 mm 5V trace carries 1 A at ~10 C rise (1 oz), so the firmware must cap the total brightness (a lit digit at 25 % is ~0.2 A) until the budget is settled, see Open questions.
- Decoupling: only the 22 uF bulk capacitor at the entry (the user decided against a capacitor per LED). If flicker or data glitches show up, a 100 nF per LED is the usual fix; the cells have room below the 5V rail.
- Data: WS2812 inputs need VIH of about 0.7 x VDD (3.5 V at 5 V), so the ESP32 (3.3 V) needs a level shifter (e.g. 74AHCT1G125) plus a ~330 ohm series resistor **on the controller board** (not on this board).

### How the copper is made

The digit is routed explicitly, not by the autorouter (`<board routeRemaining={false}>`), so the pattern is the same for every LED and independent of autorouter luck:

- `lib/LedSegment.tsx`: one bar = 10 LEDs in a row, built with `pcbPath` traces (5V rail, data hop between neighbours, GND via).
- `lib/SevenSegDigit.tsx`: places the 7 bars (LEDs at absolute board positions and rotations; there are no `<group>`s anywhere) and joins them with explicit corner links (`LINKS`). The e to g data link hops under the 5V link on the bottom layer.
- `seven-segment-display.circuit.tsx`: the board, the wire pads J1, the bulk capacitor C1 and their traces. The DOUT trace leaves U70.DOUT on top, hops under the 5V link and the b to c data link on the bottom layer through one via and ends directly at the plated DOUT pad on the right edge (a plated hole is on both layers, so no second via is needed). The right 5V pad J2.V5 is joined to the digit's 5V net the same way: the trace follows the c bar's 5V link up from U31.VDD, drops through a via at x = 27 and runs on the bottom layer under the c bar's data link (x = 30.4) to the pad. DOUT and the right 5V are the only signals on the bottom layer.
- A trace's `pcbPath` points are expressed in the **frame of the component that owns the `from` port** (its position and rotation), not in board or group coordinates. `lib/SevenSegDigit.tsx` converts digit coordinates into that frame (`toLed`).
- A via inside a `pcbPath` needs a wire point at the same spot before and after it (only used at the end of a path here: the GND vias).
- Capacitors also get a default 1 mm "decoupling" max trace length; `C1` sets `maxDecouplingTraceLength`.

### Controller board

Layout rules: see [DESIGN.md](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md) (shared template repo, not copied here; controller board only, not the digit panel); how the controller meets them: "Design rules status (controller)" below.

**Parts**

| Ref | Part | JLCPCB | Why |
| --- | --- | --- | --- |
| U1 | ESP32-S3 SuperMini, 18 pin header footprint (hand-soldered) | - | Chosen by the user; `doNotPlace`. |
| U2 | DFPlayer-16P (HW-247A), 2 x 8 pin footprint (hand-soldered) | - | Chosen by the user; `doNotPlace`. |
| U3 | AP7361C-33ER-13 (Diodes), SOT-223R | C3743528 | 3.3 V, 1 A, dropout 0.34 V at 1 A, Economic and Standard, extended part. Replaces the AMS1117-3.3 (C6186) on 2026-10-06 because CIRCUIT_RULES C6 asks for a regulator whose datasheet allows a ceramic output capacitor: the AP7361C is stable with a ceramic of at least 2.2 uF (datasheet DS37274), 1 uF recommended at the input. SOT-223R has the pin order of the AMS1117 (1 GND, 2 OUT, 3 IN), so the footprint and the wiring stayed. Absolute maximum VIN is 6.5 V (the AMS1117 took 15 V): the supply must be a regulated 5 V. The datasheet text does not say what the tab is connected to; by the SOT-223 convention it is OUT (the middle pin) and the board joins it to VOUT: **check the package drawing before ordering**. |
| Q1 | AO3401A (Alpha & Omega), P-MOSFET SOT-23 | C15127 | Reverse polarity protection in the + line (CIRCUIT_RULES Q5): 50 mohm, a drop of about 0.1 V at 2 A. Basic, Economic and Standard. Footprint is a local one with the package turned by 90 degrees. |
| U4 | SN74AHCT1G125DBVR, SOT-23-5 | C7484 | 5 V buffer with TTL-level inputs (VIH 2 V), so a 3.3 V GPIO drives it directly; Economic and Standard. Extended part. |
| C1 | 100 uF 16 V X5R 1210 | C394395 | Bulk capacitor ("stabilizer") behind `Q1`, east of the 5V riser near `J1`, GND through a via; Economic and Standard. Extended part. |
| C3 | 22 uF 25 V X5R 0805 | C45783 | LDO output capacitor (the AP7361C is stable with a ceramic of at least 2.2 uF). Basic. There is no input capacitor at the regulator: its courtyard collided with the regulator's, and the strip above the ESP32 has no room next to the VIN pad; `C1` is on the same 0.8 mm 5V line 36 mm away (about 49 mm of trace), which breaks DESIGN.md rule 24 and CIRCUIT_RULES P4 (the AP7361C datasheet asks for 1 uF at IN "as close as possible"). Open question. |
| C4 | 100 nF X7R 0603 | C14663 | Decoupling at the 74AHCT1G125, 2.4 mm from its VCC pad (DESIGN.md rule 24), GND through a via at the cap. Basic. |
| R1 | 1 kohm 0603 | C21190 | Series resistor in the ESP32 TX to DFPlayer RX line (DFPlayer RX is 3.3 V tolerant but this limits ringing/overcurrent), placed next to the ESP32 pin. Basic. |
| R2 | 330 ohm 0603 | C23138 | Series resistor at the level shifter output, near the source. Basic. |
| R5 | 10 kohm 0603 | C25804 | Pull-down on the level shifter input `U4` A (CIRCUIT_RULES LOGIC-2): without it the input floats while the ESP32 resets and boots and the LEDs can flash; it also keeps DATA idle low. Basic. |
| R6 | 1 kohm 0603 | C21190 | Gate resistor of `Q1` to GND (CIRCUIT_RULES Q5). Basic. |
| R3, R4 | 4.7 kohm 0603 | C23162 | I2C pull-ups (SCL, SDA) to 3V3, 1 % 100 mW; at 3.3 V about 0.7 mA per line when pulled low. Basic, Economic and Standard. |
| J1..J5 | plated wire pads (`doNotPlace`) | - | Power class (2.4 mm pad, 1.2 mm drill, 5.08 mm pitch): `J1` 5V/GND in, `J2` speaker. Signal class (2.0 mm pad, 1.0 mm drill, 2.54 mm pitch): `J3` snooze (`SNZ`, GND), `J4` LED output (DATA, 5V, GND), `J5` BH1750 light sensor (5V, GND, SCL, SDA; top edge). |

The new parts `U3` (C3743528), `Q1` (C15127), `R5` (C25804) and `R6` (C21190) were checked on 2026-10-06; all SMD parts were checked on their jlcpcb.com part page: "PCBA Type: Economic and Standard".

**ESP32-S3 SuperMini footprint** (from the vendor drawing, USB-C up): left header row top to bottom TX, RX, IO1..IO7; right row 5V, GND, 3V3, IO13..IO8; 2.54 mm pitch, rows 16.51 mm apart (13 grid units, read off the picture, **verify with a caliper**), pins 1.6 mm from the module ends, module about 23.5 x 18 mm. The module is placed rotated by 90 degrees: the USB-C end faces the left board edge (1.095 mm from it), the antenna end faces the board centre, the TX..IO7 row is the bottom row (facing the connectors) and the 5V/GND/3V3/IO13..IO8 row is the top row. The footprint is a local `<footprint>` with 18 plated holes (1.0 mm drill, 1.6 mm pad, small enough that a 0.4 mm trace fits between two neighbouring pads; the DFPlayer uses the same pad size), no 3D model.

**DFPlayer footprint**: standard DFPlayer Mini layout, left row top to bottom VCC, RX, TX, DAC_R, DAC_L, SPK_2, GND, SPK_1; right row bottom to top IO1, GND, IO2, ADKEY1, ADKEY2, USB+, USB-, BUSY; rows 15.24 mm apart; silkscreen box 21 x 21 mm. The module is placed rotated by 90 degrees so that the left row (VCC at the west end, SPK_1 at the east end) is the bottom row facing the connector edge. Only VCC, RX, TX, SPK_1, SPK_2 and both GND pins are used; BUSY is not connected (dropped to keep the routing simple; the firmware can follow the playback state from the DFPlayer's UART replies).

**Pin plan** (ESP32-S3; no strapping pins used: 0, 3, 45, 46 stay free; USB D+/D- stay free for programming):

| Signal | ESP32 pin | Goes to |
| --- | --- | --- |
| LED data (3.3 V) | IO4 | U4.A (74AHCT1G125) |
| DFPlayer RX line | IO7 | R1 (1 kohm) to U2.RX; firmware: UART TX on IO7 |
| DFPlayer TX line | IO6 | U2.TX; firmware: UART RX on IO6 |
| Snooze | IO2 | J3.SNOOZE (button to GND, internal pull-up) |
| I2C SDA (light sensor) | IO9 | R4 (4.7k to 3V3) and J5.SDA |
| I2C SCL (light sensor) | IO8 | R3 (4.7k to 3V3) and J5.SCL |
| 3V3 | 3V3 | U3 output |
| GND | GND | GND pour (bottom layer) |
| 5V | 5V | not connected |

**Power**: the 5V from `J1` goes through the protection transistor `Q1` (a 45 degree jog from the pad to its drain, 0.8 mm; the source sits on the riser line) and then runs entirely on the top layer, 0.8 mm wide, with no via. A riser at the x of the `J1` 5V pad (2.54 mm) goes up the corridor between the modules to a line along y = 13.97 mm that runs west above the ESP32 pins to the AP7361C input (`U3` sits above the ESP32 so its output is a few mm from the module's 3V3 pin, which is on the top pin row). Branches off the riser: east along y = -5.08 mm to the DFPlayer VCC (the west end of its bottom pin row), east along y = -9.53 mm to the bulk capacitor `C1`, west along y = -9.21 mm (the VCC pad row of `U4`) to the level shifter VCC and `C4` (which sits right next to the VCC pad, a 0.8 mm stub down to its pin 1), and west along y = -12.07 mm below the level shifter section to the `J4` 5V pad. The gate of `Q1` goes through `R6` (1 kohm) to GND with its own via. The AP7361C tab (VOUT) goes straight to the ESP32 3V3 pin (0.6 mm), the output capacitor `C3` sits right east of the tab (out of the screw circle of the top left hole, DESIGN.md rule 18), 3V3 on its left pad, GND on its right pad through a via; the ESP32 5V pin stays unconnected on purpose (see Decisions). The DFPlayer drives the speaker directly (mono, SPK_1/SPK_2, up to about 3 W at 5 V), so there is no extra amplifier. **GND is a copper pour on the bottom layer** (`<copperpour connectsTo="net.GND" layer="bottom" />`): every through-hole GND pin (`J1`, `J3`, `J4`, the ESP32 GND, both DFPlayer GND pins) touches it directly (a plain `to="net.GND"` trace without a path, nothing to route), and every SMD GND pad has its own GND via to it (DESIGN.md rule 16): `C1`, `R5`, `R6`, `U4` GND (0.5 mm; `U4` OE is joined to its GND pad by a 0.5 mm link through the channel between the pad columns, exactly double a signal), `U3`, `C3` and `C4` (eight vias, none on 5V or 3V3; see Decisions). The pour stays 1.27 mm from the board edge (rule 26) and has a keep-out under the ESP32 antenna end. Every 5V and GND trace is 0.8 mm wide (user request), signals are 0.25 mm. `tsci check shorts` is clean.

**Routing**: explicit like the digit board (`<board routeRemaining={false}>`, `<trace pcbPath>`, helpers `wire()`/`gndWire()`/`hop()` in the TSX with board coordinates on the 1.27 mm grid (`g(n)`), the frame converter `inFrame` and the pin-position helpers `espAt()`/`dfAt()`). Everything is on the top layer except the pour and the UART hops. Layout: connector row along the bottom edge (west to east: `J3` snooze, `J4` LED output, `J1` power, `J2` speaker); ESP32 on the left (USB-C at the edge), DFPlayer on the right; between them the corridor with the 5V riser. The speaker pins SPK_2/SPK_1 run straight down and then diagonally to `J2`; the level shifter section (`U4`, `C4`, `R2`) is below the ESP32's east half, above `J4`; the LDO section (`U3`, `C3`) is in the strip above the ESP32, next to the module's 3V3/GND pins. The ESP32 bottom row goes straight down (IO2 snooze to `J3`; IO4 LED data runs down and east into the `U4` A pad from the west (`R5`, the pull-down, taps it west of `U4`), the OE/GND link passes through the channel between the pad columns, so the A line does not cross it). IO7 (through `R1`) and IO6, the two easternmost bottom pins, run east just below the module pins at y = -6.35 / -7.62 mm to the DFPlayer RX/TX; both hop under the 5V riser on the bottom layer (a via pair each, vias on signals are allowed). Nothing else crosses a top-layer line.

### Design rules status (controller)

The layout and schematic rules are **not stored in this repo**: they live in one shared file, [DESIGN.md in agentic-pcb/example-base](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md) (43 rules: alignment 1-13, routing 14-17 and 39-40, mounting 18, schematic 19-20 and 29-36, placement 21-27, 37-38 and 41-42, silkscreen groups 43, outline 28). They apply to the controller board (`controller.circuit.tsx`) only; the digit panel (`seven-segment-display.circuit.tsx`) is exempt because its layout is fixed by the LED geometry in `lib/ledLayout.ts`. This table is the audit of the controller against them (last audited 2026-10-06 against the reread remote file with 43 rules; no panel is used for this board, rule 26). Update it after layout changes. Numbers measured from `dist/controller/circuit.json`; board 60.31 x 43.82 mm, grid origin = 0.625 mm right of the board centre in x (the outline is offset with `outlineOffsetX`) and the board centre in y, `g(n)` = n x 1.27 mm in the TSX.

| # | Status | How |
| --- | --- | --- |
| 1 | pass | ESP32 and DFPlayer bottom pin rows both at y = -5.08; the bottom connector pads (`J1`..`J4`) all at y = -16.51; the top pad row `J5` at y = +16.51 (the mirror line). |
| 2 | pass | Top and bottom: the group labels are 1.37 mm (text box) from the edge on both (`Sensor` on top, `Snooze`, `LED stripe`, `Power`, `Speaker` on the bottom), the pad rows 5.49 mm. Left and right: module outlines 1.095 mm both, pads 1.9 mm. |
| 3 | exception | All through-hole pads (module pins, connectors) are on the 1.27 mm grid; the mounting holes are not (x = -26.495 / +25.245, y = +-17.87: 0.09-0.15 mm off, the equal 4.13 mm inset of rule 12 on a whole-mm board outline wins), so rule 3 is an exception for the four holes; part centres too, except `U1` (centre at a half grid unit, its pins are on the grid), `C4` (y on the half grid, so its courtyard clears `R2`) and `Q1` (x 0.95 mm east of the riser so its source pad sits on it). |
| 4 | pass | Modules 90 deg; every R, C and IC 0 deg. |
| 5 | pass | Signal connectors (`J3`, `J4`, `J5`) 2.54 mm pitch, power connectors (`J1`, `J2`) 5.08 mm; 7.62 mm between the nearest pads of two groups on the bottom row. |
| 6 | pass | Signal pads 2.0 / 1.0 mm, power pads 2.4 / 1.2 mm, all module header pads 1.6 / 1.0 mm. |
| 7 | pass | Pad labels and module texts 1.0 mm, each pad row on one baseline (2 mm outside the pads, bottom y = -18.51, top y = +18.51); designators 0.5 mm; group labels one size (1.25 mm, larger). All text is horizontal: the module texts (`USB`, `ANT`, `DFPlayer`) and the `1` marks use `pcbRotation={360}` (0 is treated as unset and the text then follows the module's 90 deg). |
| 8 | exception | Pad labels all outside their pad rows; designators above their parts (`U3` moved above its body with `pcbSx`), except `R2`: its designator is below, because above it the courtyards of `C4` and `U4` leave no room (the cluster `U4`/`C4`/`R2` would all have to move). The silkscreen outlines of `C1`, `C3`, `C4` touch traces (part outlines, kept); the designator of `R6` is below it and the one of `Q1` below-right of it (the `Q1` text is in its footprint), because above them the `C1` outline and the 5V line leave no room. |
| 9 | exception | Every connector pad is labelled (`SNZ`, `GND`, `DATA`, `5V`, `GND`, `5V`, `GND`, `SPK+`, `SPK-`, `5V`, `GND`, `SCL`, `SDA`) and every group has its group label (rule 43). The 34 module header pins carry no label: the modules have their own pin names. |
| 10 | exception | The groups are 7.62 mm apart pad centre to pad centre (the pads stay on the grid), so the pad-edge gaps are 5.6 / 5.4 / 5.2 mm. |
| 11 | pass | 13.3 mm corridor between the modules; the free area above the DFPlayer is the price of the 7 mm LDO strip above the ESP32. |
| 12 | pass | Holes at (-26.495 / +25.245, +-17.87), 4.13 mm from every edge of the 60 x 44 mm outline (see rule 3). |
| 13 | pass | Both pad rows at one distance from their edge (5.49 mm pad centre to edge: bottom row y = -16.51, top row y = +16.51); the ESP32 is not flush: its outline is 1.095 mm from the left edge, like the DFPlayer on the right. |
| 14 | pass | 5V and GND traces 0.8 mm (3.2 x the 0.25 mm signal), 0.5 mm (exactly double) only in the `U4` GND via stub and the OE/GND link between its pad columns. The 3V3 line (0.6 mm, 2.4 x) is covered since the rule covers every supply net: pass. |
| 15 | pass | No via on 5V or 3V3: the 5V and 3V3 run entirely on the top layer. GND vias are not covered. The two UART lines hop under the 5V riser with 4 vias, the I2C lines with 6 more (two hops, two vias each at the pull-ups and on the last leg to `J5`; vias on signals are allowed): 10 signal vias. The 5V line is now two nets: `J1` to the `Q1` drain (unprotected) and the rail behind `Q1`; neither has a via. |
| 16 | pass | GND is a copper pour on the **bottom layer only**, no top-layer pour. Through-hole GND pins touch the pour directly; every SMD GND pad has a GND via to it: `C1`, `U4` GND, `U3`, `C3`, `C4`, `R5` and `R6` (7 vias). The pour keeps 1.27 mm from the board edge (`boardEdgeMargin`) and has a `<keepout>` on the bottom layer under the ESP32 antenna end: 7 mm of the module plus 2 mm beyond it (the antenna length is an estimate, verify with the real module). |
| 17 | pass | Every corner is two 45 degree bends (`chamfer()`/`wire45()` in `controller.circuit.tsx`, cut 1.27 mm, smaller where a pad is close). The only 90 degree turns left are T junctions on the 5V riser and the end of the `U3` VIN feed inside its pad (0.24 mm jog). The new `SDA_J5`/`SCL_J5` legs use 0.8 mm cuts. |
| 18 | pass | Free circle r = 3 mm around each hole centre, measured from `circuit.json`: nearest pad or label edge 4.57 mm (top left, `U3` pad), 6.99 mm (top right), 5.28 mm (bottom left, `Snooze` label), 3.73 mm (bottom right, `SPK+` label). Only traces run through the circles. |
| 19 | pass | Six sections on the one sheet `Controller`: MCU (`U1`), Power (`J1`, `C1`, `U3`, `C3`), LED output (`U4`, `C4`, `R2`, `J4`), Audio (`U2`, `R1`, `J2`), Input (`J3`), Sensor (`J5`, `R3`, `R4`); each block clustered, with a gap to the next. |
| 20 | pass | Left: `J1` power in, `J3` snooze, `J5` sensor; middle: `U1` (inputs on the left, outputs on the right, V33 on top, GND and V5 below); right: the LED chain `U4` > `R2` > `J4` (top) and `R1` > `U2` > `J2` (bottom). |
| 21 | pass | Fixed first: both modules (`U1`, `U2`), the connector rows and the 5V riser from `J1`; then `U3`/`C3` (next to the 3V3 pin), `U4`/`C4`/`R2` (next to its connector `J4`), `R3`/`R4` (next to `J5`) and `R1` (near its source pin). |
| 22 | exception | The power parts are split: the entry (`J1`, `C1`) at the bottom, the regulator (`U3`, `C3`) above the ESP32, because the module's 3V3 pin is on its top pin row and the 5V riser connects the two (rule 11, README Decisions). The level shifter section and the audio parts are together. |
| 23 | pass | Digital left (`U1`, level shifter, snooze, LED output), audio right (`U2`, speaker pads), the 5V riser between them, the regulator top left. The speaker lines leave the DFPlayer at its east end and the UART lines at its west end, so they never run alongside each other; the UART lines hop under the riser. |
| 24 | exception | `U4` VCC: `C4` is 2.4 mm away (pad centre to pad centre), 5V stub 0.8 mm, GND through a via at the cap. `U3` VOUT: `C3` is 2.3 mm from the tab, 0.6 mm 3V3. `Q1` is next to the `J1` 5V pad; `R5` is 2.4 mm from the A line. **`U3` VIN has no capacitor within 3 mm:** `C1` (100 uF) is about 49 mm of 0.8 mm trace away; the strip above the ESP32 has no room next to the VIN pad (hole circle, ESP32 pads, 3V3 and 5V lines; tried again 2026-10-06 with the tab on the left, VIN on top and the line along the top edge: the 3V3 wire to the ESP32 and the I2C lanes block it). The AP7361C datasheet asks for 1 uF at IN "as close as possible"; a 1 uF at VIN needs a bigger board or the regulator at another place. |
| 25 | n/a | No crystal on the board (the modules carry their own). |
| 26 | exception | The ESP32 23.5 mm outline is 1.095 mm from the left edge and the DFPlayer 21 mm outline 1.095 mm from the right edge (0.155 mm short of the 1.25 mm, nominal vendor outlines; their pads are 1.9 mm from the edge, the whole-mm board width of 60 mm costs this); all pads and labels are at least 1.27 mm from the edge (group labels 1.37 mm, measured from the text box, pads at least 1.885 mm); the SMD parts (`U3` body) are over 3 mm from it. The pour is 1.27 mm from the edge. No panel is used (routed tabs would need 5 mm). |
| 27 | exception | `U3` (AP7361C, SOT-223R, 110 degC/W on minimum copper per its datasheet) is warm: about 0.2-0.35 W (an estimate, not measured); `Q1` loses about 0.3 W at 2.5 A. The `U3` tab is a 2 x 3.8 mm pad with a 0.6 mm trace, in the open top left corner; there is no dedicated pour or thermal via (the bottom layer is the GND pour, so the VOUT tab cannot use it). If the regulator runs hot: add a V33 `copperpour` with an `outline` round the tab on the top layer. |
| 28 | pass | `<board borderRadius="2mm">` gives every outer corner a 2 mm radius; the nearest pad, hole, via or label to a corner arc centre is far over the 1.27 mm clearance from the curve. |
| 29 | pass | `U1`: used pins first (IO9, IO8, IO2 on the left; IO4, IO7, IO6 on the right), the unused ones together at the end of each side; `U2`: RX, TX on the left, SPK1, SPK2 first on the right, the unused ones after them; V5/GND at the bottom. `U1` has gaps (`schPinStyle`) between the used pins so each wire lines up with its partner. |
| 30 | pass | `C1` at `J1` V5, `C3` at the `U3` tab, `C4` at the `U4` VCC pin, `R3`/`R4` at the SCL/SDA wire between `J5` and `U1`, `R1` on the UART line near `U1`, `R2` at the `U4` output. |
| 31 | exception | Signal wires are straight (`J3`/`J5` to `U1`, `U1` to `U4`, `R2`, `R1`, `U2`, `J2`, all on a 0.5 grid and aligned by pin position). Exceptions: the `U4` OE to GND link (three segments), the one-bend taps of `C1`/`C3` and the `J5` SDA/SCL taps to `R4`/`R3`. `U1` IO6 (DFP_TX) is a label pair, 8.6 units long. |
| 32 | exception | Every flag and stub has a real name (`SDA`, `SCL`, `SNOOZE`, `LED_3V3`, `LED_5V`, `LED_DATA`, `DFP_RX`, `DFP_RX_R`, `DFP_TX`, `SPK1`, `SPK2`, `V5`, `V33`), no default `T..` names. Not one style per net: `V5` and `V33` mix short wires (`J1`-`C1`, `U4`-`C4`, `U3` tab - `C3`) with label stubs, and `SDA`/`SCL` are a wire to the pull-up plus a stub at `U1` (the traces are the PCB's, the schematic is the auto-router's, `schMaxTraceDistance` = 4.5). |
| 33 | pass | All text is horizontal; every connector has its pins on one side and rotation 0 (`J2` no longer sideways); `R3`, `R4`, `C1`, `C3`, `C4` are the two-pin passives on a vertical path (90, 270). Supply pins of the ICs are on the top (`U4` VCC, `U2` VCC, `U1` V33) and bottom (GND, V5). `U3` has VIN on the left because an LDO reads left to right. |
| 34 | pass | `J1`, `J3`, `J5` at the left edge (one `schX` = -3) with their pins on the right, pin 1 on top; `J2`, `J4` at the right edge with their pins on the left. The `J5` pins SDA, SCL are in the order of `U1` (swapped against the pad order; schematic only). |
| 35 | exception | Wires of different nets run at least 1 unit apart; the blocks are not spaced equally: the sheet has empty areas top left and bottom right, because the pin gaps that line up the signals make `U1` and `J5` tall. The sheet stays 260 x 180 mm and the drawing is not exactly centred. |
| 36 | pass | `U1` in the centre, power lower left, inputs left, outputs and audio right. |
| 37 | pass | `tsci check placement controller.circuit.tsx`: 0 errors (only the `insertionDirection` warnings of the hand-soldered pad rows, and a suggested rotation of `R4`, which is informational). Courtyards were checked in the render: `C4`/`R2`/`U4` are the tightest cluster. |
| 38 | exception | `R3`/`R4` and `R1` sit on lines with their designators on one side; the cluster `U4`/`C4`/`R2` is not on one line (`C4` on a half grid unit so its courtyard clears `R2`, the designator of `R2` is below). |
| 39 | exception | `SPK1`/`SPK2` run side by side as equal-length 45 degree diagonals (the traces are the same shape, 5.08 mm apart, checked with `tsci check trace-length`) but the gap is 4.28 mm, not 1.6 mm: the DFPlayer pins and the `J2` pads are 5.08 mm apart. The UART lines are not a pair. |
| 40 | pass | Every trace starts and ends on a pad or a via (`tsci check shorts` is clean); no stub, no copper island seen in the render. |
| 41 | exception | Input pad, protection transistor `Q1` (right above `J1`), bulk cap `C1` (behind `Q1`, 6 mm from `J1`), then the loads along the 5V riser; the regulator is far from the input (exception of rule 24 and 22). The supply runs through `Q1` and up the riser to the AP7361C and its 3V3 comes straight back down to the module (short, 0.6 mm). |
| 42 | pass | Pin 1 of both modules is marked with a `1` next to it (inside the module outline, on the silkscreen), `U3`/`U4` carry the footprint's pin 1 mark. The board has no polarized SMD part (`C1`, `C3`, `C4` are ceramic, `Q1` is a MOSFET, not polarized); the hand-soldered bulk electrolytic across `J1` is marked by the `5V` pad label (5V = +). |
| 43 | pass | `Snooze`, `LED stripe`, `Power`, `Speaker` on the bottom edge and `Sensor` on the top edge: one `silkscreentext` per group (1.25 mm), centred on the group, 1.5 mm further out than the pin labels, with a thin `silkscreenline` from the first to the last pad; the board is 2.54 mm taller than before so they fit inside the 1.27 mm edge clearance. |

### Circuit rules status (controller)

Parts and values are audited against the second shared file, [CIRCUIT_RULES.md in agentic-pcb/example-base](https://github.com/agentic-pcb/example-base/blob/main/CIRCUIT_RULES.md) (rule IDs with section prefixes, e.g. C6, LED-5; it says which parts and values to use, `DESIGN.md` says where they go). Last audited 2026-10-06 against the raw file, controller only. Not applicable: transistors, ATmega/STM32/RP2040, USB-UART, USB-C, isolation, relays, crystals, optocouplers, RF, IR, and the bare-chip ESP rules (ESP-1/2/8/9/11: the SuperMini module carries its own decoupling, reset, crystal and USB).

| Rules | Status | How |
| --- | --- | --- |
| G1, G3, G4 | pass | Spec and sections are in this README and the schematic; capacitors are rated 16 V / 25 V on the 5 V / 3.3 V rails; all values are standard; every SMD part is JLCPCB Economic. |
| G2, C6 | pass (fixed 2026-10-06) | `U3` is now the AP7361C-3.3: its datasheet (DS37274) says it is stable with a ceramic output capacitor of 2.2 uF or more, so the 22 uF X5R `C3` is allowed (the AMS1117 it replaced has an ESR window). 1 uF recommended at the input. |
| G6, LOGIC-2 | pass (fixed 2026-10-06) | `U4` OE is tied to GND, `SNOOZE` has the ESP32 internal pull-up (firmware), and `U4` A has a 10 kohm pull-down `R5`, so it no longer floats while the ESP32 resets and boots. |
| G8 | partial | Calculations are in "Circuit rules: calculations" below; the capacitor DC-bias curves are not yet checked against the datasheets. |
| C1, C2 | partial | `U4` VCC: 100 nF `C4`, 2.4 mm, own GND via. `U3` VOUT: 22 uF `C3`, 2.3 mm, own GND via. `U3` VIN: no capacitor (see P4). |
| C3 | pass | `C1` 100 uF is 16 V on 5 V, `C3` 22 uF is 25 V on 3.3 V (the rule asks 16/25/50 V on these rails); the real capacitance at bias is lower (not measured, check the DC-bias curve of C394395 and C45783 if the rails misbehave). |
| C5, LED-6 | pass | No polarized SMD part (all ceramic). The hand-soldered bulk electrolytic across `J1` (LED-5) is polarized: the `5V` pad label is +. |
| C7 | pass | `C1` (1210) and `C3` (0805) are at rotation 0, long axis parallel to the nearest board edge. |
| R3, R8 | pass | Series resistors R1 1 kohm and R2 330 ohm, pull-down R5 10 kohm, gate resistor R6 1 kohm, I2C pull-ups 4.7 kohm; all are JLCPCB basic parts. |
| R4 | pass | I2C pull-ups: Rp(min) = (3.3 - 0.4) / 3 mA = 0.97 kohm; Rp(max) at 100 kHz = 1000 ns / (0.8473 x Cb), so 4.7 kohm is good up to about 250 pF; at 400 kHz only about 75 pF (the BH1750 works at 100 kHz, firmware default). Check that the GY-302 pull-ups go to its 3.3 V LDO, not VIN (Open questions). |
| P1, P2 | pass | LDO from 5 V to 3.3 V: 1.7 V drop (1.95 V at 5.25 V in), about 0.3 W average, about 1 W in a 0.5 A Wi-Fi burst (the datasheet gives 110 degC/W for SOT-223 on minimum copper, so the average is about 30 K, the burst is short); dropout of the AP7361C is 0.34 V at 1 A, plenty at 4.5 V in. |
| P4, P8 | **fail** (open) | `U3` VIN has no input capacitor: `C1` is about 49 mm of 0.8 mm trace away and the DFPlayer amplifier (about 0.9 A peaks) is on the same line (the DESIGN.md 24 exception is a real electrical risk, not only a layout one). Retried 2026-10-06, no place found on this board (see DESIGN.md row 24). Power path order is now input pad, protection transistor, bulk cap, regulator, loads (P8); the fuse is external. |
| ESP-3, ESP-4, ESP-5, ESP-12 | pass | ESP32-S3: the strapping pins 0, 3, 45, 46 are unused; IO2/4/6/7/8/9 are plain GPIO with 3.3 V logic and light loads (the level shifter, two UART lines, I2C, a button). |
| ESP-6 | partial | Panels are powered from the supply directly (Open questions); `J4` 5V is the board's 0.8 mm rail behind `Q1`, fine for panel 1. See LED-5 for the bulk capacitor. |
| ESP-7 | pass | `R1` 1 kohm in the UART TX line at the ESP32 pin. |
| ESP-10 | exception | The antenna end is over the board (bottom pour keep-out of 7 + 2 mm, estimated), the DFPlayer is 13.3 mm away (rule: 15 mm), the 5V riser and the UART lines pass beside the end. Kept, see Open questions. |
| LED-5 | partial | Level shifting is right (74AHCT1G125 from 5 V, VIH 2 V). The 500-1000 uF across the LED supply is a hand-soldered electrolytic across the `J1` pads or at the first panel (not on the board, not in the BOM): **add it when assembling**. The 330 ohm `R2` is in the 300-500 ohm range but sits at the level shifter, not at the first pixel. |
| LOGIC-1, 3, 4, 5 | pass | AHCT input level (VIH 2 V) accepts the 3.3 V GPIO, `C4` decouples the package. |
| FUSE-1, PR-2, PR-3, Q5 | partial (fixed 2026-10-06) | Reverse polarity: P-MOSFET `Q1` (AO3401A) in the + line, gate through `R6` to GND (Q5; Vgs is 5 V, inside the +-12 V limit, so no zener). No fuse and no TVS on the board: use a fused supply (about 3 A); the board takes up to about 2.5 A (panel 1 1.4 A, DFPlayer 0.9 A, ESP32 0.3 A). |
| PR-1 | partial | The snooze button (`J3`) and the sensor lines (`J5`) are bare wire pads straight to the MCU: no series resistor or clamp. Low risk (case, MCU ESD protection); a 1 kohm + 100 nF RC on `SNOOZE` would also be the debounce. |

### Circuit rules: calculations

- **AP7361C dissipation (P1):** P = (Vin - Vout) x I = (5.25 V - 3.3 V) x I: 0.2 A gives 0.39 W, 0.5 A (Wi-Fi burst) gives 0.98 W; with 110 degC/W (SOT-223 on minimum copper, datasheet) that is 43 K at 0.2 A. SOT-223 with no heat copper (DESIGN.md 27 exception): fine on average, check the temperature if Wi-Fi is busy all the time.
- **Q1 (Q5):** AO3401A, Vgs = -5 V when on (limit +-12 V), Rds(on) about 50 mohm at 4.5 V: 2.5 A gives 0.31 W and 0.13 V drop; source current from the body diode at power-up is limited by `C1` (100 uF).
- **R5 (LOGIC-2):** 10 kohm pull-down on `U4` A: 3.3 V / 10 kohm = 0.33 mA when the ESP32 drives high, which is fine for a GPIO.
- **I2C pull-ups (R4):** 3.3 V, VOL 0.4 V, IOL 3 mA: Rp(min) = 0.97 kohm; Rp(max) = tr / (0.8473 x Cb) = 1000 ns / (0.8473 x 250 pF) = 4.7 kohm at 100 kHz. A line pulled low draws 3.3 V / 4.7 kohm = 0.7 mA.
- **Level shifter (LED-5):** the WS2812 needs VIH = 0.7 x 5 V = 3.5 V, a 3.3 V GPIO is below it; the AHCT buffer (VIH 2 V, powered from 5 V) drives 5 V into 330 ohm and the panel DIN.
- **Bulk capacitor `C1`:** 100 uF X5R, 16 V, 1210 on the 5 V rail (31 % of the rating, as C3 asks); the capacitance at 5 V is lower than 100 uF.

## Decisions

- **2 mm rounded board corners** (user request) on both boards: `borderRadius="2mm"` on `<board>`. The GND pours got `boardEdgeMargin="0.25mm"`: with the rounded outline the 0.2 mm default fails the copper-to-board-edge check by rounding (measured 0.200, required 0.200). The case needs matching 2 mm corner radii.
- **LED part:** user's choice, C3646929 (Economic assembly OK). Local footprint; 3D model: the EasyEDA model of C3646929 via modelcdn (`objUrl`).
- **No per-LED capacitor** (user decision): a bar is just 10 LEDs. Only a 22 uF bulk capacitor at the entry.
- **One data chain through all LEDs** of all panels: DIN of the first panel from the controller, then DOUT to DIN between panels.
- **Two layers, top-side parts only** to keep Economic assembly and a cheap board; GND on the bottom pour instead of a second 5V/GND layer pair. Rejected: 4 layers (cost, not needed for the current budget).
- **Explicit routing** instead of the autorouter: the autorouter produced tangled, uneven copper and tried to connect GND pad to pad on top.
- **Bars like discrete bars with gaps** (user, from a photo of a laser-cut board with separate bar PCBs): no shared corners, ~3 mm gaps, so the corner links pass through the gap and nothing collides. Replaces the first version where the vertical bars ran into the horizontal rows (100 mm figure-8). Costs height: ~120 mm instead of 100 mm.
- **Chain order f-a-b-c-d-e-g** instead of alphabetical, so DIN and DOUT are both at mid height on the left/right.
- **5V link b to c stays on top**; it blocks the straight exit of U70.DOUT to the next digit, which will hop under it on the bottom layer when the digits are chained.
- **Solder pads, no connector** for the wire entry (user decision).
- **5V and GND pads on both sides** (user, to ease wiring): the right side J2 repeats 5V/GND next to DOUT. Rejected: all pads on the bottom edge (user said left and right sides).
- **One panel per board, four boards** instead of one four-digit board (user decision): the panels are mounted in a 3D printed case and chained with wires. Each has pads DIN, 5V, GND on the left and DOUT, 5V, GND on the right (user: "left and right sides", same order top to down on both sides, easy wiring; a bottom-edge pad row was rejected).
- **Controller: ESP32 USB-C end towards the left edge with a 1.25 mm margin, antenna towards the centre** (user: the antenna need not be at the edge, and the module must not sit on the real board edge, its USB-C connector is on the module top; this replaces the earlier antenna-at-the-edge decision and the flush placement). Consequence: the module's 5V/GND/3V3 pins are now on the top row (away from the connectors), so the AMS1117 moved into the strip above the module and its 5V comes up a top-layer riser in the corridor between the modules (the two UART lines hop under it). Rejected: ESP32 on the right with USB at the right edge and the DFPlayer on the left (the power pins would be on the bottom row, but the UART lines would have to cross the speaker pins and the DFPlayer VCC would be at the far end from the supply); the UART through the pad gaps.
- **Controller: AP7361C-3.3 (was AMS1117-3.3) feeds the ESP32 3V3 pin, the 5V pin stays unconnected** (user asked for a separate 3.3 V power chip; the regulator was swapped 2026-10-06, see the circuit rules audit). Consequence: with USB plugged in, the module's own regulator and the AMS1117 are in parallel on 3V3 (usual for dev boards); the 5 V rail is not backfed from USB through the 5V pin. Rejected: powering the module from its 5V pin (would not need U3, but the user asked for the chip).
- **Controller: DFPlayer without amplifier**: it drives a mono speaker (up to 3 W) directly from SPK_1/SPK_2; DAC outputs unused.
- **Controller: 5 V power pads 5.08 mm apart, 1.2 mm drill, 2.4 mm pad** (user: "solder pins only 5 mm distance", then DESIGN.md rules 5 and 6: one pitch and one pad size per function, so `J1` follows the speaker pads `J2`; 5 mm was 3 mm pad / 1.5 mm drill), bulk capacitor 100 uF at the entry, moved next to `J1` so its GND reaches the `J1` GND pad without a via.
- **Controller: LED output pads `J4` = DATA, 5V, GND** (user: 5V next to DATA and GND for easy wiring, same order as the digit panel pads). The 5V pad is on the board's 5V rail, which is a 0.8 mm trace from `J1`: fine for panel 1 (about 1.4 A at full white) but not for all four panels at full brightness, so power the other panels from the supply (or cap the brightness in firmware).
- **Controller: explicit routing, all signals and power on the top layer, GND as a bottom copper pour** (DESIGN.md rule 15 then read "no vias on 5V/GND"; it is now 5V only and the pour is rule 16; this reverses the earlier "no pour, GND as a bottom-layer tree with a via per pin" decision). Why: tscircuit starts an explicit trace on the top layer even at a through-hole pad, so every bottom-layer GND branch needed a via (12 GND vias and 3 on 5V before); with the pour the through-hole GND pins join it directly and the SMD GND pins get a GND via (first run on the top layer to a through-hole GND pad; changed 2026-10-05 when DESIGN.md rule 16 required GND vias for top-layer GND pads: `C1` and `U4` now have a via instead of a 20-40 mm top-layer GND trace). Result: no via on 5V or 3V3, five on GND (`C1` and `U4` GND: rule 16; `U3` GND: its way to the ESP32 GND pin would cross the 3V3 line; `C3` GND: the cap had to leave the top left screw circle, DESIGN.md rule 18, and cannot reach the ESP32 GND pin on one layer; `C4` GND: the cap had to sit next to `U4` VCC, DESIGN.md rule 24, 6.4 mm from the nearest GND pad), four on signals (the two UART lines hop under the 5V riser). Rejected: the autorouter (tangled GND pad-to-pad traces, long diagonals); keeping the via-per-pin tree. The pour also gives a low-impedance return for the DFPlayer speaker current (up to ~0.9 A peaks), the WS2812 data line and the ESP32 Wi-Fi bursts. The pour keeps 1.27 mm from the board edge and has a keep-out under the ESP32 antenna end (rules 16 and 26).
- **Controller: 1.27 mm grid, board 60.31 x 43.82 mm (now 60 x 44 mm, see the CIRCUIT_RULES decision below)** (DESIGN.md rule 3): every pad and module pin is on the grid; the board was 59.06 mm wide with the ESP32 flush with the left edge, and was widened by 1.25 mm on the left (the edge moved, no part did) so the ESP32 outline has the DFPlayer's 1.25 mm edge margin. Holes at (-26.65 / +25.4, +-16.51), equal 4.13 mm inset, the lower holes on the line of the connector row. Rejected: moving the ESP32 one grid unit right (the 13.3 mm corridor with the 5V riser and the UART hops would shrink to 12 mm and every ESP wire would change); 60.33 mm (all holes on the grid, but a 1.27 mm margin that differs from the DFPlayer's).
- **Controller: connectors in two classes** (rules 5 and 6): signal pads (`J3`, `J4`) 2.0 / 1.0 mm at 2.54 mm pitch, power pads (`J1`, `J2`) 2.4 / 1.2 mm at 5.08 mm pitch; header pads of both modules 1.6 / 1.0 mm; the groups are 7.62 mm apart (pad centre to pad centre, so the pads stay on the grid). The snooze pad is labelled `SNZ` so two labels fit on the 2.54 mm pitch.
- **Controller: part orientation** (rule 4): modules rotated 90 deg, every R, C and IC at 0 deg; `C3` has its pin 1 on 3V3 (left, at the AMS1117 tab) and pin 2 on GND (right, via).
- **Controller: light-sensor pads `J5` on the top edge above the DFPlayer, I2C pull-ups on the board** (user: wire a GY-302/BH1750 to four solder pads for the future brightness control). The bottom edge has no 4-pad gap, the left and right edges are filled by the module pins, so the free strip above the DFPlayer (top edge row, y = +16.51) is used; the board size and case outline stay the same. Pad order 5V, GND, SCL, SDA as on the GY-302 header. 5V is a chamfered continuation of the riser (top layer, 0.8 mm, no via); GND joins the pour through the pad. SDA = IO9, SCL = IO8: any GPIO can be I2C on the S3, these are the free header pins nearest to `J5`; the pair is swapped against the Arduino defaults (SDA 8, SCL 9) so the two lanes above the pad row cross nothing, firmware uses `Wire.begin(9, 8)`. Each line hops under the 5V line on the bottom layer (vias on signals are allowed), runs east under the pull-ups and surfaces at its pull-up pad `R4` (SDA) / `R3` (SCL); then two lanes above the pad row (SCL the lower one, 18.4 mm, SDA the upper one, 19.05 mm) drop onto the `J5` pads. Pull-ups 4.7 kohm to 3V3 (user choice: on the board, because the GY-302 pull-up wiring is unknown; parallel module pull-ups are harmless at 100 kHz). Rejected: widening the board for pads on the right edge or the bottom row (case change), pads at the end of the bottom row (no room), pull-ups only in the firmware (about 45 kohm internal, unverified).
- **Controller: DESIGN.md reread 2026-10-06 (43 rules)**: the board grew 1.27 mm at the top and at the bottom (60.31 x 43.82 mm, user decision) so the group labels (rule 43: 1.5 mm further out than the pin labels, then 1.27 mm to the edge) fit; the mounting holes follow to y = +-17.78 (equal 4.13 mm inset, on the grid) and the `J5` labels moved to the outer side of its pad row. The last leg of `SDA`/`SCL` to `J5` moved from the top layer (it ran through the labels) to the bottom layer (a via pair each, 4 more signal vias). Module texts are horizontal, pin 1 of both modules is marked, and the schematic was re-laid out (rules 29-36, only `sch*` props: pins grouped and spaced with `schPinStyle`, signal wires aligned, connectors with one pin side, `schMaxTraceDistance` 4.5). Rejected: keeping the board size with exceptions for rule 43.
- **Controller: modules hand-soldered, `doNotPlace`** (ESP32 module, DFPlayer, wire pads); the JLCPCB BOM only has the 7 SMD parts.
- **Controller: CIRCUIT_RULES.md fixes (2026-10-06, user: "do controller circuit fixes")**: (1) `U3` AMS1117 -> AP7361C-33ER-13 (C3743528, same pin order, stable with the ceramic `C3`; VIN absolute maximum 6.5 V, so the supply must be a regulated 5 V; user chose it over the TLV1117, whose "new" and "legacy" chips share a part number); (2) `R5` 10 kohm pull-down on the level shifter input; (3) reverse polarity protection `Q1` (AO3401A, C15127) + gate resistor `R6` right above the `J1` 5V pad, user choice "P-MOSFET only": the fuse stays external (fused supply cable), the 5V pad now feeds `Q1` and everything else hangs on its source (`C1` moved east to (8.26, -9.53) and the `J4` 5V feed leaves the riser at y = -12.07, both to make room); (4) the 470-1000 uF LED supply capacitor is a hand-soldered electrolytic across `J1` (user choice), not on the board; (5) the board is 60 x 44 mm (whole mm, user request "try to minimize, round to integer"): the width shrank by 0.31 mm (module margins 1.25 -> 1.095 mm) and the height grew by 0.18 mm. Rejected: a custom mirrored AP7361C footprint with VIN on top and a 1 uF input cap above it (the 3V3 wire to the ESP32 and the I2C lanes block it), 59 x 43 mm (rule 26 and 43 clearances), PTC on the board (about 12 x 5 mm near `J1`, no room), a Schottky for reverse protection (0.3-0.5 V drop at 2 A).

## Open questions / TODO

- Verify the LED current per colour from the XL-0807RGBC-2812B datasheet and set the real power budget (supply size, trunk width, firmware brightness cap).
- Case fit of the 3.5 mm corner holes (4 mm inset from the edges) and the pads, diffuser; optional colon dots (24 h clock) as a separate small board.
- 5V and GND are wired to each panel separately (only DIN/DOUT are chained): one panel draws up to ~1.4 A, so use a thicker wire per pad and a 5V supply sized for ~5.6 A with a brightness cap.
- Check the LED rotation in the JLCPCB assembly preview before ordering (`tsci export` warns "cannot verify jlcpcb pick-and-place rotation"; the LEDs are exported at 270 deg / 180 deg depending on the bar).
- Controller: **verify the module footprints against the real boards** (ESP32-S3 SuperMini row spacing 16.5 mm and pin positions were read off a picture; DFPlayer HW-247A pinout and 15.24 mm row spacing are the standard DFPlayer Mini values, not measured). Print the board at 1:1 and hold the modules against it before ordering.
- Controller: DFPlayer microSD slot orientation/access (which side is the slot on, can a card be changed with the module soldered in place?); the footprint just has a 21 x 21 mm outline. The DFPlayer and the ESP32 have no 3D model (custom footprints), so the 3D picture shows only the SMD parts.
- Controller: the 3 J2/J1/J4 connector warnings ("not in accessible orientation") are informational (wire pads, no insertion direction).
- Controller: the board is compact on purpose: clearances are 0.2-0.5 mm in places; check the USB plug and the DFPlayer SD card fit in the case (the board is 60 x 44 mm now, 2 mm wider and 3 mm taller than the previous 58 x 41 mm version, so re-check the case fit). The antenna end of the ESP32 sits in the board interior; the UART lines pass 1.3 mm below the module edge and the 5V line 3.4 mm above it, and the bottom GND pour has a keep-out there (7 mm of the module plus 2 mm beyond; the antenna length is an estimate, check it against the real module). If Wi-Fi range is poor, enlarge the keep-out (`ANT_LEN` in `controller.circuit.tsx`) or move the 5V line further up.
- Controller: DESIGN.md schematic and placement rules (now 19-27) were added: the schematic now reads inputs left, MCU middle, outputs right, `C4` moved next to `U4` VCC. Open: `U3` VIN has no capacitor within 3 mm (rule 24), the top edge is 1.08 mm from the `U3` GND pad (rule 26), and the AMS1117 has no dedicated heat copper (rule 27).
- Controller: DESIGN.md rule 17 (no 90 degree corners, T junctions allowed) was added: every corner of the explicit copper is two 45 degree bends (`chamfer()`/`wire45()` in `controller.circuit.tsx`); vias and the GND pour are unchanged.
- Controller: all four screw heads (5.5 mm) now have a free 6 mm circle (DESIGN.md rule 18); `C3` moved east of `U3` for it and needs a GND via (see the rule 16 row). If the 3V3 rail needs a capacitor right at the ESP32 pins, check the SuperMini's own capacitors first.
- Controller: light sensor `J5` (GY-302 / BH1750): **check on the real module whether its SDA/SCL pull-ups go to its 3.3 V LDO output or to VIN** before connecting it with 5 V on VIN: if they pull up to 5 V the ESP32 pins (3.3 V only) would see 5 V; then power the module from 3V3 instead or remove its pull-ups. Firmware (not in this repo yet): `Wire.begin(9, 8)` (SDA 9, SCL 8), BH1750 address 0x23 (0x5C with ADDR high), continuous high-resolution mode 0x10, smooth the lux value before mapping it to the LED brightness. The module's built-in WS2812 status LED is on GPIO48 (the Waveshare ESP32-S3-Zero pin picture shows GP21, that is that board, not this one). The sensor must look at the room, not at the LEDs (case window or a light shield on the cable end).
- Controller: **no input capacitor at the AP7361C VIN** (CIRCUIT_RULES P4, DESIGN.md 24; datasheet: 1 uF "as close as possible"); needs a bigger board or the regulator at another place. Also check the AP7361C tab connection on the package drawing (README parts table), and add the LED supply electrolytic (470-1000 uF, 10 V or higher) across the `J1` pads when assembling.
- Controller: ESP32 5V pin is unconnected; if the board should also be powered by USB alone, add a Schottky from the 5 V rail instead (open).
- Controller: firmware UART on IO7 (TX) / IO6 (RX), LED data on IO4, snooze on IO2 with INPUT_PULLUP (remap in the firmware); add an RC debounce or do it in the firmware.

## Finding JLCPCB parts

Query the [jlcsearch](https://jlcsearch.tscircuit.com/) JSON API (e.g. `leds/list.json`, `led_with_ic/list.json`, `capacitors/list.json`, `components/list.json?search=...`). Prefer basic parts (`is_basic=true`) and pick the highest stock. Then open the part page (`https://jlcpcb.com/partdetail/C<number>`) and confirm it says `PCBA Type: Economic and Standard`; jlcsearch does not expose this flag. Record the chosen part as `supplierPartNumbers={{ jlcpcb: ["C..."] }}` in the TSX. Also browse [tscircuit datasheets](https://tscircuit.com/datasheets).

## Setup

Requires Node and [Bun](https://bun.sh) (`tsci` runs under Bun; make sure `~/.bun/bin` is on PATH).

```bash
npm install
npm start              # tsci dev: interactive preview
# every board script exists twice, :display (seven-segment-display.circuit.tsx) and :controller (controller.circuit.tsx)
npm run check:full:display        # tsc + eslint + prettier + netlist + schematic placement + build + shorts check (check:wiring:<board> stops before the build)
npm run check:full:controller
npx tsci snapshot -u              # regenerate the schematic and PCB SVG snapshots of both boards (the schematics are embedded at the top of this README)
npm run export:images:display     # rebuild and refresh docs/images/display-{pcb,3d}.png (embedded at the top of this README)
npm run export:images:controller  # docs/images/controller-{pcb,3d}.png
npm run export:gerbers:display    # dist/gerbers-display.zip with Gerbers, drill, bom.csv, pick_and_place.csv
npm run export:gerbers:controller # dist/gerbers-controller.zip
npm run export:cpp                # cpp/SevenSegLayout.h, the FastLED helper (needs Bun)
npm run update:skill   # re-install the latest tscircuit AI skill into .claude/skills/tscircuit/
```

Before sharing or fabricating, work through the checks in order: `tsci check netlist`, `schematic-placement`, `placement`, `routing-difficulty` (informative only here, the digit is routed explicitly), then `tsci build`, then `tsci check shorts`. See `.claude/skills/tscircuit/CHECKLIST.md` for the pre-fab checklist.

## References

- [tscircuit docs](https://docs.tscircuit.com/); the full docs are also available as one text file at https://docs.tscircuit.com/llms.txt
- [DESIGN.md](https://github.com/agentic-pcb/example-base/blob/main/DESIGN.md): PCB layout and schematic rules, shared in the template repo `agentic-pcb/example-base` (not copied; applied to the controller board only)
- [CIRCUIT_RULES.md](https://github.com/agentic-pcb/example-base/blob/main/CIRCUIT_RULES.md): rules for parts and values (capacitors, regulators, ESP32, LEDs, protection), shared in the template repo (not copied; audited in "Circuit rules status (controller)")
- [tscircuit datasheets](https://tscircuit.com/datasheets)
- [jlcsearch](https://jlcsearch.tscircuit.com/)
- AI skill: [tscircuit/skill](https://github.com/tscircuit/skill), installed in `.claude/skills/tscircuit/`
- Controller: DESIGN.md reread 2026-10-05: rule 14 now covers every supply net (3V3 is 0.6 mm, passes), rule 16 needs GND vias on top-layer GND pads, a pour margin of rule 26 (1.27 mm) and no pour under an antenna. `C1` and `U4` got GND vias (their long top-layer GND traces to `J1`/`J3` are gone), the pour margin went from 0.25 to 1.27 mm and the bottom pour has an antenna keep-out.
- Controller: DESIGN.md rule 28 (2 mm board corner radius) was added: already met (`borderRadius="2mm"`), audit row added.
