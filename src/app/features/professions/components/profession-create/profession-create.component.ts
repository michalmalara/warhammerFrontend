import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {finalize} from 'rxjs/operators';

import {ProfessionsApiService} from '../../services/professions-api.service';

@Component({
  selector: 'app-profession-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './profession-create.component.html',
  styleUrls: ['./profession-create.component.scss'],
})
export class ProfessionCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProfessionsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isSaving = false;

  // transient animation state per control
  animating: Record<string, boolean> = {};
  private timeouts: Record<string, any> = {};

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],

    weaponSkillsDevelopment: [0, [Validators.required, Validators.min(0)]],
    ballisticSkillsDevelopment: [0, [Validators.required, Validators.min(0)]],
    strengthDevelopment: [0, [Validators.required, Validators.min(0)]],
    toughnessDevelopment: [0, [Validators.required, Validators.min(0)]],
    agilityDevelopment: [0, [Validators.required, Validators.min(0)]],
    intelligenceDevelopment: [0, [Validators.required, Validators.min(0)]],
    willpowerDevelopment: [0, [Validators.required, Validators.min(0)]],
    fellowshipDevelopment: [0, [Validators.required, Validators.min(0)]],

    attacksDevelopment: [0, [Validators.required, Validators.min(0)]],
    woundsDevelopment: [0, [Validators.required, Validators.min(0)]],
    movementDevelopment: [0, [Validators.required, Validators.min(0)]],
    magicDevelopment: [0, [Validators.required, Validators.min(0)]],
  });

  save() {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.api
      .create(this.form.getRawValue())
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (created) => {
          this.snackBar.open('Profesja utworzona', 'OK', {duration: 2500});
          this.router.navigate(['/professions', created.id]);
        },
        error: () => {
          this.snackBar.open('Nie udało się utworzyć profesji', 'OK', {duration: 3500});
        },
      });
  }

  // Trigger a short pulse animation for the named control
  private triggerPulse(controlName: string) {
    const DURATION = 300; // ms, keep in sync with CSS animation duration
    // clear existing timeout if present
    if (this.timeouts[controlName]) {
      clearTimeout(this.timeouts[controlName]);
    }
    this.animating[controlName] = true;
    this.timeouts[controlName] = setTimeout(() => {
      this.animating[controlName] = false;
      delete this.timeouts[controlName];
    }, DURATION);
  }

  // Increment a numeric form control by `step` (default 1). Minimum is 0.
  increment(controlName: string, step = 1) {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    const current = Number(ctrl.value ?? 0) || 0;
    ctrl.setValue(Math.max(0, current + step));
    this.triggerPulse(controlName);
  }

  // Decrement a numeric form control by `step` (default 1). Minimum is 0.
  decrement(controlName: string, step = 1) {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    const current = Number(ctrl.value ?? 0) || 0;
    const next = Math.max(0, current - step);
    ctrl.setValue(next);
    this.triggerPulse(controlName);
  }
}
