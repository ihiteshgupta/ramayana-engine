import { Container, Sprite, Texture } from "pixi.js";
import gsap from "gsap";
import { drawCharacter } from "./art/characters";

/** Character sprite size (2x detail for zoom). */
const CHAR_W = 128;
const CHAR_H = 256;

/**
 * CharacterSprite manages a single character's silhouette art,
 * state-based pose changes, and movement.
 */
export class CharacterSprite {
  private id: string;
  private container: Container;
  private sprite: Sprite;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentState: string = "idle";

  constructor(id: string) {
    this.id = id;
    this.container = new Container();
    this.sprite = new Sprite();
    this.container.addChild(this.sprite);

    // Anchor at bottom-center (feet position)
    this.sprite.anchor.set(0.5, 1.0);

    // Persistent canvas for state redraws
    this.canvas = document.createElement("canvas");
    this.canvas.width = CHAR_W;
    this.canvas.height = CHAR_H;
    this.ctx = this.canvas.getContext("2d")!;
  }

  async load(_assetRef: unknown): Promise<void> {
    this.redraw();
    console.log(`[CharacterSprite] Loaded: ${this.id}`);
  }

  private redraw(): void {
    if (!drawCharacter(this.ctx, this.id, this.currentState, CHAR_W, CHAR_H)) {
      // Fallback for unknown characters
      this.ctx.clearRect(0, 0, CHAR_W, CHAR_H);
      this.ctx.fillStyle = "#888";
      this.ctx.fillRect(CHAR_W / 4, CHAR_H / 4, CHAR_W / 2, CHAR_H / 2);
    }
    this.sprite.texture = Texture.from(this.canvas);
    this.sprite.texture.source.update();
  }

  getContainer(): Container {
    return this.container;
  }

  setPosition(x: number, y: number): void {
    this.container.position.set(x, y);
  }

  setState(state: string): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.redraw();
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
    this.container.destroy({ children: true });
  }
}
