/**
 * AudioCueEmitter records timestamps for audio events during playback.
 *
 * The renderer does NOT play audio — it only logs when audio events
 * should occur relative to the video timeline. The Python pipeline
 * uses these timestamps to position audio clips with ffmpeg.
 */

export interface AudioCue {
  beat: number;
  type: "sfx" | "music" | "narration_mark";
  clip: string;
  wall_clock_ms: number;
  volume?: number;
  fade_in?: number;
}

export class AudioCueEmitter {
  private cueLog: AudioCue[] = [];
  private startTime: number = 0;
  private currentBeat: number = 0;

  setStartTime(time: number): void {
    this.startTime = time;
  }

  private now(): number {
    return performance.now() - this.startTime;
  }

  /** Mark the start of a narration beat. */
  emitNarrationMark(beatIndex: number, wallClockMs: number): void {
    this.currentBeat = beatIndex;
    this.cueLog.push({
      beat: beatIndex,
      type: "narration_mark",
      clip: `beat_${beatIndex}`,
      wall_clock_ms: wallClockMs,
    });
  }

  /** Emit a sound effect cue. */
  emitSFX(clip: string, delay: number = 0, volume: number = 1.0): void {
    this.cueLog.push({
      beat: this.currentBeat,
      type: "sfx",
      clip,
      wall_clock_ms: this.now() + delay,
      volume,
    });
    console.log(`[AudioCue] SFX: ${clip} at ${this.now() + delay}ms`);
  }

  /** Emit a music track change cue. */
  emitMusic(track: string, volume: number = 0.5, fadeIn?: number): void {
    this.cueLog.push({
      beat: this.currentBeat,
      type: "music",
      clip: track,
      wall_clock_ms: this.now(),
      volume,
      fade_in: fadeIn,
    });
    console.log(`[AudioCue] Music: ${track} at ${this.now()}ms (vol: ${volume})`);
  }

  /** Get the full cue log for the Python pipeline. */
  getCueLog(): AudioCue[] {
    return [...this.cueLog];
  }

  /** Reset for a new recording. */
  reset(): void {
    this.cueLog = [];
    this.currentBeat = 0;
  }
}
