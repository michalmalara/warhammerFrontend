import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {firstValueFrom} from 'rxjs';
import {ProfessionsApiService} from '../../../professions/services/professions-api.service';
import {CharacterDataService} from '../../services/character-data.service';
import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {Profession} from '../../../professions/models/profession.models';

@Component({
  selector: 'app-character-creation-step-3-career',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-3-career.component.html',
  styleUrls: ['./character-creation-step-3-career.component.scss'],
})
export class CharacterCreationStep3CareerComponent {
  private readonly api = inject(ProfessionsApiService);
  private readonly charData = inject(CharacterDataService);
  private readonly router = inject(Router);

  // UI state
  readonly isLoading = signal(false);
  readonly lastRoll = signal<number | null>(null);
  readonly profession = signal<Profession | null>(null);
  readonly fallback = signal<boolean | null>(null);
  readonly candidates = signal<number | null>(null);

  // Selections for alternative choices (keys are generated per-list index)
  readonly skillSelections = signal<Record<string, string | null>>({});
  readonly talentSelections = signal<Record<string, string | null>>({});

  // Race label from CharacterDataService
  readonly selectedRace = computed(() => this.charData.race() ?? 'human');

  readonly selectedRaceLabel = computed(() => {
    const race = this.selectedRace();
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  // Ensure all required alternative choices are made before enabling accept
  readonly requiredAlternativesSelected = computed(() => {
    const skills = this.displaySkills();
    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      const alts = this.skillAlternatives(s) ?? [];
      if (alts.length > 0) {
        const sel = this.getSkillChoice(i);
        if (!sel) return false;
      }
    }
    const talents = this.displayTalents();
    for (let j = 0; j < talents.length; j++) {
      const t = talents[j];
      const alts = this.talentAlternatives(t) ?? [];
      if (alts.length > 0) {
        const sel = this.getTalentChoice(j);
        if (!sel) return false;
      }
    }
    return true;
  });

  readonly canAccept = computed(() => !!this.profession() && this.requiredAlternativesSelected());

  readonly entryText = computed(() => {
    const p = this.profession();
    const list = (p?.entryProfessions ?? []) as Array<any>;
    return list.map((x) => x?.name ?? String(x)).join(', ');
  });

  readonly exitText = computed(() => {
    const p = this.profession();
    const list = (p?.exitProfessions ?? []) as Array<any>;
    return list.map((x) => x?.name ?? String(x)).join(', ');
  });

  readonly displaySkills = computed(() => {
    const p = this.profession();
    const skills = (p?.skills ?? []) as Array<any>;

    const hiddenIds = new Set<number>();
    const hiddenNames = new Set<string>();
    for (const s of skills) {
      const alts = (s?.alternativeSkill ?? s?.alternative_skill ?? []) as Array<any>;
      for (const a of alts ?? []) {
        const id = a?.id;
        if (typeof id === 'number') hiddenIds.add(id);
        const name = a?.name ?? a?.skill?.name ?? (typeof a === 'string' ? a : String(a));
        if (name) hiddenNames.add(String(name).trim().toLowerCase());
      }
    }

    // Jeżeli dany element występuje jako alternatywa u innego — nie wyświetlamy go jako osobnej pozycji.
    return skills.filter((s) => {
      const id = s?.id;
      const name = s?.name ?? s?.skill?.name ?? String(s);
      const lname = name ? String(name).trim().toLowerCase() : null;
      if (typeof id === 'number' && hiddenIds.has(id)) return false;
      if (lname && hiddenNames.has(lname)) return false;
      return true;
    });
  });

  readonly displayTalents = computed(() => {
    const p = this.profession();
    const talents = (p?.talents ?? []) as Array<any>;

    const hiddenIds = new Set<number>();
    for (const t of talents) {
      const alts = (t?.alternativeTalent ?? t?.alternative_talent ?? []) as Array<any>;
      for (const a of alts ?? []) {
        const id = a?.id;
        if (typeof id === 'number') hiddenIds.add(id);
      }
    }

    return talents.filter((t) => {
      const id = t?.id;
      return !(typeof id === 'number' && hiddenIds.has(id));
    });
  });

  skillName(item: any): string {
    if (!item) return '';
    return item.name ?? item.skill?.name ?? String(item);
  }

  skillAlternatives(item: any): string[] {
    const alts = (item?.alternativeSkill ?? item?.alternative_skill ?? []) as Array<any>;
    if (!Array.isArray(alts) || alts.length === 0) return [];
    // backend/FE model: [{ id, skill: { name } }]
    return alts
      .map((x) => x?.name ?? x?.skill?.name ?? String(x))
      .filter((x) => !!x);
  }

  talentName(item: any): string {
    if (!item) return '';
    return item.name ?? item.talent?.name ?? String(item);
  }

  talentAlternatives(item: any): string[] {
    const alts = (item?.alternativeTalent ?? item?.alternative_talent ?? []) as Array<any>;
    if (!Array.isArray(alts) || alts.length === 0) return [];
    // backend/FE model: [{ id, talent: { name } }]
    return alts
      .map((x) => x?.name ?? x?.talent?.name ?? String(x))
      .filter((x) => !!x);
  }

  // Helper to build selection keys and manipulate selection state
  private skillChoiceKey(index: number) {
    return `s_${index}`;
  }

  private talentChoiceKey(index: number) {
    return `t_${index}`;
  }

  getSkillChoice(index: number): string | null {
    return this.skillSelections()[this.skillChoiceKey(index)] ?? null;
  }

  setSkillChoice(index: number, value: string | null) {
    const cur = {...this.skillSelections()};
    cur[this.skillChoiceKey(index)] = value;
    this.skillSelections.set(cur);
  }

  getTalentChoice(index: number): string | null {
    return this.talentSelections()[this.talentChoiceKey(index)] ?? null;
  }

  setTalentChoice(index: number, value: string | null) {
    const cur = {...this.talentSelections()};
    cur[this.talentChoiceKey(index)] = value;
    this.talentSelections.set(cur);
  }

  // --- START: New state for selectable characteristics (cechy) ---
  // Lists of characteristic headers so template can reference by index and name
  readonly primaryCharacteristicHeaders = ['WS', 'BS', 'S', 'T', 'Ag', 'Int', 'WP', 'Fel'];
  readonly secondaryCharacteristicHeaders = ['A', 'W', 'SB', 'TB', 'M', 'Mag', 'IP', 'FP'];

  // Currently selected characteristic (only one allowed at a time)
  readonly selectedCharacteristic = signal<string | null>(null);

  selectCharacteristic(name: string | null) {
    // Toggle selection: if already selected, deselect; otherwise select this name
    if (!name) return;
    const cur = this.selectedCharacteristic();
    this.selectedCharacteristic.set(cur === name ? null : name);
  }

  isCharacteristicSelected(name: string) {
    return this.selectedCharacteristic() === name;
  }

  private formatAdvance(value: number | null | undefined, unitValue: number): string {
    const v = typeof value === 'number' ? value : 0;
    const total = v * unitValue;
    return total > 0 ? `+${total}${unitValue === 5 ? '%' : ''}` : '-';
  }

  /**
   * Wiersze (primary/secondary) dla grida "Advance Scheme".
   * Primary: każde rozwinięcie = 5 (wyświetlane jako %).
   * Secondary: każde rozwinięcie = 1.
   *
   * Uwaga: backend nie ma pól dla SB/TB/IP/FP — dla nich zwracamy '-'.
   */
  readonly primaryAdvanceRow = computed(() => {
    const p = this.profession();
    return [
      this.formatAdvance(p?.weaponSkillsDevelopment, 5),
      this.formatAdvance(p?.ballisticSkillsDevelopment, 5),
      this.formatAdvance(p?.strengthDevelopment, 5),
      this.formatAdvance(p?.toughnessDevelopment, 5),
      this.formatAdvance(p?.agilityDevelopment, 5),
      this.formatAdvance(p?.intelligenceDevelopment, 5),
      this.formatAdvance(p?.willpowerDevelopment, 5),
      this.formatAdvance(p?.fellowshipDevelopment, 5),
    ];
  });

  readonly secondaryAdvanceRow = computed(() => {
    const p = this.profession();
    return [
      this.formatAdvance(p?.attacksDevelopment, 1),
      this.formatAdvance(p?.woundsDevelopment, 1),
      '-',
      '-',
      this.formatAdvance(p?.movementDevelopment, 1),
      this.formatAdvance(p?.magicDevelopment, 1),
      '-',
      '-',
    ];
  });

  // --- END: New state for selectable characteristics (cechy) ---

  async drawCareer() {
    const race = this.selectedRace();
    this.isLoading.set(true);
    this.profession.set(null);
    this.lastRoll.set(null);
    this.fallback.set(null);
    this.candidates.set(null);

    // Clear previous selections
    this.skillSelections.set({});
    this.talentSelections.set({});

    try {
      const res = await firstValueFrom(this.api.draw(race));
      // backend returns { roll, matches: [profession], fallback, candidates? }
      this.lastRoll.set(res.roll ?? null);
      this.fallback.set(res.fallback ?? false);
      this.candidates.set(res.candidates ?? null);
      const first = Array.isArray(res.matches) && res.matches.length > 0 ? (res.matches[0] as Profession) : null;
      this.profession.set(first);
    } catch (err) {
      // TODO: better error handling / snackbars
      console.error('Failed to draw profession', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  goPrev() {
    void this.router.navigate(['/character/create/step-2']);
  }

  reroll() {
    void this.drawCareer();
  }

  acceptCareer() {
    // TODO: Persist chosen career to CharacterDataService / backend in later step.
    // For now we just move forward.
    if (!this.canAccept()) return;
    void this.router.navigate(['/character/create/step-4']);
  }
}
