import { Container } from "pixi.js";
import gsap from "gsap";

/**
 * Camera controls the viewport by manipulating the stage container's
 * position and scale. All camera movements use GSAP for smooth easing.
 */
export class Camera {
  private stage: Container;
  private x: number = 0;
  private y: number = 0;
  private zoom: number = 1.0;

  constructor(stage: Container) {
    this.stage = stage;
  }

  /** Set camera position immediately (no animation). */
  setImmediate(x: number, y: number, zoom: number): void {
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.applyTransform();
  }

  /** Smoothly pan to a target position. */
  async panTo(target: { x: number; y: number }, duration: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        x: target.x,
        y: target.y,
        duration: duration / 1000,
        ease: "power2.inOut",
        onUpdate: () => this.applyTransform(),
        onComplete: resolve,
      });
    });
  }

  /** Smoothly zoom to a target level. */
  async zoomTo(targetZoom: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        zoom: targetZoom,
        duration: duration / 1000,
        ease: "power2.inOut",
        onUpdate: () => this.applyTransform(),
        onComplete: resolve,
      });
    });
  }

  /** Camera shake effect for dramatic moments. */
  async shake(intensity: number = 5, duration: number = 300): Promise<void> {
    const originalX = this.x;
    const originalY = this.y;
    const steps = Math.floor(duration / 50);

    for (let i = 0; i < steps; i++) {
      const offsetX = (Math.random() - 0.5) * 2 * intensity;
      const offsetY = (Math.random() - 0.5) * 2 * intensity;
      this.stage.position.set(
        -(originalX + offsetX) * this.zoom + 960 * (1 - this.zoom),
        -(originalY + offsetY) * this.zoom + 540 * (1 - this.zoom)
      );
      await new Promise((r) => setTimeout(r, 50));
    }

    // Reset to original
    this.x = originalX;
    this.y = originalY;
    this.applyTransform();
  }

  private applyTransform(): void {
    // Camera (0,0) shows world (0,0) at screen top-left.
    // Zoom centers on viewport midpoint (960, 540).
    this.stage.scale.set(this.zoom);
    this.stage.position.set(
      -this.x * this.zoom + 960 * (1 - this.zoom),
      -this.y * this.zoom + 540 * (1 - this.zoom)
    );
  }
}
