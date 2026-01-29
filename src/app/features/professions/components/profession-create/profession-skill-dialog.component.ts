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
import {MatSelectModule} from '@angular/material/select';
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
    MatSelectModule,
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

  // Holds IDs of already-added profession-skill links chosen as alternatives
  selectedAlternativeIds: number[] = [];

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

  toggleAlternative(id: number) {
    const i = this.selectedAlternativeIds.indexOf(id);
    if (i >= 0) {
      this.selectedAlternativeIds.splice(i, 1);
    } else {
      this.selectedAlternativeIds.push(id);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    if (!this.selectedOption) return;
    const description = (this.descriptionControl.value ?? '').toString().trim();
    // include alternativeSkill if any selected
    this.dialogRef.close({
      ...this.selectedOption,
      description: description || undefined,
      alternativeSkill: this.selectedAlternativeIds.length ? this.selectedAlternativeIds : undefined,
    } as any);
  }

  get existingSkillNames(): string[] {
    const items = this.data?.existingSkills ?? [];
    return items
      .map((s: any) => (typeof s === 'string' ? s : (s?.name ?? s?.skill?.name)))
      .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }

  // Helper used by template to expose structured existing skills (id + name)
  get existingSkillsStructured(): Array<{ id: number; name: string }> {
    const items = this.data?.existingSkills ?? [];
    return items
      .map((s: any) => ({
        id: typeof s === 'object' ? s?.id : undefined,
        name: typeof s === 'object' ? (s?.name ?? s?.skill?.name) : s
      }))
      .filter((x: any) => typeof x.id === 'number' && typeof x.name === 'string' && x.name.trim().length > 0);
  }
}
