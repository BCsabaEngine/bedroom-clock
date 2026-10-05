import { SevenSegDigit, via } from './lib/SevenSegDigit'

// LED board, digit 1 of 4: one 7-segment digit of 70 WS2812 LEDs and a 3-pad wire entry (5V, GND, DIN). See README.md.
// Digit coordinates: origin = digit centre. The board is centred on (0,0), the digit sits DIGIT_X to the right so the wire pads fit on the left.
const DIGIT_X = 2.5
const DIGIT_Y = -0.25
const SHEET = 'Main'
const J1 = { x: -35, y: 2.5 } // J1.V5 pad centre in digit coordinates; DIN is 2.54mm above, GND 2.54mm below
const inJ1 = ({ x, y }: { x: number; y: number }) => ({ x: x - J1.x, y: y - J1.y })

export default () => (
  <board width='70mm' height='124mm' thickness='1.6mm' routeRemaining={false}>
    <schematicsheet name={SHEET} displayName='LED digit' sheetIndex={0} sheetWidth='400mm' sheetHeight='260mm' />

    <SevenSegDigit first={1} gnd='net.GND' pcbX={DIGIT_X} pcbY={DIGIT_Y} sheet={SHEET} schY={10} />

    <>
      <connector
        name='J1'
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
            <platedhole portHints={['pin1']} shape='circle' holeDiameter='1mm' outerDiameter='2mm' pcbX='0mm' pcbY='0mm' />
            <platedhole portHints={['pin2']} shape='circle' holeDiameter='1mm' outerDiameter='2mm' pcbX='0mm' pcbY='2.54mm' />
            <platedhole portHints={['pin3']} shape='circle' holeDiameter='1mm' outerDiameter='2mm' pcbX='0mm' pcbY='-2.54mm' />
          </footprint>
        }
      />
      <capacitor name='C1' capacitance='22uF' footprint='0805' schSheetName={SHEET} schX={2} schY={-13.5} schRotation={90} pcbX={-32.2 + DIGIT_X} pcbY={0.9 + DIGIT_Y} pcbRotation={270} supplierPartNumbers={{ jlcpcb: ['C45783'] }} maxDecouplingTraceLength='10mm' />

      <trace name='V5_FEED' from='.J1 > .V5' to='.U1 > .VDD' pcbPath={[{ x: -27, y: 2.5 }, { x: -27, y: 5.711 }].map(inJ1)} thickness='0.5mm' schDisplayLabel='V5' />
      <trace name='DIN_FEED' from='.J1 > .DIN' to='.U1 > .DIN' pcbPath={[{ x: -31.5, y: 5.04 }, { x: -31.5, y: 5.711 }].map(inJ1)} thickness='0.25mm' schDisplayLabel='DIN' />
      <trace name='GND_J1' from='.J1 > .GND' to='net.GND' pcbPath={[via(inJ1({ x: -35, y: -2.2 }))]} thickness='0.5mm' />
      <trace name='V5_C1' from='.C1 > .pin1' to='.J1 > .V5' pcbPath={[{ x: -1.6, y: 0 }]} thickness='0.5mm' />
      <trace name='GND_C1' from='.C1 > .pin2' to='net.GND' pcbPath={[via({ x: 2.5, y: 0 })]} thickness='0.5mm' />
    </>

    <copperpour connectsTo='net.GND' layer='bottom' />
  </board>
)
