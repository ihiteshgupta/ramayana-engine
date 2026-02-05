import { Container, Sprite, Texture } from "pixi.js";
import { drawCourtHall } from "./art/background";

/**
 * Background handles scene backgrounds.
 * Draws scene-specific art using Canvas 2D, then converts to a PixiJS texture.
 */
export class Background {
  private parent: Container;
  private container: Container;
  private layers: { sprite: Sprite; parallaxRate: number }[] = [];

  constructor(parent: Container) {
    this.parent = parent;
    this.container = new Container();
  }

  async load(backgroundId: string, _assetsMap?: Record<string, unknown>): Promise<void> {
    this.container.removeChildren();
    this.layers = [];

    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;

    // Dispatch to art drawing functions by background id
    switch (backgroundId) {
      case "court_hall":
      default:
        drawCourtHall(ctx, 1920, 1080);
        break;
    }

    const texture = Texture.from(canvas);
    const sprite = new Sprite(texture);
    this.layers.push({ sprite, parallaxRate: 1.0 });
    this.container.addChild(sprite);

    this.parent.addChildAt(this.container, 0);
    console.log(`[Background] Loaded: ${backgroundId}`);
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
