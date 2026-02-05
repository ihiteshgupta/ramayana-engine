/**
 * Cinematic vignette overlay — dark edges for theatrical framing.
 */

export function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.max(w, h) * 0.65;

  const g = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.7, "rgba(0,0,0,0.1)");
  g.addColorStop(1, "rgba(0,0,0,0.45)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
