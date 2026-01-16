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
import {CreateProfessionPayload, ProfessionSkill, ProfessionTalent} from '../../models/profession.models';
import {SkillsApiService} from '../../../skills/services/skills-api.service';
import {TalentsApiService} from '../../../talents/services/talents-api.service';
import {ProfessionLinksApiService} from '../../services/profession-links-api.service';

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
  private readonly linksApi = inject(ProfessionLinksApiService);
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
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
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
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) =>
      q.length >= ProfessionCreateComponent.MIN_AUTOCOMPLETE_CHARS
        ? this.talentsApi.search(q).pipe(catchError(() => of([])))
        : of([])
    )
  );

  // alternatywy (search per-row)
  private readonly altSkillSearchControls = new Map<number, FormControl<string>>();
  private readonly altTalentSearchControls = new Map<number, FormControl<string>>();

  altSkillControl(i: number): FormControl<string> {
    const existing = this.altSkillSearchControls.get(i);
    if (existing) return existing;
    const ctrl = new FormControl<string>('', {nonNullable: true});
    this.altSkillSearchControls.set(i, ctrl);
    return ctrl;
  }

  altTalentControl(i: number): FormControl<string> {
    const existing = this.altTalentSearchControls.get(i);
    if (existing) return existing;
    const ctrl = new FormControl<string>('', {nonNullable: true});
    this.altTalentSearchControls.set(i, ctrl);
    return ctrl;
  }

  altSkillsOptions$(i: number) {
    return this.altSkillControl(i).valueChanges.pipe(
      startWith(this.altSkillControl(i).value),
      map((v) => (typeof v === 'string' ? v : '').toString().trim()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) =>
        q.length >= ProfessionCreateComponent.MIN_AUTOCOMPLETE_CHARS
          ? this.skillsApi.search(q).pipe(catchError(() => of([])))
          : of([])
      )
    );
  }

  altTalentsOptions$(i: number) {
    return this.altTalentControl(i).valueChanges.pipe(
      startWith(this.altTalentControl(i).value),
      map((v) => (typeof v === 'string' ? v : '').toString().trim()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) =>
        q.length >= ProfessionCreateComponent.MIN_AUTOCOMPLETE_CHARS
          ? this.talentsApi.search(q).pipe(catchError(() => of([])))
          : of([])
      )
    );
  }

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

    // dynamic lists (skills / talents) - przechowujemy encje ProfessionSkill/ProfessionTalent
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

    // map skills/talents arrays to number[] of IDs (ProfessionSkill/ProfessionTalent)
    const skillsIds: number[] = [];
    for (const s of (v.skills || [])) {
      if (s && typeof s === 'object' && 'id' in s && typeof (s as any).id === 'number') {
        skillsIds.push((s as any).id);
      }
    }
    if (skillsIds.length) payload.skills = skillsIds;

    const talentsIds: number[] = [];
    for (const t of (v.talents || [])) {
      if (t && typeof t === 'object' && 'id' in t && typeof (t as any).id === 'number') {
        talentsIds.push((t as any).id);
      }
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
    // ręczne dodawanie wyłączone — backend wymaga istniejących ProfessionSkill
    if (event.chipInput) {
      event.chipInput.clear();
    }
    this.skillSearchControl.setValue('');
    this.snackBar.open('Wybierz umiejętność z listy (autocomplete).', 'OK', {duration: 2500});
  }

  addTalentFromChip(event: MatChipInputEvent) {
    // ręczne dodawanie wyłączone — backend wymaga istniejących ProfessionTalent
    if (event.chipInput) {
      event.chipInput.clear();
    }
    this.talentSearchControl.setValue('');
    this.snackBar.open('Wybierz talent z listy (autocomplete).', 'OK', {duration: 2500});
  }

  removeSkill(index: number) {
    if (index < 0 || index >= this.skills.length) return;

    const current = this.skills.at(index)?.value as any;
    const id = current?.id;
    if (typeof id !== 'number') {
      this.skills.removeAt(index);
      // odśwież listę podpowiedzi
      const q = (this.skillSearchControl.value ?? '').toString();
      this.skillSearchControl.setValue(q);
      return;
    }

    this.linksApi.deleteProfessionSkill(id).subscribe({
      next: () => {
        this.skills.removeAt(index);
        this.altSkillSearchControls.delete(index);
        // przesuwamy map9 index3w (po removeAt wszystko po prawej przesuwa si9 o -1)
        const nextMap = new Map<number, FormControl<string>>();
        for (const [k, v] of this.altSkillSearchControls.entries()) {
          nextMap.set(k > index ? k - 1 : k, v);
        }
        this.altSkillSearchControls.clear();
        for (const [k, v] of nextMap.entries()) this.altSkillSearchControls.set(k, v);

        // odbwiec list9 podpowiedzi (autocomplete)
        const q = (this.skillSearchControl.value ?? '').toString();
        this.skillSearchControl.setValue(q);
      },
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
      // odśwież listę podpowiedzi
      const q = (this.talentSearchControl.value ?? '').toString();
      this.talentSearchControl.setValue(q);
      return;
    }

    this.linksApi.deleteProfessionTalent(id).subscribe({
      next: () => {
        this.talents.removeAt(index);
        this.altTalentSearchControls.delete(index);
        const nextMap = new Map<number, FormControl<string>>();
        for (const [k, v] of this.altTalentSearchControls.entries()) {
          nextMap.set(k > index ? k - 1 : k, v);
        }
        this.altTalentSearchControls.clear();
        for (const [k, v] of nextMap.entries()) this.altTalentSearchControls.set(k, v);

        // odbwiec list9 podpowiedzi (autocomplete)
        const q = (this.talentSearchControl.value ?? '').toString();
        this.talentSearchControl.setValue(q);
      },
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

    // unikamy duplikatów po skill.id
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

    // unikamy duplikatów po talent.id
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

  // --- Alternatywne umiej9tnobci / talenty ---
  selectAlternativeSkill(skillIndex: number, event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    const base = this.skills.at(skillIndex)?.value as any;
    const baseId = base?.id as number | undefined;

    if (!opt?.id || typeof baseId !== 'number') {
      this.altSkillControl(skillIndex).setValue('');
      return;
    }

    const currentAlt: any[] = Array.isArray(base?.alternativeSkill) ? base.alternativeSkill : [];
    const already = currentAlt.some((a) => a?.skill?.id === opt.id || a?.id === opt.id);
    if (already) {
      this.altSkillControl(skillIndex).setValue('');
      return;
    }

    const nextAltSkillIds = [
      ...currentAlt
        .map((a) => a?.skill?.id)
        .filter((id) => typeof id === 'number'),
      opt.id,
    ];

    this.linksApi.updateProfessionSkill(baseId, {alternativeSkill: nextAltSkillIds}).subscribe({
      next: (updated: ProfessionSkill) => {
        this.skills.at(skillIndex)?.setValue(updated);
        this.altSkillControl(skillIndex).setValue('');
      },
      error: () => {
        this.snackBar.open('Nie udało się dodać alternatywnej umiejętności.', 'OK', {duration: 3000});
        this.altSkillControl(skillIndex).setValue('');
      },
    });
  }

  removeAlternativeSkill(skillIndex: number, altIndex: number) {
    const base = this.skills.at(skillIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    if (typeof baseId !== 'number') return;

    const currentAlt: any[] = Array.isArray(base?.alternativeSkill) ? base.alternativeSkill : [];
    const nextAltSkillIds = currentAlt
      .filter((_: any, i: number) => i !== altIndex)
      .map((a) => a?.skill?.id)
      .filter((id) => typeof id === 'number');

    this.linksApi.updateProfessionSkill(baseId, {alternativeSkill: nextAltSkillIds}).subscribe({
      next: (updated: ProfessionSkill) => {
        this.skills.at(skillIndex)?.setValue(updated);
      },
      error: () => {
        this.snackBar.open('Nie udało się usunąć alternatywnej umiejętności.', 'OK', {duration: 3000});
      },
    });
  }

  selectAlternativeTalent(talentIndex: number, event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    const base = this.talents.at(talentIndex)?.value as any;
    const baseId = base?.id as number | undefined;

    if (!opt?.id || typeof baseId !== 'number') {
      this.altTalentControl(talentIndex).setValue('');
      return;
    }

    const currentAlt: any[] = Array.isArray(base?.alternativeTalent) ? base.alternativeTalent : [];
    const already = currentAlt.some((a) => a?.talent?.id === opt.id || a?.id === opt.id);
    if (already) {
      this.altTalentControl(talentIndex).setValue('');
      return;
    }

    const nextAltTalentIds = [
      ...currentAlt
        .map((a) => a?.talent?.id)
        .filter((id) => typeof id === 'number'),
      opt.id,
    ];

    this.linksApi.updateProfessionTalent(baseId, {alternativeTalent: nextAltTalentIds}).subscribe({
      next: (updated: ProfessionTalent) => {
        this.talents.at(talentIndex)?.setValue(updated);
        this.altTalentControl(talentIndex).setValue('');
      },
      error: () => {
        this.snackBar.open('Nie udało się dodać alternatywnego talentu.', 'OK', {duration: 3000});
        this.altTalentControl(talentIndex).setValue('');
      },
    });
  }

  removeAlternativeTalent(talentIndex: number, altIndex: number) {
    const base = this.talents.at(talentIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    if (typeof baseId !== 'number') return;

    const currentAlt: any[] = Array.isArray(base?.alternativeTalent) ? base.alternativeTalent : [];
    const nextAltTalentIds = currentAlt
      .filter((_: any, i: number) => i !== altIndex)
      .map((a) => a?.talent?.id)
      .filter((id) => typeof id === 'number');

    this.linksApi.updateProfessionTalent(baseId, {alternativeTalent: nextAltTalentIds}).subscribe({
      next: (updated: ProfessionTalent) => {
        this.talents.at(talentIndex)?.setValue(updated);
      },
      error: () => {
        this.snackBar.open('Nie udało się usunąć alternatywnego talentu.', 'OK', {duration: 3000});
      },
    });
  }

  // --- Alternatywy wybierane z juc dodanych ---
  addAlternativeSkillFromExisting(skillIndex: number, altSkillId: number) {
    const base = this.skills.at(skillIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    const baseSkillId = base?.skill?.id as number | undefined;

    if (typeof baseId !== 'number' || !Number.isFinite(altSkillId)) return;
    if (typeof baseSkillId === 'number' && altSkillId === baseSkillId) {
      this.snackBar.open('Nie możesz dodać jako alternatywy tej samej umiejętności.', 'OK', {duration: 2500});
      return;
    }

    const currentAlt: any[] = Array.isArray(base?.alternativeSkill) ? base.alternativeSkill : [];
    const already = currentAlt.some((a) => a?.skill?.id === altSkillId);
    if (already) return;

    const nextAltSkillIds = [
      ...currentAlt
        .map((a) => a?.skill?.id)
        .filter((id) => typeof id === 'number'),
      altSkillId,
    ];

    this.linksApi.updateProfessionSkill(baseId, {alternativeSkill: nextAltSkillIds}).subscribe({
      next: (updated: ProfessionSkill) => {
        this.skills.at(skillIndex)?.setValue(updated);
      },
      error: () => {
        this.snackBar.open('Nie udało się dodać alternatywnej umiejętności.', 'OK', {duration: 3000});
      },
    });
  }

  addAlternativeTalentFromExisting(talentIndex: number, altTalentId: number) {
    const base = this.talents.at(talentIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    const baseTalentId = base?.talent?.id as number | undefined;

    if (typeof baseId !== 'number' || !Number.isFinite(altTalentId)) return;
    if (typeof baseTalentId === 'number' && altTalentId === baseTalentId) {
      this.snackBar.open('Nie możesz dodać jako alternatywy tego samego talentu.', 'OK', {duration: 2500});
      return;
    }

    const currentAlt: any[] = Array.isArray(base?.alternativeTalent) ? base.alternativeTalent : [];
    const already = currentAlt.some((a) => a?.talent?.id === altTalentId);
    if (already) return;

    const nextAltTalentIds = [
      ...currentAlt
        .map((a) => a?.talent?.id)
        .filter((id) => typeof id === 'number'),
      altTalentId,
    ];

    this.linksApi.updateProfessionTalent(baseId, {alternativeTalent: nextAltTalentIds}).subscribe({
      next: (updated: ProfessionTalent) => {
        this.talents.at(talentIndex)?.setValue(updated);
      },
      error: () => {
        this.snackBar.open('Nie udało się dodać alternatywnego talentu.', 'OK', {duration: 3000});
      },
    });
  }

  parseNumberValue(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
}
