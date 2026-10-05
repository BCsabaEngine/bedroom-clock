// Logical LED layout of the clock, shared by the PCB code (lib/SevenSegDigit.tsx) and the C++ helper generator (scripts/export-cpp.ts, `npm run export:cpp`).
// Plain TS, no JSX, so a script can import it. LED index = digit * LEDS_PER_DIGIT + chain position of the segment * LEDS_PER_SEGMENT + LED in the segment
// (refdes U<index + 1> over the four chained panels). Digit 0 is the panel nearest the controller (DIN from the controller), the leftmost one: hour tens.
export const NUM_DIGITS = 4;
export const LEDS_PER_SEGMENT = 10;

// Order of the segments in the data chain of one panel; the LEDs of a segment are consecutive and run in the direction below (as seen on the panel, y up).
export const SEGMENT_ORDER = ['f', 'a', 'b', 'c', 'd', 'e', 'g'] as const;
export type SegmentId = (typeof SEGMENT_ORDER)[number];
export const SEGMENT_DIRECTION: Record<SegmentId, 'up' | 'down' | 'left' | 'right'> = { f: 'up', a: 'right', b: 'down', c: 'down', d: 'left', e: 'up', g: 'right' };

export const LEDS_PER_DIGIT = SEGMENT_ORDER.length * LEDS_PER_SEGMENT;

// Lit segments for the digits 0..9 (standard seven-segment font: 6 with the top bar, 7 as a, b, c, 9 with the bottom bar).
export const DIGIT_SEGMENTS: readonly (readonly SegmentId[])[] = [
  ['a', 'b', 'c', 'd', 'e', 'f'],
  ['b', 'c'],
  ['a', 'b', 'd', 'e', 'g'],
  ['a', 'b', 'c', 'd', 'g'],
  ['b', 'c', 'f', 'g'],
  ['a', 'c', 'd', 'f', 'g'],
  ['a', 'c', 'd', 'e', 'f', 'g'],
  ['a', 'b', 'c'],
  ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  ['a', 'b', 'c', 'd', 'f', 'g']
];
