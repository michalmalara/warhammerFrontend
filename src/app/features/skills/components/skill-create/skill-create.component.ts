import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {finalize} from 'rxjs';

import {
  type CreateSkillPayload,
  SKILL_CHARACTERISTICS_META,
  SKILL_TYPES,
  type SkillCharacteristic,
  type SkillType,
} from '../../models/skill.models';
import {SkillsApiService} from '../../services/skills-api.service';

@Component({
  selector: 'app-skill-create',
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
  templateUrl: './skill-create.component.html',
  styleUrls: ['./skill-create.component.scss'],
})
export class SkillCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SkillsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly characteristics = SKILL_CHARACTERISTICS_META;
  readonly skillTypes = SKILL_TYPES;

  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    type: this.fb.nonNullable.control<SkillType>('basic', [Validators.required]),
    associatedCharacteristic: this.fb.nonNullable.control<SkillCharacteristic>('intelligence', [
      Validators.required,
    ]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateSkillPayload = this.form.getRawValue();

    this.isSaving = true;
    this.api
      .create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Umiejętność utworzona', 'OK', {duration: 2500});
          void this.router.navigate(['/skills']);
        },
        error: () => {
          this.snackBar.open('Nie udało się utworzyć umiejętności', 'OK', {duration: 3500});
        },
      });
  }
}
