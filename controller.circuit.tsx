import { Fragment } from 'react';

import { via } from './lib/SevenSegDigit';

// Controller board of the bedroom clock: ESP32-S3 SuperMini at the left edge (USB-C end towards it, 1.25 mm edge margin like the DFPlayer, antenna end towards the board centre) and the DFPlayer (HW-247A, 16P)
// on the same baseline (bottom pin rows level), 5V in, AMS1117-3.3 for the ESP32 above the module, 74AHCT1G125 level shifter + 330R for the WS2812 data line, the speaker pads, a snooze button input and four 3.5mm corner holes. See README.md.
// Mounting holes (rule 18): a free circle of 6 mm (5.5 mm screw head) around each; no part or pad inside, traces may run through.
// Layout follows the shared DESIGN.md rules (agentic-pcb/example-base, not copied here): everything sits on a 1.27 mm grid (`g(n)` = n grid units), origin = board centre, x right, y up. Every connector sits in one row along the bottom edge.
const SHEET = 'Controller';
const G = 1.27;
const g = (n: number) => Math.round(n * G * 1e4) / 1e4;
const EDGE_MARGIN = 1.25; // module outline to board edge: the DFPlayer outline (21 mm, centre on the grid) sits this far from the right edge, the ESP32 outline gets the same on the left (its USB-C is on the module top, not at the edge)
const EDGE_R = g(14) + 10.5 + EDGE_MARGIN; // right board edge (x)
const EDGE_L = g(-14) - 11.75 - EDGE_MARGIN; // left board edge (x)
const W = EDGE_R - EDGE_L; // 60.31 mm
const H = 41.28;
const BOARD_X = (EDGE_L + EDGE_R) / 2; // the board centre is not the origin of the part coordinates (those stay on the grid): the board is shifted here with outlineOffsetX
const HOLE = { d: 3.5, inset: 4.13, y: g(13) }; // equal inset (4.13 mm) from the four edges; the lower holes share the y of the connector row

// Pads: one size per function (DESIGN.md rule 6). Header pads of both modules, signal wire pads (J3, J4), power wire pads (J1, J2).
const HDR = { drill: 1, pad: 1.6 };
const SIG = { drill: 1, pad: 2 };
const PWR = { drill: 1.2, pad: 2.4 };
const FONT = 1; // pad labels and module texts
const DESIGNATOR_SIZE = 0.5; // one smaller size for the designators (rule 7)
const LABEL_DY = -2; // pad label baseline: the same offset below every connector pad (rule 7)

// ESP32-S3 SuperMini, header pins seen from the top with USB-C up: left row TX, RX, IO1..IO7, right row 5V, GND, 3V3, IO13..IO8; pitch 2.54 mm, rows 16.51 mm apart (13 grid units, measured from the vendor drawing, verify with the real board), board about 23.5 x 18 mm.
// The module is placed rotated by 90 deg (counter-clockwise): USB-C towards -x (the left board edge), antenna end towards the board centre, the TX..IO7 row at the bottom (facing the connectors), the 5V/GND/3V3/IO13..IO8 row at the top.
const ESP_PITCH = 2.54;
const ESP_ROW = g(13);
const ESP_LEN = 23.5;
const ESP_WID = 18;
const ESP_LABELS = { pin1: 'TX', pin2: 'RX', pin3: 'IO1', pin4: 'IO2', pin5: 'IO3', pin6: 'IO4', pin7: 'IO5', pin8: 'IO6', pin9: 'IO7', pin10: 'V5', pin11: 'GND', pin12: 'V33', pin13: 'IO13', pin14: 'IO12', pin15: 'IO11', pin16: 'IO10', pin17: 'IO9', pin18: 'IO8' } as const;
const BASE = g(-4); // y of the bottom pin rows of both modules (the common baseline)
const ESP = { x: g(-14), y: BASE + ESP_ROW / 2 };
const espPin = (n: number) => ({ x: n <= 9 ? -ESP_ROW / 2 : ESP_ROW / 2, y: 4 * ESP_PITCH - ((n - 1) % 9) * ESP_PITCH });

// DFPlayer Mini style module (HW-247A, DFPlayer-16P): two rows of 8 pins, 2.54 mm pitch, rows 15.24 mm apart, body about 21 x 21 mm. Left row top to bottom VCC, RX, TX, DAC_R, DAC_L, SPK_2, GND, SPK_1; right row bottom to top IO1, GND, IO2, ADKEY1, ADKEY2, USB+, USB-, BUSY.
const DF_PITCH = 2.54;
const DF_ROW = 15.24;
const DF_LABELS = { pin1: 'VCC', pin2: 'RX', pin3: 'TX', pin4: 'DAC_R', pin5: 'DAC_L', pin6: 'SPK2', pin7: 'GND', pin8: 'SPK1', pin9: 'IO1', pin10: 'GND2', pin11: 'IO2', pin12: 'ADKEY1', pin13: 'ADKEY2', pin14: 'USB_P', pin15: 'USB_N', pin16: 'BUSY' } as const;
// Placed rotated by 90 deg (counter-clockwise): the left pin row (VCC, RX, TX, DAC_R, DAC_L, SPK_2, GND, SPK_1, west to east) is then the bottom row, facing the connector edge.
const DF = { x: g(14), y: BASE + DF_ROW / 2, rot: 90 };

const hole = (pin: number | string, x: number, y: number, { drill, pad } = HDR) => <platedhole portHints={[`pin${pin}`]} shape="circle" holeDiameter={`${drill}mm`} outerDiameter={`${pad}mm`} pcbX={`${x}mm`} pcbY={`${y}mm`} />;
const rect = (w: number, h: number) => <silkscreenrect pcbX="0mm" pcbY="0mm" width={`${w}mm`} height={`${h}mm`} filled={false} strokeWidth="0.15mm" />;

const espFootprint = (
  <footprint>
    {Array.from({ length: 18 }, (_, i) => (
      <Fragment key={i}>{hole(i + 1, espPin(i + 1).x, espPin(i + 1).y)}</Fragment>
    ))}
    {rect(ESP_WID, ESP_LEN)}
    <silkscreentext text="USB" pcbX="0mm" pcbY={`${ESP_LEN / 2 - 1.2}mm`} fontSize={`${FONT}mm`} />
    <silkscreentext text="ANT" pcbX="0mm" pcbY={`${-ESP_LEN / 2 + 1.2}mm`} fontSize={`${FONT}mm`} />
  </footprint>
);
const dfPin = (n: number) => ({ x: n <= 8 ? -DF_ROW / 2 : DF_ROW / 2, y: n <= 8 ? 3.5 * DF_PITCH - (n - 1) * DF_PITCH : -3.5 * DF_PITCH + (n - 9) * DF_PITCH });
const dfFootprint = (
  <footprint>
    {Array.from({ length: 16 }, (_, i) => (
      <Fragment key={i}>{hole(i + 1, dfPin(i + 1).x, dfPin(i + 1).y)}</Fragment>
    ))}
    {rect(21, 21)}
    <silkscreentext text="DFPlayer" pcbX="0mm" pcbY="0mm" fontSize={`${FONT}mm`} />
  </footprint>
);

// Row of plated wire pads along the bottom edge, pad 1 at the footprint origin, `pitch` to the right (negative: to the left); every pad has its label on one baseline below the row.
const pads = (labels: string[], pitch: number, { drill, pad } = SIG) => (
  <footprint>
    {labels.map((l, i) => (
      <Fragment key={l}>
        {hole(i + 1, i * pitch, 0, { drill, pad })}
        <silkscreentext text={l} pcbX={`${i * pitch}mm`} pcbY={`${LABEL_DY}mm`} fontSize={`${FONT}mm`} />
      </Fragment>
    ))}
  </footprint>
);

type P = { x: number; y: number };
type Pt = P & { via?: boolean };
type Frame = P & { rot?: number };
// pcbPath points are in the frame of the component owning the trace's `from` port (position and rotation, see README): board point -> local point (flags such as `via` are kept).
const inFrame =
  ({ x, y, rot = 0 }: Frame) =>
  (p: Pt): Pt => {
    const a = (rot * Math.PI) / 180;
    const dx = p.x - x;
    const dy = p.y - y;
    return { ...p, x: Math.round((dx * Math.cos(a) + dy * Math.sin(a)) * 1e4) / 1e4, y: Math.round((-dx * Math.sin(a) + dy * Math.cos(a)) * 1e4) / 1e4 };
  };
// Explicit copper (rule 17: corners are cut to 45 deg with `chamfer`/`wire45` below, never drawn as 90 deg): `pts` are board coordinates of the corners between the `from` pad and the `to` pad (`via(p)` switches layer), `owner` is the component of the `from` port.
const wire = (name: string, from: string, to: string, owner: Frame, pts: Pt[], thickness = 0.25) => <trace name={name} from={`.${from}`} to={`.${to}`} pcbPath={pts.map(inFrame(owner))} thickness={`${thickness}mm`} />;
// A layer change at p: a wire point on both sides of the via (needed in a pcbPath).
const hop = (p: P, from: 'top' | 'bottom' = 'top', to: 'top' | 'bottom' = 'bottom'): Pt[] => [p, via(p, from, to), p];
// GND is a bottom copper pour. Through-hole GND pins touch it directly (a plain `to="net.GND"` connection, no copper to draw); an SMD GND pin runs on the top layer to such a pad, only U3 needs a via (see README).
const gndTrace = (port: string) => <trace from={`.${port}`} to="net.GND" />;
const gndWire = (name: string, from: string, to: string, owner: Frame, pts: Pt[], thickness = GND_W) => wire(name, from, to, owner, pts, thickness);
const pt = (x: number, y: number): P => ({ x, y });
// No 90 deg corners (DESIGN.md rule 17): each one becomes two 45 deg bends, a T junction stays sharp. `poly` = pad centre, corners (board coordinates, orthogonal segments), pad centre; `c` = cut length (one number, or one per vertex index of `poly`); corner indices in `keep` are T junctions.
const chamfer = (poly: P[], c: number | number[] = G, keep: number[] = []): P[] =>
  poly.flatMap((v, i) => {
    if (i === 0 || i === poly.length - 1 || keep.includes(i)) return [v];
    const a = poly[i - 1];
    const b = poly[i + 1];
    const din = { x: Math.sign(v.x - a.x), y: Math.sign(v.y - a.y) };
    const dout = { x: Math.sign(b.x - v.x), y: Math.sign(b.y - v.y) };
    if (din.x * dout.x + din.y * dout.y !== 0) return [v];
    const d = Math.min(Array.isArray(c) ? (c[i] ?? G) : c, Math.hypot(v.x - a.x, v.y - a.y), Math.hypot(b.x - v.x, b.y - v.y));
    return [pt(v.x - din.x * d, v.y - din.y * d), pt(v.x + dout.x * d, v.y + dout.y * d)];
  });
// Like wire(), but the path is the full polyline from pad centre to pad centre and its 90 deg corners are chamfered.
const wire45 = (name: string, from: string, to: string, owner: Frame, poly: P[], thickness = 0.25, c: number | number[] = G, keep: number[] = []) => wire(name, from, to, owner, chamfer(poly, c, keep).slice(1, -1), thickness);

// Board coordinates of every part (mm). The explicit copper below is written against these.
const CONN_Y = g(-13); // pad row of J1..J4 along the bottom edge (the lower mounting holes sit on the same line)
const V5_X = g(2); // 5V riser up the corridor between the modules (top layer); J1 5V pad is at its foot
const TOP_Y = g(11); // 5V line above the ESP32 to the AMS1117 input
const UART_A = g(-5); // the two UART lines run east just below the module pins (ESP IO7 to the DFPlayer RX on A, DFPlayer TX to ESP IO6 on B); they hop under the 5V riser on the bottom layer
const UART_B = g(-6);
const ESP_F: Frame = { ...ESP, rot: 90 };
const espAt = (n: number): P => ({ x: ESP.x - espPin(n).y, y: ESP.y + espPin(n).x }); // board position of ESP pin n (module rotated by 90 deg)
const dfAt = (n: number): P => ({ x: DF.x - dfPin(n).y, y: DF.y + dfPin(n).x }); // board position of DFPlayer pin n (module rotated by 90 deg)
const GND_W = 0.8; // every 5V/GND trace is as wide as the 5V traces (0.8 mm, more than double the 0.25 mm of a signal, rule 14)
const U3 = { x: g(-14), y: g(13) }; // AMS1117, rot 0: pins on the left (GND top, VOUT, VIN bottom), tab (VOUT) on the right
const C3 = { x: g(-9), y: g(13) }; // 22 uF output capacitor right next to the AMS1117 tab (3V3 on pin1, left; GND on pin2, right, via to the pour); the screw circle of the top left hole (rule 18) leaves no room beside the ESP32 pads
const U4 = { x: g(-10), y: g(-8) }; // rot 0: left column OE, A, GND, right column VCC, Y; the A line comes from the west, the OE-GND link passes through the channel between the pad columns
const U4_PAD = { col: 1.137, pitch: 0.95 }; // pad column offset and pitch of the SOT-23-5
const LINE_Y = U4.y + U4_PAD.pitch; // top-layer 5V line along the VCC pad row from the riser to the level shifter, C4 and J4
const R2 = { x: g(-8), y: g(-10) };
const GND_VIA = { dx: -4.82 }; // the one via on a power net: U3 GND (its pad is on the top layer, the through-hole GND pad is out of reach without crossing the 3V3 line) to the bottom pour
const C4 = { x: g(-7), y: g(-8.5) }; // 100 nF decoupling of U4, 1.1 mm east of its VCC pad (rule 24): 5V from the VCC line straight down to pin 1, GND through a via on its east side
const C4_GND_VIA = { x: g(-5), y: C4.y };
const J4_V5_Y = g(-11.5); // the J4 5V feed leaves the riser foot below the level shifter section (it used to run down at x = J4 5V, through the place of C4)
const C1 = { x: g(5), y: g(-9) }; // bulk capacitor at the 5V entry (also the input capacitor of the AMS1117)
const R1 = { x: g(-3), y: UART_A }; // in the UART line near its source (ESP IO7), west of the riser
// Connector groups on the grid, 6 grid units (7.62 mm) between the nearest pads of two groups: J3 (snooze, signal), J4 (LED output, signal), J1 (power in), J2 (speaker).
const J3 = { x: g(-16), y: CONN_Y }; // SNZ, GND 2.54 mm to the right
const J4 = { x: g(-8), y: CONN_Y }; // DATA, 5V, GND 2.54 mm apart to the right (same order as J1 of the digit panels)
const J1 = { x: V5_X, y: CONN_Y }; // 5V, GND 5.08 mm to the right
const J2 = { x: g(16), y: CONN_Y }; // SPK+ here, SPK- 5.08 mm to the left
// Pad centres of the SMD parts and connector pads (board coordinates) for the 45 deg routing.
const U3_PAD = { x: U3.x - 3.15, out: U3.y };
const U4_A = pt(U4.x - U4_PAD.col, U4.y);
const U4_OE = pt(U4.x - U4_PAD.col, U4.y + U4_PAD.pitch);
const U4_GND = pt(U4.x - U4_PAD.col, U4.y - U4_PAD.pitch);
const U4_Y = pt(U4.x + U4_PAD.col, U4.y - U4_PAD.pitch);
const R2_P1 = pt(R2.x - 0.825, R2.y);
const R2_P2 = pt(R2.x + 0.825, R2.y);
const R1_P1 = pt(R1.x - 0.825, R1.y);
const J3_GND = pt(J3.x + 2.54, CONN_Y);
const J4_DATA = pt(J4.x, CONN_Y);
const J4_V5 = pt(J4.x + 2.54, CONN_Y);

export default () => (
  <board width={`${W}mm`} height={`${H}mm`} outlineOffsetX={`${BOARD_X}mm`} borderRadius="2mm" thickness="1.6mm" routeRemaining={false} pcbStyle={{ silkscreenFontSize: DESIGNATOR_SIZE, silkscreenTextPosition: 'outside' }}>
    <schematicsheet name={SHEET} displayName="Controller" sheetIndex={0} sheetWidth="260mm" sheetHeight="180mm" />

    <schematicsection name="MCU" displayName="ESP32-S3" />
    <schematicsection name="Power" displayName="5V in and 3.3V" />
    <schematicsection name="LED output" displayName="WS2812 data (level shifter)" />
    <schematicsection name="Audio" displayName="DFPlayer and speaker" />
    <schematicsection name="Input" displayName="Snooze button" />

    {/* MCU */}
    <chip
      name="U1"
      doNotPlace
      manufacturerPartNumber="ESP32-S3 SuperMini"
      pinLabels={ESP_LABELS}
      pinAttributes={{ GND: { requiresGround: true }, V33: { requiresPower: true } }}
      schPinArrangement={{
        leftSide: { direction: 'top-to-bottom', pins: ['IO2', 'IO1', 'IO3', 'TX', 'RX', 'IO5', 'IO8', 'IO12'] },
        rightSide: { direction: 'top-to-bottom', pins: ['IO4', 'IO7', 'IO6', 'IO13', 'IO11', 'IO10', 'IO9'] },
        topSide: { direction: 'left-to-right', pins: ['V33'] },
        bottomSide: { direction: 'left-to-right', pins: ['GND', 'V5'] }
      }}
      schSheetName={SHEET}
      schSectionName="MCU"
      schX={3}
      schY={-5}
      pcbX={ESP.x}
      pcbY={ESP.y}
      pcbRotation={90}
      footprint={espFootprint}
    />

    {/* Power: 5V in, bulk capacitor, AMS1117-3.3 for the ESP32 */}
    <connector name="J1" doNotPlace pinLabels={{ pin1: 'V5', pin2: 'GND' }} pinAttributes={{ V5: { requiresPower: true }, GND: { requiresGround: true } }} schSheetName={SHEET} schSectionName="Power" schX={-6} schY={-11} pcbX={J1.x} pcbY={J1.y} footprint={pads(['5V', 'GND'], 5.08, PWR)} />
    <capacitor name="C1" capacitance="100uF" footprint="1210" schSheetName={SHEET} schSectionName="Power" schX={-4} schY={-11} schRotation={270} pcbX={C1.x} pcbY={C1.y} supplierPartNumbers={{ jlcpcb: ['C394395'] }} maxDecouplingTraceLength="60mm" />
    <chip
      name="U3"
      manufacturerPartNumber="AMS1117-3.3"
      footprint="sot223"
      pinLabels={{ pin1: 'GND', pin2: 'VOUT', pin3: 'VIN', pin4: 'TAB' }}
      pinAttributes={{ GND: { requiresGround: true }, VIN: { requiresPower: true } }}
      schPinArrangement={{ leftSide: { direction: 'top-to-bottom', pins: ['VIN', 'GND'] }, rightSide: { direction: 'top-to-bottom', pins: ['VOUT', 'TAB'] } }}
      supplierPartNumbers={{ jlcpcb: ['C6186'] }}
      schSheetName={SHEET}
      schSectionName="Power"
      schX={-1}
      schY={-11}
      pcbX={U3.x}
      pcbY={U3.y}
      pcbSx={{ '& silkscreentext': { pcbX: '0mm', pcbY: '3.4mm' } }}
    />
    <capacitor name="C3" capacitance="22uF" footprint="0805" schSheetName={SHEET} schSectionName="Power" schX={1.2} schY={-12.6} schRotation={90} pcbX={C3.x} pcbY={C3.y} supplierPartNumbers={{ jlcpcb: ['C45783'] }} maxDecouplingTraceLength="60mm" />

    {/* Level shifter: 3.3 V GPIO to 5 V WS2812 data */}
    <chip
      name="U4"
      manufacturerPartNumber="SN74AHCT1G125DBVR"
      footprint="sot23_5"
      pinLabels={{ pin1: 'OE', pin2: 'A', pin3: 'GND', pin4: 'Y', pin5: 'VCC' }}
      pinAttributes={{ GND: { requiresGround: true }, VCC: { requiresPower: true } }}
      schPinArrangement={{ leftSide: { direction: 'top-to-bottom', pins: ['A', 'OE', 'GND'] }, rightSide: { direction: 'top-to-bottom', pins: ['VCC', 'Y'] } }}
      supplierPartNumbers={{ jlcpcb: ['C7484'] }}
      schSheetName={SHEET}
      schSectionName="LED output"
      schX={8}
      schY={0}
      pcbX={U4.x}
      pcbY={U4.y}
    />
    <capacitor name="C4" capacitance="100nF" footprint="0603" schSheetName={SHEET} schSectionName="LED output" schX={10} schY={1.6} schRotation={270} pcbX={C4.x} pcbY={C4.y} supplierPartNumbers={{ jlcpcb: ['C14663'] }} maxDecouplingTraceLength="60mm" />
    <resistor name="R2" resistance="330" footprint="0603" schSheetName={SHEET} schSectionName="LED output" schX={11.2} schY={-0.6} pcbX={R2.x} pcbY={R2.y} supplierPartNumbers={{ jlcpcb: ['C23138'] }} />
    <connector
      name="J4"
      doNotPlace
      pinLabels={{ pin1: 'DATA', pin2: 'V5', pin3: 'GND' }}
      pinAttributes={{ DATA: { mustBeConnected: true }, V5: { requiresPower: true }, GND: { requiresGround: true } }}
      schSheetName={SHEET}
      schSectionName="LED output"
      schX={15}
      schY={-0.6}
      pcbX={J4.x}
      pcbY={J4.y}
      footprint={pads(['DATA', '5V', 'GND'], 2.54, SIG)}
    />

    {/* DFPlayer and speaker */}
    <chip
      name="U2"
      doNotPlace
      manufacturerPartNumber="DFPlayer-16P (HW-247A)"
      pinLabels={DF_LABELS}
      pinAttributes={{ VCC: { requiresPower: true }, GND: { requiresGround: true } }}
      schPinArrangement={{ leftSide: { direction: 'top-to-bottom', pins: ['VCC', 'RX', 'TX', 'BUSY', 'GND', 'GND2'] }, rightSide: { direction: 'top-to-bottom', pins: ['SPK1', 'SPK2', 'DAC_R', 'DAC_L', 'IO1', 'IO2', 'ADKEY1', 'ADKEY2', 'USB_P', 'USB_N'] } }}
      schSheetName={SHEET}
      schSectionName="Audio"
      schX={14}
      schY={-8}
      pcbX={DF.x}
      pcbY={DF.y}
      pcbRotation={DF.rot}
      footprint={dfFootprint}
    />
    <resistor name="R1" resistance="1k" footprint="0603" schSheetName={SHEET} schSectionName="Audio" schX={9.5} schY={-5.5} pcbX={R1.x} pcbY={R1.y} supplierPartNumbers={{ jlcpcb: ['C21190'] }} />
    <connector name="J2" doNotPlace pinLabels={{ pin1: 'SPK1', pin2: 'SPK2' }} schSheetName={SHEET} schSectionName="Audio" schX={17.5} schY={-12} pcbX={J2.x} pcbY={J2.y} footprint={pads(['SPK+', 'SPK-'], -5.08, PWR)} />

    {/* Snooze button input */}
    <connector name="J3" doNotPlace pinLabels={{ pin1: 'SNOOZE', pin2: 'GND' }} pinAttributes={{ SNOOZE: { mustBeConnected: true }, GND: { requiresGround: true } }} schSheetName={SHEET} schSectionName="Input" schX={-6} schY={-6} pcbX={J3.x} pcbY={J3.y} footprint={pads(['SNZ', 'GND'], 2.54, SIG)} />

    {/* GND: a bottom copper pour. The through-hole GND pins join it directly, the SMD GND pins run on the top layer to a through-hole GND pad (no via): C1 to J1, U4 GND/OE to J3. U3 GND, C3 GND and C4 GND have a via each (the only ones on a power net; C4 so that it can sit next to U4 VCC, DESIGN.md rule 24) */}
    <copperpour connectsTo="net.GND" layer="bottom" boardEdgeMargin="0.25mm" />
    {gndTrace('J1 > .GND')}
    {gndTrace('J3 > .GND')}
    {gndTrace('J4 > .GND')}
    {gndTrace('U1 > .GND')}
    {gndTrace('U2 > .GND')}
    {gndTrace('U2 > .GND2')}

    {gndWire('GND_C1', 'C1 > .pin2', 'J1 > .GND', C1, [pt(C1.x + 1.4625, CONN_Y + (C1.x + 1.4625 - J1.x - 5.08))])}
    {wire45('GND_U4_OE', 'U4 > .OE', 'U4 > .GND', U4, [U4_OE, pt(U4.x, U4_OE.y), pt(U4.x, U4_GND.y), U4_GND], 0.5, [0, 0.5, 0.3])}
    {wire45('GND_U4', 'U4 > .GND', 'J3 > .GND', U4, [U4_GND, pt(U4.x, U4_GND.y), pt(U4.x, g(-11)), pt(J3_GND.x, g(-11)), J3_GND], 0.5, [0, 0.3, G, G])}
    <trace name="GND_C3" from=".C3 > .pin2" to="net.GND" pcbPath={hop(pt(C3.x + 2.4, C3.y)).map(inFrame(C3))} thickness={`${GND_W}mm`} />
    <trace name="GND_C4" from=".C4 > .pin2" to="net.GND" pcbPath={hop(C4_GND_VIA).map(inFrame(C4))} thickness={`${GND_W}mm`} />
    <trace name="GND_U3" from=".U3 > .GND" to="net.GND" pcbPath={hop(pt(U3.x + GND_VIA.dx, U3.y + 2.3)).map(inFrame(U3))} thickness={`${GND_W}mm`} />

    {/* 5V, top layer: J1 up the corridor (riser) to the line y = TOP_Y west to the AMS1117 input, branches east to the DFPlayer VCC, west along y = LINE_Y to the level shifter and C4 (right next to its VCC pad) and along J4_V5_Y to J4 */}
    {wire('V5', 'J1 > .V5', 'U2 > .VCC', J1, [pt(V5_X, dfAt(1).y)], 0.8)}
    {wire('V5_U3', 'J1 > .V5', 'U3 > .VIN', J1, chamfer([pt(V5_X, CONN_Y), pt(V5_X, TOP_Y), pt(U3_PAD.x, TOP_Y)]).slice(1), 0.8)}
    {wire('V5_C1', 'J1 > .V5', 'C1 > .pin1', J1, [pt(V5_X, C1.y)], 0.8)}
    {wire45('V5_J4', 'J1 > .V5', 'J4 > .V5', J1, [pt(V5_X, CONN_Y), pt(V5_X, J4_V5_Y), pt(J4_V5.x, J4_V5_Y), J4_V5], 0.8, G, [1])}
    {wire('V5_U4', 'J1 > .V5', 'U4 > .VCC', J1, [pt(V5_X, LINE_Y)], 0.8)}
    {wire('V5_C4', 'J1 > .V5', 'C4 > .pin1', J1, [pt(V5_X, LINE_Y), pt(C4.x - 0.825, LINE_Y)], 0.8)}

    {/* 3V3: ESP V33 (top row) straight up to the AMS1117 VOUT, the tab is joined to VOUT under the body, output capacitor on the way */}
    {wire45('V33', 'U1 > .V33', 'U3 > .VOUT', ESP_F, [espAt(12), pt(espAt(12).x, U3_PAD.out), pt(U3_PAD.x, U3_PAD.out)], 0.6)}
    {wire('V33_TAB', 'U3 > .VOUT', 'U3 > .TAB', U3, [pt(U3.x, U3.y)], 0.6)}
    {wire('V33_C3', 'U3 > .TAB', 'C3 > .pin1', U3, [pt(C3.x - 1.4, C3.y)], 0.6)}

    {/* Signals. ESP IO4 LED data to the level shifter (west of its A pad), IO2 snooze straight down to J3; IO7/IO6 are the DFPlayer RX/TX: two lines east under the module pins, hopping under the 5V riser; speaker to the pads */}
    {wire45('LED_3V3', 'U1 > .IO4', 'U4 > .A', ESP_F, [espAt(6), pt(espAt(6).x, U4_A.y), U4_A], 0.25, 0.7)}
    {wire45('LED_5V', 'U4 > .Y', 'R2 > .pin1', U4, [U4_Y, pt(U4_Y.x, R2_P1.y), R2_P1], 0.25, 0.5)}
    {wire('LED_DATA', 'R2 > .pin2', 'J4 > .DATA', R2, [pt(R2_P2.x, J4_DATA.y + (R2_P2.x - J4_DATA.x))])}
    {wire('SNOOZE', 'U1 > .IO2', 'J3 > .SNOOZE', ESP_F, [pt(espAt(4).x, g(-9))])}
    {wire45('DFP_RX', 'U1 > .IO7', 'R1 > .pin1', ESP_F, [espAt(9), pt(espAt(9).x, UART_A), R1_P1], 0.25, 0.9)}
    {wire('DFP_RX_R', 'R1 > .pin2', 'U2 > .RX', R1, [...hop(pt(V5_X - 1.27, UART_A)), ...hop(pt(V5_X + 1.27, UART_A), 'bottom', 'top'), ...chamfer([pt(V5_X + 1.27, UART_A), pt(dfAt(2).x, UART_A), dfAt(2)], 0.9).slice(1, -1)])}
    {wire('DFP_TX', 'U2 > .TX', 'U1 > .IO6', DF, [
      ...chamfer([dfAt(3), pt(dfAt(3).x, UART_B), pt(V5_X + 1.27, UART_B)]).slice(1, -1),
      ...hop(pt(V5_X + 1.27, UART_B)),
      ...hop(pt(V5_X - 1.27, UART_B), 'bottom', 'top'),
      ...chamfer([pt(V5_X - 1.27, UART_B), pt(espAt(8).x, UART_B), espAt(8)]).slice(1, -1)
    ])}
    {wire('SPK1', 'U2 > .SPK1', 'J2 > .SPK1', DF, [pt(dfAt(8).x, g(-7)), pt(J2.x, CONN_Y + 1.27)], 0.8)}
    {wire('SPK2', 'U2 > .SPK2', 'J2 > .SPK2', DF, [pt(dfAt(6).x, g(-7)), pt(J2.x - 5.08, CONN_Y + 1.27)], 0.8)}

    {[EDGE_L + HOLE.inset, EDGE_R - HOLE.inset].flatMap((hx) =>
      [-1, 1].map((sy) => (
        <Fragment key={`${hx}${sy}`}>
          <hole diameter={`${HOLE.d}mm`} pcbX={hx} pcbY={sy * HOLE.y} />
        </Fragment>
      ))
    )}
  </board>
);
