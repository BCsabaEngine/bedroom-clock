import { Fragment } from 'react';

import { LEDS_PER_DIGIT, LEDS_PER_SEGMENT, SEGMENT_ORDER } from './ledLayout';
import { LED_PITCH, LedSegment } from './LedSegment';

// One 7-segment digit in the style of discrete bars: the bars never touch, there is a ~3 mm gap at every corner. The horizontal bars sit
// between the two vertical columns, each vertical bar between two horizontal bars. About 120 mm high, 65 mm wide (outer copper).
// Data chain (so DIN is at the middle left and DOUT at the middle right, ready to chain digits left to right):
// f (up) -> a (right) -> b (down) -> c (down) -> d (left) -> e (up) -> g (right); 10 LEDs per segment, 70 per digit.
// Refdes: LED U<first+k>, k = 0..69 in chain order. The 5V rail sits on the inner side of every bar, the GND vias on the outer side.
// pcbX/pcbY are the digit origin; no <group> is used, every part is placed at board coordinates. All copper is explicit (pcbPath):
// inside a bar see LedSegment, between bars see LINKS below. Coordinates below are digit coordinates (x right, y up, mm).
// Bar positions: horizontals at y = +57.6 / 0 / -57.1 (LED x = -22.5..22.5), verticals at x = +-28.5, upper LEDs y = 6.6..51.6, lower -51.1..-6.1.
const GEOMETRY = {
  f: { x: -28.5, y: 6.6, rot: 90 },
  a: { x: -22.5, y: 57.6, rot: 0 },
  b: { x: 28.5, y: 51.6, rot: -90 },
  c: { x: 28.5, y: -6.1, rot: -90 },
  d: { x: 22.5, y: -57.1, rot: 180 },
  e: { x: -28.5, y: -51.1, rot: 90 },
  g: { x: -22.5, y: 0, rot: 0 }
} as const;
// Chain order and LED counts come from lib/ledLayout.ts (also the source of the C++ helper); LINKS below is written for exactly that order.
export const SEGMENTS = SEGMENT_ORDER.map((id) => ({ id, ...GEOMETRY[id] }));
export { LEDS_PER_DIGIT, LEDS_PER_SEGMENT };

type P = { x: number; y: number };
const rotate = (deg: number, x: number, y: number): P => ({ x: x * Math.cos((deg * Math.PI) / 180) - y * Math.sin((deg * Math.PI) / 180), y: x * Math.sin((deg * Math.PI) / 180) + y * Math.cos((deg * Math.PI) / 180) });

// pcbPath points are given in the frame of the component owning the trace's `from` port: convert digit coordinates into LED k's frame (LED k sits on its bar, rotated 180deg).
export const toLed = (k: number) => {
  const s = SEGMENTS[Math.floor(k / LEDS_PER_SEGMENT)];
  const c = rotate(s.rot, (k % LEDS_PER_SEGMENT) * LED_PITCH, 0);
  return ({ x, y }: P) => rotate(-(s.rot + 180), x - (s.x + c.x), y - (s.y + c.y));
};
export const via = (p: P, fromLayer: 'top' | 'bottom' = 'top', toLayer: 'top' | 'bottom' = 'bottom') => ({ ...p, via: true, fromLayer, toLayer }) as const;
const pt = (x: number, y: number): P => ({ x, y });

// Corner links, digit coordinates, from the last LED of one bar to the first LED of the next. Pad centres are LED centre +-0.889 along the bar and
// +-0.575 across it. `v5` runs from the 5V rail end around the corner through the 3 mm gap between the bars, `data` from the DOUT pad to the
// DIN pad. All links stay on the top layer.
const LINKS = [
  { data: [pt(-27.925, 58.175)], v5: [pt(-27, 50.711), pt(-27, 54.4), pt(-23.389, 54.4)] }, // f -> a
  { data: [pt(30.4, 57.025), pt(30.4, 52.489)], v5: [pt(21.611, 56.1), pt(27, 56.1), pt(27, 52.489)] }, // a -> b
  { data: [pt(27.925, 2), pt(30.4, 2), pt(30.4, -5.211)], v5: [pt(27, 7.489), pt(27, -5.211)] }, // b -> c
  { data: [pt(27.925, -57.675)], v5: [pt(27, -50.211), pt(27, -53.9), pt(23.389, -53.9)] }, // c -> d
  { data: [pt(-30.4, -56.525), pt(-30.4, -51.989)], v5: [pt(-21.611, -55.6), pt(-27, -55.6), pt(-27, -51.989)] }, // d -> e
  { data: [pt(-27.925, 0.575)], v5: [pt(-27, -6.989), pt(-27, -1.5), pt(-23.389, -1.5)] } // e -> g
] as const;

export const SevenSegDigit = ({ first = 1, gnd, pcbX = 0, pcbY = 0, sheet, schY = 0 }: { first?: number; gnd: string; pcbX?: number; pcbY?: number; sheet: string; schY?: number }) => (
  <>
    {SEGMENTS.map((s, i) => (
      <LedSegment key={s.id} first={first + i * LEDS_PER_SEGMENT} gnd={gnd} x={pcbX + s.x} y={pcbY + s.y} rot={s.rot} sheet={sheet} schX={0} schY={schY - i * 3.2} />
    ))}
    {LINKS.map((l, i) => {
      const k = (i + 1) * LEDS_PER_SEGMENT - 1;
      const n = first + k;
      const loc = toLed(k);
      const local = (p: P & { via?: boolean }) => ({ ...p, ...loc(p) });
      return (
        <Fragment key={i}>
          <trace name={`DATA_${n}`} from={`.U${n} > .DOUT`} to={`.U${n + 1} > .DIN`} pcbPath={l.data.map(local)} thickness="0.25mm" schDisplayLabel={`D${n}`} />
          <trace name={`VCC_${n}`} from={`.U${n} > .VDD`} to={`.U${n + 1} > .VDD`} pcbPath={l.v5.map(local)} thickness="0.5mm" schDisplayLabel="V5" />
        </Fragment>
      );
    })}
  </>
);
