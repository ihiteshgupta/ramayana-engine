import { Container, Sprite, Texture, Graphics } from "pixi.js";

interface BackgroundLayers {
  far?: string;
  mid?: string;
  near?: string;
}

/**
 * Background handles scene backgrounds with optional parallax layers.
 *
 * A background can be:
 * - A single image (no parallax)
 * - Multiple layers (far, mid, near) that move at different rates during camera pan
 *
 * Parallax ratios: far=0.3, mid=0.6, near=1.0 (relative to camera movement)
 */
export class Background {
  private parent: Container;
  private container: Container;
  private layers: { sprite: Sprite; parallaxRate: number }[] = [];

  constructor(parent: Container) {
    this.parent = parent;
    this.container = new Container();
  }

  async load(backgroundId: string, assetsMap?: Record<string, unknown>): Promise<void> {
    // Remove previous background
    this.container.removeChildren();
    this.layers = [];

    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }

    // TODO: Load actual background images from assetsMap
    // For now, create a placeholder gradient background

    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;

    // Scene-specific placeholder colors
    const sceneColors: Record<string, [string, string]> = {
      court_hall: ["#4A2810", "#D4A050"],
      bow_hall_closeup: ["#3A1808", "#C49040"],
      balcony: ["#2A3858", "#B4A070"],
    };

    const [top, bottom] = sceneColors[backgroundId] || ["#2A1808", "#C49040"];

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Placeholder pillars for court
    if (backgroundId.includes("court")) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      for (let i = 0; i < 6; i++) {
        const x = 160 + i * 320;
        ctx.fillRect(x, 100, 40, 800);

        // Arch tops
        ctx.beginPath();
        ctx.arc(x + 20, 100, 160, Math.PI, 0);
        ctx.strokeStyle = "rgba(212, 160, 80, 0.3)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Label
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText(`[ ${backgroundId} ]`, 960, 540);

    const texture = Texture.from(canvas);
    const sprite = new Sprite(texture);
    this.layers.push({ sprite, parallaxRate: 1.0 });
    this.container.addChild(sprite);

    // Add to parent at index 0 (behind everything)
    this.parent.addChildAt(this.container, 0);

    console.log(`[Background] Loaded placeholder: ${backgroundId}`);
  }

  /**
   * Apply parallax offset based on camera movement.
   * Called by Camera when panning.
   */
  applyParallax(cameraX: number, cameraY: number): void {
    for (const layer of this.layers) {
      layer.sprite.position.set(
        -cameraX * layer.parallaxRate,
        -cameraY * layer.parallaxRate
      );
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
