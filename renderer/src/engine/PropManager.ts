import { Container, Sprite, Texture } from "pixi.js";

/**
 * PropManager handles static and animated props placed in a scene.
 * Props are non-character visual elements (Shiva's bow, garland, throne, etc.)
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
    // TODO: Load actual prop texture from assets
    // For now, create a placeholder

    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 60;
    const ctx = canvas.getContext("2d")!;

    // Different shapes for different props
    if (id.includes("bow")) {
      ctx.strokeStyle = "#8B4513";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(60, 80, 50, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
      // String
      ctx.strokeStyle = "#DDD";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, 52);
      ctx.lineTo(102, 52);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#DAA520";
      ctx.fillRect(10, 10, 100, 40);
    }

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(id, 60, 35);

    const texture = Texture.from(canvas);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(position.x, position.y);
    sprite.scale.set(scale);

    this.parent.addChild(sprite);
    this.props.set(id, sprite);

    console.log(`[PropManager] Added placeholder prop: ${id}`);
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
