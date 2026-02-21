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

import type {CreateWeaponPayload} from '../../models/weapon.models';
import {WeaponsApiService} from '../../services/weapons-api.service';

@Component({
  selector: 'app-weapon-create',
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
  templateUrl: './weapon-create.component.html',
  styleUrls: ['./weapon-create.component.scss'],
})
export class WeaponCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(WeaponsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    type: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    damage: this.fb.nonNullable.control(0, [Validators.required]),
    damageBonus: this.fb.nonNullable.control(0, [Validators.required]),
    range: this.fb.nonNullable.control(0, [Validators.required]),
    reloadTime: this.fb.nonNullable.control(0, [Validators.required]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    traits: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    priceGc: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    priceSs: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    priceBp: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    weight: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateWeaponPayload = this.form.getRawValue();

    this.isSaving = true;
    this.api
      .create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open($localize`:Snack bar@@weaponCreate.snack.success:Weapon created`, 'OK', {
            duration: 2500,
          });
          void this.router.navigate(['/weapons']);
        },
        error: () => {
          this.snackBar.open(
            $localize`:Snack bar@@weaponCreate.snack.error:Failed to create weapon`,
            'OK',
            {duration: 3500},
          );
        },
      });
  }
}
