import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

import {CharacterCreationStateService} from '../../services/character-creation-state.service';
import {DiceService} from '../../../../shared/services/dice.service';

type PrimaryStatId = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

type PrimaryStat = {
  id: PrimaryStatId;
  label: string;
  fullName: string;
  value: number;
  deltaFromBase: number;
  lastRoll?: [number, number];
  lastRollTotal?: number;
  // Shallya's Mercy flag (boolean) added to primary stats
  shallyasMercy?: boolean;
};

@Component({
  selector: 'app-character-creation-step-2-attributes',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-2-attributes.component.html',
  styleUrls: ['./character-creation-step-2-attributes.component.scss'],
})
export class CharacterCreationStep2AttributesComponent {
  private readonly router = inject(Router);
  private readonly state = inject(CharacterCreationStateService);
  private readonly dice = inject(DiceService);

  // minimal UI: prezentujemy dane przykładowe z mockupa
  readonly humanBase = 20;

  readonly primaryStats = signal<PrimaryStat[]>([
    {id: 'WS', label: 'WS', fullName: 'Weapon Skill', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'BS', label: 'BS', fullName: 'Ballistic Skill', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'S', label: 'S', fullName: 'Strength', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'T', label: 'T', fullName: 'Toughness', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'Ag', label: 'Ag', fullName: 'Agility', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'Int', label: 'Int', fullName: 'Intelligence', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'WP', label: 'WP', fullName: 'Willpower', value: 20, deltaFromBase: 0, shallyasMercy: false},
    {id: 'Fel', label: 'Fel', fullName: 'Fellowship', value: 20, deltaFromBase: 0, shallyasMercy: false},
  ]);

  readonly selectedRaceLabel = computed(() => {
    const race = this.state.step1().race;
    if (!race) return 'Unknown';
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  // --- new UI state for rolling ---
  lastRollDisplay = '-';
  isRolling = false;

  // selected primary stat for UI (click / toggle)
  readonly selectedStat = signal<PrimaryStatId | null>(null);

  // Secondary stats used by template
  readonly secondaryStats = signal({
    A: 1,
    W: 0,
    SB: 0,
    TB: 0,
    M: 5,
    Mag: 0,
    IP: 0,
    FP: 0,
  });

  // computed: lowest total of lastRollTotal across primaryStats (undefined if none)
  readonly lowestRollTotal = computed(() => {
    const arr = this.primaryStats();
    const totals = arr.map(s => s.lastRollTotal).filter((t): t is number => typeof t === 'number');
    if (totals.length === 0) return undefined as number | undefined;
    return Math.min(...totals);
  });

  goPrev() {
    void this.router.navigate(['/character/create/step-1']);
  }

  goNext() {
    // jeszcze nie implementujemy logiki akceptacji, więc pozwalamy przejść dalej.
    void this.router.navigate(['/character/create/step-3']);
  }

  // Helper: get primary stat value by id
  private getStat(id: PrimaryStatId): number {
    const arr = this.primaryStats();
    const found = arr.find(s => s.id === id);
    return found ? found.value : 0;
  }

  // Public: wywołaj przy kliknięciu przycisku. Opcjonalnie pass seed for deterministic tests.
  onRollDice(seed?: number) {
    if (this.isRolling) return;
    this.isRolling = true;

    const rng = this.dice.rngFactory(seed);
    const base = this.humanBase;

    // Update primary stats: always perform rolls (so we keep lastRoll/lastRollTotal for logs)
    // but if a stat has Shallya's Mercy flagged, override the final value to base + 11
    this.primaryStats.update(prev => {
      return prev.map(s => {
        // Always roll and store roll info
        const {total, rolls} = this.dice.roll2d10(rng);

        if (s.shallyasMercy) {
          const added = 11; // fixed bonus when mercy is used
          const newValue = base + added;
          return {
            ...s,
            value: newValue,
            deltaFromBase: added,
            // keep roll info even though Mercy overrides the final value
            lastRoll: rolls,
            lastRollTotal: total,
            shallyasMercy: true,
          } as PrimaryStat;
        }

        const newValue = base + total;
        const delta = newValue - base;
        return {
          ...s,
          value: newValue,
          deltaFromBase: delta,
          lastRoll: rolls,
          lastRollTotal: total,
          shallyasMercy: s.shallyasMercy ?? false,
        } as PrimaryStat;
      });
    });

    // Update lastRollDisplay to show the selected stat's info if a stat is selected
    const arr = this.primaryStats();
    const selected = this.selectedStat();
    if (selected) {
      const found = arr.find(s => s.id === selected);
      if (found) {
        if (found.shallyasMercy) {
          if (typeof found.lastRollTotal === 'number') {
            this.lastRollDisplay = `${found.label}: ${found.value} (Shallya +11; roll ${found.lastRollTotal} +${base})`;
          } else {
            this.lastRollDisplay = `${found.label}: ${found.value} (Shallya +11)`;
          }
        } else if (typeof found.lastRollTotal === 'number') {
          // show label, total value and roll/base breakdown
          this.lastRollDisplay = `${found.label}: ${found.value} (roll ${found.lastRollTotal} +${base})`;
        } else {
          this.lastRollDisplay = `${found.label}: ${found.value} (base ${base})`;
        }
      } else {
        // fallback to representative last
        const last = arr[arr.length - 1];
        if (last && typeof last.lastRollTotal === 'number') {
          this.lastRollDisplay = `${last.lastRollTotal} (+${base})`;
        } else {
          this.lastRollDisplay = `+${base}`;
        }
      }
    } else {
      // No stat selected: previous behaviour (representative last)
      const last = arr[arr.length - 1];
      if (last && typeof last.lastRollTotal === 'number') {
        this.lastRollDisplay = `${last.lastRollTotal} (+${base})`;
      } else {
        this.lastRollDisplay = `+${base}`;
      }
    }

    // Draw a single d10 (mapped) for W according to the requested rule
    // Provide mapping array: index 0 => raw=1, ..., index 9 => raw=10
    const wMapping = {map: [10, 10, 10, 11, 11, 11, 12, 12, 12, 13]};
    const mappedW = this.dice.mapRawToMapped(wMapping, rng);

    // IP jest stałe (0) — nie losujemy go
    this.deriveSecondaries(mappedW);

    this.isRolling = false;
  }

  // Minimal placeholder derivation rules. These can be replaced with real WFRP formulas later.
  private deriveSecondaries(mappedW?: number) {
    const BS = this.getStat('BS');
    const S = this.getStat('S');
    const T = this.getStat('T');
    const WP = this.getStat('WP');

    // User requested rules:
    // A and Mag are always 1
    // SB = S // 10, TB = T // 10
    const A = 1;
    const SB = Math.floor(S / 10);
    const TB = Math.floor(T / 10);

    // W: if mappedW provided, use it (single mapped d10), otherwise fallback to previous rule
    const W = typeof mappedW === 'number' ? mappedW : Math.max(1, Math.floor((T + S + Math.floor(BS / 10)) / 10));
    // M ma zawsze wartość 5 zgodnie z wymaganiem
    const M = 5;
    // Mag (magic) is always 1 per requirement
    const Mag = 1;
    // IP ma zawsze wartość 0 zgodnie z wymaganiem
    const IP = 0;
    // FP obliczane standardowo
    const FP = Math.max(1, Math.floor((T + WP) / 20));

    this.secondaryStats.set({A, W, SB, TB, M, Mag, IP, FP});
  }

  // Apply Shallya's Mercy to the currently selected stat (set boolean true for selected, false for others)
  applyShallyasMercy() {
    const id = this.selectedStat();
    if (!id) return;
    this.primaryStats.update(prev => prev.map(s => ({...s, shallyasMercy: s.id === id})));
  }

  // Expose button state for Mercy UI (variant, label, disabled)
  get mercyVariant(): 'save' | 'cancel' {
    // If a stat has Mercy applied, show primary (red) variant. Otherwise if a stat is selected show 'save'.
    const hasMercy = this.primaryStats().some(s => s.shallyasMercy);
    if (hasMercy) return 'save';
    return this.selectedStat() ? 'save' : 'cancel';
  }

  get mercyLabel(): string {
    const hasMercy = this.primaryStats().some(s => s.shallyasMercy);
    if (hasMercy) {
      const stat = this.primaryStats().find(s => s.shallyasMercy);
      return stat ? `Mercy: ${stat.label}` : 'Mercy Applied';
    }
    return this.selectedStat() ? 'Invoke Mercy' : 'Select a stat to upgrade';
  }

  get mercyDisabled(): boolean {
    // If Mercy already applied, disable the button. Otherwise enabled only when a stat is selected.
    const hasMercy = this.primaryStats().some(s => s.shallyasMercy);
    return hasMercy || !this.selectedStat();
  }

  // Avoid arrow functions in template bindings by exposing a getter used by the template
  get primaryStatsHasMercy(): boolean {
    return this.primaryStats().some(s => s.shallyasMercy);
  }

  onSelectPrimary(id: PrimaryStatId) {
    const cur = this.selectedStat();
    const newSelected = cur === id ? null : id;
    this.selectedStat.set(newSelected);

    // Update button display immediately to reflect selected stat's current values
    const arr = this.primaryStats();
    const base = this.humanBase;
    if (newSelected) {
      const found = arr.find(s => s.id === newSelected);
      if (found) {
        if (found.shallyasMercy) {
          if (typeof found.lastRollTotal === 'number') {
            this.lastRollDisplay = `${found.label}: ${found.value} (Shallya +11; roll ${found.lastRollTotal} +${base})`;
          } else {
            this.lastRollDisplay = `${found.label}: ${found.value} (Shallya +11)`;
          }
        } else if (typeof found.lastRollTotal === 'number') {
          this.lastRollDisplay = `${found.label}: ${found.value} (roll ${found.lastRollTotal} +${base})`;
        } else {
          this.lastRollDisplay = `${found.label}: ${found.value} (base ${base})`;
        }
      }
    } else {
      // Deselected: fallback to representative last or base-only
      const last = arr[arr.length - 1];
      if (last && typeof last.lastRollTotal === 'number') {
        this.lastRollDisplay = `${last.lastRollTotal} (+${base})`;
      } else {
        this.lastRollDisplay = `+${base}`;
      }
    }
  }
}
