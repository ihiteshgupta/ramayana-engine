"""Playwright-based scene recording — captures the PixiJS renderer."""

import json
import logging
from dataclasses import dataclass
from pathlib import Path

from playwright.async_api import async_playwright

logger = logging.getLogger("ramayana-engine")

RENDERER_URL = "http://localhost:3000"


@dataclass
class RecordingResult:
    video_path: Path
    audio_cue_log: list[dict]


async def record_episode(
    script_path: Path,
    beat_durations: list[int],
    video_dir: Path,
    resolution: dict | None = None,
) -> RecordingResult:
    """Record the PixiJS renderer playing an episode.

    1. Launch headless Chromium with video recording
    2. Navigate to the renderer with the script URL
    3. Send beat durations
    4. Start playback and wait for completion
    5. Collect audio cue log
    """
    width = resolution.get("width", 1920) if resolution else 1920
    height = resolution.get("height", 1080) if resolution else 1080

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": width, "height": height},
            record_video_dir=str(video_dir),
            record_video_size={"width": width, "height": height},
        )
        page = await context.new_page()

        # Navigate to renderer with script path
        url = f"{RENDERER_URL}?script={script_path}"
        logger.info(f"Navigating to renderer: {url}")
        await page.goto(url, wait_until="load")

        # Wait for engine to initialize
        await page.wait_for_function(
            "typeof window.setBeatDurations === 'function'",
            timeout=30000,
        )

        # Send beat durations
        durations_json = json.dumps(beat_durations)
        await page.evaluate(f"window.setBeatDurations({durations_json})")

        # Start playback
        logger.info(f"Starting playback with {len(beat_durations)} beats...")
        await page.evaluate("window.startPlayback()")

        # Wait for completion (up to 10 minutes)
        await page.wait_for_function(
            "window.playbackComplete === true",
            timeout=600000,
        )

        # Collect audio cue log
        cue_log = await page.evaluate("window.getAudioCueLog()")

        await page.close()
        await context.close()
        await browser.close()

    # Find the recorded video file
    video_files = list(video_dir.glob("*.webm"))
    if not video_files:
        raise RuntimeError("No video file found after recording")

    video_path = video_files[0]
    file_size_mb = video_path.stat().st_size / 1024 / 1024
    logger.info(f"Recorded video: {video_path} ({file_size_mb:.1f} MB)")

    return RecordingResult(video_path=video_path, audio_cue_log=cue_log)
