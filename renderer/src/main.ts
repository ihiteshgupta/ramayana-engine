import { Application } from "pixi.js";
import { SceneManager } from "@engine/SceneManager";
import { Timeline } from "@engine/Timeline";
import { AudioCueEmitter } from "@engine/AudioCueEmitter";

/**
 * Ramayana Engine — main entry point.
 *
 * Boots PixiJS, loads the episode script, and exposes
 * the Playwright control API on the window object.
 */

interface WindowAPI {
  setBeatDurations: (durations: number[]) => void;
  startPlayback: () => Promise<void>;
  playbackComplete: boolean;
  getAudioCueLog: () => AudioCue[];
}

interface AudioCue {
  beat: number;
  type: "sfx" | "music" | "narration_mark";
  clip: string;
  wall_clock_ms: number;
}

// Extend window for Playwright communication
declare global {
  interface Window extends WindowAPI {}
}

let beatDurations: number[] = [];
let sceneManager: SceneManager | null = null;
let timeline: Timeline | null = null;
const audioCueEmitter = new AudioCueEmitter();

async function init() {
  // Create PixiJS application
  const app = new Application();
  await app.init({
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    antialias: true,
  });
  document.body.appendChild(app.canvas);

  // Load episode script from URL params or default
  const params = new URLSearchParams(window.location.search);
  const scriptUrl = params.get("script") || "/episodes/ep01_sita_swayamvar.json";

  let episodeData: unknown;
  try {
    const resp = await fetch(scriptUrl);
    episodeData = await resp.json();
  } catch (err) {
    console.error("Failed to load episode script:", err);
    return;
  }

  // Initialize scene manager
  sceneManager = new SceneManager(app, episodeData, audioCueEmitter);
  await sceneManager.preloadAssets();

  // Initialize timeline
  timeline = new Timeline(sceneManager, audioCueEmitter);

  console.log("[ramayana-engine] Initialized. Waiting for beat durations.");
}

// --- Playwright Control API ---

window.setBeatDurations = (durations: number[]) => {
  beatDurations = durations;
  console.log(`[ramayana-engine] Received ${durations.length} beat durations.`);
};

window.startPlayback = async () => {
  if (!timeline || !sceneManager) {
    throw new Error("Engine not initialized");
  }
  console.log("[ramayana-engine] Starting playback...");
  window.playbackComplete = false;
  await timeline.play(beatDurations);
  window.playbackComplete = true;
  console.log("[ramayana-engine] Playback complete.");
};

window.playbackComplete = false;

window.getAudioCueLog = () => {
  return audioCueEmitter.getCueLog();
};

// Boot
init();
