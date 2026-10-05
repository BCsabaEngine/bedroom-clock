import { Fragment } from 'react';

import { LEDS_PER_DIGIT, SevenSegDigit, toLed, via } from './lib/SevenSegDigit';

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

export default () => (
  <board width="76mm" height="124mm" thickness="1.6mm" routeRemaining={false}>
    <schematicsheet name={SHEET} displayName="LED digit" sheetIndex={0} sheetWidth="400mm" sheetHeight="260mm" />

    <SevenSegDigit first={1} gnd="net.GND" pcbX={DIGIT_X} pcbY={DIGIT_Y} sheet={SHEET} schY={10} />

    <>
      <connector
        name="J1"
        doNotPlace
        pinLabels={{ pin1: 'V5', pin2: 'DIN', pin3: 'GND' }}
        pinAttributes={{ V5: { requiresPower: true }, GND: { requiresGround: true }, DIN: { mustBeConnected: true } }}
        schSheetName={SHEET}
        schX={-2}
        schY={-13.5}
        pcbX={J1.x + DIGIT_X}
        pcbY={J1.y + DIGIT_Y}
        footprint={
          <footprint>
            <platedhole portHints={['pin1']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="0mm" />
            <platedhole portHints={['pin2']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="2.54mm" />
            <platedhole portHints={['pin3']} shape="circle" holeDiameter="1mm" outerDiameter="2mm" pcbX="0mm" pcbY="-2.54mm" />
            <silkscreentext text="5V" pcbX="1.5mm" pcbY="0.95mm" fontSize="1mm" anchorAlignment="center_left" />
            <silkscreentext text="DIN" pcbX="1.5mm" pcbY="3.49mm" fontSize="1mm" anchorAlignment="center_left" />
            <silkscreentext text="GND" pcbX="1.5mm" pcbY="-2.54mm" fontSize="1mm" anchorAlignment="center_left" />
          </footprint>
        }
      />
      <connector
        name="J2"
        doNotPlace
        pinLabels={{ pin1: 'V5', pin2: 'DOUT', pin3: 'GND' }}
        pinAttributes={{ V5: { requiresPower: true }, GND: { requiresGround: true } }}
        schSheetName={SHEET}
        schX={12}
        schY={-13.5}
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
          </footprint>
        }
      />
      <capacitor name="C1" capacitance="22uF" footprint="0805" schSheetName={SHEET} schX={2} schY={-13.5} schRotation={90} pcbX={-29.6 + DIGIT_X} pcbY={0.1 + DIGIT_Y} pcbRotation={270} supplierPartNumbers={{ jlcpcb: ['C45783'] }} maxDecouplingTraceLength="10mm" />

      <trace
        name="V5_FEED"
        from=".J1 > .V5"
        to=".U1 > .VDD"
        pcbPath={[
          { x: -27, y: 2.5 },
          { x: -27, y: 5.711 }
        ].map(inJ1)}
        thickness="0.5mm"
        schDisplayLabel="V5"
      />
      <trace
        name="DIN_FEED"
        from=".J1 > .DIN"
        to=".U1 > .DIN"
        pcbPath={[
          { x: -31.5, y: 5.04 },
          { x: -31.5, y: 5.711 }
        ].map(inJ1)}
        thickness="0.25mm"
        schDisplayLabel="DIN"
      />
      {/* DOUT: from U70.DOUT hop under the b/c links (bottom layer, one via), straight to the plated DOUT pad on the right edge. */}
      <trace name="DOUT_OUT" from={`.U${LEDS_PER_DIGIT} > .DOUT`} to=".J2 > .DOUT" pcbPath={[{ x: 25.4, y: DOUT_Y }, via({ x: 25.4, y: DOUT_Y }), { x: 25.4, y: DOUT_Y }, { x: J2.x - 1, y: DOUT_Y }].map((p) => ({ ...p, ...toLed(LEDS_PER_DIGIT - 1)(p) }))} thickness="0.25mm" schDisplayLabel="DOUT" />
      {/* 5V on the right: up the b -> c 5V link (x = 27) from U31.VDD, a via at J2.V5's height, then on the bottom layer under the c bar's data link (x = 30.4) to the pad. */}
      <trace name="V5_J2" from=".U31 > .VDD" to=".J2 > .V5" pcbPath={[{ x: 27, y: -5.211 }, { x: 27, y: J2.y }, via({ x: 27, y: J2.y }), { x: 27, y: J2.y }, { x: J2.x - 1, y: J2.y }].map((p) => ({ ...p, ...toLed(30)(p) }))} thickness="0.5mm" schDisplayLabel="V5" />
      <trace name="GND_J2" from=".J2 > .GND" to="net.GND" pcbPath={[via(inJ2({ x: J2.x, y: J2.y - 2.54 - 2.2 }))]} thickness="0.5mm" />
      <trace name="GND_J1" from=".J1 > .GND" to="net.GND" pcbPath={[via(inJ1({ x: -35, y: -2.2 }))]} thickness="0.5mm" />
      <trace name="V5_C1" from=".C1 > .pin1" to=".J1 > .V5" pcbPath={[{ x: -2.4, y: 0 }]} thickness="0.5mm" />
      <trace name="GND_C1" from=".C1 > .pin2" to="net.GND" pcbPath={[via({ x: 2.5, y: 0 })]} thickness="0.5mm" />
    </>

    {[-1, 1].flatMap((sx) =>
      [-1, 1].map((sy) => (
        <Fragment key={`${sx}${sy}`}>
          <hole diameter={`${HOLE.d}mm`} pcbX={sx * HOLE.x} pcbY={sy * HOLE.y} />
        </Fragment>
      ))
    )}
    <silkscreentext text="TOP" pcbX={DIGIT_X} pcbY={60.7} fontSize="1.2mm" />

    <copperpour connectsTo="net.GND" layer="bottom" />
  </board>
);
