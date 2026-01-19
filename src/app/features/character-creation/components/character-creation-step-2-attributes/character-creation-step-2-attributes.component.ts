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
  // base value (np. 20 dla człowieka)
  base: number;
  // rolledStat = suma oczek na 2d10 (np. 4..20) — przechowujemy surową wartość losowania
  rolledStat?: number;
  // Shallya's Mercy flag
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

  // --- primary stats trzymają teraz: id, label, fullName, base, rolledStat, shallyasMercy
  readonly primaryStats = signal<PrimaryStat[]>([
    {id: 'WS', label: 'WS', fullName: 'Weapon Skill', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'BS', label: 'BS', fullName: 'Ballistic Skill', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'S', label: 'S', fullName: 'Strength', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'T', label: 'T', fullName: 'Toughness', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'Ag', label: 'Ag', fullName: 'Agility', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'Int', label: 'Int', fullName: 'Intelligence', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'WP', label: 'WP', fullName: 'Willpower', base: 20, rolledStat: undefined, shallyasMercy: false},
    {id: 'Fel', label: 'Fel', fullName: 'Fellowship', base: 20, rolledStat: undefined, shallyasMercy: false},
  ]);

  readonly selectedRaceLabel = computed(() => {
    const race = this.state.step1().race;
    if (!race) return 'Unknown';
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  // --- new UI state for rolling ---
  lastRollDisplay = '-';
  isRolling = false;

  // Cached values: jeśli W został już wylosowany, przechowujemy mappedW, aby
  // przy późniejszym przeliczaniu sekundarnych nie "przelosowywać" go ponownie.
  private lastMappedW: number | null = null;
  // Podobnie przechowujemy ostatnio obliczone FP — użytkownik poprosił, żeby
  // nie 'losować' (ponownie przeliczać) W i FP przy ponownych przeliczaniach.
  private lastComputedFP: number | null = null;

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

  // computed: lowest rolledStat across primaryStats (undefined if none)
  readonly lowestRollTotal = computed(() => {
    const arr = this.primaryStats();
    const totals = arr.map(s => s.rolledStat).filter((t): t is number => typeof t === 'number');
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

  // Helper: get primary stat total by id = base + (shallyasMercy ? 11 : rolledStat)
  private getStat(id: PrimaryStatId): number {
    const arr = this.primaryStats();
    const found = arr.find(s => s.id === id);
    if (!found) return 0;
    const base = found.base;
    if (found.shallyasMercy) return base + 11;
    const rolled = typeof found.rolledStat === 'number' ? found.rolledStat : 0;
    return base + rolled;
  }

  // Public: wywołaj przy kliknięciu przycisku. Opcjonalnie pass seed for deterministic tests.
  onRollDice(seed?: number) {
    if (this.isRolling) return;
    this.isRolling = true;

    // Nowy rzut: kasujemy cache wylosowanego W i obliczonego FP
    this.lastMappedW = null;
    this.lastComputedFP = null;

    // Reset any previously-applied Shallya's Mercy so that a fresh roll
    // re-enables the mercy button (if a stat is selected).
    this.primaryStats.update(prev => prev.map(s => ({...s, shallyasMercy: false})));

    const rng = this.dice.rngFactory(seed);

    const base = this.humanBase;

    // Update primary stats: always perform rolls (so we keep rolledStat for logs)
    this.primaryStats.update(prev => {
      return prev.map(s => {
        const {total} = this.dice.roll2d10(rng);
        return {
          ...s,
          // store the rolled total (raw die total). Final displayed total uses base + rolledStat,
          // or base + 11 when shallyasMercy is true (handled in getStat and display logic)
          rolledStat: total,
          // preserve any mercy flag that might have been set by UI (applyShallyasMercy)
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
        const rolled = found.rolledStat;
        if (found.shallyasMercy) {
          if (typeof rolled === 'number') {
            this.lastRollDisplay = `${found.label}: ${found.base + 11} (Shallya +11; roll ${rolled} +${found.base})`;
          } else {
            this.lastRollDisplay = `${found.label}: ${found.base + 11} (Shallya +11)`;
          }
        } else if (typeof rolled === 'number') {
          this.lastRollDisplay = `${found.label}: ${found.base + rolled} (roll ${rolled} +${found.base})`;
        } else {
          this.lastRollDisplay = `${found.label}: ${found.base} (base ${found.base})`;
        }
      } else {
        // fallback to representative last
        const last = arr[arr.length - 1];
        if (last && typeof last.rolledStat === 'number') {
          this.lastRollDisplay = `${last.rolledStat} (+${base})`;
        } else {
          this.lastRollDisplay = `+${base}`;
        }
      }
    } else {
      // No stat selected: show average of all rolledStat values if available
      const totals = arr.map(s => s.rolledStat).filter((t): t is number => typeof t === 'number');
      if (totals.length > 0) {
        const sum = totals.reduce((a, b) => a + b, 0);
        const avg = sum / totals.length;
        const avgDisplay = Number.isInteger(avg) ? `${avg}` : `${avg.toFixed(1)}`;
        // Show average only, do not include base information per request
        this.lastRollDisplay = `AVG: ${avgDisplay}`;
      } else {
        this.lastRollDisplay = `+${base}`;
      }
    }

    // Przenieśliśmy losowanie mapped W oraz obliczanie FP do metody deriveSecondaries.
    // Przekazujemy rng, aby metoda sama wykonała potrzebne losowania i zapisała cache.
    this.deriveSecondaries(rng);

    this.isRolling = false;
  }

  // Minimal placeholder derivation rules. These can be replaced with real WFRP formulas later.
  // Jeżeli przekazano rng (nie-number), metoda wykona losowanie mapped W i obliczy FP;
  // jeżeli przekazano liczbę, użyje jej jako mappedW; jeśli nic nie przekazano, użyje
  // cache lub fallbackowych obliczeń.
  private deriveSecondaries(mappedWOrRng?: number | any) {
    const BS = this.getStat('BS');
    const S = this.getStat('S');
    const T = this.getStat('T');
    const WP = this.getStat('WP');

    // User requested rules:
    // A and Mag are always 1
    // SB = S // 10, TB = T // 10
    const A = 1;
    const {SB, TB} = this.computeSBandTB();

    // W: jeśli przekazano rng -> wylosuj mappedW i zapisz w cache. Jeśli przekazano liczbę ->
    // użyj jej i zapisz w cache. W przeciwnym razie użyj cache lub fallbacku.
    let W: number;
    const wMapping = {map: [10, 10, 10, 11, 11, 11, 12, 12, 12, 13]};
    if (typeof mappedWOrRng !== 'undefined' && typeof mappedWOrRng !== 'number') {
      // traktujemy to jako rng
      W = this.dice.mapRawToMapped(wMapping, mappedWOrRng);
      this.lastMappedW = W;
    } else if (typeof mappedWOrRng === 'number') {
      W = mappedWOrRng;
      this.lastMappedW = W;
    } else if (this.lastMappedW != null) {
      W = this.lastMappedW;
    } else {
      W = Math.max(1, Math.floor((T + S + Math.floor(BS / 10)) / 10));
    }
    // M ma zawsze wartość 5 zgodnie z wymaganiem
    const M = 5;
    // Mag (magic) is always 1 per requirement
    const Mag = 1;
    // IP ma zawsze wartość 0 zgodnie z wymaganiem
    const IP = 0;
    // FP: jeśli przekazano rng -> policz FP i zapisz w cache. W przeciwnym razie użyj cache
    // lub policz i zapisz jeśli nie było poprzednio.
    let FP: number;
    if (typeof mappedWOrRng !== 'undefined' && typeof mappedWOrRng !== 'number') {
      // przekazano rng -> oblicz FP i zapisz
      FP = Math.max(1, Math.floor((T + WP) / 20));
      this.lastComputedFP = FP;
    } else if (this.lastComputedFP != null) {
      FP = this.lastComputedFP;
    } else {
      FP = Math.max(1, Math.floor((T + WP) / 20));
      this.lastComputedFP = FP;
    }

    this.secondaryStats.set({A, W, SB, TB, M, Mag, IP, FP});
  }

  // Wydzielona logika przeliczania SB i TB
  private computeSBandTB(): { SB: number; TB: number } {
    // Pobierz aktualne wartości primaryStats i oblicz SB/TB z uwzględnieniem shallyasMercy
    const arr = this.primaryStats();
    const sStat = arr.find(s => s.id === 'S');
    const tStat = arr.find(s => s.id === 'T');

    const sTotal = sStat ? (sStat.base + (sStat.shallyasMercy ? 11 : (typeof sStat.rolledStat === 'number' ? sStat.rolledStat : 0))) : 0;
    const tTotal = tStat ? (tStat.base + (tStat.shallyasMercy ? 11 : (typeof tStat.rolledStat === 'number' ? tStat.rolledStat : 0))) : 0;

    const SB = Math.floor(sTotal / 10);
    const TB = Math.floor(tTotal / 10);
    return {SB, TB};
  }

  // Apply Shallya's Mercy to the currently selected stat (set boolean true for selected, false for others)
  applyShallyasMercy() {
    const id = this.selectedStat();
    if (!id) return;
    this.primaryStats.update(prev => prev.map(s => ({...s, shallyasMercy: s.id === id})));
    // Po zastosowaniu Mercy przeliczamy ponownie statystyki pochodne, aby SB/TB uwzględniały +11
    this.deriveSecondaries();
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
    if (newSelected) {
      const found = arr.find(s => s.id === newSelected);
      if (found) {
        const rolled = found.rolledStat;
        if (found.shallyasMercy) {
          if (typeof rolled === 'number') {
            this.lastRollDisplay = `${found.label}: ${found.base + 11} (Shallya +11; roll ${rolled} +${found.base})`;
          } else {
            this.lastRollDisplay = `${found.label}: ${found.base + 11} (Shallya +11)`;
          }
        } else if (typeof rolled === 'number') {
          this.lastRollDisplay = `${found.label}: ${found.base + rolled} (roll ${rolled} +${found.base})`;
        } else {
          this.lastRollDisplay = `${found.label}: ${found.base} (base ${found.base})`;
        }
      }
    } else {
      // Deselected: show average of all rolledStat values if available
      const totals = arr.map(s => s.rolledStat).filter((t): t is number => typeof t === 'number');
      if (totals.length > 0) {
        const sum = totals.reduce((a, b) => a + b, 0);
        const avg = sum / totals.length;
        const avgDisplay = Number.isInteger(avg) ? `${avg}` : `${avg.toFixed(1)}`;
        // Show average only, do not include base information per request
        this.lastRollDisplay = `AVG: ${avgDisplay}`;
      } else {
        this.lastRollDisplay = `+${this.humanBase}`;
      }
    }
  }
}
