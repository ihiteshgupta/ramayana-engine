import { Container, Graphics } from "pixi.js";
import gsap from "gsap";

/**
 * TransitionFX handles visual transitions between scenes.
 * Renders a full-screen overlay and animates its opacity.
 */
export class TransitionFX {
  private overlay: Graphics;

  constructor(stage: Container, width: number, height: number) {
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, width, height);
    this.overlay.fill(0x000000);
    this.overlay.alpha = 0;
    this.overlay.zIndex = 9999;
    stage.addChild(this.overlay);
  }

  /** Fade to black. */
  async fadeOut(duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this.overlay, {
        alpha: 1,
        duration: duration / 1000,
        ease: "power2.in",
        onComplete: resolve,
      });
    });
  }

  /** Fade from black. */
  async fadeIn(duration: number = 500): Promise<void> {
    this.overlay.alpha = 1;
    return new Promise((resolve) => {
      gsap.to(this.overlay, {
        alpha: 0,
        duration: duration / 1000,
        ease: "power2.out",
        onComplete: resolve,
      });
    });
  }

  /** Quick flash (white) for dramatic moments. */
  async flash(duration: number = 200): Promise<void> {
    this.overlay.clear();
    this.overlay.rect(0, 0, 1920, 1080);
    this.overlay.fill(0xffffff);
    this.overlay.alpha = 1;

    return new Promise((resolve) => {
      gsap.to(this.overlay, {
        alpha: 0,
        duration: duration / 1000,
        ease: "power2.out",
        onComplete: () => {
          // Restore to black overlay
          this.overlay.clear();
          this.overlay.rect(0, 0, 1920, 1080);
          this.overlay.fill(0x000000);
          this.overlay.alpha = 0;
          resolve();
        },
      });
    });
  }
}
