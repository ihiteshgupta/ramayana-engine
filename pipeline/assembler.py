"""Final video assembly — merge video + audio + subtitles.

Uses asyncio.create_subprocess_exec for all ffmpeg calls.
Arguments passed as list (no shell), safe from injection.
"""

import asyncio
import logging
from pathlib import Path

logger = logging.getLogger("ramayana-engine")


async def _run_ffmpeg_safe(args: list[str]) -> tuple[int, bytes]:
    """Run ffmpeg with argument list. Returns (returncode, stderr)."""
    proc = await asyncio.create_subprocess_exec(
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    return proc.returncode, stderr


async def assemble_video(
    video_path: Path,
    audio_path: Path,
    srt_path: Path,
    output_path: Path,
) -> Path:
    """Merge recorded video with mixed audio and burned subtitles.

    Uses H.264 + AAC encoding. Subtitles burned with libass
    using a serif font for classical storytelling aesthetic.
    """
    subtitle_style = (
        "FontName=Noto Serif,"
        "FontSize=22,"
        "PrimaryColour=&H00F0E0D0,"
        "OutlineColour=&H00000000,"
        "BorderStyle=3,"
        "Outline=2,"
        "Shadow=1,"
        "MarginV=40"
    )

    primary_args = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(audio_path),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-vf", f"subtitles={srt_path}:force_style='{subtitle_style}'",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        str(output_path),
    ]

    logger.info(f"Assembling final video: {output_path}")
    rc, stderr = await _run_ffmpeg_safe(primary_args)

    if rc != 0:
        logger.warning("Subtitle burn-in failed, retrying without subtitles...")
        fallback_args = [
            "ffmpeg", "-y",
            "-i", str(video_path),
            "-i", str(audio_path),
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-c:a", "aac", "-b:a", "192k",
            "-map", "0:v:0", "-map", "1:a:0",
            "-shortest",
            str(output_path),
        ]
        rc2, stderr2 = await _run_ffmpeg_safe(fallback_args)
        if rc2 != 0:
            raise RuntimeError(f"Video assembly failed: {stderr2.decode()[-500:]}")

    size_mb = output_path.stat().st_size / 1024 / 1024
    logger.info(f"Final video: {output_path} ({size_mb:.1f} MB)")
    return output_path
