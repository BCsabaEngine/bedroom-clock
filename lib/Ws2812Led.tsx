import type { ChipProps } from 'tscircuit';

// XL-0807RGBC-2812B (JLCPCB C3646929): 2.0x1.8mm 5V WS2812B-compatible RGB LED with built-in driver. Economic assembly OK.
// Pad geometry copied from the JLCPCB/EasyEDA footprint (0.8x0.8mm pads at +-0.889/+-0.575mm); unrotated, data flows right-to-left (DIN right, DOUT left).
const pinLabels = { pin1: 'DOUT', pin2: 'GND', pin3: 'DIN', pin4: 'VDD' } as const;

const pad = (pin: number, x: number, y: number) => <smtpad portHints={[`pin${pin}`]} shape="rect" width="0.8mm" height="0.8mm" pcbX={`${x}mm`} pcbY={`${y}mm`} layer="top" />;

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
        {pad(1, -0.889, 0.575)}
        {pad(2, -0.889, -0.575)}
        {pad(3, 0.889, -0.575)}
        {pad(4, 0.889, 0.575)}
        <courtyardrect pcbX={0} pcbY={0} width="2.9mm" height="2.1mm" />
      </footprint>
    }
    cadModel={{ objUrl: 'https://modelcdn.tscircuit.com/easyeda_models/download?uuid=7d141c69518a44a6ad89b5ed9bb215c5&pn=C3646929' }}
  />
);
