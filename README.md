# Bedroom clock

![Schematic](__snapshots__/seven-segment-display.circuit-schematic.snap.svg)

![PCB layout](docs/images/pcb.png)

![3D view](docs/images/3d.png)

A bedroom clock that shows the time in 24 h format on four large 7-segment digits and plays a song as an alarm with slowly rising volume. PCB design written in [tscircuit](https://tscircuit.com) (React/TSX, compiled by the `tsci` CLI). This file is the project doc: the brief (requirements), then design decisions and status, kept current as the design evolves.

## System overview

Two boards:

1. **Digit panel** (this repo, `seven-segment-display.circuit.tsx`): one 7-segment digit. Four identical panels are built into a 3D printed case (hh:mm) and chained with wires: DOUT of one panel to DIN of the next, so all four LED chains form one data line. A digit is 7 segments (bars) of 10 WS2812-type LEDs in a line; a bar is 50 mm long, a digit is about 120 mm high and 62 mm wide (bars separated by ~3 mm gaps, like discrete bars on a sign). Each panel has wire pads on **both side edges**, hand-soldered: DIN, 5V, GND on the left and DOUT, 5V, GND on the right (5V and GND of the two sides are the same nets, so power wires can go to either side). Four 3.5 mm mounting holes sit near the corners and the silkscreen says TOP at the top edge and names every pad.
2. **Controller board** (not designed yet): ESP32-S3 mini dev board (extended, 18-pin version, if the pins suffice), an MP3 player module with SD card socket, the 5V power input, the 3.3 V to 5 V data level shifter and the amplifier/speaker connection.

Firmware (not in this repo): custom, web UI written in Svelte and embedded with the `svelteesp32` library, with a Wi-Fi settings portal (time, alarm, song, volume ramp, brightness).

## Status

- Digit panel: **one digit** (70 LEDs) with wire pads on both sides (left DIN/5V/GND, right DOUT/5V/GND, both top to down), four 3.5 mm corner holes pad labels and a TOP mark, 76 x 124 mm; order four of them. `check:wiring`, `tsci build` and `tsci check shorts` pass. Fabrication outputs export (BOM: 70 LEDs + 1 capacitor).
- Next: design the controller board; decide mounting holes / case fit (Open questions).

## Requirements

- **Purpose:** one 7-segment digit panel built from WS2812-type RGB LEDs (2.0 x 1.8 mm), 10 LEDs per segment, 5 cm segment length, bars not overlapping (horizontals between the vertical columns, verticals between the horizontals, ~3 mm gaps), so about 120 mm digit height, one data chain. Four panels are ordered and built into a 3D printed case; the panels are chained with wires (DOUT to DIN). Brightness/colour set by firmware.
- **Board size / form factor:** one digit per board, 76 x 124 mm, 2 layers, all SMD parts on the top side.
- **Power sources and rails:** 5 V only, fed through the 5V and GND wire pads of each panel from the controller board / supply. Current budget: see Design notes.
- **I/O (connectors, headers, mounting holes):** plated wire pads (hand-soldered, no connector) on both side edges, 2.54 mm pitch: `J1` on the left, DIN (top), 5V (middle), GND (bottom); `J2` on the right, DOUT (top, level with the end of the middle bar), 5V (middle), GND (bottom); both sides read data, 5V, GND from top to down. The right pads sit about 5.6 mm lower than the left ones. Left and right 5V/GND are the same nets (wire power to either side). Four 3.5 mm non-plated holes at (+-34, +-58) mm from the board centre. A small `TOP` silkscreen text above the top bar marks the top edge, and every wire pad has its name (DIN, 5V, GND, DOUT) on the silkscreen on its inboard side (on the left the DIN and 5V names sit just above their traces).
- **Mechanical constraints:** the digit outline is fixed by the 5 cm bars: LED rows of the horizontal bars at y = +57.6 / 0 / -57.1 mm (x = -22.5..22.5), vertical bars at x = +-28.5 mm (centre lines), upper LEDs y = 6.6..51.6, lower -51.1..-6.1. Enclosure not defined yet.
- **Manufacturer and constraints:** JLCPCB; basic parts where one exists; Economic assembly (only parts marked "PCBA Type: Economic and Standard", never "Standard Only"; top side only).

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

## Open questions / TODO

- Verify the LED current per colour from the XL-0807RGBC-2812B datasheet and set the real power budget (supply size, trunk width, firmware brightness cap).
- Case fit of the 3.5 mm corner holes (4 mm inset from the edges) and the pads, diffuser; optional colon dots (24 h clock) as a separate small board.
- 5V and GND are wired to each panel separately (only DIN/DOUT are chained): one panel draws up to ~1.4 A, so use a thicker wire per pad and a 5V supply sized for ~5.6 A with a brightness cap.
- Check the LED rotation in the JLCPCB assembly preview before ordering (`tsci export` warns "cannot verify jlcpcb pick-and-place rotation"; the LEDs are exported at 270 deg / 180 deg depending on the bar).
- Controller board: which MP3 module (DFPlayer-style with SD socket?), amplifier and speaker, 5V input connector, ESP32-S3 pin plan, level shifter.

## Finding JLCPCB parts

Query the [jlcsearch](https://jlcsearch.tscircuit.com/) JSON API (e.g. `leds/list.json`, `led_with_ic/list.json`, `capacitors/list.json`, `components/list.json?search=...`). Prefer basic parts (`is_basic=true`) and pick the highest stock. Then open the part page (`https://jlcpcb.com/partdetail/C<number>`) and confirm it says `PCBA Type: Economic and Standard`; jlcsearch does not expose this flag. Record the chosen part as `supplierPartNumbers={{ jlcpcb: ["C..."] }}` in the TSX. Also browse [tscircuit datasheets](https://tscircuit.com/datasheets).

## Setup

Requires Node and [Bun](https://bun.sh) (`tsci` runs under Bun; make sure `~/.bun/bin` is on PATH).

```bash
npm install
npm start              # tsci dev: interactive preview
npm run check:full     # tsc + netlist + schematic placement + build + shorts check
npx tsci snapshot -u   # regenerate the schematic SVG snapshot (embedded at the top of this README)
npm run export:images  # rebuild and refresh docs/images/{pcb,3d}.png (embedded at the top of this README)
npm run export:cpp     # cpp/SevenSegLayout.h, the FastLED helper (needs Bun)
npm run export:gerbers # dist/gerbers.zip with Gerbers, drill, bom.csv, pick_and_place.csv
npm run update:skill   # re-install the latest tscircuit AI skill into .claude/skills/tscircuit/
```

Before sharing or fabricating, work through the checks in order: `tsci check netlist`, `schematic-placement`, `placement`, `routing-difficulty` (informative only here, the digit is routed explicitly), then `tsci build`, then `tsci check shorts`. See `.claude/skills/tscircuit/CHECKLIST.md` for the pre-fab checklist.

## References

- [tscircuit docs](https://docs.tscircuit.com/); the full docs are also available as one text file at https://docs.tscircuit.com/llms.txt
- [tscircuit datasheets](https://tscircuit.com/datasheets)
- [jlcsearch](https://jlcsearch.tscircuit.com/)
- AI skill: [tscircuit/skill](https://github.com/tscircuit/skill), installed in `.claude/skills/tscircuit/`
