"""Load and validate episode JSON scripts."""

import json
import logging
from pathlib import Path

from .models import EpisodeScript

logger = logging.getLogger("ramayana-engine")


def load_episode(path: str | Path) -> EpisodeScript:
    """Load and validate an episode script from a JSON file."""
    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(f"Episode script not found: {path}")

    if not path.suffix == ".json":
        raise ValueError(f"Expected .json file, got: {path.suffix}")

    raw = json.loads(path.read_text(encoding="utf-8"))
    script = EpisodeScript.model_validate(raw)

    beats = script.all_beats()
    narrated = sum(1 for b in beats if b.narration)

    logger.info(
        f"Loaded episode: {script.episode.title} "
        f"({len(script.scenes)} scenes, {len(beats)} beats, {narrated} narrated)"
    )

    return script
