"""Edge TTS narration generation — adapted from demo-recorder."""

import asyncio
import logging
from dataclasses import dataclass
from pathlib import Path

import edge_tts

logger = logging.getLogger("ramayana-engine")


@dataclass
class NarrationResult:
    audio_path: Path
    duration_ms: int
    srt_text: str


async def generate_narration(
    text: str,
    output_path: Path,
    voice: str = "en-US-GuyNeural",
    rate: str = "+0%",
) -> NarrationResult:
    """Generate TTS audio and SRT for a single narration text."""
    if not text.strip():
        return NarrationResult(audio_path=output_path, duration_ms=0, srt_text="")

    communicate = edge_tts.Communicate(text, voice, rate=rate)
    submaker = edge_tts.SubMaker()

    with open(output_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.feed(chunk)

    # Measure audio duration using ffprobe
    duration_ms = await _measure_duration(output_path)
    srt_text = submaker.generate_srt()

    logger.debug(f"Narration: {len(text)} chars → {duration_ms}ms")
    return NarrationResult(
        audio_path=output_path,
        duration_ms=duration_ms,
        srt_text=srt_text,
    )


async def generate_all_narrations(
    texts: list[str],
    output_dir: Path,
    voice: str = "en-US-GuyNeural",
    rate: str = "+0%",
) -> list[NarrationResult]:
    """Generate TTS for all beat narrations."""
    results = []
    for i, text in enumerate(texts):
        audio_path = output_dir / f"beat_{i:03d}.mp3"
        result = await generate_narration(text, audio_path, voice, rate)
        results.append(result)
    return results


async def _measure_duration(audio_path: Path) -> int:
    """Get audio duration in ms using ffprobe.

    Uses create_subprocess_exec (not shell) for safety — arguments
    are passed as a list, preventing any injection.
    """
    proc = await asyncio.create_subprocess_exec(
        "ffprobe",
        "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        str(audio_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    try:
        return int(float(stdout.decode().strip()) * 1000)
    except (ValueError, IndexError):
        return 0


def list_voices_sync(language_prefix: str = "en") -> list[dict]:
    """List available Edge TTS voices filtered by language."""
    voices = asyncio.run(edge_tts.list_voices())
    filtered = [
        {"name": v["ShortName"], "gender": v["Gender"], "locale": v["Locale"]}
        for v in voices
        if v["Locale"].startswith(language_prefix)
    ]
    return sorted(filtered, key=lambda v: v["name"])
