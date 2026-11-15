#!/usr/bin/env bash
# New cartoon-short project:  bash setup.sh <project_dir> [juliane|yamaguchi]
# Needs node >= 22.6, python3 + numpy + Pillow, ffmpeg, Playwright with Chromium (pre-installed in Claude cloud sessions).
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; P="${1:?usage: setup.sh <project_dir> [example]}"; EX="${2:-juliane}"
mkdir -p "$P/web/lib" "$P/stills" "$P/out" "$P/frames"
cp "$KIT"/engine/* "$P/web/"
cp "$KIT/examples/$EX/story.js" "$KIT/examples/$EX/world.js" "$P/web/"
cp "$KIT/tools/render.mjs" "$KIT/tools/sheet.py" "$KIT/tools/mix.py" "$KIT/tools/transcribe.py" "$P/"
cp "$KIT/examples/$EX/audio.py" "$KIT/examples/$EX/compose.py" "$P/"
if [ ! -f "$P/web/lib/three.module.js" ]; then
  ( cd /tmp && rm -rf _three && mkdir _three && cd _three && npm pack three@0.160.0 >/dev/null 2>&1 && tar xzf three-0.160.0.tgz && cp package/build/three.module.js "$P/web/lib/" )
fi
node -e "const m=require('node:module'),fs=require('fs');fs.writeFileSync('$P/web/toonbase.js',m.stripTypeScriptTypes(fs.readFileSync('$KIT/vendor/toon.ts','utf8'),{mode:'transform'}))"
cat "$P/web/toonbase.js" "$P/web/roman.js" > "$P/web/toon.js"
mkdir -p "$P/node_modules"; [ -e "$P/node_modules/playwright" ] || ln -sf "$(npm root -g)/playwright" "$P/node_modules/playwright"
echo "ready: $P  (example: $EX). After editing roman.js run: cat web/toonbase.js web/roman.js > web/toon.js"
