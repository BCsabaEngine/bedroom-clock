// Placeholder example: one resistor and one LED joined by a single trace. Replace with the real design (see README.md).
export default () => (
  <board width="20mm" height="10mm" thickness="1.6mm">

    <schematicsheet name="Main" displayName="Example" sheetIndex={0} sheetWidth="70mm" sheetHeight="50mm" />

    <resistor name="R1" schSheetName="Main" schX={-2} schY={0} resistance="330" footprint="0603" pcbX={-4} pcbY={0} />
    <led name="D1" schSheetName="Main" schX={2} schY={0} color="red" footprint="0603" pcbX={4} pcbY={0} />

    <trace name="T1" from="R1.pin2" to="D1.anode" />
  </board>
)
