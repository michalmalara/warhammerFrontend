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

import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import type {CreateTalentPayload} from '../../models/talent.models';
import {TalentsApiService} from '../../services/talents-api.service';

@Component({
  selector: 'app-talent-create',
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
    WaxSealButtonComponent,
  ],
  templateUrl: './talent-create.component.html',
  styleUrls: ['./talent-create.component.scss'],
})
export class TalentCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TalentsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateTalentPayload = this.form.getRawValue();

    this.isSaving = true;
    this.api
      .create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Talent created', 'OK', {
            duration: 2500,
          });
          void this.router.navigate(['/talents']);
        },
        error: () => {
          this.snackBar.open('Failed to create talent', 'OK', {duration: 3500});
        },
      });
  }
}
