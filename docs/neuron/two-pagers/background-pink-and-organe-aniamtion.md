## Problem
The page currently has a static purple/violet gradient background (`body` `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` in `index.html`). The request is to give the background a pink-and-orange color animation instead of (or in addition to) the current static look, consistent with the page's existing pure-CSS animation style (pulse, blink, swish, spin).

## Approach
- Replace the static `background: linear-gradient(...)` on `body` with a multi-color pink/orange gradient (e.g. `#ff6ec4`/`#ff9a5a`-style stops) sized larger than the viewport (`background-size: 400% 400%`) so it can be animated.
- Add a new `@keyframes` rule (e.g. `bgShift`) that animates `background-position` (or interpolates gradient angle/stops) to create a smooth looping pink↔orange color shift, matching the naming/style of existing keyframes (`pulse`, `spin`, `swish`, `fadeOut`, `blink`).
- Apply the new animation to `body` via `animation: bgShift <duration>s ease-in-out infinite;`, choosing a slow duration (e.g. 8–12s) so it doesn't visually compete with the faster mouse animations (pulse 1.5s, swish 0.8s, spin 1s).
- Keep everything self-contained in the single `<style>` block in `index.html` — no new files, no build step, no dependencies, matching the "Pure CSS & JavaScript (no dependencies)" convention stated in `README.md`.
- Verify contrast: existing white text/mouse elements (`h1`, `.info`, `.mouse-body` white fill, box-shadows tuned for a purple backdrop) must remain legible against the new pink/orange palette — adjust `text-shadow`/`box-shadow` opacity only if needed.
- Update `README.md`'s Features/Animations lists to mention the new animated pink-orange background, keeping the doc in sync with the code (existing convention: every animation is listed there).

## Files to change
- `index.html` — replace the static `body` gradient with a pink/orange gradient, add `@keyframes bgShift`, and wire it up via `background-size` + `animation` on `body`.
- `README.md` — add a bullet noting the animated pink/orange background under "Features" and/or "Animations" to keep docs aligned with the new behavior.

## Acceptance criteria
1. AC-1: Opening `index.html` in a browser shows the body background continuously and smoothly cycling/shifting between pink and orange tones (no static single-gradient background remains).
2. AC-2: The background animation loops seamlessly (no visible jump/reset at the loop boundary) and runs indefinitely (`infinite`) without JavaScript involvement.
3. AC-3: All existing animations (mouse pulse, eye blink, tail swish, spinner spin, trail fade/orbit) continue to work unchanged and remain visually distinguishable against the new background.
4. AC-4: Text elements (`h1`, `.info`) and mouse elements remain clearly legible/visible at all points in the background animation cycle.
5. AC-5: No new files, frameworks, or dependencies are introduced; the page remains a single self-contained `index.html`.
6. AC-6: `README.md` reflects the new animated background feature.

## Suggested worker roster
- **CSS animation implementer** — owns `index.html`: swaps the `body` background for the pink/orange gradient, adds the `bgShift` keyframes, and tunes duration/easing.
- **Visual QA / contrast checker** — opens `index.html` in-browser (or via the `run` skill), confirms legibility of text/mouse against the animated background through a full cycle, and checks no jank/flicker at loop boundaries.
- **Docs updater** — owns `README.md`: adds the new animation to the Features/Animations lists to match repo convention.