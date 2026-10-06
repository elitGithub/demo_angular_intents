# Signal — Angular desktop abandonment demo

A small, self-contained Angular app with **Contact** and **About** pages, a validated demo form, and a live browser-event monitor.

## Open in GitHub Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/elitGithub/demo_angular_intents?quickstart=1)

Click the button, sign in to GitHub, and choose **Create codespace** (or resume your existing one). The repository must be accessible to your account. The configuration selects Node 24, installs dependencies, and starts the app automatically on port **4200**, including when a codespace restarts. No terminal commands are needed for normal use.

The preview is configured to open in a separate browser tab. If the browser blocks it, use **Ports → 4200 → Open in Browser**. A separate tab gives the desktop exit-intent demo the full browser viewport.

To enable this after pulling changes into an existing codespace, run **Codespaces: Rebuild Container** from the command palette. Startup logs are in `/tmp/signal-demo.log`; to retry startup manually, run `bash .devcontainer/start-demo.sh`.

### Share only the running demo

If someone only needs to try the app, open your own codespace, then go to **Ports**, right-click **4200**, select **Port Visibility → Public**, and copy the forwarded URL. Visitors can open that URL without a GitHub account. This makes the development preview publicly accessible, and it is available only while your codespace and its server remain running. Your account or organization policy may restrict public ports. Stop the codespace when the demo is over.

People who create their own codespaces need a GitHub account and available Codespaces usage. A private repository also requires repository access. See [GitHub's quick-launch links](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/setting-up-your-repository/facilitating-quick-creation-and-resumption-of-codespaces) and [sharing forwarded ports](https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace#sharing-a-port).

## Run

Use Node.js 24.15+ (24.x), Node 22.22.3+ (22.x), or Node 26.x.

```sh
cd /var/www/transcription/angular_demo_app
npm ci
npm start
```

Open **http://localhost:4200**. Contact is the default page; `/about` is directly addressable.

```sh
npm run build                       # production files: dist/signal/browser
npx playwright install chromium     # one-time test browser setup
npm test                            # real Chromium browser tests
npm run check                       # production build + tests
```

The app has its own dependencies and does not use or modify the parent transcription API. Angular CLI analytics is disabled. Production hosting needs an SPA fallback to `index.html` for `/contact` and `/about`.

## Demo walkthrough

1. Start typing in the Contact form. The monitor records that a form was started without recording any field values.
2. Move your mouse out through the **top edge** of the webpage. An exit-intent event appears; if the form is unfinished, a dismissible check-in opens. Escape or **Keep writing** closes it.
3. Switch tabs or focus another window, then return. Watch the visibility/focus events.
4. Leave the visible, focused page untouched for **15 seconds**. One idle event is recorded until activity resumes. The threshold can be changed to 30 or 60 seconds.
5. Visit **About** with a partial form. The monitor records the unfinished departure. Return to Contact to find the draft intact.
6. Complete and submit the form. This is a local demo success state: no email or message is sent.

The monitor also offers **simulated exit intent and inactivity**, **pause/resume**, **reset events**, and **JSON export**. Simulated events are explicitly labeled and do not change the real visitor's idle state. Reset clears event history without clearing the form. Pause stops event collection; it does not erase the draft. The history and signal count refer to the last 50 retained events.

## Behavior and boundaries

- All tracking is local and transparent. There are no analytics calls, cookies, localStorage, or sessionStorage. Reloading clears the draft and event history.
- Event exports contain timestamps, event type, source, fixed descriptions, route, and a boolean for pending form state. Names, emails, topics, and message content are never included.
- Exit intent is a heuristic for a fine-pointer desktop device, based on a top-edge `mouseleave`. It does not prove that someone intends to abandon a page. Events have a five-second cooldown to avoid repeated prompts.
- Idle timing runs only while visible and focused. No repeated idle events occur until interaction resumes. Hidden time does not count toward the next idle threshold.
- `visibilitychange`, `blur`, `focus`, and `pagehide` are separate observations and may describe the same user action. Counts are event counts, not unique abandonment episodes.
- Navigation is never blocked, and no `beforeunload` warning is installed. `pagehide` is best-effort, and its in-memory event disappears if the document is destroyed. This demo does not promise reliable closed-tab reporting.
- The frontend is responsive, but mouse exit intent is deliberately a desktop demonstration.

Browser lifecycle references: [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [MDN pagehide](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event), [MDN beforeunload limitations](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event). Version requirements follow [Angular compatibility](https://angular.dev/reference/versions).

## Files

- `src/app/tracker.service.ts`: session state, native browser listeners, idle timer, bounded event log, simulation and export.
- `src/app/contact.component.*`: form validation, draft restoration and local completion.
- `src/app/about.component.ts`: explanation and walkthrough.
- `src/app/monitor.component.*`: shared live monitor and controls.
- `src/app/app.component.ts`: shell, navigation and native accessible recovery dialog.
- `src/styles.css`: responsive design and reduced-motion support.
- `tests/demo.spec.ts`: browser behavior checks.

To use a preinstalled Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. `PLAYWRIGHT_BROWSERS_PATH` can select a custom Playwright browser cache location.
# demo_angular_intents
