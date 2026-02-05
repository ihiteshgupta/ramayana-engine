import { Container, Sprite, Texture } from "pixi.js";
import { drawShivaBow, drawGarland } from "./art/props";

/**
 * PropManager handles static props placed in a scene.
 * Props are non-character visual elements (Shiva's bow, garland, etc.)
 */
export class PropManager {
  private parent: Container;
  private props: Map<string, Sprite> = new Map();

  constructor(parent: Container) {
    this.parent = parent;
  }

  async addProp(
    id: string,
    position: { x: number; y: number },
    scale: number = 1.0
  ): Promise<void> {
    const canvas = document.createElement("canvas");
    let w = 120;
    let h = 60;

    if (id.includes("bow")) {
      w = 180; h = 100;
      canvas.width = w; canvas.height = h;
      drawShivaBow(canvas.getContext("2d")!, w, h);
    } else if (id.includes("garland")) {
      w = 120; h = 60;
      canvas.width = w; canvas.height = h;
      drawGarland(canvas.getContext("2d")!, w, h);
    } else {
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#DAA520";
      ctx.fillRect(10, 10, 100, 40);
    }

    const texture = Texture.from(canvas);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(position.x, position.y);
    sprite.scale.set(scale);

    this.parent.addChild(sprite);
    this.props.set(id, sprite);

    console.log(`[PropManager] Added prop: ${id}`);
  }

  removeProp(id: string): void {
    const sprite = this.props.get(id);
    if (sprite) {
      sprite.destroy();
      this.props.delete(id);
    }
  }

  clear(): void {
    for (const sprite of this.props.values()) {
      sprite.destroy();
    }
    this.props.clear();
  }
}
