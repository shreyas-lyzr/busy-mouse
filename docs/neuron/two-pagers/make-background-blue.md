This is a tiny single-file static page project (no build system, no tests). Here's the plan.

## Problem
The "Busy Mouse" demo page (`index.html`) currently renders with a purple/violet gradient background (`#667eea` → `#764ba2`). The request is to change this to a blue background so the page reads as blue instead of purple.

## Approach
- Locate the single source of the page background in the `body` selector's `background` property inside the `<style>` block of `index.html` (line 20).
- Replace the purple/violet gradient with a blue color scheme, preserving the existing `linear-gradient(135deg, ...)` structure so the diagonal gradient look and feel is unchanged — just re-key the two stop colors to blues (e.g. a mid blue to a deeper/navy blue).
- Keep everything else (mouse body, eyes, trail dots, animations) untouched, since white/gray/pink accents already contrast fine against blue.
- Double-check the `.trail-dot` colors (`rgba(59, 130, 246, 0.8)` and `rgba(147, 197, 253, 0.8)`, already blue-ish) still contrast acceptably against the new blue background; adjust only if they blend in.
- No build step, package manager, or test suite exists in this repo — verification is visual (open `index.html` in a browser) rather than automated.

## Files to change
- `index.html` — update the `body { background: linear-gradient(...) }` rule (line 20) from the purple gradient to a blue gradient.

## Acceptance criteria
1. AC-1: Opening `index.html` in a browser shows a blue-toned background (no purple/violet hue) filling the full viewport.
2. AC-2: The gradient effect (`linear-gradient(135deg, ...)`) is preserved — two blue shades blending diagonally, not a flat single color, unless a flat blue is explicitly preferred.
3. AC-3: All existing elements (mouse body, ears, eyes, nose, tail, spinning indicator, trail dots, heading, info text) remain visible and legible against the new background with no contrast regressions.
4. AC-4: No other styles, markup, or script logic in `index.html` are modified.

## Suggested worker roster
- **CSS implementer** — edits the `body` background gradient in `index.html` to blue tones; owns `index.html`.
- **Visual verifier** — opens the updated `index.html` (e.g., via a quick local file preview or the `run` skill) to confirm the background reads as blue and all foreground elements remain legible; owns manual/visual check only, no separate test files exist.