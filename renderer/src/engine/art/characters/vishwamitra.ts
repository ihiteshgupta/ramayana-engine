/**
 * Vishwamitra — the great sage.
 *
 * Tall, lean build. Long beard, staff (danda), sage robes.
 * Brown/copper tinted glow. States: standing, nodding.
 */

import { VISHWAMITRA_TINT, COPPER, GOLD_DIM, CREAM } from "../palette";
import {
  drawBody, drawLegs, drawHead, drawNeck, drawBeard,
  drawStaff, drawNecklace, drawFeet, drawArm,
} from "./base";
import { silhouetteFill, resetShadow } from "../palette";

export function drawVishwamitra(
  ctx: CanvasRenderingContext2D,
  state: string,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const tint = VISHWAMITRA_TINT;

  switch (state) {
    case "nodding":
      drawNodding(ctx, cx, tint, w, h);
      break;
    default:
      drawStanding(ctx, cx, tint, w, h);
      break;
  }
}

function drawVishwamitraBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  tint: string,
  h: number,
  headTilt: number = 0
): { bodyTop: number; bodyBottom: number; shoulderW: number } {
  const headR = 14;
  const headY = 36;
  const neckBottom = 60;
  const bodyTop = neckBottom;
  const bodyBottom = 155;
  const legBottom = h - 6;
  const shoulderW = 20;
  const waistW = 14;

  // Long robe / dhoti (sage style — ankle length)
  silhouetteFill(ctx, tint);
  ctx.beginPath();
  ctx.moveTo(cx - waistW, bodyBottom - 10);
  ctx.lineTo(cx - waistW - 6, legBottom);
  ctx.lineTo(cx + waistW + 6, legBottom);
  ctx.lineTo(cx + waistW, bodyBottom - 10);
  ctx.closePath();
  ctx.fill();
  resetShadow(ctx);

  drawFeet(ctx, cx, legBottom, 4, 8);

  // Body (lean, ascetic)
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Bark cloth / deer skin drape (diagonal across chest)
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW - 4, bodyTop + 2);
  ctx.lineTo(cx - waistW + 2, bodyBottom - 10);
  ctx.stroke();

  // Neck
  drawNeck(ctx, cx, headY + headR - 2, neckBottom, 9, tint);

  // Head with optional tilt
  ctx.save();
  if (headTilt) {
    ctx.translate(cx, headY);
    ctx.rotate(headTilt);
    ctx.translate(-cx, -headY);
  }
  drawHead(ctx, cx, headY, headR, tint);

  // Matted hair (jata) — piled on top
  silhouetteFill(ctx, tint);
  ctx.beginPath();
  ctx.ellipse(cx - 2, headY - headR - 4, 10, 14, -0.15, 0, Math.PI * 2);
  ctx.fill();
  resetShadow(ctx);

  // Hair tie
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx - 2, headY - headR + 2, 10, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.stroke();

  // Long beard
  drawBeard(ctx, cx + 2, headY + headR - 4, 14, 35);

  ctx.restore();

  // Rudraksha mala (prayer beads)
  drawRudrakshaMala(ctx, cx, neckBottom, 20);

  // Staff always present (to the right)
  drawStaff(ctx, cx + shoulderW + 14, bodyTop - 20, legBottom);

  return { bodyTop, bodyBottom, shoulderW };
}

function drawStanding(ctx: CanvasRenderingContext2D, cx: number, tint: string, w: number, h: number): void {
  const { bodyTop, bodyBottom, shoulderW } = drawVishwamitraBase(ctx, cx, tint, h);

  // Left arm at side, right arm holding staff
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 4, bodyBottom - 15, 6, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 12, bodyTop + 30, 6, tint);
}

function drawNodding(ctx: CanvasRenderingContext2D, cx: number, tint: string, w: number, h: number): void {
  const { bodyTop, bodyBottom, shoulderW } = drawVishwamitraBase(ctx, cx, tint, h, 0.08);

  // Left arm at side, right arm gesturing forward slightly
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 4, bodyBottom - 15, 6, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 8, bodyTop + 20, 6, tint);
}

function drawRudrakshaMala(
  ctx: CanvasRenderingContext2D,
  cx: number,
  neckBase: number,
  width: number
): void {
  // String of beads in a U shape
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, neckBase, width / 2, 0, Math.PI);
  ctx.stroke();

  // Individual beads
  const beadCount = 7;
  for (let i = 0; i <= beadCount; i++) {
    const angle = (i / beadCount) * Math.PI;
    const bx = cx + Math.cos(angle) * (width / 2);
    const by = neckBase + Math.sin(angle) * (width / 2);
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(bx, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
