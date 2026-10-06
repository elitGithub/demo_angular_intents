import { Component, input } from '@angular/core';
@Component({
  selector: 'app-icon',
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()] || paths['pulse']" /></svg>`,
  styles: [':host { display: inline-flex; width: 20px; height: 20px; flex: 0 0 auto; } svg { width: 100%; height: 100%; }']
})
export class IconComponent {
  readonly name = input('pulse');
  readonly paths: Record<string, string> = {
    pulse: 'M3 13h4l3-9 4 16 3-9h4',
    arrow: 'M5 12h14m-5-5 5 5-5 5',
    diagonal: 'M6 18 18 6M6 6h12v12',
    mail: 'M4 5h16v14H4zM4 6l8 7 8-7',
    cursor: 'm5 3 14 9-7 1-3 7-4-17Z',
    clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    shield: 'm12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Zm-4 9 3 3 5-6',
    check: 'm5 12 4 4L19 6',
    reset: 'M3 4v6h6M3 10a9 9 0 1 1 1 8',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    pause: 'M8 5v14M16 5v14',
    play: 'm8 4 12 8-12 8V4Z',
    close: 'm6 6 12 12M6 18 18 6',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    window: 'M3 4h18v16H3zM3 8h18',
    layers: 'm12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5',
    info: 'M12 11v6m0-10v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    code: 'm8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16',
    dot: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'
  };
}
