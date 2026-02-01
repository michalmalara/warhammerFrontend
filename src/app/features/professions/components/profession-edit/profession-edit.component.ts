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
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

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
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {ProfessionSkillDialogComponent} from '../profession-create/profession-skill-dialog.component';
import {
  ProfessionTalentDialogComponent,
  type ProfessionTalentDialogResult
} from '../profession-create/profession-talent-dialog.component';

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
    MatDialogModule,
    WaxSealButtonComponent,
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
  private readonly dialog = inject(MatDialog);

  private static readonly MIN_AUTOCOMPLETE_CHARS = 3;

  isSaving = false;
  isLoading = true;

  private professionId!: number;

  // transient animation state per control (współdzielony template z create)
  animating: Record<string, boolean> = {};
  private timeouts: Record<string, any> = {};

  // Trigger a short pulse animation for the named control
  private triggerPulse(controlName: string) {
    const DURATION = 300;
    if (this.timeouts[controlName]) {
      clearTimeout(this.timeouts[controlName]);
    }
    this.animating[controlName] = true;
    this.timeouts[controlName] = setTimeout(() => {
      this.animating[controlName] = false;
      delete this.timeouts[controlName];
    }, DURATION);
  }

  increment(controlName: string, step = 1) {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    const current = Number(ctrl.value ?? 0) || 0;
    ctrl.setValue(Math.max(0, current + step));
    this.triggerPulse(controlName);
  }

  decrement(controlName: string, step = 1) {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    const current = Number(ctrl.value ?? 0) || 0;
    const next = Math.max(0, current - step);
    ctrl.setValue(next);
    this.triggerPulse(controlName);
  }

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

  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  get talents(): FormArray {
    return this.form.get('talents') as FormArray;
  }

  get exits(): FormArray {
    return this.form.get('exitProfessions') as FormArray;
  }

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
        q.length >= ProfessionEditComponent.MIN_AUTOCOMPLETE_CHARS
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
        q.length >= ProfessionEditComponent.MIN_AUTOCOMPLETE_CHARS
          ? this.talentsApi.search(q).pipe(catchError(() => of([])))
          : of([])
      )
    );
  }

  // --- UI state: pokazywanie panelu alternatyw per-wiersz (wspólny template z create) ---
  private readonly altSkillPickerVisible = new Map<number, boolean>();
  private readonly altTalentPickerVisible = new Map<number, boolean>();

  isAltSkillPickerVisible(i: number): boolean {
    return this.altSkillPickerVisible.get(i) ?? false;
  }

  toggleAltSkillPicker(i: number) {
    this.altSkillPickerVisible.set(i, !this.isAltSkillPickerVisible(i));
  }

  isAltTalentPickerVisible(i: number): boolean {
    return this.altTalentPickerVisible.get(i) ?? false;
  }

  toggleAltTalentPicker(i: number) {
    this.altTalentPickerVisible.set(i, !this.isAltTalentPickerVisible(i));
  }

  // Index of recently added skill/talent used by shared template to highlight & scroll into view
  addedSkillIndex = -1;
  addedTalentIndex = -1;

  private markAndScrollSkill(index: number) {
    this.addedSkillIndex = index;
    setTimeout(() => {
      try {
        const el = document.querySelector(`[data-added-skill="${index}"]`);
        (el as HTMLElement | null)?.scrollIntoView({behavior: 'smooth', block: 'center'});
      } catch (e) {
      }
    }, 60);
    setTimeout(() => (this.addedSkillIndex = -1), 2200);
  }

  private markAndScrollTalent(index: number) {
    this.addedTalentIndex = index;
    setTimeout(() => {
      try {
        const el = document.querySelector(`[data-added-talent="${index}"]`);
        (el as HTMLElement | null)?.scrollIntoView({behavior: 'smooth', block: 'center'});
      } catch (e) {
      }
    }, 60);
    setTimeout(() => (this.addedTalentIndex = -1), 2200);
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
          this.snackBar.open($localize`:Snackbar@@profession.edit.load.failed:Failed to load profession`, 'OK', {duration: 3500});
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
          this.snackBar.open($localize`:Snackbar@@profession.edit.saved:Profession saved`, 'OK', {duration: 2500});
          this.router.navigate(['/professions', updated.id]);
        },
        error: () => {
          this.snackBar.open($localize`:Snackbar@@profession.edit.save.failed:Failed to save profession`, 'OK', {duration: 3500});
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
    this.snackBar.open($localize`:Snackbar@@profession.edit.chooseSkill.autocomplete:Choose a skill from the list (autocomplete).`, 'OK', {duration: 2500});
  }

  addTalentFromChip(event: MatChipInputEvent) {
    if (event.chipInput) event.chipInput.clear();
    this.talentSearchControl.setValue('');
    this.snackBar.open($localize`:Snackbar@@profession.edit.chooseTalent.autocomplete:Choose a talent from the list (autocomplete).`, 'OK', {duration: 2500});
  }

  removeSkill(index: number) {
    if (index < 0 || index >= this.skills.length) return;

    const current = this.skills.at(index)?.value as any;
    const id = current?.id;
    if (typeof id !== 'number') {
      this.skills.removeAt(index);

      // przesuwamy stan widoczności
      this.altSkillPickerVisible.delete(index);
      const nextVisible = new Map<number, boolean>();
      for (const [k, v] of this.altSkillPickerVisible.entries()) {
        nextVisible.set(k > index ? k - 1 : k, v);
      }
      this.altSkillPickerVisible.clear();
      for (const [k, v] of nextVisible.entries()) this.altSkillPickerVisible.set(k, v);

      return;
    }

    this.linksApi.deleteProfessionSkill(id).subscribe({
      next: () => {
        this.skills.removeAt(index);
        this.altSkillSearchControls.delete(index);

        // przesuwamy searchControls
        const nextSearchControls = new Map<number, FormControl<string>>();
        for (const [k, v] of this.altSkillSearchControls.entries()) {
          if (k > index) {
            nextSearchControls.set(k - 1, v);
          } else if (k < index) {
            nextSearchControls.set(k, v);
          }
        }
        this.altSkillSearchControls.clear();
        for (const [k, v] of nextSearchControls.entries()) this.altSkillSearchControls.set(k, v);

        // przesuwamy stan widoczności
        this.altSkillPickerVisible.delete(index);
        const nextVisible = new Map<number, boolean>();
        for (const [k, v] of this.altSkillPickerVisible.entries()) {
          nextVisible.set(k > index ? k - 1 : k, v);
        }
        this.altSkillPickerVisible.clear();
        for (const [k, v] of nextVisible.entries()) this.altSkillPickerVisible.set(k, v);
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.edit.remove.skill.failed:Failed to remove skill from server.`, 'OK', {duration: 3000});
      },
    });
  }

  removeTalent(index: number) {
    if (index < 0 || index >= this.talents.length) return;

    const current = this.talents.at(index)?.value as any;
    const id = current?.id;
    if (typeof id !== 'number') {
      this.talents.removeAt(index);

      // przesuwamy stan widoczności
      this.altTalentPickerVisible.delete(index);
      const nextVisible = new Map<number, boolean>();
      for (const [k, v] of this.altTalentPickerVisible.entries()) {
        nextVisible.set(k > index ? k - 1 : k, v);
      }
      this.altTalentPickerVisible.clear();
      for (const [k, v] of nextVisible.entries()) this.altTalentPickerVisible.set(k, v);

      return;
    }

    this.linksApi.deleteProfessionTalent(id).subscribe({
      next: () => {
        this.talents.removeAt(index);
        this.altTalentSearchControls.delete(index);

        // przesuwamy searchControls
        const nextSearchControls = new Map<number, FormControl<string>>();
        for (const [k, v] of this.altTalentSearchControls.entries()) {
          if (k > index) {
            nextSearchControls.set(k - 1, v);
          } else if (k < index) {
            nextSearchControls.set(k, v);
          }
        }
        this.altTalentSearchControls.clear();
        for (const [k, v] of nextSearchControls.entries()) this.altTalentSearchControls.set(k, v);

        // przesuwamy stan widoczności
        this.altTalentPickerVisible.delete(index);
        const nextVisible = new Map<number, boolean>();
        for (const [k, v] of this.altTalentPickerVisible.entries()) {
          nextVisible.set(k > index ? k - 1 : k, v);
        }
        this.altTalentPickerVisible.clear();
        for (const [k, v] of nextVisible.entries()) this.altTalentPickerVisible.set(k, v);
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.edit.remove.talent.failed:Failed to remove talent from server.`, 'OK', {duration: 3000});
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
        this.markAndScrollSkill(this.skills.length - 1);
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.edit.add.skill.failed:Failed to add skill to profession.`, 'OK', {duration: 3000});
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

    const selectedDesc = '';
    const already = this.talents.controls.some((c) => {
      const v = c.value as any;
      return v?.talent?.id === opt.id && this.getTalentDescription(v) === selectedDesc;
    });
    if (already) {
      this.talentSearchControl.setValue('');
      return;
    }

    this.linksApi.createProfessionTalent({talent: opt.id}).subscribe({
      next: (created: ProfessionTalent) => {
        this.talents.push(new FormControl<ProfessionTalent>(created));
        this.markAndScrollTalent(this.talents.length - 1);
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.edit.add.talent.failed:Failed to add talent to profession.`, 'OK', {duration: 3000});
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
        this.snackBar.open($localize`:Snackbar@@profession.edit.add.alternative.skill.failed:Failed to add alternative skill.`, 'OK', {duration: 3000});
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
        this.snackBar.open($localize`:Snackbar@@profession.edit.remove.alternative.skill.failed:Failed to remove alternative skill.`, 'OK', {duration: 3000});
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
        this.snackBar.open($localize`:Snackbar@@profession.edit.add.alternative.talent.failed:Failed to add alternative talent.`, 'OK', {duration: 3000});
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
        this.snackBar.open($localize`:Snackbar@@profession.edit.remove.alternative.talent.failed:Failed to remove alternative talent.`, 'OK', {duration: 3000});
      },
    });
  }

  addAlternativeSkillFromExisting(skillIndex: number, altSkillId: number) {
    const base = this.skills.at(skillIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    const baseSkillId = base?.skill?.id as number | undefined;

    if (typeof baseId !== 'number' || typeof altSkillId !== 'number') return;
    if (typeof baseSkillId === 'number' && altSkillId === baseSkillId) {
      this.snackBar.open($localize`:Snackbar@@profession.edit.alt.sameSkill:You cannot add the same skill as an alternative.`, 'OK', {duration: 2500});
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
        this.snackBar.open($localize`:Snackbar@@profession.edit.add.alternative.skill.failed:Failed to add alternative skill.`, 'OK', {duration: 3000});
      },
    });
  }

  addAlternativeTalentFromExisting(talentIndex: number, altTalentId: number) {
    const base = this.talents.at(talentIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    const baseTalentId = base?.talent?.id as number | undefined;

    if (typeof baseId !== 'number' || typeof altTalentId !== 'number') return;
    if (typeof baseTalentId === 'number' && altTalentId === baseTalentId) {
      this.snackBar.open($localize`:Snackbar@@profession.edit.alt.sameTalent:You cannot add the same talent as an alternative.`, 'OK', {duration: 2500});
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
        this.snackBar.open($localize`:Snackbar@@profession.edit.add.alternative.talent.failed:Failed to add alternative talent.`, 'OK', {duration: 3000});
      },
    });
  }

  parseNumberValue(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  isSkillRenderedAsAlternative(i: number): boolean {
    const current = this.skills.at(i)?.value as any;
    const currentSkillId = current?.skill?.id;
    if (typeof currentSkillId !== 'number') return false;

    for (let j = 0; j < this.skills.length; j++) {
      if (j === i) continue;
      const other = this.skills.at(j)?.value as any;
      const alt = Array.isArray(other?.alternativeSkill) ? other.alternativeSkill : [];
      if (alt.some((a: any) => a?.skill?.id === currentSkillId)) return true;
    }
    return false;
  }

  isTalentRenderedAsAlternative(i: number): boolean {
    const current = this.talents.at(i)?.value as any;
    const currentTalentId = current?.talent?.id;
    if (typeof currentTalentId !== 'number') return false;

    for (let j = 0; j < this.talents.length; j++) {
      if (j === i) continue;
      const other = this.talents.at(j)?.value as any;
      const alt = Array.isArray(other?.alternativeTalent) ? other.alternativeTalent : [];
      if (alt.some((a: any) => a?.talent?.id === currentTalentId)) return true;
    }
    return false;
  }

  openAddSkillDialog() {
    const existingSkills = this.skills.controls
      .map((c) => c.value as any)
      .filter((v) => v && typeof v === 'object')
      .map((v) => ({
        id: v.id as number | undefined,
        name: v?.skill?.name ?? v?.name,
        alternativeSkillIds: Array.isArray(v?.alternativeSkill)
          ? v.alternativeSkill
            .map((a: any) => a?.id ?? a?.skill?.id)
            .filter((id: any) => typeof id === 'number')
          : [],
      }))
      .filter((s) => typeof s.id === 'number' && typeof s.name === 'string' && s.name.trim().length > 0);

    const ref = this.dialog.open(ProfessionSkillDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'wax-dialog-panel',
      backdropClass: 'wax-dialog-backdrop',
      data: {existingSkills},
    });
    ref.afterClosed().subscribe((selected: {
      id: number;
      name: string;
      description?: string;
      alternativeSkill?: number[]
    } | undefined) => {
      if (!selected?.id) return;

      const selectedDesc = typeof selected.description === 'string' ? selected.description : '';
      const already = this.skills.controls.some((c) => {
        const v = c.value as any;
        return v?.skill?.id === selected.id && this.getSkillDescription(v) === selectedDesc;
      });
      if (already) {
        this.snackBar.open(
          $localize`:Snackbar@@profession.create.add.skill.duplicate:Skill already added.`,
          'OK',
          {duration: 2000}
        );
        return;
      }

      const payload: any = {skill: selected.id};
      if (typeof selected.description === 'string' && selected.description.trim().length) {
        payload.description = selected.description.trim();
      }
      if (Array.isArray(selected.alternativeSkill) && selected.alternativeSkill.length) {
        payload.alternativeSkill = selected.alternativeSkill;
      }

      this.linksApi.createProfessionSkill(payload).subscribe({
        next: (created: ProfessionSkill) => {
          this.skills.push(new FormControl<ProfessionSkill>(created));
          this.refreshSkillsOptions();
        },
        error: () => {
          this.snackBar.open(
            $localize`:Snackbar@@profession.create.add.skill.failed:Failed to add skill to profession.`,
            'OK',
            {duration: 3000}
          );
        },
      });
    });
  }

  openAddTalentDialog() {
    const existingTalents = this.talents.controls
      .map((c) => (c.value as any)?.talent?.name ?? (c.value as any)?.name ?? (c.value as any))
      .filter((v) => typeof v === 'string' && v.trim().length > 0);

    const ref = this.dialog.open(ProfessionTalentDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'wax-dialog-panel',
      backdropClass: 'wax-dialog-backdrop',
      data: {existingTalents},
    });

    ref.afterClosed().subscribe((selected: ProfessionTalentDialogResult | undefined) => {
      if (!selected?.id) return;

      const already = this.talents.controls.some((c) => {
        const v = c.value as any;
        return v?.talent?.id === selected.id;
      });
      if (already) {
        this.snackBar.open(
          $localize`:Snackbar@@profession.create.add.talent.duplicate:Talent already added.`,
          'OK',
          {duration: 2000}
        );
        return;
      }

      const payload: any = {talent: selected.id};
      if (typeof selected.description === 'string' && selected.description.trim().length) {
        payload.description = selected.description.trim();
      }
      if (Array.isArray((selected as any).alternativeTalent) && (selected as any).alternativeTalent.length) {
        payload.alternativeTalent = (selected as any).alternativeTalent;
      }

      this.linksApi.createProfessionTalent(payload).subscribe({
        next: (created: ProfessionTalent) => {
          this.talents.push(new FormControl<ProfessionTalent>(created));
        },
        error: () => {
          this.snackBar.open(
            $localize`:Snackbar@@profession.create.add.talent.failed:Failed to add talent to profession.`,
            'OK',
            {duration: 3000}
          );
        },
      });
    });
  }

  /** Forces refresh of skills autocomplete streams by re-emitting the current value. */
  private refreshSkillsOptions() {
    const q = (this.skillSearchControl.value ?? '').toString();
    this.skillSearchControl.setValue(q);
  }

  getSkillDescription(value: unknown): string {
    const d = (value as any)?.description;
    return typeof d === 'string' ? d : '';
  }

  getTalentDescription(value: unknown): string {
    const d = (value as any)?.description;
    return typeof d === 'string' ? d : '';
  }
}
