// Helpers for explicit copper (`<trace pcbPath>`) shared by both boards. Plain TS, no JSX.
export type P = { x: number; y: number };
export const pt = (x: number, y: number): P => ({ x, y });

const CUT = 1.27;

// No 90 deg corners (LAYOUT_RULES.md rule 17): each one becomes two 45 deg bends, a T junction stays sharp. `poly` = pad centre, corners (orthogonal segments), pad centre; `c` = cut length (one number, or one per vertex index of `poly`), never more than the shorter of the two legs; `keep` = vertex indices that stay sharp (layer-change points). The first and last vertex are the pad centres and are returned unchanged.
export const chamfer = (poly: P[], c: number | number[] = CUT, keep: number[] = []): P[] =>
  poly.flatMap((v, i) => {
    if (i === 0 || i === poly.length - 1 || keep.includes(i)) return [v];
    const a = poly[i - 1];
    const b = poly[i + 1];
    const din = { x: Math.sign(v.x - a.x), y: Math.sign(v.y - a.y) };
    const dout = { x: Math.sign(b.x - v.x), y: Math.sign(b.y - v.y) };
    if (din.x * dout.x + din.y * dout.y !== 0) return [v];
    const d = Math.min(Array.isArray(c) ? (c[i] ?? CUT) : c, Math.hypot(v.x - a.x, v.y - a.y), Math.hypot(b.x - v.x, b.y - v.y));
    return [pt(v.x - din.x * d, v.y - din.y * d), pt(v.x + dout.x * d, v.y + dout.y * d)];
  });
