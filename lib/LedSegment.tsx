import { Fragment } from 'react';

import { chamfer, type P, pt } from './wire';
import { LED_PADS, Ws2812Led } from './Ws2812Led';

export const LED_PITCH = 5;
const DX = LED_PADS.VDD.x; // LED pad offset from LED centre (x)
const CUT = 0.5; // 45 deg corner cut of the copper inside a bar (rule 17); the stubs between pad and rail are 0.925 mm
// pcbPath points are expressed in the frame of the component owning the trace's `from` port, so convert from segment coordinates.
// Every LED is rotated 180deg and sits at (x, 0) in the segment frame.
const inLed =
  (x: number) =>
  ({ x: gx, y: gy }: P) => ({ x: x - gx, y: -gy });
// Pad centre of an LED at `x` in the segment frame (the LEDs are rotated 180deg to it).
const padAt = (pin: keyof typeof LED_PADS, x: number): P => pt(x - LED_PADS[pin].x, -LED_PADS[pin].y);
const cut = (poly: P[]) => chamfer(poly, CUT).slice(1, -1);
const via = (p: P) => ({ ...p, via: true, fromLayer: 'top', toLayer: 'bottom' }) as const;

// One 7-segment bar: `count` WS2812 LEDs in a line at 5mm pitch (50mm envelope), nothing else.
// Local frame: data flows +x, first LED at the origin, the 5V rail runs on the -y side. The LEDs are placed on a line at `rot` on the board; no <group> is used.
// `first` is the refdes number of the first LED (U<n>); the segment input is U<first>.DIN, the output U<first+count-1>.DOUT.
// All copper inside the segment is routed explicitly (pcbPath): 5V is a 0.5mm rail below the LEDs, data hops through the gap between
// LEDs, GND drops through a via at each LED to the bottom-layer GND pour (a <copperpour> on the board).
const SCH_PITCH = 3.6;

// `x`, `y`, `rot`: board position of the first LED and direction of the bar (degrees, 0 = towards +x). `sch`: centre of the schematic row.
type Props = { first: number; count?: number; gnd: string; x: number; y: number; rot: number; sheet: string; section?: string; schX: number; schY: number };
export const LedSegment = ({ first, count = 10, gnd, x: x0, y: y0, rot, sheet, section, schX, schY }: Props) => {
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const n = first + i;
        const x = i * LED_PITCH;
        const led = inLed(x);
        return (
          <Fragment key={i}>
            <Ws2812Led name={`U${n}`} pcbX={x0 + x * c} pcbY={y0 + x * s} pcbRotation={rot + 180} schSheetName={sheet} schSectionName={section} schX={schX + (i - (count - 1) / 2) * SCH_PITCH} schY={schY} />
            <trace name={`GND_U${n}`} from={`.U${n} > .GND`} to={gnd} pcbPath={[via(led({ x: x + DX, y: 2 }))]} thickness="0.5mm" />
            {i < count - 1 && <trace name={`VCC_${n}`} from={`.U${n} > .VDD`} to={`.U${n + 1} > .VDD`} pcbPath={cut([padAt('VDD', x), pt(x - DX, -1.5), pt(x + LED_PITCH - DX, -1.5), padAt('VDD', x + LED_PITCH)]).map(led)} thickness="0.5mm" schDisplayLabel="V5" />}
            {i < count - 1 && <trace name={`DATA_${n}`} from={`.U${n} > .DOUT`} to={`.U${n + 1} > .DIN`} pcbPath={cut([padAt('DOUT', x), pt(x + LED_PITCH / 2, -0.575), pt(x + LED_PITCH / 2, 0.575), padAt('DIN', x + LED_PITCH)]).map(led)} thickness="0.25mm" />}
          </Fragment>
        );
      })}
    </>
  );
};
