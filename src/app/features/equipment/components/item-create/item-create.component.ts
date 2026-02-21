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

import type {CreateItemPayload} from '../../models/item.models';
import {ItemsApiService} from '../../services/items-api.service';

@Component({
  selector: 'app-item-create',
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
  templateUrl: './item-create.component.html',
  styleUrls: ['./item-create.component.scss'],
})
export class ItemCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ItemsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isSaving = false;

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
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

    const payload: CreateItemPayload = this.form.getRawValue();

    this.isSaving = true;
    this.api
      .create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open($localize`:Snack bar@@itemCreate.snack.success:Item created`, 'OK', {
            duration: 2500,
          });
          void this.router.navigate(['/items']);
        },
        error: () => {
          this.snackBar.open(
            $localize`:Snack bar@@itemCreate.snack.error:Failed to create item`,
            'OK',
            {duration: 3500},
          );
        },
      });
  }
}

