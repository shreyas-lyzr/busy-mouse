## Summary
Change the page background from the current purple gradient to solid white while preserving the animated busy mouse layout and ensuring foreground text remains readable. Update the feature documentation so it no longer describes a gradient background.

## Files to change
| File | Change |
| --- | --- |
| `index.html` | Replace the `body` gradient background with a solid white background and adjust text or indicator colors if needed for sufficient contrast. |
| `README.md` | Update the feature list to describe the new white background instead of a gradient. |

## Acceptance criteria
| ID | Criterion |
| --- | --- |
| AC-1 | The rendered page uses a solid white background with no visible gradient. |
| AC-2 | The busy mouse remains centered and all existing animations continue functioning. |
| AC-3 | Heading and informational text remain readable against the white background. |
| AC-4 | The busy indicator and other white mouse elements remain visually distinguishable on the white page. |
| AC-5 | README documentation no longer claims the page has a gradient background. |

## Worker roster
| Role | Owns |
| --- | --- |
| CSS implementation worker | `index.html` background and contrast-related style updates. |
| Documentation worker | `README.md` feature description update. |
| Verification worker | Browser-level visual check and regression review of layout and animations. |

## Open questions
None