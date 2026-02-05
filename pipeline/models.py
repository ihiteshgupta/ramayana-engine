"""Pydantic v2 models for episode script schema."""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Resolution(BaseModel):
    width: int = 1920
    height: int = 1080


class NarrationConfig(BaseModel):
    voice: str = "en-US-GuyNeural"
    rate: str = "+0%"


class EpisodeMeta(BaseModel):
    id: str
    title: str
    duration_target: str = "5-7 min"
    resolution: Resolution = Field(default_factory=Resolution)
    narration: NarrationConfig = Field(default_factory=NarrationConfig)


class MusicCue(BaseModel):
    track: str
    volume: float = 0.5
    fade_in: Optional[int] = None  # ms


class CameraState(BaseModel):
    x: float = 0
    y: float = 0
    zoom: float = 1.0


class CharacterPlacement(BaseModel):
    id: str
    ref: Optional[str] = None
    position: dict  # {x, y}
    state: str = "idle"
    flip: bool = False


class PropPlacement(BaseModel):
    id: str
    position: dict  # {x, y}
    scale: float = 1.0


class BeatAction(BaseModel):
    type: str
    # Remaining fields vary by action type
    model_config = {"extra": "allow"}


class Beat(BaseModel):
    narration: str = ""
    actions: list[BeatAction] = Field(default_factory=list)


class Scene(BaseModel):
    id: str
    background: str
    music: Optional[MusicCue] = None
    camera: CameraState = Field(default_factory=CameraState)
    characters_on_stage: list[CharacterPlacement] = Field(default_factory=list)
    props_on_stage: list[PropPlacement] = Field(default_factory=list)
    beats: list[Beat] = Field(default_factory=list)


class EpisodeScript(BaseModel):
    episode: EpisodeMeta
    assets: dict = Field(default_factory=dict)
    scenes: list[Scene] = Field(..., min_length=1)

    def all_beats(self) -> list[Beat]:
        """Flatten all beats across all scenes in order."""
        return [beat for scene in self.scenes for beat in scene.beats]

    def all_narration_texts(self) -> list[str]:
        """Extract narration text from every beat."""
        return [beat.narration for beat in self.all_beats()]
