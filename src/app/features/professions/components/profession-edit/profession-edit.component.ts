import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';

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

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  take
} from 'rxjs';

import {ProfessionsApiService, type ProfessionUpsertPayload} from '../../services/professions-api.service';
import type {Profession, ProfessionSkill, ProfessionTalent} from '../../models/profession.models';
import {SkillsApiService} from '../../../skills/services/skills-api.service';
import {TalentsApiService} from '../../../talents/services/talents-api.service';
import {ProfessionLinksApiService} from '../../services/profession-links-api.service';

@Component({
  selector: 'app-profession-edit',
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
  templateUrl: '../profession-create/profession-create.component.html',
  styleUrls: ['../profession-create/profession-create.component.scss'],
})
export class ProfessionEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProfessionsApiService);
  private readonly skillsApi = inject(SkillsApiService);
  private readonly talentsApi = inject(TalentsApiService);
  private readonly linksApi = inject(ProfessionLinksApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private static readonly MIN_AUTOCOMPLETE_CHARS = 3;

  isSaving = false;
  isLoading = true;

  private professionId!: number;

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
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) =>
      q.length >= ProfessionEditComponent.MIN_AUTOCOMPLETE_CHARS
        ? this.skillsApi.search(q).pipe(catchError(() => of([])))
        : of([])
    )
  );

  readonly talentSearchControl = new FormControl('');
  talentsOptions$ = this.talentSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) =>
      q.length >= ProfessionEditComponent.MIN_AUTOCOMPLETE_CHARS
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

    skills: this.fb.array([]),
    talents: this.fb.array([]),
    trappings: ['', [Validators.maxLength(2000)]],

    exitProfessions: this.fb.array([]),

    // create template używa tego pola do toggle; w trybie edycji nie mapujemy na backend
    isAdvanced: false,
  });

  // convenience getters for template
  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  get talents(): FormArray {
    return this.form.get('talents') as FormArray;
  }

  get exits(): FormArray {
    return this.form.get('exitProfessions') as FormArray;
  }

  // transient animation state per control (współdzielony template z create)
  animating: Record<string, boolean> = {};
  private timeouts: Record<string, any> = {};

  // Trigger a short pulse animation for the named control
  private triggerPulse(controlName: string) {
    const DURATION = 300; // ms, keep in sync with CSS animation duration
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

  constructor() {
    // Wczytaj profesję i ustaw form
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        filter((id): id is string => !!id),
        map((id) => Number(id)),
        filter((id) => Number.isFinite(id)),
        take(1),
        switchMap((id) => {
          this.professionId = id;
          return this.api.getById(id);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (p) => this.patchFromProfession(p),
        error: () => {
          this.snackBar.open('Nie udało się wczytać profesji', 'OK', {duration: 3500});
          this.router.navigate(['/professions']);
        },
      });
  }

  save() {
    if (this.form.invalid || this.isSaving || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = this.buildPatchPayload();

    this.api
      .patch(this.professionId, payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (updated) => {
          this.snackBar.open('Profesja zapisana', 'OK', {duration: 2500});
          this.router.navigate(['/professions', updated.id]);
        },
        error: () => {
          this.snackBar.open('Nie udało się zapisać profesji', 'OK', {duration: 3500});
        },
      });
  }

  private patchFromProfession(p: Profession) {
    this.form.patchValue({
      name: p.name,
      description: p.description,

      weaponSkillsDevelopment: p.weaponSkillsDevelopment,
      ballisticSkillsDevelopment: p.ballisticSkillsDevelopment,
      strengthDevelopment: p.strengthDevelopment,
      toughnessDevelopment: p.toughnessDevelopment,
      agilityDevelopment: p.agilityDevelopment,
      intelligenceDevelopment: p.intelligenceDevelopment,
      willpowerDevelopment: p.willpowerDevelopment,
      fellowshipDevelopment: p.fellowshipDevelopment,

      attacksDevelopment: p.attacksDevelopment,
      woundsDevelopment: p.woundsDevelopment,
      movementDevelopment: p.movementDevelopment,
      magicDevelopment: p.magicDevelopment,

      trappings: (p as any).trappings ?? '',

      isAdvanced: (p.entryProfessions?.length ?? 0) > 0,
    });

    // skills / talents = trzymamy całe obiekty ProfessionSkill/ProfessionTalent v2
    this.skills.clear();
    for (const s of p.skills ?? []) {
      this.skills.push(new FormControl<ProfessionSkill>(s));
    }

    this.talents.clear();
    for (const t of p.talents ?? []) {
      this.talents.push(new FormControl<ProfessionTalent>(t));
    }

    this.exits.clear();
    for (const e of p.exitProfessions ?? []) {
      this.exits.push(new FormControl({id: e.id, name: e.name}));
    }
  }

  private buildPatchPayload(): ProfessionUpsertPayload {
    const v = this.form.getRawValue();

    const payload: ProfessionUpsertPayload = {
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

    const skillsIds: number[] = [];
    for (const s of v.skills || []) {
      if (s && typeof s === 'object' && 'id' in s && typeof (s as any).id === 'number') {
        skillsIds.push((s as any).id);
      }
    }
    payload.skills = skillsIds;

    const talentsIds: number[] = [];
    for (const t of v.talents || []) {
      if (t && typeof t === 'object' && 'id' in t && typeof (t as any).id === 'number') {
        talentsIds.push((t as any).id);
      }
    }
    payload.talents = talentsIds;

    const exitIds: number[] = [];
    for (const e of v.exitProfessions || []) {
      if (e && typeof e === 'object' && 'id' in e && typeof (e as any).id === 'number') {
        exitIds.push((e as any).id);
        continue;
      }
      const n = Number(e);
      if (!Number.isNaN(n) && Number.isFinite(n)) exitIds.push(n);
    }
    payload.exitProfessions = exitIds;

    return payload;
  }

  // Skills / talents helpers (mat-chip)
  addSkillFromChip(event: MatChipInputEvent) {
    if (event.chipInput) event.chipInput.clear();
    this.skillSearchControl.setValue('');
    this.snackBar.open('Wybierz umiejętność z listy (autocomplete).', 'OK', {duration: 2500});
  }

  addTalentFromChip(event: MatChipInputEvent) {
    if (event.chipInput) event.chipInput.clear();
    this.talentSearchControl.setValue('');
    this.snackBar.open('Wybierz talent z listy (autocomplete).', 'OK', {duration: 2500});
  }

  removeSkill(index: number) {
    if (index < 0 || index >= this.skills.length) return;

    const current = this.skills.at(index)?.value as any;
    const id = current?.id;
    if (typeof id !== 'number') {
      this.skills.removeAt(index);
      return;
    }

    this.linksApi.deleteProfessionSkill(id).subscribe({
      next: () => this.skills.removeAt(index),
      error: () => {
        this.snackBar.open('Nie udało się usunąć umiejętności z bazy.', 'OK', {duration: 3000});
      },
    });
  }

  removeTalent(index: number) {
    if (index < 0 || index >= this.talents.length) return;

    const current = this.talents.at(index)?.value as any;
    const id = current?.id;
    if (typeof id !== 'number') {
      this.talents.removeAt(index);
      return;
    }

    this.linksApi.deleteProfessionTalent(id).subscribe({
      next: () => this.talents.removeAt(index),
      error: () => {
        this.snackBar.open('Nie udało się usunąć talentu z bazy.', 'OK', {duration: 3000});
      },
    });
  }

  selectSkill(event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    if (!opt || !opt.id) {
      this.skillSearchControl.setValue('');
      return;
    }

    const already = this.skills.controls.some((c) => {
      const v = c.value as any;
      return v?.skill?.id === opt.id;
    });
    if (already) {
      this.skillSearchControl.setValue('');
      return;
    }

    this.linksApi.createProfessionSkill({skill: opt.id}).subscribe({
      next: (created) => {
        this.skills.push(new FormControl<ProfessionSkill>(created));
      },
      error: () => {
        this.snackBar.open('Nie udało się dodać umiejętności do profesji.', 'OK', {duration: 3000});
      },
    });

    this.skillSearchControl.setValue('');
  }

  selectTalent(event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    if (!opt || !opt.id) {
      this.talentSearchControl.setValue('');
      return;
    }

    const already = this.talents.controls.some((c) => {
      const v = c.value as any;
      return v?.talent?.id === opt.id;
    });
    if (already) {
      this.talentSearchControl.setValue('');
      return;
    }

    this.linksApi.createProfessionTalent({talent: opt.id}).subscribe({
      next: (created) => {
        this.talents.push(new FormControl<ProfessionTalent>(created));
      },
      error: () => {
        this.snackBar.open('Nie udało się dodać talentu do profesji.', 'OK', {duration: 3000});
      },
    });

    this.talentSearchControl.setValue('');
  }

  // Career exits helpers (mat-chip)
  addExitFromChip(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.exits.push(new FormControl(value));
    }
    if (event.chipInput) {
      event.chipInput.clear();
    }
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
    this.exitSearchControl.setValue('');
  }
}
