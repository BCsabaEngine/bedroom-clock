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
2. **Controller board** (`controller.circuit.tsx`, 59.06 x 41.28 mm): ESP32-S3 SuperMini dev module at the left edge (USB-C flush with the board edge so the plug is reachable) and the DFPlayer (HW-247A, 16P) next to it on the same baseline, 5V input pads, an AMS1117-3.3 for the ESP32, a 74AHCT1G125 level shifter plus 330 ohm series resistor for the WS2812 data line, speaker pads, a snooze button input and four 3.5 mm corner holes; all connectors are in one row along the bottom edge with equal gaps between the groups. The layout follows the alignment rules in [DESIGN.md](DESIGN.md). Details under "Controller board" below.

Firmware (not in this repo): custom, web UI written in Svelte and embedded with the `svelteesp32` library, with a Wi-Fi settings portal (time, alarm, song, volume ramp, brightness).

## Status

- Digit panel: **one digit** (70 LEDs) with wire pads on both sides (left DIN/5V/GND, right DOUT/5V/GND, both top to down), four 3.5 mm corner holes pad labels and a TOP mark, 76 x 124 mm; order four of them. `check:wiring:display`, `tsci build` and `tsci check shorts` pass. Fabrication outputs export (BOM: 70 LEDs + 1 capacitor).
- Controller board: **compact design** (`controller.circuit.tsx`, 59.06 x 41.28 mm, all connectors on the bottom edge), explicitly routed, GND as a bottom copper pour, checked against all 15 rules of [DESIGN.md](DESIGN.md) (status table there: 4 documented exceptions). `tsc`/eslint/prettier, netlist, schematic-placement, placement, `tsci build` and `tsci check shorts` pass (`npm run check:full:controller`). BOM: 7 SMD parts (C1, C3, C4, U3, U4, R1, R2); the ESP32 module, the DFPlayer and the wire pads are hand-soldered (`doNotPlace`). Not yet verified against the real modules (see Open questions).
- Next: verify the module footprints against the real boards, decide case fit of the holes (Open questions).

## Requirements

- **Purpose:** one 7-segment digit panel built from WS2812-type RGB LEDs (2.0 x 1.8 mm), 10 LEDs per segment, 5 cm segment length, bars not overlapping (horizontals between the vertical columns, verticals between the horizontals, ~3 mm gaps), so about 120 mm digit height, one data chain. Four panels are ordered and built into a 3D printed case; the panels are chained with wires (DOUT to DIN). Brightness/colour set by firmware.
- **Board size / form factor:** one digit per board, 76 x 124 mm, 2 layers, all SMD parts on the top side.
- **Power sources and rails:** 5 V only, fed through the 5V and GND wire pads of each panel from the controller board / supply. Current budget: see Design notes.
- **I/O (connectors, headers, mounting holes):** plated wire pads (hand-soldered, no connector) on both side edges, 2.54 mm pitch: `J1` on the left, DIN (top), 5V (middle), GND (bottom); `J2` on the right, DOUT (top, level with the end of the middle bar), 5V (middle), GND (bottom); both sides read data, 5V, GND from top to down. The right pads sit about 5.6 mm lower than the left ones. Left and right 5V/GND are the same nets (wire power to either side). Four 3.5 mm non-plated holes at (+-34, +-58) mm from the board centre. A small `TOP` silkscreen text above the top bar marks the top edge, and every wire pad has its name (DIN, 5V, GND, DOUT) on the silkscreen on its inboard side (on the left the DIN and 5V names sit just above their traces).
- **Mechanical constraints:** the digit outline is fixed by the 5 cm bars: LED rows of the horizontal bars at y = +57.6 / 0 / -57.1 mm (x = -22.5..22.5), vertical bars at x = +-28.5 mm (centre lines), upper LEDs y = 6.6..51.6, lower -51.1..-6.1. Enclosure not defined yet.
- **Manufacturer and constraints:** JLCPCB; basic parts where one exists; Economic assembly (only parts marked "PCBA Type: Economic and Standard", never "Standard Only"; top side only).

### Controller board requirements

- **Purpose:** drive the four chained digit panels (one WS2812 data line, 280 LEDs), play the alarm song through a DFPlayer, take one snooze button, and run the firmware on an ESP32-S3.
- **Board size / form factor:** 59.06 x 41.28 mm = 2438 mm2 (46.5 x 32.5 grid units of 1.27 mm; 15 % smaller than the 64 x 45 mm version, the user asked for 10-20 %), 2 layers, SMD parts on the top side only, GND is a copper pour on the bottom layer. The size follows the 1.27 mm grid of [DESIGN.md](DESIGN.md): with the USB-C end of the ESP32 flush with the left edge its pins only land on the grid if the half width is 29.53 mm. Four 3.5 mm non-plated holes at (+-25.4, +-16.51) mm from the board centre (on the grid, equal 4.13 mm from all edges). **Every connector (power, LED output, snooze, speaker) is a plated pad in one row along the bottom edge** (y = -16.51 mm, the same line as the lower holes), labelled on the silkscreen on one baseline, in four groups 7.62 mm apart pad centre to pad centre (snooze, LED output, power, speaker). The size follows from the parts: width = ESP32 module 23.5 + DFPlayer 21 + a 13.3 mm corridor between them (5V riser, UART hops, `R1` is left of it; the antenna end of the ESP32 faces it) + margins, and it also has to hold the 40.6 mm connector row clear of the holes; height = connector row and level shifter section below the module pins (about 11 mm), the 18/21 mm module bodies, and the AMS1117 section above the ESP32 (about 8 mm).
- **Power:** 5 V only, through two plated solder pads **5.08 mm apart** (`J1`: 5V, GND; 1.2 mm drill, 2.4 mm pad, the same size as the speaker pads: the power class of [DESIGN.md](DESIGN.md) rules 5 and 6). A 100 uF bulk capacitor sits at the input right next to `J1` (it also serves as the AMS1117 input capacitor, about 30 mm of 0.8 mm trace away: if the 3V3 rail misbehaves, add a 22 uF capacitor at the AMS1117 input). The ESP32 gets 3.3 V from an AMS1117-3.3 (3V3 pin of the module); the DFPlayer and the level shifter run from 5 V.
- **ESP32:** ESP32-S3 SuperMini (Hestore 10051729), soldered on its header pins on the left board edge with the **USB-C end flush with the edge** so the plug is reachable (user: the antenna no longer has to be at the edge). The antenna end points to the board centre; nothing is placed within about 3 mm of it except the two UART lines (1.3 mm below the module edge) and the 5V line (1.7 mm above the pins, 3.4 mm above the module body); the bottom copper pour fills the area behind it. The module and the DFPlayer share one baseline: their bottom pin rows (the ones facing the connectors) are at the same y.
- **Level shifting:** the ESP32 data pin (3.3 V) goes through a 74AHCT1G125 (powered from 5 V, VIH about 2 V) and a 330 ohm series resistor to the `LED DATA` pad; the first panel's DIN takes it.
- **Audio:** DFPlayer (Hestore 10038040, HW-247A DFPlayer-16P) on 2 x 8 pin rows; speaker (SPK1/SPK2, mono, up to 3 W) on two solder pads (`J2`, 5.08 mm apart, 1.2 mm drill, 2.4 mm pad).
- **Input:** one button on solder pads (`J3`, two pads labelled `SNZ` and `GND`, 2.54 mm apart, 1.0 mm drill, 2.0 mm pad); the other side of the button goes to GND, the ESP32 uses its internal pull-up.
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

Layout rules: see [DESIGN.md](DESIGN.md) (controller board only, not the digit panel).

**Parts**

| Ref | Part | JLCPCB | Why |
| --- | --- | --- | --- |
| U1 | ESP32-S3 SuperMini, 18 pin header footprint (hand-soldered) | - | Chosen by the user; `doNotPlace`. |
| U2 | DFPlayer-16P (HW-247A), 2 x 8 pin footprint (hand-soldered) | - | Chosen by the user; `doNotPlace`. |
| U3 | AMS1117-3.3, SOT-223 | C6186 | Basic, Economic and Standard; 1 A, plenty for the ESP32-S3 (peak about 0.35-0.5 A with Wi-Fi). |
| U4 | SN74AHCT1G125DBVR, SOT-23-5 | C7484 | 5 V buffer with TTL-level inputs (VIH 2 V), so a 3.3 V GPIO drives it directly; Economic and Standard. Extended part. |
| C1 | 100 uF 16 V X5R 1210 | C394395 | Bulk capacitor ("stabilizer") at the 5 V entry, next to `J1` (its GND pad runs straight to the `J1` GND pad); Economic and Standard. Extended part. |
| C3 | 22 uF 25 V X5R 0805 | C45783 | AMS1117 output capacitor. Basic. (An input capacitor C2 was dropped for lack of room: its courtyard collided with the regulator's; C1 is on the same 0.8 mm 5V line about 30 mm away and acts as the input capacitor; if the 3V3 rail misbehaves, add a 22 uF capacitor at the regulator input.) |
| C4 | 100 nF X7R 0603 | C14663 | Decoupling at the 74AHCT1G125. Basic. |
| R1 | 1 kohm 0603 | C21190 | Series resistor in the ESP32 TX to DFPlayer RX line (DFPlayer RX is 3.3 V tolerant but this limits ringing/overcurrent), placed next to the ESP32 pin. Basic. |
| R2 | 330 ohm 0603 | C23138 | Series resistor at the level shifter output, near the source. Basic. |
| J1..J4 | plated wire pads (`doNotPlace`) | - | Power class (2.4 mm pad, 1.2 mm drill, 5.08 mm pitch): `J1` 5V/GND in, `J2` speaker. Signal class (2.0 mm pad, 1.0 mm drill, 2.54 mm pitch): `J3` snooze (`SNZ`, GND), `J4` LED output (DATA, 5V, GND). |

All SMD parts were checked on their jlcpcb.com part page: "PCBA Type: Economic and Standard".

**ESP32-S3 SuperMini footprint** (from the vendor drawing, USB-C up): left header row top to bottom TX, RX, IO1..IO7; right row 5V, GND, 3V3, IO13..IO8; 2.54 mm pitch, rows 16.51 mm apart (13 grid units, read off the picture, **verify with a caliper**), pins 1.6 mm from the module ends, module about 23.5 x 18 mm. The module is placed rotated by 90 degrees: USB-C faces the left board edge and is flush with it, the antenna end faces the board centre, the TX..IO7 row is the bottom row (facing the connectors) and the 5V/GND/3V3/IO13..IO8 row is the top row. The footprint is a local `<footprint>` with 18 plated holes (1.0 mm drill, 1.6 mm pad, small enough that a 0.4 mm trace fits between two neighbouring pads; the DFPlayer uses the same pad size), no 3D model.

**DFPlayer footprint**: standard DFPlayer Mini layout, left row top to bottom VCC, RX, TX, DAC_R, DAC_L, SPK_2, GND, SPK_1; right row bottom to top IO1, GND, IO2, ADKEY1, ADKEY2, USB+, USB-, BUSY; rows 15.24 mm apart; silkscreen box 21 x 21 mm. The module is placed rotated by 90 degrees so that the left row (VCC at the west end, SPK_1 at the east end) is the bottom row facing the connector edge. Only VCC, RX, TX, SPK_1, SPK_2 and both GND pins are used; BUSY is not connected (dropped to keep the routing simple; the firmware can follow the playback state from the DFPlayer's UART replies).

**Pin plan** (ESP32-S3; no strapping pins used: 0, 3, 45, 46 stay free; USB D+/D- stay free for programming):

| Signal | ESP32 pin | Goes to |
| --- | --- | --- |
| LED data (3.3 V) | IO4 | U4.A (74AHCT1G125) |
| DFPlayer RX line | IO7 | R1 (1 kohm) to U2.RX; firmware: UART TX on IO7 |
| DFPlayer TX line | IO6 | U2.TX; firmware: UART RX on IO6 |
| Snooze | IO2 | J3.SNOOZE (button to GND, internal pull-up) |
| 3V3 | 3V3 | U3 output |
| GND | GND | GND pour (bottom layer) |
| 5V | 5V | not connected |

**Power**: the 5V from `J1` runs entirely on the top layer, 0.8 mm wide, with no via. A riser at the x of the `J1` 5V pad (2.54 mm) goes up the corridor between the modules to a line along y = 13.97 mm that runs west above the ESP32 pins to the AMS1117 input (`U3` sits above the ESP32 so its output is a few mm from the module's 3V3 pin, which is on the top pin row). Branches off the riser: east along y = -5.08 mm to the DFPlayer VCC (the west end of its bottom pin row), the bulk capacitor `C1` right next to `J1`, and west along y = -9.21 mm (the VCC pad row of `U4`) to the level shifter VCC, `C4` and the `J4` 5V pad. The AMS1117 tab (VOUT) goes straight to the ESP32 3V3 pin (0.6 mm), the output capacitor `C3` sits on the way between the 3V3 line and the ESP32 GND pin; the ESP32 5V pin stays unconnected on purpose (see Decisions). The DFPlayer drives the speaker directly (mono, SPK_1/SPK_2, up to about 3 W at 5 V), so there is no extra amplifier. **GND is a copper pour on the bottom layer** (`<copperpour connectsTo="net.GND" layer="bottom" />`): every through-hole GND pin (`J1`, `J3`, `J4`, the ESP32 GND, both DFPlayer GND pins) touches it directly (a plain `to="net.GND"` trace without a path, nothing to route), and the SMD GND pins reach a through-hole GND pad on the top layer: `C1` to the `J1` GND pad, `C4` to the `J4` GND pad, the `U4` GND and OE pins (joined by a 0.5 mm link through the channel between the pad columns, exactly double a signal) to the `J3` GND pad, `C3` to the ESP32 GND pin. Only `U3` GND has a via (see Decisions). Every 5V and GND trace is 0.8 mm wide (user request), signals are 0.25 mm. The pour also fills the area behind the ESP32 antenna end; if Wi-Fi range suffers, cut it back there (a `<keepout>` or a cutout). `tsci check shorts` is clean.

**Routing**: explicit like the digit board (`<board routeRemaining={false}>`, `<trace pcbPath>`, helpers `wire()`/`gndWire()`/`hop()` in the TSX with board coordinates on the 1.27 mm grid (`g(n)`), the frame converter `inFrame` and the pin-position helpers `espAt()`/`dfAt()`). Everything is on the top layer except the pour and the UART hops. Layout: connector row along the bottom edge (west to east: `J3` snooze, `J4` LED output, `J1` power, `J2` speaker); ESP32 on the left (USB-C at the edge), DFPlayer on the right; between them the corridor with the 5V riser. The speaker pins SPK_2/SPK_1 run straight down and then diagonally to `J2`; the level shifter section (`U4`, `C4`, `R2`) is below the ESP32's east half, above `J4`; the AMS1117 section (`U3`, `C3`) is in the strip above the ESP32, next to the module's 3V3/GND pins. The ESP32 bottom row goes straight down (IO2 snooze to `J3`; IO4 LED data runs down and east into the `U4` A pad from the west, the OE/GND link passes through the channel between the pad columns, so the A line does not cross it). IO7 (through `R1`) and IO6, the two easternmost bottom pins, run east just below the module pins at y = -6.35 / -7.62 mm to the DFPlayer RX/TX; both hop under the 5V riser on the bottom layer (a via pair each, vias on signals are allowed). Nothing else crosses a top-layer line.

## Decisions

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
- **Controller: ESP32 USB-C flush with the board edge, antenna towards the centre** (user: the antenna need not be at the edge, but the ESP32 USB port must be accessible; this replaces the earlier antenna-at-the-edge decision). Consequence: the module's 5V/GND/3V3 pins are now on the top row (away from the connectors), so the AMS1117 moved into the strip above the module and its 5V comes up a top-layer riser in the corridor between the modules (the two UART lines hop under it). Rejected: ESP32 on the right with USB at the right edge and the DFPlayer on the left (the power pins would be on the bottom row, but the UART lines would have to cross the speaker pins and the DFPlayer VCC would be at the far end from the supply); the UART through the pad gaps.
- **Controller: AMS1117-3.3 feeds the ESP32 3V3 pin, the 5V pin stays unconnected** (user asked for a separate 3.3 V power chip). Consequence: with USB plugged in, the module's own regulator and the AMS1117 are in parallel on 3V3 (usual for dev boards); the 5 V rail is not backfed from USB through the 5V pin. Rejected: powering the module from its 5V pin (would not need U3, but the user asked for the chip).
- **Controller: DFPlayer without amplifier**: it drives a mono speaker (up to 3 W) directly from SPK_1/SPK_2; DAC outputs unused.
- **Controller: 5 V power pads 5.08 mm apart, 1.2 mm drill, 2.4 mm pad** (user: "solder pins only 5 mm distance", then DESIGN.md rules 5 and 6: one pitch and one pad size per function, so `J1` follows the speaker pads `J2`; 5 mm was 3 mm pad / 1.5 mm drill), bulk capacitor 100 uF at the entry, moved next to `J1` so its GND reaches the `J1` GND pad without a via.
- **Controller: LED output pads `J4` = DATA, 5V, GND** (user: 5V next to DATA and GND for easy wiring, same order as the digit panel pads). The 5V pad is on the board's 5V rail, which is a 0.8 mm trace from `J1`: fine for panel 1 (about 1.4 A at full white) but not for all four panels at full brightness, so power the other panels from the supply (or cap the brightness in firmware).
- **Controller: explicit routing, all signals and power on the top layer, GND as a bottom copper pour** (DESIGN.md rule 15: no vias on 5V/GND; this reverses the earlier "no pour, GND as a bottom-layer tree with a via per pin" decision). Why: tscircuit starts an explicit trace on the top layer even at a through-hole pad, so every bottom-layer GND branch needed a via (12 GND vias and 3 on 5V before); with the pour the through-hole GND pins join it directly and the SMD GND pins run on the top layer to a through-hole GND pad. Result: no via on 5V, one on GND (`U3` GND: its way to the ESP32 GND pin would cross the 3V3 line), four on signals (the two UART lines hop under the 5V riser). Rejected: the autorouter (tangled GND pad-to-pad traces, long diagonals); keeping the via-per-pin tree. The pour also gives a low-impedance return for the DFPlayer speaker current (up to ~0.9 A peaks), the WS2812 data line and the ESP32 Wi-Fi bursts. Trade-off: copper behind the ESP32 antenna end (see Open questions).
- **Controller: 1.27 mm grid, board 59.06 x 41.28 mm** (DESIGN.md rule 3, user approved the +1.06 x +0.28 mm): every pad, module pin and hole is on the grid, and with the USB-C flush against the left edge the ESP32 pins only land on it if the half width is 29.53 mm. Holes at (+-25.4, +-16.51), equal 4.13 mm inset, the lower holes on the line of the connector row. Rejected: keeping 58 x 41 mm with the ESP32 pins 0.32 mm off the grid.
- **Controller: connectors in two classes** (rules 5 and 6): signal pads (`J3`, `J4`) 2.0 / 1.0 mm at 2.54 mm pitch, power pads (`J1`, `J2`) 2.4 / 1.2 mm at 5.08 mm pitch; header pads of both modules 1.6 / 1.0 mm; the groups are 7.62 mm apart (pad centre to pad centre, so the pads stay on the grid). The snooze pad is labelled `SNZ` so two labels fit on the 2.54 mm pitch.
- **Controller: part orientation** (rule 4): modules rotated 90 deg, every R, C and IC at 0 deg; `C3` has its pin 1 on GND and pin 2 on 3V3 (non-polar, so it could sit between the ESP32 GND and 3V3 pins in that order; the schematic symbol is rotated to match).
- **Controller: modules hand-soldered, `doNotPlace`** (ESP32 module, DFPlayer, wire pads); the JLCPCB BOM only has the 7 SMD parts.

## Open questions / TODO

- Verify the LED current per colour from the XL-0807RGBC-2812B datasheet and set the real power budget (supply size, trunk width, firmware brightness cap).
- Case fit of the 3.5 mm corner holes (4 mm inset from the edges) and the pads, diffuser; optional colon dots (24 h clock) as a separate small board.
- 5V and GND are wired to each panel separately (only DIN/DOUT are chained): one panel draws up to ~1.4 A, so use a thicker wire per pad and a 5V supply sized for ~5.6 A with a brightness cap.
- Check the LED rotation in the JLCPCB assembly preview before ordering (`tsci export` warns "cannot verify jlcpcb pick-and-place rotation"; the LEDs are exported at 270 deg / 180 deg depending on the bar).
- Controller: **verify the module footprints against the real boards** (ESP32-S3 SuperMini row spacing 16.5 mm and pin positions were read off a picture; DFPlayer HW-247A pinout and 15.24 mm row spacing are the standard DFPlayer Mini values, not measured). Print the board at 1:1 and hold the modules against it before ordering.
- Controller: DFPlayer microSD slot orientation/access (which side is the slot on, can a card be changed with the module soldered in place?); the footprint just has a 21 x 21 mm outline. The DFPlayer and the ESP32 have no 3D model (custom footprints), so the 3D picture shows only the SMD parts.
- Controller: the 3 J2/J1/J4 connector warnings ("not in accessible orientation") are informational (wire pads, no insertion direction).
- Controller: the board is compact on purpose: clearances are 0.2-0.5 mm in places; check the USB plug and the DFPlayer SD card fit in the case (the board is 1.06 mm wider and 0.28 mm taller than the previous 58 x 41 mm version, so re-check the case fit). The antenna end of the ESP32 sits in the board interior; the UART lines pass 1.3 mm below the module edge and the 5V line 3.4 mm above it, and the GND pour fills the area behind it. If Wi-Fi range is poor, cut the pour back there (a keepout) or move the 5V line further up.
- Controller: the top left mounting hole is only 0.58 mm from the `C3` pad and 0.49 mm from the 3V3 trace (the only space left next to the ESP32 pads); a screw head would cover them, so use a nylon screw or a washer, or move `C3`.
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
- [DESIGN.md](DESIGN.md): PCB alignment rules for the controller board
- [tscircuit datasheets](https://tscircuit.com/datasheets)
- [jlcsearch](https://jlcsearch.tscircuit.com/)
- AI skill: [tscircuit/skill](https://github.com/tscircuit/skill), installed in `.claude/skills/tscircuit/`
