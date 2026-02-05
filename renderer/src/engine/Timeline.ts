import { SceneManager } from "./SceneManager";
import { AudioCueEmitter } from "./AudioCueEmitter";

/**
 * Timeline drives the playback of an episode.
 *
 * Iterates through scenes and their beats sequentially.
 * For each beat:
 *   1. Execute all actions concurrently
 *   2. Wait for the narration duration (provided by the Python pipeline)
 *   3. Advance to next beat
 */
export class Timeline {
  private sceneManager: SceneManager;
  private audioCueEmitter: AudioCueEmitter;
  private startTime: number = 0;

  constructor(sceneManager: SceneManager, audioCueEmitter: AudioCueEmitter) {
    this.sceneManager = sceneManager;
    this.audioCueEmitter = audioCueEmitter;
  }

  /**
   * Play the full episode timeline.
   * @param beatDurations - Array of narration durations in ms, one per beat across all scenes.
   */
  async play(beatDurations: number[]): Promise<void> {
    this.startTime = performance.now();
    this.audioCueEmitter.setStartTime(this.startTime);

    const scenes = this.sceneManager.getScenes();
    let beatIndex = 0;

    for (let sceneIdx = 0; sceneIdx < scenes.length; sceneIdx++) {
      const scene = scenes[sceneIdx];

      // Load and transition into the scene
      await this.sceneManager.loadScene(sceneIdx);

      // Play each beat in the scene
      for (const beat of scene.beats) {
        const duration = beatDurations[beatIndex] || 2000;

        console.log(
          `[Timeline] Scene ${sceneIdx}, Beat ${beatIndex} ` +
          `(${duration}ms): "${beat.narration.substring(0, 50)}..."`
        );

        // Record the wall-clock time when narration should start
        const beatStartMs = performance.now() - this.startTime;
        this.audioCueEmitter.emitNarrationMark(beatIndex, beatStartMs);

        // Execute all actions concurrently
        const actionPromises = beat.actions.map((action) =>
          this.sceneManager.executeAction(action)
        );

        // Wait for the longer of: actions completing OR narration duration
        await Promise.all([
          Promise.all(actionPromises),
          this.wait(duration),
        ]);

        beatIndex++;
      }
    }

    console.log(`[Timeline] Episode complete. ${beatIndex} beats played.`);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
