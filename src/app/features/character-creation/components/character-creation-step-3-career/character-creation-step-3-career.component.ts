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
import {Profession, ProfessionSkill} from '../../../professions/models/profession.models';

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

  // Race label from CharacterDataService
  readonly selectedRace = computed(() => this.charData.race() ?? 'human');

  readonly selectedRaceLabel = computed(() => {
    const race = this.selectedRace();
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  // Since skills/talents display was removed, there are no required alternative selections
  readonly requiredAlternativesSelected = computed(() => true);

  // Czy w aktualnej profesji istnieje co najmniej jedna wybieralna cecha (nie jest "-")
  readonly hasSelectableCharacteristic = computed(() => {
    const primary = this.primaryAdvanceRow() ?? [];
    const secondary = this.secondaryAdvanceRow() ?? [];
    const anyPrimary = primary.some((v) => v !== '-' && v !== null && v !== undefined);
    const anySecondary = secondary.some((v) => v !== '-' && v !== null && v !== undefined);
    return anyPrimary || anySecondary;
  });

  // Umożliwiamy akceptację tylko jeśli:
  // - mamy wylosowaną profesję,
  // - oraz jeśli profesja ma wybieralną cechę -> użytkownik musiał wybrać jedną cechę.
  readonly canAccept = computed(() => {
    if (!this.profession()) return false;
    if (!this.requiredAlternativesSelected()) return false;
    const hasSelect = this.hasSelectableCharacteristic();
    if (!hasSelect) return true; // brak cech do wyboru
    return !!this.selectedCharacteristic();
  });

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

  // --- START: New state for selectable characteristics (cechy) ---
  // Lists of characteristic headers so template can reference by index and name
  readonly primaryCharacteristicHeaders = ['WS', 'BS', 'S', 'T', 'Ag', 'Int', 'WP', 'Fel'];
  readonly secondaryCharacteristicHeaders = ['A', 'W', 'SB', 'TB', 'M', 'Mag', 'IP', 'FP'];

  // Currently selected characteristic (only one allowed at a time)
  readonly selectedCharacteristic = signal<string | null>(null);

  readonly displayedSkills: number[] = []

  selectCharacteristic(name: string | null) {
    // Toggle selection: if already selected, deselect; otherwise select this name
    if (name === null) {
      this.selectedCharacteristic.set(null);
      // persist
      this.charData.setSelectedCharacteristic(null);
      return;
    }
    const cur = this.selectedCharacteristic();
    const newVal = cur === name ? null : name;
    this.selectedCharacteristic.set(newVal);
    // Persist selection to service so other steps can read it
    this.charData.setSelectedCharacteristic(newVal);
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
    // reset characteristic picks
    this.selectedCharacteristic.set(null);
    // Persist cleared selection
    this.charData.setSelectedCharacteristic(null);
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

    // Reset characteristic selection
    this.selectedCharacteristic.set(null);
    // Persist cleared selection
    this.charData.setSelectedCharacteristic(null);

    try {
      const res = await firstValueFrom(this.api.draw(race));
      // backend returns { roll, matches: [profession], fallback, candidates? }
      this.lastRoll.set(res.roll ?? null);
      this.fallback.set(res.fallback ?? false);
      this.candidates.set(res.candidates ?? null);
      const first = Array.isArray(res.matches) && res.matches.length > 0 ? (res.matches[0] as Profession) : null;
      this.profession.set(first);
    } catch (err) {
      console.error('Failed to draw profession', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  goPrev() {
    void this.router.navigate(['/character-create/step-2']);
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

    // Also persist selectedCharacteristic into CharacterDataService to keep global state
    this.charData.setSelectedCharacteristic(this.selectedCharacteristic());

    // Persist chosen profession only when user accepts
    const chosen = this.profession();
    if (chosen) {
      this.charData.setProfession(chosen);
      // clear any previously stored skills/talents (since UI no longer collects them here)
      this.charData.setProfessionSkills([]);
      this.charData.setProfessionTalents([]);
    }

    // For now we just move forward.
    if (!this.canAccept()) return;
    void this.router.navigate(['/character-create/step-4']);
  }

  // Add a small initialization block to sync selection from the service when component is created
  constructor() {
    const persisted = this.charData.getSelectedCharacteristic?.();
    if (typeof persisted !== 'undefined') {
      this.selectedCharacteristic.set(persisted ?? null);
    }
  }

  readonly professionSkills = computed((): ProfessionSkill[] => {
    const p = this.profession();
    const items = Array.isArray(p?.skills) ? p!.skills : [];

    return items
      .filter((ps): ps is ProfessionSkill => !!ps && !!ps.skill)
      .slice()
      .sort((a, b) => (a.skill?.name ?? '').localeCompare(b.skill?.name ?? ''));
  });

  protected appendToDisplayedSkills(id: number) {
    this.displayedSkills.push(id);
    return ""
  }

  protected isSkillDisplayed(id: number) {
    return this.displayedSkills.includes(id);
  }
}
