## Summary
Add a twinkling starfield behind the existing "Busy Mouse" scene in `index.html` by layering an absolutely-positioned canvas (or CSS box-shadow stars) under the current gradient background, generated and animated with a small vanilla JS snippet consistent with the file's existing inline `<script>` style.

## Files to change
| File | Change |
| --- | --- |
| `index.html` | Add a `<canvas id="stars">` (or `.stars` div) behind `.container`, CSS for full-viewport fixed positioning + twinkle keyframes, and JS to generate/animate randomly placed, twinkling stars on load and on resize |
| `README.md` | Add a "Starry Background" bullet under Features/Animations describing the new effect |

## Acceptance criteria
| ID | Criterion |
| --- | --- |
| AC-1 | Loading `index.html` shows a field of stars covering the full viewport behind the gradient and mouse scene |
| AC-2 | Stars twinkle (opacity/brightness pulse) with varied timing so the effect doesn't look mechanically uniform |
| AC-3 | Star layer does not block or shift the existing mouse animation, trail effect, or text (pointer-events disabled, correct z-index/stacking) |
| AC-4 | Background remains responsive — stars redistribute or rescale correctly on window resize, no clipping or fixed-size overflow |
| AC-5 | No new dependencies introduced; effect implemented in pure CSS/JS matching existing file's inline `<style>`/`<script>` structure |
| AC-6 | Page still renders correctly and performs smoothly (no visible jank) with the star count chosen |

## Worker roster
| Role | Owns |
| --- | --- |
| Frontend implementer | `index.html` — markup, CSS (positioning, twinkle keyframes), and JS star generation/animation logic |
| Visual QA | Manual browser check of `index.html` across viewport sizes for AC-1–AC-4, AC-6 |
| Docs updater | `README.md` feature/animation list update |

## Open questions
None