import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';
import {A11yModule} from '@angular/cdk/a11y';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {WaxSealButtonComponent} from '../wax-seal-button/wax-seal-button.component';

export type SkillDeleteConfirmDialogData = Readonly<{
  skillId: number;
  skillName: string;
}>;

@Component({
  selector: 'app-skill-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, A11yModule, MatButtonModule, MatIconModule, WaxSealButtonComponent],
  templateUrl: './skill-delete-confirm-dialog.component.html',
  styleUrls: ['./skill-delete-confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillDeleteConfirmDialogComponent {
  readonly data = inject<SkillDeleteConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<boolean>);

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
