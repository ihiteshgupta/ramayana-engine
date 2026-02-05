/**
 * Court hall background — Dravidian temple architecture.
 *
 * Grand pillared hall with arched ceiling, oil lamp glows,
 * and a polished stone floor. Everything drawn in shadow-puppet
 * style: dark silhouette architecture with gold accent strokes.
 */

import {
  BG_DARK, BG_DEEP_AMBER, BG_WARM_BROWN, BG_SIENNA,
  BG_FLOOR, BG_FLOOR_LIGHT,
  GOLD, GOLD_DIM, LAMP_CORE,
  verticalGradient, radialGlow,
} from "./palette";

export function drawCourtHall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  // ── 1. Base wall gradient ──────────────────────────────
  ctx.fillStyle = verticalGradient(ctx, 0, h, [
    [0, BG_DARK],
    [0.15, BG_DEEP_AMBER],
    [0.5, BG_WARM_BROWN],
    [0.75, BG_SIENNA],
    [1.0, BG_WARM_BROWN],
  ]);
  ctx.fillRect(0, 0, w, h);

  // ── 2. Ceiling decorative band ─────────────────────────
  drawCeilingBand(ctx, w);

  // ── 3. Pillars with arches ─────────────────────────────
  const pillarCount = 8;
  const spacing = w / (pillarCount - 1);
  const pillarWidth = 44;
  const pillarTop = 120;
  const pillarBottom = 820;

  for (let i = 0; i < pillarCount; i++) {
    const cx = i * spacing;
    drawPillar(ctx, cx, pillarTop, pillarBottom, pillarWidth);

    // Arches between pillars
    if (i < pillarCount - 1) {
      const nextCx = (i + 1) * spacing;
      drawArch(ctx, cx, nextCx, pillarTop);
    }
  }

  // ── 4. Floor ───────────────────────────────────────────
  drawFloor(ctx, w, h, pillarBottom);

  // ── 5. Oil lamp glows ──────────────────────────────────
  const lampPositions = [
    { x: w * 0.15, y: 200 },
    { x: w * 0.5, y: 180 },
    { x: w * 0.85, y: 200 },
    { x: w * 0.3, y: 600 },
    { x: w * 0.7, y: 600 },
  ];
  for (const lamp of lampPositions) {
    drawLampGlow(ctx, lamp.x, lamp.y);
  }

  // ── 6. Throne platform hint (center) ───────────────────
  drawThronePlatform(ctx, w, pillarBottom);

  // ── 7. Upper ambient light wash ────────────────────────
  // Warm light falling from above
  radialGlow(ctx, w / 2, 0, h * 0.7, LAMP_CORE, 0.06);
}

// ── Sub-drawing functions ─────────────────────────────────

function drawCeilingBand(ctx: CanvasRenderingContext2D, w: number): void {
  // Decorative horizontal band at top
  const y = 60;
  const bandH = 12;

  ctx.fillStyle = BG_DEEP_AMBER;
  ctx.fillRect(0, y, w, bandH);

  // Gold accent lines
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.moveTo(0, y + bandH);
  ctx.lineTo(w, y + bandH);
  ctx.stroke();

  // Small repeating diamond pattern
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  const step = 40;
  for (let x = step / 2; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, y + 1);
    ctx.lineTo(x + 6, y + bandH / 2);
    ctx.lineTo(x, y + bandH - 1);
    ctx.lineTo(x - 6, y + bandH / 2);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawPillar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  bottom: number,
  width: number
): void {
  const halfW = width / 2;

  // Pillar shadow (slightly wider, darker)
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(cx - halfW - 4, top, width + 8, bottom - top);

  // Pillar body — gradient from dark center to slightly lighter edges
  const pg = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
  pg.addColorStop(0, "#1A0F05");
  pg.addColorStop(0.3, "#2A1A0E");
  pg.addColorStop(0.5, "#3A2818");
  pg.addColorStop(0.7, "#2A1A0E");
  pg.addColorStop(1, "#1A0F05");
  ctx.fillStyle = pg;
  ctx.fillRect(cx - halfW, top, width, bottom - top);

  // Gold edge lines
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - halfW, top);
  ctx.lineTo(cx - halfW, bottom);
  ctx.moveTo(cx + halfW, top);
  ctx.lineTo(cx + halfW, bottom);
  ctx.stroke();

  // Lotus capital at top
  drawLotusCapital(ctx, cx, top, halfW);

  // Base pedestal
  drawPedestal(ctx, cx, bottom, halfW);

  // Carved ring details along shaft
  const rings = [top + 80, top + (bottom - top) * 0.4, top + (bottom - top) * 0.7];
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  for (const ry of rings) {
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 2, ry);
    ctx.lineTo(cx + halfW - 2, ry);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - halfW + 2, ry + 4);
    ctx.lineTo(cx + halfW - 2, ry + 4);
    ctx.stroke();
  }
}

function drawLotusCapital(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  halfW: number
): void {
  // Wider capital block
  const capW = halfW * 1.8;
  const capH = 24;

  ctx.fillStyle = "#2A1808";
  ctx.fillRect(cx - capW, top - capH, capW * 2, capH);

  // Gold outline
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cx - capW, top - capH, capW * 2, capH);

  // Lotus petal curves (3 petals)
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  for (let p = -1; p <= 1; p++) {
    const px = cx + p * (capW * 0.5);
    ctx.beginPath();
    ctx.ellipse(px, top - capH / 2, 10, capH / 2 - 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPedestal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bottom: number,
  halfW: number
): void {
  const pedW = halfW * 1.4;
  const pedH = 16;

  ctx.fillStyle = "#1A0F05";
  ctx.fillRect(cx - pedW, bottom, pedW * 2, pedH);

  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - pedW, bottom, pedW * 2, pedH);
}

function drawArch(
  ctx: CanvasRenderingContext2D,
  leftCx: number,
  rightCx: number,
  pillarTop: number
): void {
  const midX = (leftCx + rightCx) / 2;
  const archTop = pillarTop - 50;
  const archBase = pillarTop + 20;

  // Arch fill (dark)
  ctx.beginPath();
  ctx.moveTo(leftCx + 22, archBase);
  ctx.quadraticCurveTo(midX, archTop - 30, rightCx - 22, archBase);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fill();

  // Outer arch line (gold)
  ctx.beginPath();
  ctx.moveTo(leftCx + 22, archBase);
  ctx.quadraticCurveTo(midX, archTop - 30, rightCx - 22, archBase);
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner arch line
  ctx.beginPath();
  ctx.moveTo(leftCx + 22, archBase - 4);
  ctx.quadraticCurveTo(midX, archTop - 20, rightCx - 22, archBase - 4);
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Keystone at top of arch
  ctx.fillStyle = GOLD_DIM;
  ctx.beginPath();
  ctx.moveTo(midX - 8, archTop - 18);
  ctx.lineTo(midX + 8, archTop - 18);
  ctx.lineTo(midX + 5, archTop - 6);
  ctx.lineTo(midX - 5, archTop - 6);
  ctx.closePath();
  ctx.fill();
}

function drawFloor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  floorY: number
): void {
  // Floor gradient
  ctx.fillStyle = verticalGradient(ctx, floorY, h, [
    [0, BG_FLOOR],
    [0.3, BG_FLOOR_LIGHT],
    [0.7, BG_FLOOR],
    [1.0, BG_DARK],
  ]);
  ctx.fillRect(0, floorY, w, h - floorY);

  // Tile grid lines (subtle)
  ctx.strokeStyle = "rgba(212, 160, 80, 0.06)";
  ctx.lineWidth = 1;

  // Horizontal lines with perspective convergence
  const horizLines = 8;
  for (let i = 1; i <= horizLines; i++) {
    const y = floorY + (i / horizLines) * (h - floorY);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Vertical lines
  const vertLines = 12;
  for (let i = 1; i < vertLines; i++) {
    const x = (i / vertLines) * w;
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Polished reflection highlight
  radialGlow(ctx, w / 2, floorY + 60, 400, LAMP_CORE, 0.04);
}

function drawThronePlatform(
  ctx: CanvasRenderingContext2D,
  w: number,
  floorY: number
): void {
  const cx = w / 2;
  const platW = 200;
  const platH = 20;
  const stepW = 260;
  const stepH = 10;

  // Lower step
  ctx.fillStyle = "#1A0F08";
  ctx.fillRect(cx - stepW / 2, floorY - stepH, stepW, stepH);
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - stepW / 2, floorY - stepH, stepW, stepH);

  // Upper platform
  ctx.fillStyle = "#2A1810";
  ctx.fillRect(cx - platW / 2, floorY - stepH - platH, platW, platH);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - platW / 2, floorY - stepH - platH, platW, platH);
}

function drawLampGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  // Outer warm glow
  radialGlow(ctx, x, y, 200, LAMP_CORE, 0.08);

  // Inner bright glow
  radialGlow(ctx, x, y, 60, LAMP_CORE, 0.15);

  // Tiny lamp flame
  ctx.fillStyle = LAMP_CORE;
  ctx.beginPath();
  ctx.ellipse(x, y, 3, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lamp holder hint
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y + 8, 8, 0, Math.PI);
  ctx.stroke();
}
