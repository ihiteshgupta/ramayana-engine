/**
 * Rama — the hero.
 *
 * Tall, youthful build. Pointed crown (mukut), royal posture.
 * Blue-tinted edge glow. States: idle, walking, lifting, drawing_bow, triumphant.
 */

import { RAMA_TINT, GOLD, CREAM } from "../palette";
import {
  drawBody, drawLegs, drawHead, drawNeck, drawCrown,
  drawNecklace, drawEarring, drawFeet, drawArm,
} from "./base";

export function drawRama(
  ctx: CanvasRenderingContext2D,
  state: string,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const tint = RAMA_TINT;

  // Proportions (128x256 canvas, anchor bottom-center)
  const headR = 14;
  const headY = 38;
  const neckTop = headY + headR - 2;
  const neckBottom = 62;
  const bodyTop = neckBottom;
  const bodyBottom = 150;
  const legBottom = h - 6;
  const shoulderW = 22;
  const waistW = 14;

  switch (state) {
    case "walking":
      drawWalking(ctx, cx, tint, headR, headY, neckTop, neckBottom, bodyTop, bodyBottom, legBottom, shoulderW, waistW, w, h);
      break;
    case "lifting":
      drawLifting(ctx, cx, tint, headR, headY, neckTop, neckBottom, bodyTop, bodyBottom, legBottom, shoulderW, waistW, w, h);
      break;
    case "drawing_bow":
      drawDrawingBow(ctx, cx, tint, headR, headY, neckTop, neckBottom, bodyTop, bodyBottom, legBottom, shoulderW, waistW, w, h);
      break;
    case "triumphant":
      drawTriumphant(ctx, cx, tint, headR, headY, neckTop, neckBottom, bodyTop, bodyBottom, legBottom, shoulderW, waistW, w, h);
      break;
    default: // idle, standing
      drawIdle(ctx, cx, tint, headR, headY, neckTop, neckBottom, bodyTop, bodyBottom, legBottom, shoulderW, waistW, w, h);
      break;
  }
}

function drawIdle(
  ctx: CanvasRenderingContext2D,
  cx: number, tint: string,
  headR: number, headY: number,
  neckTop: number, neckBottom: number,
  bodyTop: number, bodyBottom: number,
  legBottom: number, shoulderW: number, waistW: number,
  _w: number, _h: number
): void {
  // Dhoti (lower garment) — slight flare
  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 6, 16, tint);
  drawFeet(ctx, cx, legBottom, 6);

  // Body
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Arms at sides
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 2, bodyBottom - 10, 7, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 2, bodyBottom - 10, 7, tint);

  // Neck
  drawNeck(ctx, cx, neckTop, neckBottom, 10, tint);

  // Head
  drawHead(ctx, cx, headY, headR, tint);

  // Ornaments
  drawCrown(ctx, cx, headY - headR + 2, 22, 18, 3, GOLD);
  drawNecklace(ctx, cx, neckBottom, 20);
  drawEarring(ctx, cx + headR - 2, headY + 2);

  // Angavastra (upper cloth) line across chest
  ctx.strokeStyle = RAMA_TINT;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW + 4, bodyTop + 4);
  ctx.lineTo(cx + waistW - 2, bodyBottom - 20);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawWalking(
  ctx: CanvasRenderingContext2D,
  cx: number, tint: string,
  headR: number, headY: number,
  neckTop: number, neckBottom: number,
  bodyTop: number, bodyBottom: number,
  legBottom: number, shoulderW: number, waistW: number,
  _w: number, _h: number
): void {
  // Lean forward slightly
  ctx.save();
  ctx.translate(cx, legBottom);
  ctx.rotate(-0.06);
  ctx.translate(-cx, -legBottom);

  // Legs — one forward, one back
  drawArm(ctx, cx - 4, bodyBottom - 10, cx - 12, legBottom, 14, tint); // back leg
  drawArm(ctx, cx + 4, bodyBottom - 10, cx + 14, legBottom, 14, tint); // front leg
  drawFeet(ctx, cx, legBottom, 10, 8);

  // Body
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Arms in walking motion
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 8, bodyBottom - 20, 7, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 6, bodyBottom - 30, 7, tint);

  drawNeck(ctx, cx, neckTop, neckBottom, 10, tint);
  drawHead(ctx, cx, headY, headR, tint);
  drawCrown(ctx, cx, headY - headR + 2, 22, 18, 3, GOLD);
  drawNecklace(ctx, cx, neckBottom, 20);
  drawEarring(ctx, cx + headR - 2, headY + 2);

  ctx.restore();
}

function drawLifting(
  ctx: CanvasRenderingContext2D,
  cx: number, tint: string,
  headR: number, headY: number,
  neckTop: number, neckBottom: number,
  bodyTop: number, bodyBottom: number,
  legBottom: number, shoulderW: number, waistW: number,
  _w: number, _h: number
): void {
  // Wider stance
  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 10, 16, tint);
  drawFeet(ctx, cx, legBottom, 10);

  // Body — slight lean forward
  ctx.save();
  ctx.translate(cx, bodyBottom);
  ctx.rotate(-0.04);
  ctx.translate(-cx, -bodyBottom);

  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW + 2, waistW, tint);

  // Arms reaching down
  drawArm(ctx, cx - shoulderW, bodyTop + 8, cx - 14, bodyBottom + 10, 8, tint);
  drawArm(ctx, cx + shoulderW, bodyTop + 8, cx + 14, bodyBottom + 10, 8, tint);

  drawNeck(ctx, cx, neckTop, neckBottom, 10, tint);
  drawHead(ctx, cx, headY + 3, headR, tint); // head slightly lowered
  drawCrown(ctx, cx, headY - headR + 5, 22, 18, 3, GOLD);
  drawNecklace(ctx, cx, neckBottom, 20);

  ctx.restore();
}

function drawDrawingBow(
  ctx: CanvasRenderingContext2D,
  cx: number, tint: string,
  headR: number, headY: number,
  neckTop: number, neckBottom: number,
  bodyTop: number, bodyBottom: number,
  legBottom: number, shoulderW: number, waistW: number,
  w: number, _h: number
): void {
  // Power stance
  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 12, 16, tint);
  drawFeet(ctx, cx, legBottom, 12);

  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW + 2, waistW + 2, tint);

  // Left arm extended forward (holding bow)
  drawArm(ctx, cx - shoulderW, bodyTop + 8, cx - shoulderW - 30, bodyTop - 10, 8, tint);

  // Right arm pulled back (drawing string)
  drawArm(ctx, cx + shoulderW, bodyTop + 8, cx + shoulderW + 20, bodyTop + 4, 8, tint);

  drawNeck(ctx, cx, neckTop, neckBottom, 10, tint);
  drawHead(ctx, cx, headY, headR, tint);
  drawCrown(ctx, cx, headY - headR + 2, 22, 18, 3, GOLD);
  drawNecklace(ctx, cx, neckBottom, 20);
  drawEarring(ctx, cx + headR - 2, headY + 2);

  // Glow of divine energy
  ctx.save();
  const g = ctx.createRadialGradient(cx, bodyTop, 5, cx, bodyTop, 60);
  g.addColorStop(0, "rgba(58, 90, 154, 0.2)");
  g.addColorStop(1, "rgba(58, 90, 154, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 60, bodyTop - 60, 120, 120);
  ctx.restore();
}

function drawTriumphant(
  ctx: CanvasRenderingContext2D,
  cx: number, tint: string,
  headR: number, headY: number,
  neckTop: number, neckBottom: number,
  bodyTop: number, bodyBottom: number,
  legBottom: number, shoulderW: number, waistW: number,
  _w: number, _h: number
): void {
  // Straight, proud stance
  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 8, 16, tint);
  drawFeet(ctx, cx, legBottom, 8);

  // Chest out
  drawBody(ctx, cx, bodyTop - 2, bodyBottom, shoulderW + 3, waistW, tint);

  // Arms slightly raised and out
  drawArm(ctx, cx - shoulderW - 1, bodyTop + 6, cx - shoulderW - 12, bodyBottom - 30, 7, tint);
  drawArm(ctx, cx + shoulderW + 1, bodyTop + 6, cx + shoulderW + 12, bodyBottom - 30, 7, tint);

  drawNeck(ctx, cx, neckTop, neckBottom, 10, tint);
  drawHead(ctx, cx, headY - 2, headR, tint); // head slightly raised
  drawCrown(ctx, cx, headY - headR, 24, 20, 3, GOLD);
  drawNecklace(ctx, cx, neckBottom, 22);
  drawEarring(ctx, cx + headR - 2, headY);

  // Victory aura
  ctx.save();
  const g = ctx.createRadialGradient(cx, headY, 10, cx, headY, 50);
  g.addColorStop(0, "rgba(212, 160, 23, 0.15)");
  g.addColorStop(1, "rgba(212, 160, 23, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 50, headY - 50, 100, 100);
  ctx.restore();
}
