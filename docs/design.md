# Signal — desktop abandonment demo

Build a small standalone Angular app in angular_demo_app with Contact and About routes. The existing transcription API is independent of this demo.

Contact is the default route: editorial heading, validated contact form, friendly demo-only completion, and a persistent live signal monitor. About explains the detector and provides a short guided test. A warm off-white surface, dark ink, teal accents, simple line icons, and responsive layouts keep the design polished and restrained.

One root Angular service owns the browser listeners and session state across routes. It observes top-edge mouse exit, 15 seconds of visible inactivity, tab visibility, window focus, unfinished-form route departure, and pagehide. Exit intent can open a dismissible, keyboard-accessible recovery dialog after form engagement. Signals are heuristic observations, not proof of abandonment. No unload blocking or claims of reliable closed-tab delivery.

Keep at most 50 events in memory. Never store or transmit form values. Maintain the draft in memory between routes; a reload clears the session. Offer pause/resume, reset event history, JSON event export, and clearly labeled simulated exit/idle signals. Native listeners are removed on service teardown. Timers do not create duplicate idle events while inactive or hidden. Form completion clears pending status; edited successful forms become pending again.

Verification covers dirty-form navigation, event cooldowns, visibility/focus changes, idle recovery, pause/resume, reset, privacy of exported data, keyboard modal behavior, validation, and mobile overflow. Production build and real Chromium browser checks are required.
