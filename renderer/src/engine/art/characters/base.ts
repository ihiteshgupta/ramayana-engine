/**
 * Shared character drawing utilities.
 *
 * All characters share the same shadow-puppet silhouette base.
 * These helpers draw common elements: body, head, crown, ornaments, etc.
 */

import {
  SILHOUETTE, GOLD, GOLD_DIM, GOLD_LIGHT, COPPER, CREAM, SKIN_TONE,
  silhouetteFill, resetShadow, goldStroke,
} from "../palette";

// ── Body silhouette helpers ──────────────────────────────

/** Draw the basic body silhouette — torso + legs. */
export function drawBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bodyTop: number,
  bodyBottom: number,
  shoulderW: number,
  waistW: number,
  tint?: string
): void {
  silhouetteFill(ctx, tint);
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW, bodyTop);
  ctx.lineTo(cx + shoulderW, bodyTop);
  ctx.lineTo(cx + waistW, bodyBottom);
  ctx.lineTo(cx - waistW, bodyBottom);
  ctx.closePath();
  ctx.fill();
  resetShadow(ctx);
}

/** Draw legs (two slightly separated pillars). */
export function drawLegs(
  ctx: CanvasRenderingContext2D,
  cx: number,
  legTop: number,
  legBottom: number,
  legSpread: number,
  legWidth: number,
  tint?: string
): void {
  silhouetteFill(ctx, tint);
  // Left leg
  ctx.fillRect(cx - legSpread - legWidth / 2, legTop, legWidth, legBottom - legTop);
  // Right leg
  ctx.fillRect(cx + legSpread - legWidth / 2, legTop, legWidth, legBottom - legTop);
  resetShadow(ctx);
}

/** Draw a head circle with skin-tone highlight. */
export function drawHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  tint?: string
): void {
  // Silhouette head
  silhouetteFill(ctx, tint);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  resetShadow(ctx);

  // Subtle face highlight (profile-view, right side)
  ctx.fillStyle = SKIN_TONE;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(cx + 2, cy - 1, radius * 0.6, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Draw a neck connecting head to body. */
export function drawNeck(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  bottom: number,
  width: number,
  tint?: string
): void {
  silhouetteFill(ctx, tint);
  ctx.fillRect(cx - width / 2, top, width, bottom - top);
  resetShadow(ctx);
}

// ── Ornamental elements ──────────────────────────────────

/** Draw a pointed crown (mukut) — used by Rama, Janaka. */
export function drawCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number,
  peaks: number = 3,
  color: string = GOLD
): void {
  ctx.fillStyle = color;
  ctx.beginPath();

  // Crown base
  ctx.moveTo(cx - width / 2, baseY);

  // Zigzag peaks
  const peakW = width / peaks;
  for (let i = 0; i < peaks; i++) {
    const px = cx - width / 2 + peakW * i + peakW / 2;
    ctx.lineTo(px - peakW * 0.3, baseY);
    ctx.lineTo(px, baseY - height);
    ctx.lineTo(px + peakW * 0.3, baseY);
  }

  ctx.lineTo(cx + width / 2, baseY);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Jewel dot at center peak
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.arc(cx, baseY - height * 0.6, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw a broad royal crown — used by Janaka. */
export function drawBroadCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number
): void {
  // Wide band
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, baseY);
  ctx.lineTo(cx - width / 2 + 8, baseY - height * 0.7);
  ctx.lineTo(cx - width * 0.2, baseY - height);
  ctx.lineTo(cx, baseY - height * 1.1);
  ctx.lineTo(cx + width * 0.2, baseY - height);
  ctx.lineTo(cx + width / 2 - 8, baseY - height * 0.7);
  ctx.lineTo(cx + width / 2, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Central jewel
  ctx.fillStyle = "#C04040";
  ctx.beginPath();
  ctx.arc(cx, baseY - height * 0.6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Band line at base
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, baseY);
  ctx.lineTo(cx + width / 2, baseY);
  ctx.stroke();
}

/** Draw a long beard — for Vishwamitra. */
export function drawBeard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  chinY: number,
  width: number,
  length: number
): void {
  ctx.fillStyle = "#808080";
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, chinY);
  ctx.quadraticCurveTo(cx - width * 0.3, chinY + length * 0.7, cx, chinY + length);
  ctx.quadraticCurveTo(cx + width * 0.3, chinY + length * 0.7, cx + width / 2, chinY);
  ctx.closePath();
  ctx.fill();

  // Highlight strands
  ctx.strokeStyle = "#A0A0A0";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const sx = cx - width * 0.3 + i * (width * 0.6 / 4);
    ctx.beginPath();
    ctx.moveTo(sx, chinY + 2);
    ctx.quadraticCurveTo(sx + 2, chinY + length * 0.5, cx, chinY + length - 2);
    ctx.stroke();
  }
}

/** Draw a sage's staff (danda). */
export function drawStaff(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number
): void {
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();

  // Staff head — trident-like
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x - 6, top - 12);
  ctx.moveTo(x, top);
  ctx.lineTo(x, top - 15);
  ctx.moveTo(x, top);
  ctx.lineTo(x + 6, top - 12);
  ctx.stroke();
}

/** Draw a flowing sari drape (right side of body). */
export function drawSari(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  hipX: number,
  hipY: number,
  length: number,
  tint: string
): void {
  // Pallu (draped fabric over shoulder)
  ctx.fillStyle = tint;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(shoulderX + 20, shoulderY + length * 0.3, shoulderX + 10, shoulderY + length);
  ctx.lineTo(shoulderX - 5, shoulderY + length);
  ctx.quadraticCurveTo(shoulderX + 5, shoulderY + length * 0.3, shoulderX - 5, shoulderY);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Gold border on sari edge
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(shoulderX + 20, shoulderY + length * 0.3, shoulderX + 10, shoulderY + length);
  ctx.stroke();
}

/** Draw arm extending forward (for garlanding, lifting). */
export function drawArm(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  handX: number,
  handY: number,
  thickness: number,
  tint?: string
): void {
  silhouetteFill(ctx, tint);
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.strokeStyle = SILHOUETTE;
  ctx.beginPath();
  // Slight bend at elbow
  const elbowX = (shoulderX + handX) / 2 + 4;
  const elbowY = (shoulderY + handY) / 2 - 6;
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(elbowX, elbowY, handX, handY);
  ctx.stroke();
  resetShadow(ctx);
}

/** Draw ornamental necklace. */
export function drawNecklace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  neckBase: number,
  width: number
): void {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, neckBase - 4, width / 2, 0, Math.PI);
  ctx.stroke();

  // Small pendant
  ctx.fillStyle = GOLD_LIGHT;
  ctx.beginPath();
  ctx.arc(cx, neckBase + width / 2 - 6, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw a simple ear ornament. */
export function drawEarring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 3
): void {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw feet / footwear at the bottom of legs. */
export function drawFeet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  spread: number,
  footLen: number = 10
): void {
  ctx.fillStyle = SILHOUETTE;
  // Left foot
  ctx.beginPath();
  ctx.ellipse(cx - spread, y, footLen, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right foot
  ctx.beginPath();
  ctx.ellipse(cx + spread, y, footLen, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}
