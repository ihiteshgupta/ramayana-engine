/**
 * Shadow puppet art palette — Tholu Bommalata inspired.
 *
 * All colors, gradients, and shared drawing helpers live here
 * so the visual identity stays consistent across backgrounds,
 * characters, and props.
 */

// ── Silhouette fills ──────────────────────────────────────
export const SILHOUETTE = "#1A1005";
export const SILHOUETTE_LIGHT = "#2A1A0A";

// ── Accent metals ─────────────────────────────────────────
export const GOLD = "#D4A017";
export const GOLD_LIGHT = "#F0D060";
export const GOLD_DIM = "#A07810";
export const COPPER = "#B87333";
export const COPPER_LIGHT = "#D49355";
export const SILVER = "#A0A0A8";

// ── Highlights ────────────────────────────────────────────
export const CREAM = "#FFF8DC";
export const WARM_WHITE = "#FAEBD7";
export const SKIN_TONE = "#C8956A";

// ── Character accent tints ────────────────────────────────
export const RAMA_TINT = "#3A5A9A";
export const SITA_TINT = "#C04060";
export const JANAKA_TINT = "#D4A017";
export const VISHWAMITRA_TINT = "#8B5A2B";
export const KING_GENERIC_TINT = "#707078";

// ── Background tones ─────────────────────────────────────
export const BG_DARK = "#0D0803";
export const BG_DEEP_AMBER = "#1A0F05";
export const BG_WARM_BROWN = "#3D2412";
export const BG_SIENNA = "#8B4513";
export const BG_FLOOR = "#2A1808";
export const BG_FLOOR_LIGHT = "#4A3020";

// ── Lamp / glow colors ───────────────────────────────────
export const LAMP_CORE = "#FFB830";
export const LAMP_GLOW = "rgba(255, 168, 40, 0.15)";
export const LAMP_GLOW_STRONG = "rgba(255, 168, 40, 0.25)";

// ── Prop colors ──────────────────────────────────────────
export const BOW_WOOD = "#3D1E08";
export const BOW_AURA = "rgba(212, 160, 23, 0.2)";
export const BOW_AURA_STRONG = "rgba(212, 160, 23, 0.4)";
export const GARLAND_GREEN = "#4A7A3A";
export const GARLAND_FLOWER = "#FFF0E0";

// ── Helpers ──────────────────────────────────────────────

/** Create a vertical linear gradient. */
export function verticalGradient(
  ctx: CanvasRenderingContext2D,
  y0: number,
  y1: number,
  stops: [number, string][]
): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [offset, color] of stops) g.addColorStop(offset, color);
  return g;
}

/** Create a radial glow at a point. */
export function radialGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  alpha: number = 0.2
): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

/** Draw a gold accent line (stroke only). */
export function goldStroke(
  ctx: CanvasRenderingContext2D,
  lineWidth: number = 1.5
): void {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
}

/** Draw a copper accent line (stroke only). */
export function copperStroke(
  ctx: CanvasRenderingContext2D,
  lineWidth: number = 1.5
): void {
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
}

/** Fill with silhouette color and optional tint edge glow. */
export function silhouetteFill(
  ctx: CanvasRenderingContext2D,
  tint?: string
): void {
  ctx.fillStyle = SILHOUETTE;
  if (tint) {
    ctx.shadowColor = tint;
    ctx.shadowBlur = 6;
  }
}

/** Reset shadow after silhouette drawing. */
export function resetShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}
