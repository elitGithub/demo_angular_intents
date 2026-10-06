import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

export type EventKind = 'session' | 'page' | 'form_started' | 'form_abandoned' | 'form_completed' | 'exit' | 'idle' | 'activity' | 'hidden' | 'visible' | 'blur' | 'focus' | 'pagehide' | 'recovery';
export interface SignalEvent {
  id: number;
  timestamp: string;
  kind: EventKind;
  title: string;
  detail: string;
  source: 'observed' | 'simulated';
  page: string;
  pendingForm: boolean;
  isSignal: boolean;
}

const copy: Record<EventKind, [string, string, boolean]> = {
  session: ['Session started', 'Listening for interactions in this browser tab.', false],
  page: ['Page viewed', 'The visitor moved to a page in the demo.', false],
  form_started: ['Form started', 'The contact form has an unfinished draft.', false],
  form_abandoned: ['Form left unfinished', 'The visitor changed pages before completing the form.', true],
  form_completed: ['Form completed', 'The demo form was completed. No message was sent.', false],
  exit: ['Exit intent detected', 'The pointer left through the top of the page.', true],
  idle: ['Inactivity detected', 'No interaction within the selected idle threshold.', true],
  activity: ['Activity resumed', 'The visitor interacted with the page again.', false],
  hidden: ['Tab hidden', 'The page became hidden or the browser was minimized.', true],
  visible: ['Tab visible again', 'The visitor returned to this browser tab.', false],
  blur: ['Window lost focus', 'Another window or browser control received focus.', true],
  focus: ['Window focused', 'This browser window regained focus.', false],
  pagehide: ['Page departure observed', 'The browser fired pagehide. Delivery is not guaranteed.', true],
  recovery: ['Recovery prompt dismissed', 'The visitor chose to continue their session.', false]
};

@Injectable({ providedIn: 'root' })
export class TrackerService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly events = signal<SignalEvent[]>([]);
  readonly paused = signal(false);
  readonly pendingForm = signal(false);
  readonly completed = signal(false);
  readonly idleSeconds = signal(15);
  readonly idle = signal(false);
  readonly hidden = signal(document.visibilityState === 'hidden');
  readonly focused = signal(true);
  readonly recoveryOpen = signal(false);
  readonly currentPage = signal('/contact');
  readonly signalCount = computed(() => this.events().filter(event => event.isSignal).length);
  readonly status = computed(() => this.paused() ? 'Paused' : this.hidden() || !this.focused() ? 'Away' : this.idle() ? 'Idle' : 'Active');
  readonly latestSignal = computed(() => this.events().find(event => event.isSignal));
  readonly draft = { name: '', email: '', topic: 'General question', message: '' };
  private id = 0;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly lastEvent = new Map<string, number>();
  private readonly listeners = new AbortController();

  constructor() {
    const signal = this.listeners.signal;
    document.documentElement.addEventListener('mouseleave', event => {
      if (event.relatedTarget === null && event.clientY <= 12 && matchMedia('(hover: hover) and (pointer: fine)').matches) this.detectExit();
    }, { signal });
    for (const type of ['pointermove', 'pointerdown', 'keydown', 'input', 'wheel']) {
      document.addEventListener(type, () => this.activity(), { signal, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      this.hidden.set(document.visibilityState === 'hidden');
      this.record(this.hidden() ? 'hidden' : 'visible');
      this.idle.set(false);
      this.armIdle();
    }, { signal });
    window.addEventListener('blur', () => {
      this.focused.set(false);
      this.record('blur');
      this.armIdle();
    }, { signal });
    window.addEventListener('focus', () => {
      this.focused.set(true);
      this.idle.set(false);
      this.record('focus');
      this.armIdle();
    }, { signal });
    window.addEventListener('pagehide', () => this.record('pagehide'), { signal });
    window.addEventListener('pageshow', () => {
      this.hidden.set(document.visibilityState === 'hidden');
      this.focused.set(document.hasFocus());
      this.armIdle();
    }, { signal });
    const navigation = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.currentPage() === '/contact' && !event.url.startsWith('/contact') && this.pendingForm()) {
        this.record('form_abandoned');
      }
      if (event instanceof NavigationEnd) {
        this.currentPage.set(event.urlAfterRedirects.split(/[?#]/)[0]);
        this.record('page');
        this.armIdle();
      }
    });
    this.record('session');
    this.armIdle();
    this.destroyRef.onDestroy(() => {
      this.listeners.abort();
      navigation.unsubscribe();
      clearTimeout(this.idleTimer);
    });
  }

  updateDraft(value: typeof this.draft): void {
    const wasPending = this.pendingForm();
    Object.assign(this.draft, value);
    this.completed.set(false);
    const hasContent = Boolean(value.name.trim() || value.email.trim() || value.message.trim() || value.topic !== 'General question');
    this.pendingForm.set(hasContent);
    if (hasContent && !wasPending) this.record('form_started');
  }

  completeForm(): void {
    this.pendingForm.set(false);
    this.completed.set(true);
    this.record('form_completed');
  }

  newMessage(): void {
    Object.assign(this.draft, { name: '', email: '', topic: 'General question', message: '' });
    this.pendingForm.set(false);
    this.completed.set(false);
  }

  detectExit(source: 'observed' | 'simulated' = 'observed'): void {
    if (this.record('exit', source) && this.pendingForm() && this.currentPage() === '/contact') this.recoveryOpen.set(true);
  }

  simulateIdle(): void { this.record('idle', 'simulated'); }

  dismissRecovery(): void {
    if (!this.recoveryOpen()) return;
    this.recoveryOpen.set(false);
    this.record('recovery');
  }

  toggleTracking(): void {
    this.paused.update(value => !value);
    this.idle.set(false);
    this.lastEvent.clear();
    this.armIdle();
  }

  setIdleSeconds(value: number): void {
    if (![15, 30, 60].includes(value)) return;
    this.idleSeconds.set(value);
    this.idle.set(false);
    this.armIdle();
  }

  resetEvents(): void {
    this.events.set([]);
    this.lastEvent.clear();
    this.idle.set(false);
    this.armIdle();
  }

  exportEvents(): void {
    const content = JSON.stringify({ demo: 'Signal', exportedAt: new Date().toISOString(), events: this.events() }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signal-session.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private activity(): void {
    if (this.paused()) return;
    if (this.idle()) {
      this.idle.set(false);
      this.record('activity');
    }
    this.armIdle();
  }

  private armIdle(): void {
    clearTimeout(this.idleTimer);
    if (this.paused() || this.hidden() || !this.focused()) return;
    this.idleTimer = setTimeout(() => {
      this.idle.set(true);
      this.record('idle');
    }, this.idleSeconds() * 1000);
  }

  private record(kind: EventKind, source: 'observed' | 'simulated' = 'observed'): boolean {
    if (this.paused()) return false;
    const now = Date.now();
    // Only noisy exit events are throttled. Distinct visibility/route transitions must survive.
    const key = `${kind}:${source}`;
    if (kind === 'exit' && now - (this.lastEvent.get(key) ?? -Infinity) < 5000) return false;
    this.lastEvent.set(key, now);
    const [title, detail, isSignal] = copy[kind];
    const event: SignalEvent = {
      id: ++this.id, timestamp: new Date(now).toISOString(), kind, title, detail,
      source, page: this.currentPage(), pendingForm: this.pendingForm(), isSignal
    };
    this.events.update(events => [event, ...events].slice(0, 50));
    return true;
  }
}
