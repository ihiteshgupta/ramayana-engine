/**
 * Prop drawing functions — Shiva's bow and garland.
 */

import {
  BOW_WOOD, BOW_AURA, BOW_AURA_STRONG, GOLD, GOLD_DIM, CREAM,
  GARLAND_GREEN, GARLAND_FLOWER, COPPER,
} from "./palette";

/**
 * Draw Shiva's bow (Pinaka) — divine weapon with golden aura.
 * Canvas size: 180x100
 */
export function drawShivaBow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const cy = h * 0.6;

  // Divine aura (outer glow)
  const auraOuter = ctx.createRadialGradient(cx, cy - 10, 10, cx, cy - 10, 80);
  auraOuter.addColorStop(0, BOW_AURA_STRONG);
  auraOuter.addColorStop(0.6, BOW_AURA);
  auraOuter.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = auraOuter;
  ctx.fillRect(0, 0, w, h);

  // Inner aura (brighter core)
  const auraInner = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 40);
  auraInner.addColorStop(0, "rgba(255, 200, 60, 0.15)");
  auraInner.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = auraInner;
  ctx.fillRect(0, 0, w, h);

  // Bow arc — thick curved wood
  ctx.strokeStyle = BOW_WOOD;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Wood grain highlight
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 55, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Gold filigree along the bow
  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 52, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 58, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Decorative dots along the arc
  ctx.fillStyle = GOLD;
  const dotCount = 7;
  for (let i = 0; i < dotCount; i++) {
    const angle = Math.PI * 1.2 + (i / (dotCount - 1)) * Math.PI * 0.6;
    const dx = cx + Math.cos(angle) * 55;
    const dy = cy + 30 + Math.sin(angle) * 55;
    ctx.beginPath();
    ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bowstring
  const leftEnd = {
    x: cx + Math.cos(Math.PI * 1.15) * 55,
    y: cy + 30 + Math.sin(Math.PI * 1.15) * 55,
  };
  const rightEnd = {
    x: cx + Math.cos(Math.PI * 1.85) * 55,
    y: cy + 30 + Math.sin(Math.PI * 1.85) * 55,
  };

  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftEnd.x, leftEnd.y);
  ctx.lineTo(rightEnd.x, rightEnd.y);
  ctx.stroke();

  // Central grip wrapping
  ctx.fillStyle = COPPER;
  ctx.fillRect(cx - 6, cy + 30 - 55 - 4, 12, 8);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - 6, cy + 30 - 55 - 4, 12, 8);
}

/**
 * Draw jasmine garland (jayamala).
 * Canvas size: 120x60
 */
export function drawGarland(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const cx = w / 2;

  // Garland thread — catenary curve
  const startX = 15;
  const endX = w - 15;
  const sagY = h * 0.7;

  // Green thread
  ctx.strokeStyle = GARLAND_GREEN;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, h * 0.3);
  ctx.quadraticCurveTo(cx, sagY, endX, h * 0.3);
  ctx.stroke();

  // Flowers along the thread
  const flowerCount = 9;
  for (let i = 0; i <= flowerCount; i++) {
    const t = i / flowerCount;
    // Quadratic bezier point
    const fx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cx + t * t * endX;
    const fy = (1 - t) * (1 - t) * (h * 0.3) + 2 * (1 - t) * t * sagY + t * t * (h * 0.3);

    // Flower petals (4 small circles)
    ctx.fillStyle = GARLAND_FLOWER;
    for (let p = 0; p < 4; p++) {
      const angle = (p / 4) * Math.PI * 2;
      const px = fx + Math.cos(angle) * 3;
      const py = fy + Math.sin(angle) * 3;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center dot
    ctx.fillStyle = GOLD_DIM;
    ctx.beginPath();
    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gold accent dots at the two ends
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(startX, h * 0.3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(endX, h * 0.3, 3, 0, Math.PI * 2);
  ctx.fill();
}
