import { Application, Container } from "pixi.js";
import { Background } from "./Background";
import { CharacterSprite } from "./CharacterSprite";
import { PropManager } from "./PropManager";
import { Camera } from "./Camera";
import { TransitionFX } from "./TransitionFX";
import { AudioCueEmitter } from "./AudioCueEmitter";

export interface SceneData {
  id: string;
  background: string;
  music?: { track: string; volume: number; fade_in?: number };
  camera: { x: number; y: number; zoom: number };
  characters_on_stage: CharacterPlacement[];
  props_on_stage: PropPlacement[];
  beats: BeatData[];
}

export interface CharacterPlacement {
  id: string;
  ref?: string;
  position: { x: number; y: number };
  state: string;
  flip?: boolean;
}

export interface PropPlacement {
  id: string;
  position: { x: number; y: number };
  scale?: number;
}

export interface BeatAction {
  type: string;
  [key: string]: unknown;
}

export interface BeatData {
  narration: string;
  actions: BeatAction[];
}

export class SceneManager {
  private app: Application;
  private episodeData: any;
  private audioCueEmitter: AudioCueEmitter;
  private stageContainer: Container;
  private background: Background;
  private camera: Camera;
  private characters: Map<string, CharacterSprite> = new Map();
  private propManager: PropManager;
  private transitionFX: TransitionFX;
  private currentSceneIndex: number = -1;

  constructor(
    app: Application,
    episodeData: unknown,
    audioCueEmitter: AudioCueEmitter
  ) {
    this.app = app;
    this.episodeData = episodeData;
    this.audioCueEmitter = audioCueEmitter;

    // Main stage container — camera manipulates this
    this.stageContainer = new Container();
    this.app.stage.addChild(this.stageContainer);

    this.background = new Background(this.stageContainer);
    this.camera = new Camera(this.stageContainer);
    this.propManager = new PropManager(this.stageContainer);
    this.transitionFX = new TransitionFX(this.app.stage, 1920, 1080);
  }

  async preloadAssets(): Promise<void> {
    // TODO: Preload all backgrounds, sprite sheets, and props
    // referenced in episodeData.assets
    console.log("[SceneManager] Preloading assets...");
  }

  getScenes(): SceneData[] {
    return this.episodeData.scenes || [];
  }

  async loadScene(index: number): Promise<void> {
    const scenes = this.getScenes();
    if (index < 0 || index >= scenes.length) return;

    const isFirst = this.currentSceneIndex === -1;

    // Transition out of current scene
    if (!isFirst) {
      await this.transitionFX.fadeOut(500);
    }

    // Clear current scene
    this.characters.clear();
    this.stageContainer.removeChildren();

    const scene = scenes[index];
    this.currentSceneIndex = index;

    // Set up background
    await this.background.load(scene.background, this.episodeData.assets?.backgrounds);

    // Place characters
    for (const placement of scene.characters_on_stage) {
      const charId = placement.ref || placement.id;
      const sprite = new CharacterSprite(charId);
      await sprite.load(this.episodeData.assets?.characters?.[charId]);
      sprite.setPosition(placement.position.x, placement.position.y);
      sprite.setState(placement.state);
      if (placement.flip) sprite.setFlip(true);
      this.stageContainer.addChild(sprite.getContainer());
      this.characters.set(placement.id, sprite);
    }

    // Place props
    for (const prop of scene.props_on_stage) {
      await this.propManager.addProp(prop.id, prop.position, prop.scale);
    }

    // Set initial camera
    this.camera.setImmediate(scene.camera.x, scene.camera.y, scene.camera.zoom);

    // Emit music cue if scene has music
    if (scene.music) {
      this.audioCueEmitter.emitMusic(scene.music.track, scene.music.volume, scene.music.fade_in);
    }

    // Transition in
    if (!isFirst) {
      await this.transitionFX.fadeIn(500);
    } else {
      await this.transitionFX.fadeIn(1000);
    }

    console.log(`[SceneManager] Loaded scene: ${scene.id}`);
  }

  getCamera(): Camera {
    return this.camera;
  }

  getCharacter(id: string): CharacterSprite | undefined {
    return this.characters.get(id);
  }

  getTransitionFX(): TransitionFX {
    return this.transitionFX;
  }

  async executeAction(action: BeatAction): Promise<void> {
    switch (action.type) {
      case "camera_pan":
        await this.camera.panTo(
          action.to as { x: number; y: number },
          action.duration as number
        );
        break;

      case "camera_zoom":
        await this.camera.zoomTo(
          action.to as number,
          action.duration as number
        );
        break;

      case "camera_shake":
        await this.camera.shake(
          (action.intensity as number) || 5,
          (action.duration as number) || 300
        );
        break;

      case "character_state": {
        const char = this.characters.get(action.character as string);
        if (char) char.setState(action.state as string);
        break;
      }

      case "character_move": {
        const char = this.characters.get(action.character as string);
        if (char) {
          await char.moveTo(
            action.to as { x: number; y: number },
            action.duration as number
          );
        }
        break;
      }

      case "sfx":
        this.audioCueEmitter.emitSFX(
          action.clip as string,
          (action.delay as number) || 0,
          (action.volume as number) || 1.0
        );
        break;

      case "music_change":
        this.audioCueEmitter.emitMusic(
          action.track as string,
          (action.volume as number) || 0.5,
          (action.fade_in as number) || 1000
        );
        break;

      default:
        console.warn(`[SceneManager] Unknown action type: ${action.type}`);
    }
  }
}
