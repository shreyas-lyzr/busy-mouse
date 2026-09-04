Now I have the grounding I need. Revising the plan for "few planets, different colors, static planets" — this resolves both open questions.

## Summary
Add a small set (4–5) of static, differently-colored CSS-drawn planet circles as a decorative background layer behind the existing busy-mouse scene in `index.html`, with no motion/orbit and no new dependencies or files.

## Files to change
| File | Change |
| --- | --- |
| `index.html` | Add a `.planets-bg` container (fixed, full-viewport, `z-index` below `.container`) with 4–5 `.planet` divs, each a fixed-position circle with a distinct solid/radial-gradient color and size; no `@keyframes`/animation applied to them |
| `README.md` | Add a bullet under Features noting the static multi-colored planet background |

## Acceptance criteria
| ID | Criterion |
| --- | --- |
| AC-1 | Exactly 4–5 visually distinct planets render behind the mouse scene without obscuring it |
| AC-2 | Each planet has a different color (e.g. red, blue, orange, teal, purple via distinct solid/radial-gradient fills) |
| AC-3 | Planets are completely static — fixed position and size, no CSS animation/transition/keyframes applied to `.planet` |
| AC-4 | Planets use `position: fixed`/`absolute` with `z-index` lower than `.container`, `.busy-mouse-container`, and `.trail` |
| AC-5 | Page remains dependency-free (pure HTML/CSS/inline JS) and `overflow: hidden` on `body` still prevents scrollbars from planet placement |
| AC-6 | Layout stays centered and responsive at common viewport sizes (planets don't push/resize `.container`) |
| AC-7 | README updated to mention the static planet background feature |

## Worker roster
| Role | Owns |
| --- | --- |
| Markup/CSS builder | `index.html` — `.planets-bg`/`.planet` elements, per-planet colors/sizes/positions, z-index stacking (no animation) |
| Docs updater | `README.md` — Features section edit |

## Open questions
None