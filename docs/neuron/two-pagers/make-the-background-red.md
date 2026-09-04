Now I have enough grounding to write the plan.

## Problem
The "Busy Mouse" loading page (`index.html`) currently renders a purple/violet gradient background (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`). The feature request is to change the page background to red so the loading screen matches a new visual direction.

## Approach
- This is a single self-contained static HTML file (`index.html`) with all styling inline in a `<style>` block — no build step, CSS framework, or external stylesheet is involved, so the change is localized entirely to the `body` selector's `background` property.
- Replace the existing `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` on `body` with a red background, keeping the same declaration style (the codebase already favors gradients for the body background, so a red gradient, e.g. two red shades, keeps visual consistency with the existing pulsing/spinning UI) rather than a flat single color, unless a flat red is explicitly preferred.
- Leave all other colors (mouse body white, eyes `#333`, nose `#ff6b9d`, trail dots blue/white per the most recent merged change) untouched — the request only concerns the page background, not the mouse or trail elements.
- Verify contrast: the `h1` and `.info` text are white with a dark `text-shadow`/opacity — confirm white text stays legible against the new red background (it should, but check the exact red chosen isn't too light).
- No other files exist in the repo (`README.md` is unrelated Flutter boilerplate text and out of scope) — confirm no other HTML/CSS assets reference this background color before finishing.

## Files to change
- `index.html` — update the `background` property in the `body` rule (line 20) from the purple gradient to a red background/gradient.

## Acceptance criteria
1. AC-1: Opening `index.html` in a browser shows a red (not purple/violet) background filling the full viewport behind the "Busy Mouse" widget.
2. AC-2: The `body` CSS rule's `background` value uses red tones (e.g. a red hex/gradient) and no longer contains `#667eea` or `#764ba2`.
3. AC-3: All other visual elements (mouse body/ears/eyes/nose/tail, spinning busy indicator, trail dots, heading, info text) remain unchanged in color and behavior.
4. AC-4: White text (`h1`, `.info`) remains clearly legible against the new red background.
5. AC-5: No other files in the repo reference the old gradient colors that would cause visual inconsistency.

## Suggested worker roster
- **Implementer** — edits `index.html`'s `body` background declaration to red; owns the single-file change.
- **Visual verifier** — opens/renders `index.html` (or screenshots it) to confirm AC-1, AC-3, and AC-4 (contrast/legibility check).