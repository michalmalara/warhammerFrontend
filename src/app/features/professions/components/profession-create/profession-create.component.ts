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
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

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
    WaxSealButtonComponent,
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

  // --- UI state: pokazywanie panelu alternatyw per-wiersz ---
  private readonly altSkillPickerVisible = new Map<number, boolean>();
  private readonly altTalentPickerVisible = new Map<number, boolean>();

  isAltSkillPickerVisible(i: number): boolean {
    return this.altSkillPickerVisible.get(i) ?? false;
  }

  toggleAltSkillPicker(i: number) {
    this.altSkillPickerVisible.set(i, !this.isAltSkillPickerVisible(i));
  }

  hideAltSkillPicker(i: number) {
    this.altSkillPickerVisible.set(i, false);
  }

  isAltTalentPickerVisible(i: number): boolean {
    return this.altTalentPickerVisible.get(i) ?? false;
  }

  toggleAltTalentPicker(i: number) {
    this.altTalentPickerVisible.set(i, !this.isAltTalentPickerVisible(i));
  }

  hideAltTalentPicker(i: number) {
    this.altTalentPickerVisible.set(i, false);
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
          this.snackBar.open($localize`:Snackbar@@profession.create.success:Profession created`, 'OK', {duration: 2500});
          this.router.navigate(['/professions', created.id]);
        },
        error: () => {
          this.snackBar.open($localize`:Snackbar@@profession.create.failed:Failed to create profession`, 'OK', {duration: 3500});
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
    this.snackBar.open($localize`:Snackbar@@profession.create.chooseSkill.autocomplete:Choose a skill from the list (autocomplete).`, 'OK', {duration: 2500});
  }

  addTalentFromChip(event: MatChipInputEvent) {
    // ręczne dodawanie wyłączone — backend wymaga istniejących ProfessionTalent
    if (event.chipInput) {
      event.chipInput.clear();
    }
    this.talentSearchControl.setValue('');
    this.snackBar.open($localize`:Snackbar@@profession.create.chooseTalent.autocomplete:Choose a talent from the list (autocomplete).`, 'OK', {duration: 2500});
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

      // odśwież listę podpowiedzi
      this.refreshSkillsOptions();
      return;
    }

    this.linksApi.deleteProfessionSkill(id).subscribe({
      next: () => {
        this.skills.removeAt(index);
        this.altSkillSearchControls.delete(index);

        // przesuwamy mapę kontrolek autocomplete alternatyw
        const nextMap = new Map<number, FormControl<string>>();
        for (const [k, v] of this.altSkillSearchControls.entries()) {
          nextMap.set(k > index ? k - 1 : k, v);
        }
        this.altSkillSearchControls.clear();
        for (const [k, v] of nextMap.entries()) this.altSkillSearchControls.set(k, v);

        // przesuwamy stan widoczności
        this.altSkillPickerVisible.delete(index);
        const nextVisible = new Map<number, boolean>();
        for (const [k, v] of this.altSkillPickerVisible.entries()) {
          nextVisible.set(k > index ? k - 1 : k, v);
        }
        this.altSkillPickerVisible.clear();
        for (const [k, v] of nextVisible.entries()) this.altSkillPickerVisible.set(k, v);

        // odśwież listę podpowiedzi (autocomplete)
        this.refreshSkillsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.remove.skill.failed:Failed to remove skill from server.`, 'OK', {duration: 3000});
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

      // odśwież listę podpowiedzi
      this.refreshTalentsOptions();
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

        // przesuwamy stan widoczności
        this.altTalentPickerVisible.delete(index);
        const nextVisible = new Map<number, boolean>();
        for (const [k, v] of this.altTalentPickerVisible.entries()) {
          nextVisible.set(k > index ? k - 1 : k, v);
        }
        this.altTalentPickerVisible.clear();
        for (const [k, v] of nextVisible.entries()) this.altTalentPickerVisible.set(k, v);

        // odśwież listę podpowiedzi (autocomplete)
        this.refreshTalentsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.remove.talent.failed:Failed to remove talent from server.`, 'OK', {duration: 3000});
      },
    });
  }

  // Skills / talents helpers (autocomplete)
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
        this.refreshSkillsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.add.skill.failed:Failed to add skill to profession.`, 'OK', {duration: 3000});
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
        this.refreshTalentsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.add.talent.failed:Failed to add talent to profession.`, 'OK', {duration: 3000});
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

  // --- Alternatywne umiejętności / talenty ---
  selectAlternativeSkill(skillIndex: number, event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    // opt.id to ID encji ProfessionSkill (zgodnie z backendowym serializerem)
    this.addAlternativeSkillByLinkId(skillIndex, opt?.id);
    this.altSkillControl(skillIndex).setValue('');
  }

  selectAlternativeTalent(talentIndex: number, event: MatAutocompleteSelectedEvent) {
    const opt = event.option.value as { id: number; name: string };
    // opt.id to ID encji ProfessionTalent (zgodnie z backendowym serializerem)
    this.addAlternativeTalentByLinkId(talentIndex, opt?.id);
    this.altTalentControl(talentIndex).setValue('');
  }

  private addAlternativeSkillByLinkId(skillIndex: number, altProfessionSkillId: number) {
    const base = this.skills.at(skillIndex)?.value as any;
    const baseId = base?.id as number | undefined;

    if (typeof baseId !== 'number' || !Number.isFinite(altProfessionSkillId)) return;

    // zakaz dodania samego siebie jako alternatywy
    if (altProfessionSkillId === baseId) {
      this.snackBar.open($localize`:Snackbar@@profession.create.alt.skill.same:You cannot add the same skill as an alternative.`, 'OK', {duration: 2500});
      return;
    }

    const currentAlt: any[] = Array.isArray(base?.alternativeSkill) ? base.alternativeSkill : [];
    const already = currentAlt.some((a) => a?.id === altProfessionSkillId);
    if (already) return;

    const nextAltIds = [
      ...currentAlt
        .map((a) => a?.id)
        .filter((id) => typeof id === 'number'),
      altProfessionSkillId,
    ];

    this.linksApi.updateProfessionSkill(baseId, {alternativeSkill: nextAltIds}).subscribe({
      next: (updated: ProfessionSkill) => {
        this.skills.at(skillIndex)?.setValue(updated);
        this.refreshSkillsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.add.alternative.skill.failed:Failed to add alternative skill.`, 'OK', {duration: 3000});
      },
    });
  }

  removeAlternativeSkill(skillIndex: number, altIndex: number) {
    const base = this.skills.at(skillIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    if (typeof baseId !== 'number') return;

    const currentAlt: any[] = Array.isArray(base?.alternativeSkill) ? base.alternativeSkill : [];
    const nextAltIds = currentAlt
      .filter((_: any, i: number) => i !== altIndex)
      .map((a) => a?.id)
      .filter((id) => typeof id === 'number');

    this.linksApi.updateProfessionSkill(baseId, {alternativeSkill: nextAltIds}).subscribe({
      next: (updated: ProfessionSkill) => {
        this.skills.at(skillIndex)?.setValue(updated);
        this.refreshSkillsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.remove.alternative.skill.failed:Failed to remove alternative skill.`, 'OK', {duration: 3000});
      },
    });
  }

  private addAlternativeTalentByLinkId(talentIndex: number, altProfessionTalentId: number) {
    const base = this.talents.at(talentIndex)?.value as any;
    const baseId = base?.id as number | undefined;

    if (typeof baseId !== 'number' || !Number.isFinite(altProfessionTalentId)) return;

    if (altProfessionTalentId === baseId) {
      this.snackBar.open($localize`:Snackbar@@profession.create.alt.talent.same:You cannot add the same talent as an alternative.`, 'OK', {duration: 2500});
      return;
    }

    const currentAlt: any[] = Array.isArray(base?.alternativeTalent) ? base.alternativeTalent : [];
    const already = currentAlt.some((a) => a?.id === altProfessionTalentId);
    if (already) return;

    const nextAltIds = [
      ...currentAlt
        .map((a) => a?.id)
        .filter((id) => typeof id === 'number'),
      altProfessionTalentId,
    ];

    this.linksApi.updateProfessionTalent(baseId, {alternativeTalent: nextAltIds}).subscribe({
      next: (updated: ProfessionTalent) => {
        this.talents.at(talentIndex)?.setValue(updated);
        this.refreshTalentsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.add.alternative.talent.failed:Failed to add alternative talent.`, 'OK', {duration: 3000});
      },
    });
  }

  removeAlternativeTalent(talentIndex: number, altIndex: number) {
    const base = this.talents.at(talentIndex)?.value as any;
    const baseId = base?.id as number | undefined;
    if (typeof baseId !== 'number') return;

    const currentAlt: any[] = Array.isArray(base?.alternativeTalent) ? base.alternativeTalent : [];
    const nextAltIds = currentAlt
      .filter((_: any, i: number) => i !== altIndex)
      .map((a) => a?.id)
      .filter((id) => typeof id === 'number');

    this.linksApi.updateProfessionTalent(baseId, {alternativeTalent: nextAltIds}).subscribe({
      next: (updated: ProfessionTalent) => {
        this.talents.at(talentIndex)?.setValue(updated);
        this.refreshTalentsOptions();
      },
      error: () => {
        this.snackBar.open($localize`:Snackbar@@profession.create.remove.alternative.talent.failed:Failed to remove alternative talent.`, 'OK', {duration: 3000});
      },
    });
  }

  // --- Alternatywy wybierane z już dodanych ---
  addAlternativeSkillFromExisting(skillIndex: number, altSkillId: number) {
    // altSkillId tutaj = ID encji ProfessionSkill (bo select budujemy z już dodanych skills.controls)
    this.addAlternativeSkillByLinkId(skillIndex, altSkillId);
  }

  addAlternativeTalentFromExisting(talentIndex: number, altTalentId: number) {
    // altTalentId tutaj = ID encji ProfessionTalent
    this.addAlternativeTalentByLinkId(talentIndex, altTalentId);
  }

  parseNumberValue(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  /**
   * Czy umiejętność na pozycji `i` jest już użyta jako alternatywa w innej pozycji?
   * Jeśli tak, w UI nie pokazujemy jej jako osobnej, głównej pozycji.
   */
  isSkillRenderedAsAlternative(i: number): boolean {
    const current = this.skills.at(i)?.value as any;
    const currentId = current?.id;
    if (typeof currentId !== 'number') return false;

    for (let j = 0; j < this.skills.length; j++) {
      if (j === i) continue;
      const other = this.skills.at(j)?.value as any;
      const alt = Array.isArray(other?.alternativeSkill) ? other.alternativeSkill : [];
      if (alt.some((a: any) => a?.id === currentId)) return true;
    }
    return false;
  }

  isTalentRenderedAsAlternative(i: number): boolean {
    const current = this.talents.at(i)?.value as any;
    const currentId = current?.id;
    if (typeof currentId !== 'number') return false;

    for (let j = 0; j < this.talents.length; j++) {
      if (j === i) continue;
      const other = this.talents.at(j)?.value as any;
      const alt = Array.isArray(other?.alternativeTalent) ? other.alternativeTalent : [];
      if (alt.some((a: any) => a?.id === currentId)) return true;
    }
    return false;
  }

  /** Wymusza odświeżenie strumieni autocomplete (emitujemy ponownie obecną wartość). */
  private refreshSkillsOptions() {
    const q = (this.skillSearchControl.value ?? '').toString();
    this.skillSearchControl.setValue(q);
  }

  /** Wymusza odświeżenie strumieni autocomplete (emitujemy ponownie obecną wartość). */
  private refreshTalentsOptions() {
    const q = (this.talentSearchControl.value ?? '').toString();
    this.talentSearchControl.setValue(q);
  }
}
