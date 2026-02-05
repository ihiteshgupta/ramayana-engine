import { Container, Sprite, Texture, Assets } from "pixi.js";
import gsap from "gsap";

interface SpriteSheetMeta {
  path?: string;
  states?: Record<string, { frames: number[]; fps: number }>;
}

/**
 * CharacterSprite manages a single character's sprite sheet,
 * animation states, and movement.
 *
 * Each character has named states (idle, walking, lifting, etc.)
 * with frame indices into the sprite sheet texture atlas.
 */
export class CharacterSprite {
  private id: string;
  private container: Container;
  private sprite: Sprite;
  private textures: Map<string, Texture[]> = new Map();
  private currentState: string = "idle";
  private animationTimer: ReturnType<typeof setInterval> | null = null;
  private currentFrame: number = 0;
  private fps: number = 10;

  constructor(id: string) {
    this.id = id;
    this.container = new Container();
    this.sprite = new Sprite();
    this.container.addChild(this.sprite);

    // Anchor at bottom-center (feet position)
    this.sprite.anchor.set(0.5, 1.0);
  }

  async load(assetRef: unknown): Promise<void> {
    // TODO: Load actual texture atlas from spritesheet.json
    // For now, create a colored placeholder rectangle
    const meta = assetRef as SpriteSheetMeta | undefined;

    if (meta?.path) {
      // Load real sprite sheet
      // const atlas = await Assets.load(meta.path);
      // Parse states from meta.states
    }

    // Placeholder: create a 64x128 colored sprite
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    // Color based on character id
    const colors: Record<string, string> = {
      rama: "#2E5090",
      sita: "#C04040",
      janaka: "#D4A017",
      vishwamitra: "#8B4513",
      king_generic: "#606060",
    };
    ctx.fillStyle = colors[this.id] || "#888888";
    ctx.fillRect(0, 0, 64, 128);

    // Head circle
    ctx.fillStyle = "#DEB887";
    ctx.beginPath();
    ctx.arc(32, 20, 16, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.id, 32, 75);

    const texture = Texture.from(canvas);
    this.sprite.texture = texture;

    console.log(`[CharacterSprite] Loaded placeholder for: ${this.id}`);
  }

  getContainer(): Container {
    return this.container;
  }

  setPosition(x: number, y: number): void {
    this.container.position.set(x, y);
  }

  setState(state: string): void {
    this.currentState = state;
    this.currentFrame = 0;

    // TODO: Switch to actual animation frames for this state
    // For now, just log the state change
    console.log(`[CharacterSprite:${this.id}] State → ${state}`);
  }

  setFlip(flipped: boolean): void {
    this.container.scale.x = flipped ? -1 : 1;
  }

  async moveTo(target: { x: number; y: number }, duration: number): Promise<void> {
    // Set walking state during movement
    const prevState = this.currentState;
    this.setState("walking");

    await new Promise<void>((resolve) => {
      gsap.to(this.container.position, {
        x: target.x,
        y: target.y,
        duration: duration / 1000,
        ease: "power2.inOut",
        onComplete: () => {
          this.setState(prevState);
          resolve();
        },
      });
    });
  }

  destroy(): void {
    if (this.animationTimer) clearInterval(this.animationTimer);
    this.container.destroy({ children: true });
  }
}
