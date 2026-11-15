---
name: cartoon-short
description: Turn a voiceover (Indonesian or any language) into a finished vertical animated short in our house editing style - flat 2D bean-head cartoon characters standing in an inked, colourful 3D world, gliding cameras, word-by-word captions, date/counter titles, soft music + SFX at half the voice level. Use when the user uploads narration audio and wants "video kayak kemarin / gaya yang sama / bikin video dari narasi ini", or asks for a cartoon short, animated story short, or "the Yamaguchi/Juliane style".
---

# Cartoon short (house editing style)

The user uploads a voiceover; you deliver an MP4 in the style below, exactly as long as the voice. Reply to the user in their language (they write Indonesian, casual "gua/lu" register). Never re-time or edit the voice. Keep the user posted with short progress lines; renders take 25-40 min.

The `kit/` folder holds the engine and tools. `kit/examples/` holds two finished shot plans (Yamaguchi 49.6 s, Juliane Koepcke 63.4 s) as code templates only; no video files are kept here.

## The style (what makes it "ours")

### Look
- 2D flat cartoon characters (canvas-drawn cards: bean head, stick limbs, ink-dot hands, plum ink outline, no blush highlights) standing in a 3D toon world with black ink outlines on geometry, painted textures, fog = horizon colour.
- Characters are normal people: suit/shirt + trousers, or shirt + short skirt. Never the long `dress` blob or long hair on the main character (reads as a "bean"). A girl gets a `ribbon` (pita) on the head. Injuries are cartoon-mild: bandage, cuts, soot, sling (`sash`). Nothing graphic.
- Lighting carries the mood per beat: day for normal, golden for decline/relief, dusk-orange for disaster, night-blue for hardship, sepia `memory` for flashbacks, dark stage with a light pool for the closing question/statistic.
- Lens blur on close-ups and mediums (focus on the eyes), wides/aerials sharp.

### Editing grammar
- One shot per narration phrase, 2-7 s each. Every visual reaction lands 0-3 frames BEFORE its word (use the Whisper word times).
- Hook (frame 0) is already the absurd image of sentence 1 (falling in a seat, mushroom cloud behind the hero).
- Name beat = studio portrait: coloured disc backdrop + name poster, hero waves.
- Cameras: smootherstep glides 18-45 f; every hold creeps (push-in); tracking moves for travel/walks; crane up to reveal geography at the end of a beat; dutch roll 2-6 deg on drama.
- Impacts: 7-frame flip-shake kick (`KICKS`) + short white flash. Explosions/lightning: flash to full white. Time jumps (day 1 -> day 11, next day): 4-6 frame white flash between lighting presets.
- Something always moves: idle bob/blink on every card, falling leaves/petals/embers/rain cards, smoke, hearts on reunions, "?" cards on confusion.
- Closing beat: pull back wide on a symbolic set (scale of fate, 92 empty seats with one lit) while the last words land; titles state the number.

### Text on screen
- Captions: ONE word at a time, white Inter ExtraBold ~72 px with a 9 px dark stroke, at 74.5% of the frame height, small pop-in scale. Key words (names, places, numbers, the twist words) in yellow `#FFD63C`.
- Titles at the top (y ~118 / 172 px at 720p): white date or place in ~50-58 px + a yellow subtitle line in ~28-32 px. Use them for dates, places, altitude, day counters ("HARI 1 -> 11"), age counters (29 -> 93), and the final statistic ("92 ORANG / 1 SELAMAT").
- Only facts that are in the narration or verified; tell the user which labels you added yourself.

### Sound
- The voice is untouched. Music = soft sine pads that change chord per story section. SFX = soft low thumps (not noise blasts), filtered whooshes on cuts, wind for falls, rumble for thunder, leafy burst for impacts, quiet water/birds ambience, a warm chime on relief/rescue, a gentle two-note chime on the last line.
- Never: piercing tones (no 4 kHz tinnitus), heartbeat loops, hard noise bursts. The user found those unpleasant.
- `mix.py` locks music and SFX each to 50% of the voice's gated RMS, SFX peaks <= 0.7 x voice peak; then loudnorm to -14 LUFS.

## Pipeline
1. **Setup**: `bash <skill>/kit/tools/setup.sh <scratchpad>/<slug> [juliane|yamaguchi]` (copies engine + the closest example, installs three r160 via npm, builds `toon.js`, links Playwright). Work in the scratchpad, not the repo.
2. **Transcribe**: `python3 transcribe.py voice.wav id` -> `words.json` + segments + total frames (30 fps). Needs `faster-whisper` (pip) and the hosts huggingface.co, cas-server.xethub.hf.co, us.aws.cdn.hf.co (request them with the environment tools if blocked). Fix misheard names/words in `compose.py` (see the correction loop there).
3. **Shot plan** in `web/story.js`: `SHOTS` (id, a, b frames, light, sets), `LIGHTS`, `CAMS`/`camAt`, `KICKS` + flash pulses, `dofAt`, `worldAt` (set-piece progress), `actorsAt` (cards), `fxAt` (effect cards). Plan from the word times; one row per phrase.
4. **World** in `web/world.js`: named sets (Groups) toggled per shot, built from primitives + canvas textures; `update(f, S, W, camera)` animates set pieces. Reuse sets from the examples (city, ruins, valley, studio, rail, station, office, park, stage, void, sky, storm/plane, jungle+river+hut instanced, seats).
5. **Cast** in `web/roman.js` (`OUTFITS` + `romanFront` options) then `cat web/toonbase.js web/roman.js > web/toon.js`. Options added for this style: `suit`, `tie`, `glasses`, `bald`, `bun`, `ribbon`, `bandage`, `burn`, `cuts`, `soot`, `sash`, `belt`, `sweat`. Effects: `fxMushroom`, `fxCalendar`, `fxText`, `fxHeart`, `fxSmoke`, `fxPaper`, `fxShard`, `fxEmber`, `fxPlane`, `fxBubbleMush`, `fxBolt`, `fxFly`, `fxRain` (+ toon.ts `fxBurst`, `fxRing`, `fxLeaf`, `fxDust`, `fxCloud`).
6. **Look check**: `node render.mjs stills/a "f1,f2,..." 1 0.85` then `python3 sheet.py stills/a stills/sheet.jpg 5`; look at the sheet, fix, re-check only the changed shots. Send the user a sheet or a still if they ask to see characters first.
7. **Render 720p**: two parallel processes, e.g. `node render.mjs frames "0-950"` and `"951-<N-1>"` with `run_in_background`, watched by a Monitor loop that prints progress every ~25% and the exit. ~1.5-2 s/frame each, ~1 frame/s combined. `RESUME=1` skips existing frames; to redo a shot delete its frames and render that range.
8. **Sound**: edit the cue table in `audio.py` (times from words.json) -> `music.wav` + `sfx.wav`; `python3 mix.py voice.wav`; `ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=7 -ar 48000 -ac 2 mix.wav`.
9. **Compose**: edit corrections + `overlay()` titles + output name in `compose.py`, then `python3 compose.py <N>` (captions/titles onto frames, H.264 CRF 17 + AAC).
10. **QA**: `freezedetect`/`blackdetect` (a deliberate white flash hold is fine), ebur128 (target -14 LUFS), a tiled QA sheet every 3 s; look at it and fix anything blocked, empty or cut off.
11. **Deliver**: copy to the repo `output/`, SendUserFile, short summary of shots + what was verified and what wasn't (you can't hear the audio), then commit + push when the stop hook or the user asks.

## Traps we already hit (check every new shot)
- Camera looking +z: screen-right is world -x. Stage pairs accordingly.
- `PlaneGeometry`/`CircleGeometry` face +z: from a camera at -z they are invisible unless rotated `y = PI` (backdrops, posters, signs, backdrop planes).
- A big transparent cone/volume around the camera washes the whole frame grey: keep light cones small, far from the lens, opacity <= 0.03.
- Global painted clouds show up as white boxes indoors: list indoor lights in `showClouds` or set `S.noClouds`.
- A character "in a seat" must have the seat entirely BEHIND the card plane (cushion front edge at z < 0 in seat-local space) or the cushion cuts through the body. Seat yaw = card yaw; roll both by the same angle.
- Rows of seats/desks facing the camera hide whoever sits behind them: shoot from above (bird's-eye) or from the aisle.
- Desk taller than a standing card's head: raise the seated card (`y` + `ground`) or lower the desk.
- Instanced meshes need the instancing-aware normal/depth shader (already in `main.js`) or the ink pass breaks.
- Foreground props within ~2 m of the lens become blobs; keep vegetation out of camera corridors (`clear()` in the jungle).
- Vertical frame is narrow: half-width = d * tan(vfov/2) * 0.5625. Long objects (planes, beams) need a diagonal/three-quarter view or a smaller scale.
- `flash()` helpers with a zero fade length divide by zero and crash the render.
- Python per-sample DSP loops are slow and steal CPU from renders: use FFT filters (see `audio.py`) and `nice`.

## Credits
Engine built on the MIT `claude-animated-shorts` toon library (`vendor/toon.ts`, Pen/face/fx) and the `cartoon-short-kit` renderer; the house style, sets, cast extensions and tools were added in this project.
