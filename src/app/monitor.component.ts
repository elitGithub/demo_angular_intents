import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TrackerService, EventKind } from './tracker.service';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-monitor', imports: [DatePipe, IconComponent],
  templateUrl: './monitor.component.html'
})
export class MonitorComponent {
  readonly tracker = inject(TrackerService);
  eventIcon(kind: EventKind): string {
    if (kind === 'exit') return 'cursor';
    if (kind === 'idle') return 'clock';
    if (['hidden', 'visible', 'blur', 'focus', 'pagehide'].includes(kind)) return 'window';
    if (kind.startsWith('form')) return kind === 'form_completed' ? 'check' : 'mail';
    return kind === 'page' ? 'layers' : 'pulse';
  }
  setIdle(event: Event): void { this.tracker.setIdleSeconds(Number((event.target as HTMLSelectElement).value)); }
}
