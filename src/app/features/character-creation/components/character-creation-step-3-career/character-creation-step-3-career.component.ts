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
    if (name === null) {
      this.selectedCharacteristic.set(null);
      return;
    }
    const cur = this.selectedCharacteristic();
    this.selectedCharacteristic.set(cur === name ? null : name);
  }

  isCharacteristicSelected(name: string) {
    return this.selectedCharacteristic() === name;
  }

  // Allow selecting/deselecting by clicking table cell
  selectCharacteristicByCell(row: 'primary' | 'secondary', index: number) {
    if (!this.isCharacteristicSelectable(row, index)) return;
    const name = row === 'primary' ? this.primaryCharacteristicHeaders[index] : this.secondaryCharacteristicHeaders[index];
    this.selectCharacteristic(name);
  }

  // Czy dana komórka jest wybieralna (nie jest '-')
  isCharacteristicSelectable(row: 'primary' | 'secondary', index: number): boolean {
    const val = row === 'primary' ? (this.primaryAdvanceRow()[index] ?? '-') : (this.secondaryAdvanceRow()[index] ?? '-');
    return val !== '-' && val !== undefined && val !== null;
  }

  // Czy cecha powiązana z komórką jest wybrana
  isCharacteristicSelectedByCell(row: 'primary' | 'secondary', index: number): boolean {
    const name = row === 'primary' ? this.primaryCharacteristicHeaders[index] : this.secondaryCharacteristicHeaders[index];
    return this.isCharacteristicSelected(name);
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

  // New: UI state for selecting from list
  readonly isSelecting = signal(false);
  readonly eligibleList = signal<Profession[]>([]);
  readonly eligibleCount = signal<number>(0);

  // Load eligible professions for current race and show selection panel
  async loadEligible() {
    const race = this.selectedRace();
    if (!race) return;
    this.isLoading.set(true);
    this.isSelecting.set(true);
    this.eligibleList.set([]);
    this.eligibleCount.set(0);
    try {
      const res = await firstValueFrom(this.api.eligible(race));
      const list = Array.isArray(res?.eligible) ? (res.eligible as Profession[]) : (res?.eligible ?? []);
      this.eligibleList.set(list);
      this.eligibleCount.set(res?.count ?? list.length ?? 0);
    } catch (err) {
      console.error('Failed to load eligible professions', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  chooseFromList(p: Profession) {
    if (!p) return;
    this.profession.set(p);
    // reset alternative selections and characteristic picks
    this.skillSelections.set({});
    this.talentSelections.set({});
    this.selectedCharacteristic.set(null);
    this.isSelecting.set(false);
  }

  cancelSelection() {
    this.isSelecting.set(false);
  }

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
    // Reset characteristic selection
    this.selectedCharacteristic.set(null);

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
    // Persist chosen primary characteristic to CharacterDataService if applicable
    const sel = this.selectedCharacteristic();
    const primaryIds = new Set(['WS', 'BS', 'S', 'T', 'Ag', 'Int', 'WP', 'Fel']);
    if (sel && primaryIds.has(sel)) {
      // call onSelectPrimary to toggle selection in CharacterDataService
      // characterData expects PrimaryStatId type — runtime check above ensures valid value
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.charData.onSelectPrimary(sel);
    }

    // Save selected characteristic as free advance (primary -> +5, secondary -> +1)
    const free = this.selectedCharacteristic();
    if (free) {
      const primaryHeaders = new Set(this.primaryCharacteristicHeaders);
      const secondaryHeaders = new Set(this.secondaryCharacteristicHeaders);
      if (primaryHeaders.has(free)) {
        this.charData.setFreeAdvance({stat: free, kind: 'primary', delta: 5});
      } else if (secondaryHeaders.has(free)) {
        this.charData.setFreeAdvance({stat: free, kind: 'secondary', delta: 1});
      }
    }

    // Build and persist chosen profession, skills and talents only when user accepts
    const chosen = this.profession();
    if (chosen) {
      // Build skills list: for each profession skill, if it has alternatives use the user's selection,
      // otherwise use the skill's name.
      const finalSkills: any[] = [];
      const displayedSkills = this.displaySkills();
      for (let i = 0; i < displayedSkills.length; i++) {
        const s = displayedSkills[i] as any;
        // If this item wraps a skill object, prefer that
        const mainSkill = s?.skill ?? s;
        const alts = (s?.alternativeSkill ?? s?.alternative_skill ?? []) as Array<any>;
        if (Array.isArray(alts) && alts.length > 0) {
          const selName = this.getSkillChoice(i);
          if (selName) {
            // Find the alternative object whose name matches selName
            const foundAlt = alts.find((a) => {
              const n = a?.name ?? a?.skill?.name ?? (typeof a === 'string' ? a : String(a));
              return String(n).trim().toLowerCase() === String(selName).trim().toLowerCase();
            });
            if (foundAlt) {
              // alternative structure may be { id, skill } or { id, name }
              const sk = foundAlt?.skill ?? {id: foundAlt.id, name: foundAlt.name};
              finalSkills.push(sk);
            } else {
              // fallback: try to push mainSkill if available
              if (mainSkill && mainSkill.id) finalSkills.push(mainSkill);
            }
          }
        } else {
          if (mainSkill && mainSkill.id) finalSkills.push(mainSkill);
        }
      }

      // Build talents list similarly
      const finalTalents: any[] = [];
      const displayedTalents = this.displayTalents();
      for (let j = 0; j < displayedTalents.length; j++) {
        const t = displayedTalents[j] as any;
        const mainTalent = t?.talent ?? t;
        const alts = (t?.alternativeTalent ?? t?.alternative_talent ?? []) as Array<any>;
        if (Array.isArray(alts) && alts.length > 0) {
          const selName = this.getTalentChoice(j);
          if (selName) {
            const foundAlt = alts.find((a) => {
              const n = a?.name ?? a?.talent?.name ?? (typeof a === 'string' ? a : String(a));
              return String(n).trim().toLowerCase() === String(selName).trim().toLowerCase();
            });
            if (foundAlt) {
              const tl = foundAlt?.talent ?? {id: foundAlt.id, name: foundAlt.name};
              finalTalents.push(tl);
            } else {
              if (mainTalent && mainTalent.id) finalTalents.push(mainTalent);
            }
          }
        } else {
          if (mainTalent && mainTalent.id) finalTalents.push(mainTalent);
        }
      }

      // Persist into shared CharacterDataService (store full objects)
      this.charData.setProfession(chosen);
      // Type expectation: arrays of Skill/Talent
      this.charData.setProfessionSkills(finalSkills as any);
      this.charData.setProfessionTalents(finalTalents as any);
    }

    // TODO: Persist chosen career to CharacterDataService / backend in later step.
    // For now we just move forward.
    if (!this.canAccept()) return;
    void this.router.navigate(['/character/create/step-4']);
  }
}
