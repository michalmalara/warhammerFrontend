import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {WaxSealButtonComponent} from '../wax-seal-button/wax-seal-button.component';

export type ProfessionDeleteConfirmDialogData = Readonly<{
  professionId: number;
  professionName: string;
}>;

@Component({
  selector: 'app-profession-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, A11yModule, MatButtonModule, MatIconModule, WaxSealButtonComponent],
  templateUrl: './profession-delete-confirm-dialog.component.html',
  styleUrls: ['./profession-delete-confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionDeleteConfirmDialogComponent {
  readonly data = inject<ProfessionDeleteConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}

