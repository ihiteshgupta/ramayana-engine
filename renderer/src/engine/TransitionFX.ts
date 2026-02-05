import { Container, Graphics, Sprite, Texture } from "pixi.js";
import gsap from "gsap";
import { drawVignette } from "./art/vignette";

/**
 * TransitionFX handles visual transitions and cinematic vignette.
 */
export class TransitionFX {
  private overlay: Graphics;

  constructor(stage: Container, width: number, height: number) {
    // Vignette layer (always visible, behind the transition overlay)
    const vignetteCanvas = document.createElement("canvas");
    vignetteCanvas.width = width;
    vignetteCanvas.height = height;
    drawVignette(vignetteCanvas.getContext("2d")!, width, height);
    const vignetteSprite = new Sprite(Texture.from(vignetteCanvas));
    vignetteSprite.zIndex = 9998;
    stage.addChild(vignetteSprite);

    // Transition overlay (fade in/out)
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
