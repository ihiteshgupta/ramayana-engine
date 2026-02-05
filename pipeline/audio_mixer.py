"""Three-layer audio mixing: narration + music + SFX.

All ffmpeg invocations use asyncio.create_subprocess_exec which passes
arguments as a list (equivalent to Node's execFile). No shell is spawned,
so there is no command injection risk.
"""

import asyncio
import logging
from pathlib import Path

logger = logging.getLogger("ramayana-engine")


async def build_narration_track(
    narration_results: list,
    narration_timestamps: list[float],
    output_path: Path,
) -> Path:
    """Position narration clips at their beat timestamps using ffmpeg adelay."""
    inputs = []
    filters = []
    valid_count = 0

    for i, (result, timestamp_ms) in enumerate(zip(narration_results, narration_timestamps)):
        if result.duration_ms == 0:
            continue

        delay = int(timestamp_ms)
        inputs.extend(["-i", str(result.audio_path)])
        filters.append(f"[{valid_count}]adelay={delay}|{delay}[a{valid_count}]")
        valid_count += 1

    if valid_count == 0:
        await _create_silence(output_path, 1.0)
        return output_path

    mix_inputs = "".join(f"[a{i}]" for i in range(valid_count))
    filters.append(f"{mix_inputs}amix=inputs={valid_count}:normalize=0[narration]")

    cmd = [
        *inputs,
        "-filter_complex", ";".join(filters),
        "-map", "[narration]",
        "-c:a", "aac",
        str(output_path),
    ]
    await _run_ffmpeg(cmd)
    return output_path


async def build_music_track(
    music_cues: list[dict],
    assets_dir: Path,
    total_duration_s: float,
    output_path: Path,
) -> Path:
    """Build the background music track from music cues with fading."""
    if not music_cues:
        await _create_silence(output_path, total_duration_s)
        return output_path

    first_cue = music_cues[0]
    music_file = assets_dir / "audio" / "music" / f"{first_cue['clip']}.mp3"

    if not music_file.exists():
        logger.warning(f"Music file not found: {music_file}, creating silence")
        await _create_silence(output_path, total_duration_s)
        return output_path

    volume = first_cue.get("volume", 0.3)
    fade_in = first_cue.get("fade_in", 2000) / 1000
    fade_out_start = max(total_duration_s - 2, 0)

    await _run_ffmpeg([
        "-stream_loop", "-1",
        "-i", str(music_file),
        "-t", str(total_duration_s),
        "-af", f"afade=t=in:d={fade_in},afade=t=out:st={fade_out_start}:d=2,volume={volume}",
        "-c:a", "aac",
        str(output_path),
    ])
    return output_path


async def build_sfx_track(
    sfx_cues: list[dict],
    assets_dir: Path,
    total_duration_s: float,
    output_path: Path,
) -> Path:
    """Position SFX clips at their wall-clock timestamps."""
    if not sfx_cues:
        await _create_silence(output_path, total_duration_s)
        return output_path

    inputs = []
    filters = []
    valid_count = 0

    for cue in sfx_cues:
        sfx_file = assets_dir / "audio" / "sfx" / f"{cue['clip']}.wav"
        if not sfx_file.exists():
            logger.warning(f"SFX not found: {sfx_file}")
            continue

        delay = int(cue["wall_clock_ms"])
        volume = cue.get("volume", 1.0)
        inputs.extend(["-i", str(sfx_file)])
        filters.append(f"[{valid_count}]adelay={delay}|{delay},volume={volume}[s{valid_count}]")
        valid_count += 1

    if valid_count == 0:
        await _create_silence(output_path, total_duration_s)
        return output_path

    mix_inputs = "".join(f"[s{i}]" for i in range(valid_count))
    filters.append(f"{mix_inputs}amix=inputs={valid_count}:normalize=0[sfx]")

    cmd = [
        *inputs,
        "-filter_complex", ";".join(filters),
        "-map", "[sfx]",
        "-c:a", "aac",
        str(output_path),
    ]
    await _run_ffmpeg(cmd)
    return output_path


async def mix_all_layers(
    narration_path: Path,
    music_path: Path,
    sfx_path: Path,
    output_path: Path,
) -> Path:
    """Mix the three audio layers into a single track."""
    await _run_ffmpeg([
        "-i", str(narration_path),
        "-i", str(music_path),
        "-i", str(sfx_path),
        "-filter_complex",
        "[0][1][2]amix=inputs=3:duration=longest:normalize=0",
        "-c:a", "aac",
        str(output_path),
    ])
    return output_path


async def _create_silence(output_path: Path, duration_s: float) -> None:
    """Generate a silent audio track of the specified duration."""
    await _run_ffmpeg([
        "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo",
        "-t", str(duration_s),
        "-c:a", "aac",
        str(output_path),
    ])


async def _run_ffmpeg(args: list[str]) -> None:
    """Run ffmpeg safely using argument list (no shell invocation)."""
    full_args = ["ffmpeg", "-y", *args]
    logger.debug(f"Running ffmpeg with {len(args)} args")
    proc = await asyncio.create_subprocess_exec(
        *full_args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {stderr.decode()[-500:]}")
