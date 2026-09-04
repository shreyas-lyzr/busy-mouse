## Summary
Add a self-contained `chat.html` page implementing a simple client-side chat UI, following this repo's existing pure HTML/CSS/JS, no-dependency, single-file convention, and link it from `index.html`.

## Files to change
| File | Change |
| --- | --- |
| chat.html | New file: chat page with message list, input box, send button, inline `<style>`/`<script>`, matching gradient theme |
| index.html | Add a link/button to `chat.html` so the new page is reachable from the existing entry point |
| README.md | Document the new chat page: what it is, how to open it, features list |

## Acceptance criteria
| ID | Criterion |
| --- | --- |
| AC-1 | `chat.html` opens directly in a browser with no build step or external dependencies |
| AC-2 | User can type a message, submit via button or Enter key, and see it appended to the message list |
| AC-3 | Chat page visually matches existing app style (gradient background, font, rounded elements) |
| AC-4 | `index.html` contains a working link/button that navigates to `chat.html` |
| AC-5 | Message list auto-scrolls to the latest message and input clears after send |
| AC-6 | README.md updated to mention the chat page and how to use it |

## Worker roster
| Role | Owns |
| --- | --- |
| UI builder | `chat.html` markup, styles, and send/render JS logic |
| Integration worker | `index.html` link/navigation to the new chat page |
| Docs worker | `README.md` updates describing the chat feature |

## Open questions
Q1: Should the chat be purely client-side (echo/mock responses, no backend), or is a backend/API integration expected?
Q2: Should chat messages persist (e.g., localStorage) across page reloads, or is an in-memory session sufficient?