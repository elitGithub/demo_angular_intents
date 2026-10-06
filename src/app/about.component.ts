import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-about', imports: [RouterLink, IconComponent],
  template: `
    <section class="page-intro about-intro">
      <div class="eyebrow"><span class="tiny-line"></span> SMALL ACTIONS. USEFUL CLUES.</div>
      <h1>The moment<br><span>before goodbye.</span></h1>
      <p>People rarely announce they’re about to leave.<br class="desktop-break"> Their interactions can give us a little heads-up.</p>
    </section>
    <section class="surface about-card">
      <div class="card-heading"><div><h2>A little context goes a long way.</h2><p>Signal makes those quiet moments visible.</p></div><span class="soft-icon"><app-icon name="pulse" /></span></div>
      <p class="about-lead">This two-page Angular demo listens for browser interactions that may suggest a visitor is stepping away. The live monitor shows what happened, as it happens.</p>
      <div class="signal-explain"><span class="soft-icon"><app-icon name="cursor" /></span><div><h3>A move toward the exit</h3><p>A mouse leaving through the top edge can suggest a move toward a tab or the address bar. An unfinished form gets a gentle, dismissible check-in.</p></div></div>
      <div class="signal-explain"><span class="soft-icon"><app-icon name="clock" /></span><div><h3>A quiet moment</h3><p>No mouse, keyboard, or scroll activity for 15 seconds triggers an idle signal. You can adjust the threshold in the monitor.</p></div></div>
      <div class="signal-explain"><span class="soft-icon"><app-icon name="window" /></span><div><h3>A shift in attention</h3><p>Switching tabs, minimizing the browser, or focusing another window creates a signal. Returning to the page is recorded, too.</p></div></div>
      <div class="signal-explain"><span class="soft-icon"><app-icon name="mail" /></span><div><h3>A conversation left unfinished</h3><p>Start the Contact form, then visit About. The demo records the departure and keeps your draft for your return in this session.</p></div></div>
      <div class="honest-note"><app-icon name="info" /><p><strong>Clues, not conclusions.</strong> A signal doesn’t prove abandonment. Browser close events aren’t reliable, and mouse exit detection is intended for desktop. This demo doesn’t block navigation.</p></div>
    </section>
    <section class="try-strip"><div><h3>Take it for a spin.</h3><p>Start a message. Switch tabs. Come back. Watch the story unfold.</p></div><a class="primary-button" routerLink="/contact">Try the form <app-icon name="arrow" /></a></section>
    <div class="privacy-line"><app-icon name="shield" /><p>Local by design. No analytics requests, cookies, or stored form content. Events live in memory and disappear on reload. Exporting saves event metadata only.</p></div>
  `
})
export class AboutComponent {}
