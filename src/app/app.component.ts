import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from './icon.component';
import { MonitorComponent } from './monitor.component';
import { TrackerService } from './tracker.service';
@Component({
  selector: 'app-root', imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent, MonitorComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header"><div class="header-inner"><a class="brand" routerLink="/contact" aria-label="Signal home"><span class="brand-icon"><app-icon name="pulse" /></span>signal<span class="brand-period">.</span></a><span class="brand-divider"></span><span class="demo-badge">THE INTERACTION DEMO</span><nav aria-label="Main navigation"><a routerLink="/contact" routerLinkActive="active" ariaCurrentWhenActive="page">Contact</a><a routerLink="/about" routerLinkActive="active" ariaCurrentWhenActive="page">About</a></nav><span class="header-status"><span class="mini-dot"></span> A live little experiment</span></div></header>
    <main id="main-content" class="page-layout"><div class="page-content"><router-outlet /></div><app-monitor /></main>
    <footer class="site-footer"><div><span class="footer-brand">signal.</span><span>A little interaction. A lot of insight.</span></div><span class="footer-tech"><app-icon name="code" /> Built with Angular <span class="footer-dot">·</span> Demo only</span></footer>
    <dialog #recovery class="recovery-dialog" aria-labelledby="recovery-title" aria-describedby="recovery-description" (cancel)="tracker.dismissRecovery()" (close)="tracker.dismissRecovery()">
      <button class="icon-button modal-close" aria-label="Close recovery prompt" (click)="tracker.dismissRecovery()"><app-icon name="close" /></button><span class="recovery-art"><app-icon name="mail" /></span><div class="eyebrow">A SMALL CHECK-IN</div><h2 id="recovery-title">Before you go…</h2><p id="recovery-description">Looks like you might be stepping away. Your message is still here if you’d like to finish it.</p><button class="primary-button" autofocus (click)="tracker.dismissRecovery()">Keep writing <app-icon name="arrow" /></button><span class="modal-note">This is the demo’s exit-intent response.<br>You’re always free to leave.</span>
    </dialog>
  `
})
export class AppComponent {
  readonly tracker = inject(TrackerService);
  private readonly recovery = viewChild<ElementRef<HTMLDialogElement>>('recovery');
  constructor() {
    effect(() => {
      const dialog = this.recovery()?.nativeElement;
      if (!dialog) return;
      if (this.tracker.recoveryOpen() && !dialog.open) dialog.showModal();
      if (!this.tracker.recoveryOpen() && dialog.open) dialog.close();
    });
  }
}
