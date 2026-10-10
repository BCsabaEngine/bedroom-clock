import type { ChipProps } from 'tscircuit';

// XL-0807RGBC-2812B (JLCPCB C3646929): 2.0x1.8mm 5V WS2812B-compatible RGB LED with built-in driver. Economic assembly OK.
// Pad geometry copied from the JLCPCB/EasyEDA footprint (0.8x0.8mm pads at +-0.889/+-0.575mm); unrotated, data flows right-to-left (DIN right, DOUT left). The pin order was checked against the datasheet (2026-10-10); the datasheet's own recommended pattern is 0.6x0.7mm pads at +-0.75/+-0.45mm, the EasyEDA pads cover the same terminals and are kept.
const pinLabels = { pin1: 'DOUT', pin2: 'GND', pin3: 'DIN', pin4: 'VDD' } as const;

// Pad centres in the footprint frame (unrotated), by pin name; LedSegment and SevenSegDigit route to these. Datasheet (XINGLIGHT XL-0807RGBC-WS2812B, p. 11): pin 1 DO, 2 GND, 3 DI, 4 VDD, top view DO and GND on the left, VDD and DI on the right.
export const LED_PADS = { DOUT: { x: -0.889, y: 0.575 }, GND: { x: -0.889, y: -0.575 }, DIN: { x: 0.889, y: -0.575 }, VDD: { x: 0.889, y: 0.575 } } as const;

const pad = (pin: number, { x, y }: { x: number; y: number }) => <smtpad portHints={[`pin${pin}`]} shape="rect" width="0.8mm" height="0.8mm" pcbX={`${x}mm`} pcbY={`${y}mm`} layer="top" />;

export const Ws2812Led = (props: ChipProps<typeof pinLabels>) => (
  <chip
    {...props}
    pinLabels={pinLabels}
    pinAttributes={{ VDD: { requiresPower: true }, GND: { requiresGround: true }, DIN: { mustBeConnected: true } }}
    schPinArrangement={{ leftSide: { direction: 'top-to-bottom', pins: ['DIN', 'GND'] }, rightSide: { direction: 'top-to-bottom', pins: ['VDD', 'DOUT'] } }}
    supplierPartNumbers={{ jlcpcb: ['C3646929'] }}
    manufacturerPartNumber="XL-0807RGBC-2812B"
    footprint={
      <footprint>
        {pad(1, LED_PADS.DOUT)}
        {pad(2, LED_PADS.GND)}
        {pad(3, LED_PADS.DIN)}
        {pad(4, LED_PADS.VDD)}
        {/* pin 1 mark (rule 42): a dot on the DOUT / GND side of the body, between the two left pads, like the dot on the package */}
        <silkscreencircle pcbX="-1.7mm" pcbY="0mm" radius="0.2mm" isFilled />
        <courtyardrect pcbX={0} pcbY={0} width="2.9mm" height="2.1mm" />
      </footprint>
    }
    cadModel={{ objUrl: 'https://modelcdn.tscircuit.com/easyeda_models/download?uuid=7d141c69518a44a6ad89b5ed9bb215c5&pn=C3646929' }}
  />
);
