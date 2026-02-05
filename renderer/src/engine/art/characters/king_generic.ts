/**
 * Generic king/prince — competing suitors.
 *
 * Medium build, simple crown, warrior posture.
 * Grey tinted glow. States: standing, walking, straining, retreating.
 */

import { KING_GENERIC_TINT, SILVER, GOLD_DIM } from "../palette";
import {
  drawBody, drawLegs, drawHead, drawNeck, drawCrown,
  drawNecklace, drawFeet, drawArm,
} from "./base";

export function drawKingGeneric(
  ctx: CanvasRenderingContext2D,
  state: string,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const tint = KING_GENERIC_TINT;

  switch (state) {
    case "walking":
      drawWalking(ctx, cx, tint, w, h);
      break;
    case "straining":
      drawStraining(ctx, cx, tint, w, h);
      break;
    case "retreating":
      drawRetreating(ctx, cx, tint, w, h);
      break;
    default:
      drawStanding(ctx, cx, tint, w, h);
      break;
  }
}

function drawKingBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  tint: string,
  headY: number,
  neckBottom: number,
  bodyTop: number,
  bodyBottom: number,
  legBottom: number,
  headTilt: number = 0,
): { shoulderW: number; waistW: number; headR: number } {
  const headR = 14;
  const shoulderW = 24;
  const waistW = 15;

  // Dhoti
  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 7, 16, tint);
  drawFeet(ctx, cx, legBottom, 7);

  // Body
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Neck
  drawNeck(ctx, cx, headY + headR - 2, neckBottom, 10, tint);

  // Head
  ctx.save();
  if (headTilt) {
    ctx.translate(cx, headY);
    ctx.rotate(headTilt);
    ctx.translate(-cx, -headY);
  }
  drawHead(ctx, cx, headY, headR, tint);
  // Simple crown
  drawCrown(ctx, cx, headY - headR + 2, 20, 14, 2, SILVER);
  ctx.restore();

  // Simple necklace
  drawNecklace(ctx, cx, neckBottom, 18);

  return { shoulderW, waistW, headR };
}

function drawStanding(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headY = 38;
  const neckBottom = 62;
  const bodyTop = neckBottom;
  const bodyBottom = 150;
  const legBottom = h - 6;

  const { shoulderW, waistW } = drawKingBase(ctx, cx, tint, headY, neckBottom, bodyTop, bodyBottom, legBottom);

  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 3, bodyBottom - 12, 7, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 3, bodyBottom - 12, 7, tint);
}

function drawWalking(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headY = 38;
  const neckBottom = 62;
  const bodyTop = neckBottom;
  const bodyBottom = 150;
  const legBottom = h - 6;

  ctx.save();
  ctx.translate(cx, legBottom);
  ctx.rotate(-0.05);
  ctx.translate(-cx, -legBottom);

  const { shoulderW } = drawKingBase(ctx, cx, tint, headY, neckBottom, bodyTop, bodyBottom, legBottom);

  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 8, bodyBottom - 22, 7, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 6, bodyBottom - 28, 7, tint);

  ctx.restore();
}

function drawStraining(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headY = 42; // lower — hunched
  const neckBottom = 64;
  const bodyTop = neckBottom;
  const bodyBottom = 152;
  const legBottom = h - 6;

  // Wider stance for effort
  ctx.save();
  ctx.translate(cx, legBottom);
  ctx.rotate(-0.08); // leaning forward
  ctx.translate(-cx, -legBottom);

  const { shoulderW } = drawKingBase(ctx, cx, tint, headY, neckBottom, bodyTop, bodyBottom, legBottom);

  // Arms extended down — straining to lift
  drawArm(ctx, cx - shoulderW, bodyTop + 8, cx - 10, bodyBottom + 15, 8, tint);
  drawArm(ctx, cx + shoulderW, bodyTop + 8, cx + 10, bodyBottom + 15, 8, tint);

  // Effort lines (small marks near hands)
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const lx = cx + (i - 1) * 8;
    ctx.beginPath();
    ctx.moveTo(lx, bodyBottom + 18);
    ctx.lineTo(lx, bodyBottom + 24);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRetreating(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headY = 42;
  const neckBottom = 64;
  const bodyTop = neckBottom;
  const bodyBottom = 152;
  const legBottom = h - 6;

  // Slight backward lean — defeated
  ctx.save();
  ctx.translate(cx, legBottom);
  ctx.rotate(0.06);
  ctx.translate(-cx, -legBottom);

  const { shoulderW } = drawKingBase(ctx, cx, tint, headY, neckBottom, bodyTop, bodyBottom, legBottom, 0.1);

  // Slumped arms
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 10, cx - shoulderW, bodyBottom - 5, 7, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 10, cx + shoulderW, bodyBottom - 5, 7, tint);

  ctx.restore();
}
