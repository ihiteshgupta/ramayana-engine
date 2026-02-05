/**
 * Janaka — King of Mithila.
 *
 * Broad, regal build. Large ornate crown, wide shoulders.
 * Gold tinted glow. States: sitting_throne, standing, rejoicing.
 */

import { JANAKA_TINT, GOLD, GOLD_DIM } from "../palette";
import {
  drawBody, drawLegs, drawHead, drawNeck, drawBroadCrown,
  drawNecklace, drawEarring, drawFeet, drawArm,
} from "./base";
import { silhouetteFill, resetShadow, SILHOUETTE } from "../palette";

export function drawJanaka(
  ctx: CanvasRenderingContext2D,
  state: string,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const tint = JANAKA_TINT;

  switch (state) {
    case "sitting_throne":
      drawSitting(ctx, cx, tint, w, h);
      break;
    case "rejoicing":
      drawRejoicing(ctx, cx, tint, w, h);
      break;
    default: // standing
      drawStanding(ctx, cx, tint, w, h);
      break;
  }
}

function drawJanakaBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  tint: string,
  headY: number,
  neckBottom: number,
  bodyTop: number,
): { headR: number; shoulderW: number } {
  const headR = 15;
  const shoulderW = 26;

  // Neck (thicker — kingly)
  drawNeck(ctx, cx, headY + headR - 2, neckBottom, 12, tint);

  // Head
  drawHead(ctx, cx, headY, headR, tint);

  // Broad crown
  drawBroadCrown(ctx, cx, headY - headR + 3, 34, 22);

  // Jewelry
  drawNecklace(ctx, cx, neckBottom, 24);
  drawEarring(ctx, cx + headR - 1, headY + 3, 3.5);
  drawEarring(ctx, cx - headR + 1, headY + 3, 2.5);

  // Chest ornament — large pendant
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, bodyTop + 20);
  ctx.lineTo(cx - 6, bodyTop + 28);
  ctx.lineTo(cx, bodyTop + 36);
  ctx.lineTo(cx + 6, bodyTop + 28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  return { headR, shoulderW };
}

function drawStanding(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headR = 15;
  const headY = 36;
  const neckBottom = 60;
  const bodyTop = neckBottom;
  const bodyBottom = 150;
  const legBottom = h - 6;
  const shoulderW = 26;
  const waistW = 16;

  // Dhoti
  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 8, 18, tint);
  drawFeet(ctx, cx, legBottom, 8);

  // Royal dhoti border
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 18, legBottom);
  ctx.lineTo(cx + 18, legBottom);
  ctx.stroke();

  // Body (broad)
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Arms at sides
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 4, bodyBottom - 12, 8, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 4, bodyBottom - 12, 8, tint);

  // Upper garment drape
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW - 4, bodyTop + 2);
  ctx.quadraticCurveTo(cx, bodyTop + 16, cx - shoulderW + 4, bodyTop + 6);
  ctx.stroke();

  drawJanakaBase(ctx, cx, tint, headY, neckBottom, bodyTop);
}

function drawSitting(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headY = 36;
  const neckBottom = 60;
  const bodyTop = neckBottom;
  const bodyBottom = 150;
  const shoulderW = 26;
  const waistW = 18;

  // Seated legs — horizontal thighs + vertical shins
  silhouetteFill(ctx, tint);
  // Left thigh
  ctx.fillRect(cx - waistW - 10, bodyBottom - 8, 30, 14);
  // Right thigh
  ctx.fillRect(cx + waistW - 20, bodyBottom - 8, 30, 14);
  // Shins hanging
  ctx.fillRect(cx - waistW - 8, bodyBottom + 6, 14, 50);
  ctx.fillRect(cx + waistW - 6, bodyBottom + 6, 14, 50);
  resetShadow(ctx);

  drawFeet(ctx, cx, bodyBottom + 56, 14, 8);

  // Body
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Arms resting on thighs
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 10, cx - waistW - 6, bodyBottom - 4, 8, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 10, cx + waistW + 6, bodyBottom - 4, 8, tint);

  // Upper garment
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + shoulderW - 4, bodyTop + 2);
  ctx.quadraticCurveTo(cx, bodyTop + 16, cx - shoulderW + 4, bodyTop + 6);
  ctx.stroke();

  drawJanakaBase(ctx, cx, tint, headY, neckBottom, bodyTop);
}

function drawRejoicing(ctx: CanvasRenderingContext2D, cx: number, tint: string, _w: number, h: number): void {
  const headY = 32; // head raised
  const neckBottom = 58;
  const bodyTop = neckBottom;
  const bodyBottom = 148;
  const legBottom = h - 6;
  const shoulderW = 26;
  const waistW = 16;

  drawLegs(ctx, cx, bodyBottom - 10, legBottom, 8, 18, tint);
  drawFeet(ctx, cx, legBottom, 8);

  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW + 2, waistW, tint);

  // Arms raised in joy
  drawArm(ctx, cx - shoulderW, bodyTop + 6, cx - shoulderW - 18, bodyTop - 30, 8, tint);
  drawArm(ctx, cx + shoulderW, bodyTop + 6, cx + shoulderW + 18, bodyTop - 30, 8, tint);

  drawJanakaBase(ctx, cx, tint, headY, neckBottom, bodyTop);

  // Joy radiance
  ctx.save();
  const g = ctx.createRadialGradient(cx, headY, 10, cx, headY, 45);
  g.addColorStop(0, "rgba(212, 160, 23, 0.12)");
  g.addColorStop(1, "rgba(212, 160, 23, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - 45, headY - 45, 90, 90);
  ctx.restore();
}
