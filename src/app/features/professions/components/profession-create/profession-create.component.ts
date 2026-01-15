import {booleanAttribute, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatOptionModule} from '@angular/material/core';

import {COMMA, ENTER} from '@angular/cdk/keycodes';

import {finalize} from 'rxjs/operators';
import {catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap} from 'rxjs';

import {ProfessionsApiService} from '../../services/professions-api.service';
import {CreateProfessionPayload} from '../../models/profession.models';
import {SkillsApiService} from '../../../skills/services/skills-api.service';
import {TalentsApiService} from '../../../talents/services/talents-api.service';

@Component({
  selector: 'app-profession-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatOptionModule,
  ],
  templateUrl: './profession-create.component.html',
  styleUrls: ['./profession-create.component.scss'],
})
export class ProfessionCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProfessionsApiService);
  private readonly skillsApi = inject(SkillsApiService);
  private readonly talentsApi = inject(TalentsApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private static readonly MIN_AUTOCOMPLETE_CHARS = 3;

  isSaving = false;

  // transient animation state per control
  animating: Record<string, boolean> = {};
  private timeouts: Record<string, any> = {};

  // separator keys for mat-chip input
  readonly separatorKeysCodes = [ENTER, COMMA];

  // search control + options for autocomplate
  readonly exitSearchControl = new FormControl('');
  exitsOptions$ = this.exitSearchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) => this.api.search(q || '').pipe(catchError(() => of([]))))
  );

  // skills/talents autocomplete (>= 3 znaki)
  readonly skillSearchControl = new FormControl('');
  skillsOptions$ = this.skillSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (v || '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) =>
      q.length >= ProfessionCreateComponent.MIN_AUTOCOMPLETE_CHARS
        ? this.skillsApi.search(q).pipe(catchError(() => of([])))
        : of([])
    )
  );

  readonly talentSearchControl = new FormControl('');
  talentsOptions$ = this.talentSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (v || '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) =>
      q.length >= ProfessionCreateComponent.MIN_AUTOCOMPLETE_CHARS
        ? this.talentsApi.search(q).pipe(catchError(() => of([])))
        : of([])
    )
  );

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],

    weaponSkillsDevelopment: [0, [Validators.required, Validators.min(0)]],
    ballisticSkillsDevelopment: [0, [Validators.required, Validators.min(0)]],
    strengthDevelopment: [0, [Validators.required, Validators.min(0)]],
    toughnessDevelopment: [0, [Validators.required, Validators.min(0)]],
    agilityDevelopment: [0, [Validators.required, Validators.min(0)]],
    intelligenceDevelopment: [0, [Validators.required, Validators.min(0)]],
    willpowerDevelopment: [0, [Validators.required, Validators.min(0)]],
    fellowshipDevelopment: [0, [Validators.required, Validators.min(0)]],

    attacksDevelopment: [0, [Validators.required, Validators.min(0)]],
    woundsDevelopment: [0, [Validators.required, Validators.min(0)]],
    movementDevelopment: [0, [Validators.required, Validators.min(0)]],
    magicDevelopment: [0, [Validators.required, Validators.min(0)]],

    // dynamic lists (skills / talents) - przechowujemy string (ręczny wpis) albo obiekt {id, name} z autocomplete
    skills: this.fb.array([]),
    talents: this.fb.array([]),
    trappings: ['', [Validators.maxLength(2000)]],

    // career exits (chips) - can contain numbers, strings or objects { id, name }
    exitProfessions: this.fb.array([]),
    isAdvanced: booleanAttribute(false)
  });

  // convenience getters for template
  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  get talents(): FormArray {
    return this.form.get('talents') as FormArray;
  }

  // getter for exits FormArray used by template
  get exits(): FormArray {
    return this.form.get('exitProfessions') as FormArray;
  }

  save() {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = this.buildCreatePayload();
    this.api
      .create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (created) => {
          this.snackBar.open('Profesja utworzona', 'OK', {duration: 2500});
          this.router.navigate(['/professions', created.id]);
        },
        error: () => {
          this.snackBar.open('Nie udało się utworzyć profesji', 'OK', {duration: 3500});
        },
      });
  }

  private buildCreatePayload(): CreateProfessionPayload {
    const v = this.form.getRawValue();
    const payload: CreateProfessionPayload = {
      name: v.name,
      description: v.description,
      weaponSkillsDevelopment: v.weaponSkillsDevelopment,
      ballisticSkillsDevelopment: v.ballisticSkillsDevelopment,
      strengthDevelopment: v.strengthDevelopment,
      toughnessDevelopment: v.toughnessDevelopment,
      agilityDevelopment: v.agilityDevelopment,
      intelligenceDevelopment: v.intelligenceDevelopment,
      willpowerDevelopment: v.willpowerDevelopment,
      fellowshipDevelopment: v.fellowshipDevelopment,

      attacksDevelopment: v.attacksDevelopment,
      woundsDevelopment: v.woundsDevelopment,
      movementDevelopment: v.movementDevelopment,
      magicDevelopment: v.magicDevelopment,

      trappings: v.trappings,
    };

    // map skills/talents arrays to number[] of IDs when possible
    const skillsIds: number[] = [];
    for (const s of (v.skills || [])) {
      if (s && typeof s === 'object' && 'id' in s && typeof (s as any).id === 'number') {
        skillsIds.push((s as any).id);
        continue;
      }
      const n = Number(s);
      if (!Number.isNaN(n) && Number.isFinite(n)) skillsIds.push(n);
    }
    if (skillsIds.length) payload.skills = skillsIds;

    const talentsIds: number[] = [];
    for (const t of (v.talents || [])) {
      if (t && typeof t === 'object' && 'id' in t && typeof (t as any).id === 'number') {
        talentsIds.push((t as any).id);
        continue;
      }
      const n = Number(t);
      if (!Number.isNaN(n) && Number.isFinite(n)) talentsIds.push(n);
    }
    if (talentsIds.length) payload.talents = talentsIds;

    // map exit professions: support objects with `id`, numeric strings, and numbers
    const exitIds: number[] = [];
    for (const e of (v.exitProfessions || [])) {
      if (e && typeof e === 'object' && 'id' in e && typeof (e as any).id === 'number') {
        exitIds.push((e as any).id);
        continue;
      }
      const n = Number(e);
      if (!Number.isNaN(n) && Number.isFinite(n)) exitIds.push(n);
    }
    if (exitIds.length) payload.exitProfessions = exitIds;

    return payload;
  }

  // Trigger a short pulse animation for the named control
  private triggerPulse(controlName: string) {
    const DURATION = 300; // ms, keep in sync with CSS animation duration
    // clear existing timeout if present
    if (this.timeouts[controlName]) {
      clearTimeout(this.timeouts[controlName]);
    }
    this.animating[controlName] = true;
    this.timeouts[controlName] = setTimeout(() => {
      this.animating[controlName] = false;
      delete this.timeouts[controlName];
    }, DURATION);
  }

  // Increment a numeric form control by `step` (default 1). Minimum is 0.
  increment(controlName: string, step = 1) {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    const current = Number(ctrl.value ?? 0) || 0;
    ctrl.setValue(Math.max(0, current + step));
    this.triggerPulse(controlName);
  }

  // Decrement a numeric form control by `step` (default 1). Minimum is 0.
  decrement(controlName: string, step = 1) {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    const current = Number(ctrl.value ?? 0) || 0;
    const next = Math.max(0, current - step);
    ctrl.setValue(next);
    this.triggerPulse(controlName);
  }

  // Skills / talents helpers (mat-chip)
  addSkillFromChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.skills.push(new FormControl(value));
    }
    // Clear the input value
    if (event.chipInput) {
      event.chipInput.clear();
    }
    // czyścimy też kontrolkę wyszukiwania, żeby nie zostawał tekst w input
    this.skillSearchControl.setValue('');
  }

  addTalentFromChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.talents.push(new FormControl(value));
    }
    if (event.chipInput) {
      event.chipInput.clear();
    }
    this.talentSearchControl.setValue('');
  }

  removeSkill(index: number) {
    if (index < 0 || index >= this.skills.length) return;
    this.skills.removeAt(index);
  }

  removeTalent(index: number) {
    if (index < 0 || index >= this.talents.length) return;
    this.talents.removeAt(index);
  }

  selectSkill(event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    if (opt && opt.id) {
      this.skills.push(new FormControl({id: opt.id, name: opt.name}));
    }
    this.skillSearchControl.setValue('');
  }

  selectTalent(event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    if (opt && opt.id) {
      this.talents.push(new FormControl({id: opt.id, name: opt.name}));
    }
    this.talentSearchControl.setValue('');
  }

  // Career exits helpers (mat-chip)
  addExitFromChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      // add plain text entry (keeps previous behavior)
      this.exits.push(new FormControl(value));
    }
    if (event.chipInput) {
      event.chipInput.clear();
    }
    // also clear search control
    this.exitSearchControl.setValue('');
  }

  removeExit(index: number) {
    if (index < 0 || index >= this.exits.length) return;
    this.exits.removeAt(index);
  }

  selectExit(event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    if (opt && opt.id) {
      this.exits.push(new FormControl({id: opt.id, name: opt.name}));
    }
    // clear input
    this.exitSearchControl.setValue('');
  }
}
