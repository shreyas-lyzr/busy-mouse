Single-file static HTML page ("Busy Mouse") with the background defined inline in `<style>` at line 20 as a purple/violet gradient. The request is to change it to blue.

## Summary
Change the page background in `index.html` from the current purple/violet gradient to a blue background (blue gradient), keeping the rest of the layout, animations, and mouse illustration untouched.

## Files to change
| File | Change |
| --- | --- |
| index.html | Update `body` rule's `background` (line 20) from `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` to a blue gradient/color |

## Acceptance criteria
| ID | Criterion |
| --- | --- |
| AC-1 | Opening `index.html` in a browser shows a blue page background instead of the current purple/violet one |
| AC-2 | No other visual elements (mouse body, eyes, tail, trail dots, text, animations) change color or behavior |
| AC-3 | Page still renders and functions correctly (no layout shift, no JS console errors, trail/spin/blink animations still run) |
| AC-4 | Blue tone has sufficient contrast with the white mouse body and white/text elements (`h1`, `.info`) for readability |

## Worker roster
| Role | Owns |
| --- | --- |
| Implementer | `index.html` — edits the `body { background: ... }` rule to a blue value |
| Visual verifier | Opens `index.html` in a browser (or screenshot tool) to confirm AC-1–AC-4 |

## Open questions
Q1: Solid blue color, or a blue-toned gradient similar in style to the current purple gradient (e.g. two shades of blue at 135deg)?