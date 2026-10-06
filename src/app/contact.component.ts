import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TrackerService } from './tracker.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-contact', imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  readonly tracker = inject(TrackerService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly attempted = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: [this.tracker.draft.name, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: [this.tracker.draft.email, [Validators.required, Validators.email, Validators.maxLength(254)]],
    topic: [this.tracker.draft.topic],
    message: [this.tracker.draft.message, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)]]
  });
  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.tracker.updateDraft(this.form.getRawValue()));
  }
  invalid(field: 'name' | 'email' | 'message'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (this.attempted() || control.touched);
  }
  submit(): void {
    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      document.querySelector<HTMLElement>('input.ng-invalid, textarea.ng-invalid')?.focus();
      return;
    }
    this.tracker.completeForm();
  }
  startAgain(): void {
    this.tracker.newMessage();
    this.form.reset(this.tracker.draft, { emitEvent: false });
    this.attempted.set(false);
  }
}
