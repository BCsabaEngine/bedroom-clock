import { Fragment } from 'react';

import { SEGMENT_ORDER } from './lib/ledLayout';
import { CUT, LEDS_PER_DIGIT, padAt, SevenSegDigit, toLed, via } from './lib/SevenSegDigit';
import { chamfer, type P, pt } from './lib/wire';

// One 7-segment digit panel (70 WS2812 LEDs) with wire pads on both side edges: DIN, 5V, GND on the left (J1) and DOUT, 5V, GND on the right (J2), both read top to down in that order. 5V and GND of both sides are the same nets. Four 3.5mm holes in the corners, a TOP mark and pad labels on the silkscreen. See README.md.
// Four of these panels are built into a 3D printed case and chained with wires (DOUT of one panel to DIN of the next).
// Digit coordinates: origin = digit centre = board centre.
const DIGIT_X = 0;
const DIGIT_Y = -0.25;
const SHEET = 'Main';
const J1 = { x: -35, y: 2.5 }; // J1.V5 pad centre in digit coordinates; DIN is 2.54mm above, GND 2.54mm below
const J2 = { x: 35, y: -3.115 }; // J2.V5 pad centre: DOUT is 2.54mm above (level with U70.DOUT), GND 2.54mm below
const inJ2 = ({ x, y }: { x: number; y: number }) => ({ x: x - J2.x, y: y - J2.y });
const DOUT_Y = J2.y + 2.54; // = -0.575, the y of U70.DOUT (right end of the middle bar)
const HOLE = { d: 3.5, x: 34, y: 58 }; // corner mounting holes (board coordinates)
const inJ1 = ({ x, y }: { x: number; y: number }) => ({ x: x - J1.x, y: y - J1.y });
const C1 = { x: -29.6, y: 0.1, pad: 0.91 }; // C1 centre in digit coordinates, rotated 270 deg (pins vertical, pin 1 up); `pad` = pad centre offset from the centre
const inC1 = ({ x, y }: P) => ({ x: -(y - C1.y), y: x - C1.x }); // digit coordinates -> frame of C1 (rotation 270 deg)
const V5_X = 27; // the 5V link between bars b and c (x), tapped for the right 5V pad
const V5_U31 = padAt(30, 'VDD'); // VDD pad of U31, first LED of bar c
const V5_VIA2 = pt(V5_X, J2.y + 1.2);
const V5_BOT = pt(V5_X, J2.y); // first via: the 5V link comes down to J2.V5's height and the copper continues on the bottom layer
const V5_TOP = chamfer([V5_U31, pt(V5_X, V5_U31.y), V5_BOT], CUT);
const V5_TOP2 = chamfer([V5_U31, pt(V5_X, V5_U31.y), V5_VIA2], CUT); // second via of the right 5V pad, 1.2 mm above the first one (hole to hole 0.9 mm)

export default () => (
  <board width="76mm" height="124mm" layers={2} borderRadius="2mm" thickness="1.6mm" routeRemaining={false} pcbStyle={{ viaPadDiameter: 0.6, viaHoleDiameter: 0.3 }}>
    <schematicsheet name={SHEET} displayName="LED digit" sheetIndex={0} sheetWidth="540mm" sheetHeight="260mm" />

    {SEGMENT_ORDER.map((id) => (
      <Fragment key={id}>
        <schematicsection name={`Segment ${id}`} displayName={`Segment ${id}`} />
      </Fragment>
    ))}
    <schematicsection name="Input" displayName="Input side (J1)" />
    <schematicsection name="Output" displayName="Output side (J2)" />

    <SevenSegDigit first={1} gnd="net.GND" pcbX={DIGIT_X} pcbY={DIGIT_Y} sheet={SHEET} schY={10} />

    <>
      <connector
        name="J1"
        doNotPlace
        pinLabels={{ pin1: 'V5', pin2: 'DIN', pin3: 'GND' }}
        pinAttributes={{ V5: { requiresPower: true }, GND: { requiresGround: true }, DIN: { mustBeConnected: true } }}
        schPinArrangement={{ rightSide: { direction: 'top-to-bottom', pins: ['DIN', 'V5', 'GND'] } }}
        schSheetName={SHEET}
        schSectionName="Input"
        schX={-23}
        schY={9}
        pcbX={J1.x + DIGIT_X}
        pcbY={J1.y + DIGIT_Y}
        footprint={
          <footprint>
            <platedhole portHints={['pin1']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="0mm" />
            <platedhole portHints={['pin2']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="2.54mm" />
            <platedhole portHints={['pin3']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="-2.54mm" />
            <silkscreentext text="5V" pcbX="1.5mm" pcbY="0.95mm" fontSize="1mm" anchorAlignment="center_left" />
            <silkscreentext text="DIN" pcbX="1.5mm" pcbY="3.49mm" fontSize="1mm" anchorAlignment="center_left" />
            <silkscreentext text="GND" pcbX="1.5mm" pcbY="-1.59mm" fontSize="1mm" anchorAlignment="center_left" />
            <silkscreenline x1="-1.3mm" y1="-2.54mm" x2="-1.3mm" y2="2.54mm" strokeWidth="0.15mm" />
            <silkscreentext text="In" pcbX="0mm" pcbY="4.94mm" fontSize="1.2mm" />
          </footprint>
        }
      />
      <connector
        name="J2"
        doNotPlace
        pinLabels={{ pin1: 'V5', pin2: 'DOUT', pin3: 'GND' }}
        pinAttributes={{ V5: { requiresPower: true }, GND: { requiresGround: true } }}
        schPinArrangement={{ leftSide: { direction: 'top-to-bottom', pins: ['DOUT', 'V5', 'GND'] } }}
        schSheetName={SHEET}
        schSectionName="Output"
        schX={23}
        schY={-9}
        pcbX={J2.x + DIGIT_X}
        pcbY={J2.y + DIGIT_Y}
        footprint={
          <footprint>
            <platedhole portHints={['pin1']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="0mm" />
            <platedhole portHints={['pin2']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="2.54mm" />
            <platedhole portHints={['pin3']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="-2.54mm" />
            <silkscreentext text="5V" pcbX="-1.3mm" pcbY="0mm" fontSize="1mm" anchorAlignment="center_right" />
            <silkscreentext text="DOUT" pcbX="-1.3mm" pcbY="2.54mm" fontSize="1mm" anchorAlignment="center_right" />
            <silkscreentext text="GND" pcbX="-1.3mm" pcbY="-2.54mm" fontSize="1mm" anchorAlignment="center_right" />
            <silkscreenline x1="1.3mm" y1="-2.54mm" x2="1.3mm" y2="2.54mm" strokeWidth="0.15mm" />
            <silkscreentext text="Out" pcbX="0mm" pcbY="4.94mm" fontSize="1.2mm" />
          </footprint>
        }
      />
      <capacitor name="C1" capacitance="22uF" footprint="0805" schSheetName={SHEET} schSectionName="Input" schX={-23} schY={4.5} schRotation={90} pcbX={C1.x + DIGIT_X} pcbY={C1.y + DIGIT_Y} pcbRotation={270} supplierPartNumbers={{ jlcpcb: ['C45783'] }} maxDecouplingTraceLength="10mm" />

      <trace
        name="V5_FEED"
        from=".J1 > .V5"
        to=".U1 > .VDD"
        pcbPath={chamfer([pt(J1.x, J1.y), pt(-27, J1.y), pt(-27, padAt(0, 'VDD').y), padAt(0, 'VDD')], CUT)
          .slice(1, -1)
          .map(inJ1)}
        thickness="0.5mm"
        schDisplayLabel="V5"
      />
      <trace
        name="DIN_FEED"
        from=".J1 > .DIN"
        to=".U1 > .DIN"
        pcbPath={chamfer([pt(J1.x, J1.y + 2.54), pt(-31.5, J1.y + 2.54), pt(-31.5, padAt(0, 'DIN').y), padAt(0, 'DIN')], 0.3)
          .slice(1, -1)
          .map(inJ1)}
        thickness="0.25mm"
        schDisplayLabel="DIN"
      />
      {/* DOUT: from U70.DOUT hop under the b/c links (bottom layer, one via), straight to the plated DOUT pad on the right edge. */}
      <trace name="DOUT_OUT" from={`.U${LEDS_PER_DIGIT} > .DOUT`} to=".J2 > .DOUT" pcbPath={[{ x: 25.4, y: DOUT_Y }, via({ x: 25.4, y: DOUT_Y }), { x: 25.4, y: DOUT_Y }, { x: J2.x - 1, y: DOUT_Y }].map((p) => ({ ...p, ...toLed(LEDS_PER_DIGIT - 1)(p) }))} thickness="0.25mm" schDisplayLabel="DOUT" />
      {/* 5V on the right: up the b -> c 5V link (x = 27) from U31.VDD, a via at J2.V5's height, then on the bottom layer under the c bar's data link (x = 30.4) to the pad. A power line that changes layer takes two vias (rule 66): V5_J2B repeats the path with a second via 1.2 mm above, the copper of both overlaps (same net). */}
      <trace name="V5_J2" from=".U31 > .VDD" to=".J2 > .V5" pcbPath={[...V5_TOP.slice(1), via(V5_BOT), V5_BOT, pt(J2.x - 1, J2.y)].map((p) => ({ ...p, ...toLed(30)(p) }))} thickness="0.5mm" schDisplayLabel="V5" />
      <trace name="V5_J2B" from=".U31 > .VDD" to=".J2 > .V5" pcbPath={[...V5_TOP2.slice(1), via(V5_VIA2), V5_VIA2, ...chamfer([V5_VIA2, V5_BOT, pt(J2.x - 1, J2.y)], CUT).slice(1)].map((p) => ({ ...p, ...toLed(30)(p) }))} thickness="0.5mm" />
      <trace name="GND_J2" from=".J2 > .GND" to="net.GND" pcbPath={[via(inJ2({ x: J2.x, y: J2.y - 2.54 - 2.2 }))]} thickness="0.5mm" />
      <trace name="GND_J1" from=".J1 > .GND" to="net.GND" pcbPath={[via(inJ1({ x: -35, y: -2.2 }))]} thickness="0.5mm" />
      <trace
        name="V5_C1"
        from=".C1 > .pin1"
        to=".J1 > .V5"
        pcbPath={chamfer([pt(C1.x, C1.y + C1.pad), pt(C1.x, J1.y), pt(J1.x, J1.y)], CUT)
          .slice(1, -1)
          .map(inC1)}
        thickness="0.5mm"
      />
      <trace name="GND_C1" from=".C1 > .pin2" to="net.GND" pcbPath={[via({ x: 2.5, y: 0 })]} thickness="0.5mm" />
    </>

    {[-1, 1].flatMap((sx) =>
      [-1, 1].map((sy) => (
        <Fragment key={`${sx}${sy}`}>
          <hole diameter={`${HOLE.d}mm`} pcbX={sx * HOLE.x} pcbY={sy * HOLE.y} />
        </Fragment>
      ))
    )}
    <silkscreentext text="TOP" pcbX={0.9} pcbY={59.9} fontSize="1.2mm" />

    <copperpour connectsTo="net.GND" layer="bottom" boardEdgeMargin="1.27mm" />
  </board>
);
