import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';

import {catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap} from 'rxjs';

import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {TalentsApiService} from '../../../talents/services/talents-api.service';

export type ProfessionTalentDialogResult = {
  id: number;
  name: string;
  description?: string;
};

@Component({
  selector: 'app-profession-talent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatDialogModule,
    WaxSealButtonComponent,
  ],
  templateUrl: './profession-talent-dialog.component.html',
  styleUrls: ['./profession-talent-dialog.component.scss'],
})
export class ProfessionTalentDialogComponent {
  private readonly talentsApi = inject(TalentsApiService);
  private readonly dialogRef = inject(MatDialogRef<ProfessionTalentDialogComponent, ProfessionTalentDialogResult | undefined>);
  readonly data = inject<{
    existingTalents?: Array<{ id?: number; name?: string } | string>
  }>(MAT_DIALOG_DATA, {optional: true});

  readonly talentSearchControl = new FormControl('');
  readonly descriptionControl = new FormControl('');

  readonly options$ = this.talentSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) => (q.length >= 3 ? this.talentsApi.search(q).pipe(catchError(() => of([]))) : of([])))
  );

  selectedOption: { id: number; name: string } | null = null;

  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedOption = event.option.value as { id: number; name: string };
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    if (!this.selectedOption) return;
    const description = (this.descriptionControl.value ?? '').toString().trim();
    this.dialogRef.close({
      ...this.selectedOption,
      description: description || undefined,
    });
  }

  get existingTalentNames(): string[] {
    const items = this.data?.existingTalents ?? [];
    return items
      .map((t: any) => (typeof t === 'string' ? t : (t?.name ?? t?.talent?.name)))
      .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }
}
