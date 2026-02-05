/**
 * Sita — the princess.
 *
 * Graceful, slender build. Flowing sari, braid, delicate jewelry.
 * Pink/red tinted glow. States: idle, watching, walking, garlanding.
 */

import { SITA_TINT, GOLD, GOLD_DIM, CREAM, GARLAND_FLOWER, GARLAND_GREEN } from "../palette";
import {
  drawBody, drawHead, drawNeck, drawNecklace, drawEarring, drawFeet, drawArm,
} from "./base";
import { silhouetteFill, resetShadow, SILHOUETTE } from "../palette";

export function drawSita(
  ctx: CanvasRenderingContext2D,
  state: string,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const tint = SITA_TINT;

  switch (state) {
    case "walking":
      drawSitaWalking(ctx, cx, tint, w, h);
      break;
    case "watching":
      drawSitaWatching(ctx, cx, tint, w, h);
      break;
    case "garlanding":
      drawSitaGarlanding(ctx, cx, tint, w, h);
      break;
    default:
      drawSitaIdle(ctx, cx, tint, w, h);
      break;
  }
}

function drawSitaBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  tint: string,
  _w: number,
  h: number,
  headTilt: number = 0
): { bodyTop: number; bodyBottom: number; headY: number; headR: number; shoulderW: number } {
  const headR = 13;
  const headY = 40;
  const neckBottom = 62;
  const bodyTop = neckBottom;
  const bodyBottom = 148;
  const legBottom = h - 6;
  const shoulderW = 18;
  const waistW = 12;

  // Sari skirt (long flowing garment)
  silhouetteFill(ctx, tint);
  ctx.beginPath();
  ctx.moveTo(cx - waistW, bodyBottom - 10);
  ctx.lineTo(cx - waistW - 8, legBottom);
  ctx.lineTo(cx + waistW + 8, legBottom);
  ctx.lineTo(cx + waistW, bodyBottom - 10);
  ctx.closePath();
  ctx.fill();
  resetShadow(ctx);

  // Sari border (gold) at hem
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - waistW - 8, legBottom);
  ctx.lineTo(cx + waistW + 8, legBottom);
  ctx.stroke();

  // Inner sari pattern line
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - waistW - 6, legBottom - 4);
  ctx.lineTo(cx + waistW + 6, legBottom - 4);
  ctx.stroke();

  drawFeet(ctx, cx, legBottom, 4, 7);

  // Body (slender)
  drawBody(ctx, cx, bodyTop, bodyBottom, shoulderW, waistW, tint);

  // Sari pallu draped over left shoulder
  ctx.fillStyle = SITA_TINT;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW + 2, bodyTop + 2);
  ctx.quadraticCurveTo(cx - shoulderW - 10, bodyBottom, cx - shoulderW - 5, legBottom - 20);
  ctx.lineTo(cx - shoulderW + 5, legBottom - 20);
  ctx.quadraticCurveTo(cx - shoulderW, bodyBottom, cx - shoulderW + 8, bodyTop + 4);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Pallu gold border
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW + 2, bodyTop + 2);
  ctx.quadraticCurveTo(cx - shoulderW - 10, bodyBottom, cx - shoulderW - 5, legBottom - 20);
  ctx.stroke();

  // Neck
  drawNeck(ctx, cx, headY + headR - 2, neckBottom, 8, tint);

  // Head with tilt
  ctx.save();
  if (headTilt) {
    ctx.translate(cx, headY);
    ctx.rotate(headTilt);
    ctx.translate(-cx, -headY);
  }
  drawHead(ctx, cx, headY, headR, tint);

  // Braid (long, hanging behind/to side)
  silhouetteFill(ctx, tint);
  ctx.beginPath();
  ctx.moveTo(cx - 4, headY + headR - 4);
  ctx.quadraticCurveTo(cx - 10, headY + 40, cx - 6, bodyBottom);
  ctx.lineTo(cx - 2, bodyBottom);
  ctx.quadraticCurveTo(cx - 6, headY + 40, cx, headY + headR - 4);
  ctx.closePath();
  ctx.fill();
  resetShadow(ctx);

  // Braid flowers
  ctx.fillStyle = CREAM;
  for (let by = headY + 20; by < bodyBottom; by += 18) {
    ctx.beginPath();
    ctx.arc(cx - 5, by, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Maang tikka (forehead ornament)
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(cx, headY - headR + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Jewelry
  drawNecklace(ctx, cx, neckBottom, 16);
  drawEarring(ctx, cx + headR - 1, headY + 3, 2.5);

  // Bangles on both wrists
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.2;

  return { bodyTop, bodyBottom, headY, headR, shoulderW };
}

function drawSitaIdle(ctx: CanvasRenderingContext2D, cx: number, tint: string, w: number, h: number): void {
  const { bodyTop, bodyBottom, shoulderW } = drawSitaBase(ctx, cx, tint, w, h);

  // Arms at sides gracefully
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 4, bodyBottom - 15, 6, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 4, bodyBottom - 15, 6, tint);

  // Bangles
  drawBangles(ctx, cx - shoulderW - 3, bodyBottom - 18);
  drawBangles(ctx, cx + shoulderW + 3, bodyBottom - 18);
}

function drawSitaWatching(ctx: CanvasRenderingContext2D, cx: number, tint: string, w: number, h: number): void {
  const { bodyTop, bodyBottom, shoulderW } = drawSitaBase(ctx, cx, tint, w, h, 0.05);

  // Hands clasped near chest
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - 4, bodyTop + 30, 6, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + 4, bodyTop + 30, 6, tint);

  // Clasped hands
  ctx.fillStyle = SILHOUETTE;
  ctx.beginPath();
  ctx.arc(cx, bodyTop + 30, 5, 0, Math.PI * 2);
  ctx.fill();

  drawBangles(ctx, cx - 8, bodyTop + 26);
  drawBangles(ctx, cx + 8, bodyTop + 26);
}

function drawSitaWalking(ctx: CanvasRenderingContext2D, cx: number, tint: string, w: number, h: number): void {
  ctx.save();
  ctx.translate(cx, h - 6);
  ctx.rotate(-0.04);
  ctx.translate(-cx, -(h - 6));

  const { bodyTop, bodyBottom, shoulderW } = drawSitaBase(ctx, cx, tint, w, h);

  // Arms in gentle walking motion
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx - shoulderW - 8, bodyBottom - 25, 6, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + shoulderW + 6, bodyBottom - 20, 6, tint);

  drawBangles(ctx, cx - shoulderW - 7, bodyBottom - 28);
  drawBangles(ctx, cx + shoulderW + 5, bodyBottom - 23);

  ctx.restore();
}

function drawSitaGarlanding(ctx: CanvasRenderingContext2D, cx: number, tint: string, w: number, h: number): void {
  const { bodyTop, shoulderW } = drawSitaBase(ctx, cx, tint, w, h, -0.03);

  // Arms extended forward holding garland
  drawArm(ctx, cx - shoulderW + 2, bodyTop + 8, cx + 20, bodyTop + 5, 6, tint);
  drawArm(ctx, cx + shoulderW - 2, bodyTop + 8, cx + 25, bodyTop + 10, 6, tint);

  // Garland in hands
  drawMiniGarland(ctx, cx + 15, bodyTop + 2, cx + 30, bodyTop + 15);

  drawBangles(ctx, cx + 18, bodyTop + 2);
  drawBangles(ctx, cx + 23, bodyTop + 7);
}

function drawBangles(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + 3, 4, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMiniGarland(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  // Draped string
  const midX = (x1 + x2) / 2;
  const midY = Math.max(y1, y2) + 10;

  ctx.strokeStyle = GARLAND_GREEN;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();

  // Flowers along the garland
  ctx.fillStyle = GARLAND_FLOWER;
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const fx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
    const fy = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
