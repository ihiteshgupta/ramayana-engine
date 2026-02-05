# Ramayana Studio — Design Document

**Date**: 2026-02-05
**Status**: Approved
**Project**: ramayana-studio — Electron desktop app for AI-assisted creation of narrated Ramayana episodes

---

## Summary

An Electron desktop application that combines AI script generation with a visual episode editor. Users paste a chapter from Valmiki Ramayana, Claude API generates a complete episode script (scenes, beats, characters, camera, narration), and a visual editor lets them refine the result with a live PixiJS preview. One-click render produces the final MP4 via the existing Python pipeline.

**Core loop:** Paste text → AI generates → Review in visual editor → Render to MP4.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Use case | AI-first generation + visual editor | AI handles heavy lifting, human refines. Best of both. |
| Frontend | Electron desktop app | Local ffmpeg, file system access, no server needed for video production. |
| UI framework | React 19 + Vite | Fast HMR, familiar stack. |
| State management | Zustand | Lightweight, no boilerplate, fits editor state well. |
| Styling | Tailwind CSS | Rapid UI development. |
| AI provider | Claude API | Best structured output, long context for chapters, creative writing strength. |
| Preview engine | PixiJS 8 (shared with renderer) | Same codebase for preview and final capture — WYSIWYG. |
| Editor style | Storyboard + Timeline + Live Preview | Storyboard for navigation, timeline for beat editing, preview for visual feedback. |
| Project format | Folder-based (JSON + assets) | Simple, versionable, no database. |

---

## Architecture

### Process Model

```
┌─────────────────────────────────────────────┐
│ Electron Main Process                        │
│  ├── File I/O (project save/load)           │
│  ├── Claude API calls (API key in keychain) │
│  ├── Python pipeline spawn (render)          │
│  └── ffmpeg/TTS subprocess management        │
├─────────────────────────────────────────────┤
│ Electron Renderer Process (React)            │
│  ├── Editor UI (storyboard, timeline)        │
│  ├── Property panels (context-sensitive)     │
│  ├── PixiJS preview (embedded canvas)        │
│  └── Zustand store (episode state)           │
└─────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Shell | Electron 33+ | Desktop runtime, IPC, subprocess management |
| Renderer UI | React 19 + Vite | Editor components, panels, modals |
| State | Zustand | Episode state, UI state, undo/redo history |
| Styling | Tailwind CSS | Utility-first CSS |
| Preview | PixiJS 8 | Embedded live scene preview (shared with renderer) |
| AI | Claude API (Anthropic SDK) | Episode script generation from source text |
| TTS | Edge TTS (Python, local) | Narration audio generation |
| Capture | Playwright (local) | Browser recording for final render |
| Assembly | ffmpeg (bundled) | Audio mixing, video assembly, GIF generation |

### Relationship to ramayana-engine

The studio app is a **superset** that imports the existing ramayana-engine as a dependency:

```
ramayana-studio/
├── electron/              # Main process (file I/O, API, subprocess)
├── src/                   # React renderer (editor UI)
├── packages/
│   └── engine/            # Symlink or package ref to ramayana-engine/renderer
└── python/                # Symlink or ref to ramayana-engine/pipeline
```

The PixiJS renderer code (`SceneManager`, `Timeline`, `CharacterSprite`, etc.) is shared directly. The studio embeds it in an `<canvas>` element within the React UI for live preview. The same code is used by Playwright during final render. This guarantees the preview matches the output.

---

## AI Script Generation Pipeline

### Input

A chapter or passage from Valmiki Ramayana (English translation). Can be:
- Pasted text in a modal
- Selected from a built-in chapter library (stretch goal, Phase 3)

### Multi-Step Claude Pipeline

```
Raw Text ──> Step 1: Story Analysis ──> Step 2: Scene Breakdown ──> Step 3: Full Script
```

**Step 1 — Story Analysis** (Claude call #1):

System prompt includes storytelling guidelines. Output is structured JSON:

```json
{
  "title": "The Breaking of Shiva's Bow",
  "characters": ["rama", "sita", "janaka", "vishwamitra"],
  "narrative_arc": {
    "setup": "King Janaka's challenge in the court",
    "conflict": "Kings fail to lift the bow",
    "climax": "Rama breaks the bow",
    "resolution": "Sita garlands Rama"
  },
  "key_events": [
    "Janaka announces the challenge",
    "Kings attempt and fail",
    "Vishwamitra asks Rama to try",
    "Rama lifts and breaks the bow",
    "Sita garlands Rama"
  ]
}
```

**Step 2 — Scene Breakdown** (Claude call #2):

System prompt includes available backgrounds, characters, and their states from the asset registry. Output:

```json
{
  "scenes": [
    {
      "id": "scene_01",
      "background": "court_hall",
      "music": "court_ambient",
      "characters": ["janaka", "king1", "king2"],
      "mood": "regal, anticipation",
      "events": ["Janaka announces challenge", "Shows the bow"]
    }
  ]
}
```

**Step 3 — Full Script Generation** (Claude call #3):

System prompt includes the complete episode JSON schema, all available character states, SFX/music options, and camera movement vocabulary. Output is a valid `episode.json` matching the existing schema — ready to load in the renderer.

### System Prompt Strategy

Each Claude call receives:
- The episode JSON schema (for valid output)
- Character registry with available states
- Asset registry (backgrounds, music, SFX)
- Storytelling style guide (narration tone, beat pacing, 2-4 sentences per beat)
- The output from previous steps (for context continuity)

### Cost Estimate

~3 calls × ~4K output tokens = ~12K output tokens per episode.
With Claude Sonnet: under $0.05 per episode generation.

---

## Editor UI

### Three-Zone Layout

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar: [New] [Open] [Generate] [Render] [Settings]    │
├──────────────────────┬──────────────────────────────────┤
│                      │                                   │
│   STORYBOARD         │        LIVE PREVIEW               │
│   (scene grid)       │        (PixiJS canvas)            │
│                      │                                   │
│  ┌────┐ ┌────┐      │   ┌─────────────────────────┐    │
│  │ S1 │ │ S2 │      │   │                         │    │
│  └────┘ └────┘      │   │    16:9 PixiJS canvas   │    │
│  ┌────┐ ┌────┐      │   │    (live playback)      │    │
│  │ S3 │ │ S4 │      │   │                         │    │
│  └────┘ └────┘      │   └─────────────────────────┘    │
│                      │   [◀ Prev] [▶ Play] [Next ▶]     │
│  PROPERTIES          │                                   │
│  (context-sensitive) │                                   │
│  ─────────────       │                                   │
│  Narration: [____]   │                                   │
│  Camera: zoom 1.2    │                                   │
│  Characters: [+]     │                                   │
│  Music: ambient      │                                   │
├──────────────────────┴──────────────────────────────────┤
│ TIMELINE                                                 │
│ S1: │ Beat 1 │ Beat 2 │ Beat 3 │  S2: │ Beat 4 │ ...   │
│     ├────────┼────────┼────────┤      ├────────┤        │
│     │ 🎤 📷  │ 🎤 📷  │ 🎤     │      │ 🎤 🔊  │        │
└─────────────────────────────────────────────────────────┘
```

### Panel Descriptions

**Toolbar:**
- New Project / Open Project / Save
- Generate (opens AI generation modal)
- Render (triggers full pipeline)
- Settings (API key, voice selection, resolution)

**Storyboard (top-left):**
- Grid of scene cards with auto-rendered thumbnails (captured from PixiJS)
- Click to navigate to scene
- Drag to reorder scenes
- Right-click context menu: add scene, delete scene, duplicate
- Shows scene title and beat count

**Properties (below storyboard, context-sensitive):**
- When a **beat** is selected: narration text editor, camera settings (pan/zoom targets, duration), character actions list (add/remove), SFX cues, wait_after duration
- When a **scene** is selected: background selector, initial music track, character placement list with positions
- When a **character** is selected in a beat: state dropdown (filtered to that character's available states), movement target, duration
- AI assist buttons: "Rewrite Narration", "Suggest Camera", "Suggest SFX"

**Live Preview (top-right):**
- Embedded PixiJS canvas (same renderer as ramayana-engine)
- Shows the currently selected beat's visual state
- Transport controls: previous beat, play/pause, next beat, play full scene
- Updates live as properties change (narration edit doesn't need refresh; camera/character changes re-render instantly)

**Timeline (bottom):**
- Horizontal scrolling strip
- Scene groups separated by dividers
- Beat blocks: width proportional to duration, shows narration snippet + action icons
- Click beat to select (updates preview + properties)
- Drag beat edges to adjust duration
- Drag beats to reorder within a scene
- Right-click: add beat, delete, duplicate, split

### AI Integration Points in UI

| Location | AI Feature | Trigger |
|----------|-----------|---------|
| Toolbar | Full episode generation | "Generate" button → paste text modal |
| Narration field | Rewrite narration | "AI Rewrite" button next to text field |
| Camera settings | Suggest camera move | "AI Suggest" button → Claude picks appropriate pan/zoom |
| Beat actions | Suggest SFX | "AI Suggest" button → Claude adds fitting sound cues |
| Scene panel | Add missing beats | "AI: Expand Scene" → Claude generates additional beats for a scene |
| Storyboard | Regenerate scene | Right-click → "AI Regenerate" → new generation for one scene |

---

## Character & Asset Registry

### Character Registry

Ships with the app. Grows as new episodes are created.

```json
{
  "characters": {
    "rama": {
      "displayName": "Prince Rama",
      "states": ["idle", "walking", "lifting", "drawing_bow", "triumphant"],
      "defaultState": "idle",
      "color": "blue-tinted silhouette",
      "description": "Hero. Tall, youthful build. Pointed gold crown (mukut), royal posture."
    },
    "sita": {
      "displayName": "Princess Sita",
      "states": ["idle", "watching", "walking", "garlanding"],
      "defaultState": "idle",
      "color": "pink/red-tinted silhouette",
      "description": "Graceful, slender. Flowing sari, braid with flowers, gold jewelry."
    },
    "janaka": {
      "displayName": "King Janaka",
      "states": ["sitting_throne", "standing", "rejoicing"],
      "defaultState": "sitting_throne",
      "color": "gold-tinted silhouette",
      "description": "King of Mithila. Broad, regal build. Large ornate crown."
    },
    "vishwamitra": {
      "displayName": "Sage Vishwamitra",
      "states": ["standing", "nodding"],
      "defaultState": "standing",
      "color": "brown/copper-tinted silhouette",
      "description": "Great sage. Tall, lean. Long beard, staff (danda), matted hair."
    },
    "king_generic": {
      "displayName": "Generic King/Prince",
      "states": ["standing", "walking", "straining", "retreating"],
      "defaultState": "standing",
      "color": "grey silhouette",
      "description": "Background king. Medium build, simple silver crown."
    }
  }
}
```

### Asset Registry

```json
{
  "backgrounds": {
    "court_hall": {
      "displayName": "Janaka's Court Hall",
      "description": "Grand pillared Dravidian temple hall with arches, oil lamps, throne platform.",
      "mood": "regal, grand"
    }
  },
  "music": {
    "court_ambient": { "displayName": "Court Ambient", "mood": "regal, calm", "file": "court_ambient.mp3" },
    "tension_build": { "displayName": "Tension Drums", "mood": "suspense, rising", "file": "tension_drums.mp3" },
    "triumph": { "displayName": "Triumph Sitar", "mood": "victory, celebration", "file": "triumph_sitar.mp3" }
  },
  "sfx": {
    "crowd_murmur": { "tags": ["crowd", "ambient"], "description": "Low crowd murmuring" },
    "bow_crack": { "tags": ["weapon", "dramatic", "loud"], "description": "Loud crack of wood breaking" },
    "crowd_gasp": { "tags": ["crowd", "surprise"], "description": "Collective gasp of shock" },
    "crowd_cheer": { "tags": ["crowd", "celebration"], "description": "Cheering crowd" },
    "footsteps": { "tags": ["movement", "walking"], "description": "Footsteps on stone floor" }
  }
}
```

### How the Registry Feeds AI

The character and asset registries are serialized into the Claude system prompts. This ensures AI can only generate scripts that reference existing assets. When new characters or backgrounds are added (Phase 3), the AI automatically gains access to them without prompt changes.

---

## Render & Export Pipeline

### Integration with Existing Python Pipeline

The studio app wraps the existing `ramayana-engine render` CLI command:

```
User clicks [Render]
      │
      ▼
Electron Main Process:
  1. Save episode.json to project folder
  2. Spawn: python -m pipeline.cli render episode.json --output ./output/ --progress-json
  3. Parse stdout JSON progress lines
  4. Update UI progress modal
      │
      ▼
Render Progress Modal:
  Phase 1: Generating narration...  ████░░  60%
  Phase 2: Recording scenes...      ░░░░░░   0%
  Phase 3: Mixing audio...          ░░░░░░   0%
  Phase 4: Assembling video...      ░░░░░░   0%
  [Cancel]
      │
      ▼
Output: project/output/episode.mp4 + .srt + .gif
Auto-opens in system video player
```

### Pipeline Modification

Add `--progress-json` flag to the Python CLI that emits structured progress:

```json
{"phase": 1, "label": "Generating narration", "current": 8, "total": 16}
{"phase": 2, "label": "Recording scenes", "current": 3, "total": 5}
```

### Preview Modes

| Mode | Speed | What it does | When to use |
|------|-------|-------------|-------------|
| **Quick Preview** | Instant | PixiJS plays beats with timing, no audio | While editing, checking flow |
| **Audio Preview** | ~2s | TTS for one beat + PixiJS playback | Checking narration sync for a beat |
| **Full Render** | ~2-3 min | Complete pipeline → MP4 + SRT | Final export |

### Bundled Dependencies

| Dependency | Bundling Strategy |
|-----------|------------------|
| Python | Expect system Python + auto-create venv on first run |
| ffmpeg | Bundle via `ffmpeg-static` npm package |
| Playwright Chromium | Auto-install on first run (`playwright install chromium`) |
| Edge TTS | pip install into project venv |

---

## Project File Format

Each project is a self-contained folder:

```
my-episode/
├── project.json           # Metadata
│   {
│     "name": "The Breaking of Shiva's Bow",
│     "created": "2026-02-05",
│     "voice": "en-US-GuyNeural",
│     "rate": "-5%",
│     "resolution": { "width": 1920, "height": 1080 }
│   }
├── episode.json           # Full episode script (scenes, beats)
├── source-text.md         # Original Ramayana chapter text
├── generation-log.json    # AI generation history (for regeneration)
├── assets/                # Custom asset overrides (optional)
│   ├── backgrounds/
│   └── characters/
└── output/                # Rendered files
    ├── episode.mp4
    ├── episode.srt
    └── episode.gif
```

---

## Build Phases

### Phase 1 — Foundation (MVP)

Core loop: paste text → AI generates → edit → render.

- Electron shell with React + Vite + Tailwind
- File-based project management (new/open/save)
- Claude API integration (3-step generation pipeline)
- Generation modal: paste text → generate → load into editor
- Embedded PixiJS preview with play/pause/step controls
- Basic timeline showing beats with narration text
- Properties panel for editing narration, camera, character states
- One-click render via Python pipeline spawn
- Ship with EP01 character/asset registry (5 characters, 1 background)

### Phase 2 — Editor Polish

- Storyboard grid with auto-rendered thumbnails
- Drag-and-drop beat reordering on timeline
- Drag-and-drop scene reordering in storyboard
- Character position editing (click to drag in preview)
- AI "Rewrite" / "Suggest" buttons on individual properties
- Audio preview for single beats (TTS on demand)
- Render progress modal with phase tracking
- Undo/redo (Zustand history middleware)
- Keyboard shortcuts (Space = play/pause, arrow keys = navigate beats)

### Phase 3 — Content Expansion

- Built-in Ramayana chapter library (all 7 Kandas, English translations)
- New characters: Lakshmana, Ravana, Hanuman, Dasharatha, Kaikeyi, Surpanakha, Bharata, Shatrughna, Maricha, Jatayu
- New backgrounds: forest path, Lanka palace, ocean shore, Ayodhya palace, Panchavati hermitage, Kishkindha
- New music/SFX packs per mood (battle, devotion, sorrow, nature)
- Character state expansion (combat, flying, meditating, weeping)
- New art for each — same Canvas 2D shadow puppet approach

### Phase 4 — Advanced (Stretch)

- AI image generation for custom backgrounds (DALL-E / Midjourney API)
- Voice selection per character (different TTS voices for dialogue vs narration)
- Multi-episode project management (series mode with episode list)
- YouTube auto-upload integration
- Subtitle translation (Hindi, Sanskrit, Tamil)
- Episode templates (auto-fill common scene structures)

### Explicitly Out of Scope

- No cloud/server infrastructure — everything local
- No multi-user collaboration
- No custom animation editor — states are predefined poses
- No video editing features (cuts, overlays, transitions beyond fades)
- No mobile version

---

## Project Structure

```
ramayana-studio/
├── package.json
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # IPC bridge
│   ├── services/
│   │   ├── claude.ts        # Claude API integration
│   │   ├── project.ts       # Project file I/O
│   │   ├── renderer.ts      # Python pipeline spawn + progress
│   │   └── tts-preview.ts   # Single-beat TTS preview
│   └── registries/
│       ├── characters.json  # Character registry
│       └── assets.json      # Background, music, SFX registry
├── src/
│   ├── App.tsx
│   ├── stores/
│   │   ├── episode.ts       # Zustand: episode script state
│   │   ├── editor.ts        # Zustand: UI state (selection, panels)
│   │   └── history.ts       # Zustand: undo/redo
│   ├── components/
│   │   ├── Toolbar.tsx
│   │   ├── Storyboard/
│   │   │   ├── StoryboardGrid.tsx
│   │   │   └── SceneCard.tsx
│   │   ├── Timeline/
│   │   │   ├── TimelineStrip.tsx
│   │   │   └── BeatBlock.tsx
│   │   ├── Preview/
│   │   │   ├── PreviewCanvas.tsx    # PixiJS embed
│   │   │   └── TransportControls.tsx
│   │   ├── Properties/
│   │   │   ├── BeatProperties.tsx
│   │   │   ├── SceneProperties.tsx
│   │   │   └── CharacterProperties.tsx
│   │   └── Modals/
│   │       ├── GenerateModal.tsx    # AI generation UI
│   │       ├── RenderModal.tsx      # Render progress
│   │       └── SettingsModal.tsx
│   └── lib/
│       ├── ipc.ts            # IPC helpers (renderer → main)
│       └── preview-bridge.ts # PixiJS engine integration
├── packages/
│   └── engine/               # Shared: ramayana-engine renderer code
└── python/                   # Shared: ramayana-engine pipeline code
```
