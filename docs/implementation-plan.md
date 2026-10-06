# Signal Demo Implementation Plan

**Goal:** Deliver the requested two-page Angular desktop abandonment demo.
**Architecture:** Standalone routed pages, a shared signal monitor, and one session-scoped browser signal service. No backend or external analytics.
**Tech stack:** Angular 22, TypeScript 6, CSS, Playwright.
**Spec:** design.md

## Constraints
- All files and dependencies live in angular_demo_app.
- Signals must be identified as heuristics; simulations must be labeled.
- Never collect form values in events or persist the draft.
- No navigation blocking; recovery dialog is dismissible.

## Tasks
- [x] Bootstrap Angular configuration and browser test harness. Write behavior checks before feature implementation and observe failures.
- [x] Implement tracker with bounded events, cooldowns, pause/resume, form state, visibility-aware idle timing, reset and JSON export.
- [x] Build Contact, About, shared navigation, monitor and accessible recovery dialog.
- [x] Run production build and browser suite. Inspect desktop/mobile screenshots and repair actual failures.
- [x] Request an independent code/security review, fix substantive findings, and document launch instructions and limitations.

## Review focus
- Leaving a completed or blank form must not be recorded as form abandonment.
- Returning to the page must re-arm idle detection without repeated inactive events.
- Pausing must prevent signals; resetting must not destroy a contact draft.
- Exports contain only event metadata, never names, email addresses or message text.
- Dialog focus must return to the trigger and keyboard users must be able to dismiss it.

## Progress
- Workspace inspected: no applicable AGENTS.md; no usable Git metadata. Use the authorized isolated subdirectory; no commits or worktrees available.
- Implementation proceeds under the user's build authorization; design is documented for review without extra approval gates.

## Verification
- Production Angular build passed: 344.43 kB initial output, approximately 90.67 kB transfer estimate.
- All 8 Chromium browser tests passed after scoping event assertions to the visible feed rather than screen-reader announcements.
- Desktop Contact/About, native recovery dialog, and 390 px mobile screenshots inspected; no page errors or horizontal overflow.
- Independent review identified low-contrast monitor text. Updated text colors and sizes; measured event description contrast is 5.07:1 on white. Production build and all 8 tests passed again.
- Preview is running on http://127.0.0.1:4201/contact. Normal npm start uses port 4200.
