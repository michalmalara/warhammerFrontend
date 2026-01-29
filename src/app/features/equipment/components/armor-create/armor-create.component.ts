import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import {finalize} from 'rxjs';

import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

import type {CreateArmorPayload} from '../../models/armor.models';
import {ArmorsApiService} from '../../services/armors-api.service';

@Component({
  selector: 'app-armor-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    WaxSealButtonComponent,
  ],
  templateUrl: './armor-create.component.html',
  styleUrls: ['./armor-create.component.scss'],
})
export class ArmorCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ArmorsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    location: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    armorPoints: this.fb.nonNullable.control(0, [Validators.required]),
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateArmorPayload = this.form.getRawValue();

    this.isSaving = true;
    this.api
      .create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open($localize`:Snack bar@@armorCreate.snack.success:Armor created`, 'OK', {
            duration: 2500,
          });
          void this.router.navigate(['/armors']);
        },
        error: () => {
          this.snackBar.open(
            $localize`:Snack bar@@armorCreate.snack.error:Failed to create armor`,
            'OK',
            {duration: 3500},
          );
        },
      });
  }
}
