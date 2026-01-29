import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatOptionModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

import {catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap} from 'rxjs';

import {SkillsApiService} from '../../../skills/services/skills-api.service';

@Component({
  selector: 'app-profession-skill-dialog',
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
  templateUrl: './profession-skill-dialog.component.html',
  styleUrls: ['./profession-skill-dialog.component.scss'],
})
export class ProfessionSkillDialogComponent {
  private readonly skillsApi = inject(SkillsApiService);
  private readonly dialogRef = inject(MatDialogRef<ProfessionSkillDialogComponent, {
    id: number;
    name: string
  } | undefined>);
  readonly data = inject<{
    existingSkills?: Array<{ id?: number; name?: string } | string>
  }>(MAT_DIALOG_DATA, {optional: true});

  readonly skillSearchControl = new FormControl('');
  readonly descriptionControl = new FormControl('');

  readonly options$ = this.skillSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) => (q.length >= 3 ? this.skillsApi.search(q).pipe(catchError(() => of([]))) : of([])))
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
    } as any);
  }

  get existingSkillNames(): string[] {
    const items = this.data?.existingSkills ?? [];
    return items
      .map((s: any) => (typeof s === 'string' ? s : (s?.name ?? s?.skill?.name)))
      .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }
}
