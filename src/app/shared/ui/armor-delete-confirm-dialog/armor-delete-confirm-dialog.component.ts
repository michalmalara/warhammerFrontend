import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogModule, DialogRef} from '@angular/cdk/dialog';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {WaxSealButtonComponent} from '../wax-seal-button/wax-seal-button.component';

export interface ArmorDeleteConfirmDialogData {
  armorId: number;
  armorName: string;
}

@Component({
  selector: 'app-armor-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, MatButtonModule, MatIconModule, WaxSealButtonComponent],
  templateUrl: './armor-delete-confirm-dialog.component.html',
  styleUrls: ['./armor-delete-confirm-dialog.component.scss'],
})
export class ArmorDeleteConfirmDialogComponent {
  readonly data = inject<ArmorDeleteConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
