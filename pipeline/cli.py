"""CLI for ramayana-engine: render, preview, voices."""

import asyncio
import logging
import tempfile
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

console = Console()


def setup_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )


@click.group()
@click.option("--verbose", "-v", is_flag=True, help="Enable debug logging.")
@click.pass_context
def main(ctx: click.Context, verbose: bool) -> None:
    """Ramayana Engine: Create narrated 2D animated episodes from JSON scripts."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose
    setup_logging(verbose)


@main.command()
@click.argument("script_path", type=click.Path(exists=True))
@click.option("--output", "-o", type=click.Path(), default="./output", help="Output directory.")
@click.pass_context
def render(ctx: click.Context, script_path: str, output: str) -> None:
    """Render an episode from a JSON script."""
    from .script_parser import load_episode
    from .narration import generate_all_narrations
    from .recorder import record_episode
    from .audio_mixer import (
        build_narration_track, build_music_track,
        build_sfx_track, mix_all_layers,
    )
    from .assembler import assemble_video

    script = load_episode(script_path)

    console.print(f"[bold]Episode:[/bold] {script.episode.title}")
    console.print(f"  Scenes: {len(script.scenes)}")
    console.print(f"  Beats: {len(script.all_beats())}")
    console.print(f"  Voice: {script.episode.narration.voice}")

    output_dir = Path(output)
    output_dir.mkdir(parents=True, exist_ok=True)

    async def _run() -> None:
        with tempfile.TemporaryDirectory(prefix="ramayana_") as tmp:
            tmp_path = Path(tmp)
            audio_dir = tmp_path / "audio"
            audio_dir.mkdir()
            video_dir = tmp_path / "video"
            video_dir.mkdir()

            # Phase 1: Generate narrations
            console.print("\n[bold cyan]Phase 1:[/bold cyan] Generating narrations...")
            texts = script.all_narration_texts()
            narrations = await generate_all_narrations(
                texts=texts,
                output_dir=audio_dir,
                voice=script.episode.narration.voice,
                rate=script.episode.narration.rate,
            )
            durations = [n.duration_ms for n in narrations]
            total_audio = sum(durations)
            narrated = sum(1 for d in durations if d > 0)
            console.print(f"  {narrated}/{len(durations)} beats narrated, total: {total_audio / 1000:.1f}s")

            # Phase 2: Record browser
            console.print("\n[bold cyan]Phase 2:[/bold cyan] Recording scene playback...")
            recording = await record_episode(
                script_path=Path(script_path),
                beat_durations=durations,
                video_dir=video_dir,
                resolution=script.episode.resolution.model_dump(),
            )

            # Phase 3: Build audio layers
            console.print("\n[bold cyan]Phase 3:[/bold cyan] Mixing audio layers...")
            narration_timestamps = [
                cue["wall_clock_ms"]
                for cue in recording.audio_cue_log
                if cue["type"] == "narration_mark"
            ]
            music_cues = [c for c in recording.audio_cue_log if c["type"] == "music"]
            sfx_cues = [c for c in recording.audio_cue_log if c["type"] == "sfx"]

            last_ts = narration_timestamps[-1] if narration_timestamps else 0
            last_dur = durations[-1] if durations else 0
            total_duration_s = max((last_ts + last_dur) / 1000 + 2, 10)

            narration_track = await build_narration_track(
                narrations, narration_timestamps, tmp_path / "narration.aac"
            )
            project_root = Path(script_path).parent.parent
            music_track = await build_music_track(
                music_cues, project_root, total_duration_s, tmp_path / "music.aac"
            )
            sfx_track = await build_sfx_track(
                sfx_cues, project_root, total_duration_s, tmp_path / "sfx.aac"
            )
            mixed_audio = await mix_all_layers(
                narration_track, music_track, sfx_track, tmp_path / "mixed.aac"
            )

            # Build combined SRT
            srt_output = output_dir / f"{script.episode.id}.srt"
            srt_parts = [n.srt_text for n in narrations if n.srt_text.strip()]
            srt_output.write_text("\n\n".join(srt_parts), encoding="utf-8")

            # Phase 4: Assemble final video
            console.print("\n[bold cyan]Phase 4:[/bold cyan] Assembling final video...")
            mp4_output = output_dir / f"{script.episode.id}.mp4"
            await assemble_video(
                video_path=recording.video_path,
                audio_path=mixed_audio,
                srt_path=srt_output,
                output_path=mp4_output,
            )

            console.print("\n[bold green]Episode rendered![/bold green]")
            console.print(f"  MP4: {mp4_output}")
            console.print(f"  SRT: {srt_output}")

    asyncio.run(_run())


@main.command()
@click.argument("script_path", type=click.Path(exists=True))
def preview(script_path: str) -> None:
    """Open the renderer in a browser for live preview (no recording)."""
    console.print("[bold]Starting preview server...[/bold]")
    console.print(f"Script: {script_path}")
    console.print("[dim]Run 'npm run dev' in the project root to start the Vite dev server.[/dim]")


@main.command()
@click.option("--language", "-l", default="en", help="Language prefix filter.")
def voices(language: str) -> None:
    """List available Edge TTS voices."""
    from .narration import list_voices_sync

    console.print(f"[bold]Voices for '{language}':[/bold]\n")
    voice_list = list_voices_sync(language)

    if not voice_list:
        console.print(f"[yellow]No voices found for '{language}'[/yellow]")
        return

    table = Table()
    table.add_column("Voice", style="cyan")
    table.add_column("Gender", style="magenta")
    table.add_column("Locale", style="green")

    for v in voice_list:
        table.add_row(v["name"], v["gender"], v["locale"])

    console.print(table)
    console.print(f"\n[dim]Total: {len(voice_list)} voices[/dim]")


if __name__ == "__main__":
    main()
