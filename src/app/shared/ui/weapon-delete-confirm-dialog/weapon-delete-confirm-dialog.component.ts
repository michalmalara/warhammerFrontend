import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogModule, DialogRef} from '@angular/cdk/dialog';

import {MatIconModule} from '@angular/material/icon';

import {WaxSealButtonComponent} from '../wax-seal-button/wax-seal-button.component';

export interface WeaponDeleteConfirmDialogData {
  weaponId: number;
  weaponName: string;
}

@Component({
  selector: 'app-weapon-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, MatIconModule, WaxSealButtonComponent],
  templateUrl: './weapon-delete-confirm-dialog.component.html',
  styleUrls: ['./weapon-delete-confirm-dialog.component.scss'],
})
export class WeaponDeleteConfirmDialogComponent {
  readonly data = inject<WeaponDeleteConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
