import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';

import {COMMA, ENTER} from '@angular/cdk/keycodes';

import {finalize} from 'rxjs/operators';

import {ProfessionsApiService} from '../../services/professions-api.service';
import {CreateProfessionPayload} from '../../models/profession.models';

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
    MatChipsModule,
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

  // separator keys for mat-chip input
  readonly separatorKeysCodes = [ENTER, COMMA];

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

    // dynamic lists (skills / talents)
    skills: this.fb.array([]),
    talents: this.fb.array([]),
    trappings: ['', [Validators.maxLength(2000)]],
  });

  // convenience getters for template
  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  get talents(): FormArray {
    return this.form.get('talents') as FormArray;
  }

  save() {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = this.buildCreatePayload();
    this.api
      .create(payload)
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

  private buildCreatePayload(): CreateProfessionPayload {
    const v = this.form.getRawValue();
    const payload: CreateProfessionPayload = {
      name: v.name,
      description: v.description,
      weaponSkillsDevelopment: v.weaponSkillsDevelopment,
      ballisticSkillsDevelopment: v.ballisticSkillsDevelopment,
      strengthDevelopment: v.strengthDevelopment,
      toughnessDevelopment: v.toughnessDevelopment,
      agilityDevelopment: v.agilityDevelopment,
      intelligenceDevelopment: v.intelligenceDevelopment,
      willpowerDevelopment: v.willpowerDevelopment,
      fellowshipDevelopment: v.fellowshipDevelopment,

      attacksDevelopment: v.attacksDevelopment,
      woundsDevelopment: v.woundsDevelopment,
      movementDevelopment: v.movementDevelopment,
      magicDevelopment: v.magicDevelopment,

      trappings: v.trappings,
    };

    // map skills/talents arrays to number[] of IDs when possible
    const skillsIds: number[] = [];
    for (const s of (v.skills || [])) {
      const n = Number(s);
      if (!Number.isNaN(n) && Number.isFinite(n)) skillsIds.push(n);
    }
    if (skillsIds.length) payload.skills = skillsIds;

    const talentsIds: number[] = [];
    for (const t of (v.talents || [])) {
      const n = Number(t);
      if (!Number.isNaN(n) && Number.isFinite(n)) talentsIds.push(n);
    }
    if (talentsIds.length) payload.talents = talentsIds;

    return payload;
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

  // Skills / talents helpers (mat-chip)
  addSkillFromChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.skills.push(new FormControl(value));
    }
    // Clear the input value
    if (event.chipInput) {
      event.chipInput.clear();
    }
  }

  addTalentFromChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.talents.push(new FormControl(value));
    }
    if (event.chipInput) {
      event.chipInput.clear();
    }
  }

  removeSkill(index: number) {
    if (index < 0 || index >= this.skills.length) return;
    this.skills.removeAt(index);
  }

  removeTalent(index: number) {
    if (index < 0 || index >= this.talents.length) return;
    this.talents.removeAt(index);
  }
}
