/**
 * Character drawing dispatch.
 * Maps character IDs to their draw functions.
 */

import { drawRama } from "./rama";
import { drawSita } from "./sita";
import { drawJanaka } from "./janaka";
import { drawVishwamitra } from "./vishwamitra";
import { drawKingGeneric } from "./king_generic";

type DrawFn = (ctx: CanvasRenderingContext2D, state: string, w: number, h: number) => void;

const CHARACTER_DRAWERS: Record<string, DrawFn> = {
  rama: drawRama,
  sita: drawSita,
  janaka: drawJanaka,
  vishwamitra: drawVishwamitra,
  king_generic: drawKingGeneric,
};

/**
 * Draw a character silhouette onto a canvas context.
 * Returns false if no drawer exists for the given id.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  id: string,
  state: string,
  w: number,
  h: number
): boolean {
  const draw = CHARACTER_DRAWERS[id];
  if (!draw) return false;
  ctx.clearRect(0, 0, w, h);
  draw(ctx, state, w, h);
  return true;
}
