import {computed, inject, Injectable, signal} from '@angular/core';
import {DiceService} from '../../../shared/services/dice.service';
import {type CharacterCreationBio, type CharacterRace, DEFAULT_STEP_1} from '../models/character-creation.models';
import {RaceBaseService} from './race-bases.service';
import type {Profession, Skill, Talent} from '../../professions/models/profession.models';

export type PrimaryStatId = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

export type PrimaryStat = {
  id: PrimaryStatId;
  label: string;
  fullName: string;
  base: number;
  rolledStat?: number;
  shallyasMercy?: boolean;
};

export type SecondaryStats = {
  A: number;
  W: number;
  SB: number;
  TB: number;
  M: number;
  Mag: number;
  IP: number;
  FP: number;
};

export type FreeAdvance = {
  stat: string; // e.g. 'WS'|'FP'|'M'
  kind: 'primary' | 'secondary';
  delta: number; // numeric increase (5 for primary, 1 for secondary)
};

@Injectable({providedIn: 'root'})
export class CharacterDataService {
  private readonly dice = inject(DiceService);
  // Inject RaceBaseService to provide race-dependent base values
  private readonly raceBases = inject(RaceBaseService);

  // Przechowywana (wylosowana / wybrana) profesja — dostępna dla innych kroków tworzenia postaci
  readonly profession = signal<Profession | null>(null);

  // Wybrane umiejętności i talenty dla aktualnie zaakceptowanej profesji.
  // Przechowujemy pełne obiekty `Skill` i `Talent` (przydatne do dalszego zapisu na backend).
  readonly professionSkills = signal<Skill[]>([]);
  readonly professionTalents = signal<Talent[]>([]);

  // Zapisana (zaakceptowana) darmowa rozwiniecie wybranej cechy
  readonly freeAdvance = signal<FreeAdvance | null>(null);

  setProfessionSkills(list: Skill[]) {
    this.professionSkills.set(list ?? []);
  }

  getProfessionSkills(): Skill[] {
    return this.professionSkills();
  }

  setProfessionTalents(list: Talent[]) {
    this.professionTalents.set(list ?? []);
  }

  getProfessionTalents(): Talent[] {
    return this.professionTalents();
  }

  setFreeAdvance(f: FreeAdvance | null) {
    this.freeAdvance.set(f);
  }

  getFreeAdvance(): FreeAdvance | null {
    return this.freeAdvance();
  }

  /**
   * Ustawia aktualnie wybraną/wylosowaną profesję (może być null aby wyczyścić).
   */
  setProfession(p: Profession | null) {
    this.profession.set(p);
  }

  /** Zwraca aktualnie zapisaną profesję. */
  getProfession(): Profession | null {
    return this.profession();
  }

  // minimal UI: prezentujemy dane przykładowe z mockupa
  // Expose a reactive getter for the human/base value used by templates.
  // Keep the old `humanBase` name for template compatibility.
  get humanBase() {
    // For backward compat the UI referenced "HUMAN BASE" label; keep it by
    // returning the generic per-stat base for the currently selected race
    const r = this.race ? this.race() : null;
    // If race is null, use Human as default for display parity
    const baseMap = this.raceBases.getPrimaryBases(r);
    // Use WS as representative base (all races return a full map)
    return baseMap.WS ?? 20;
  }

  // --- race (moved here) ---
  readonly race = signal<CharacterRace | null>(DEFAULT_STEP_1.race);

  // helper API to update race from UI
  setRace(r: CharacterRace) {
    this.race.set(r);
    // When race changes update primary stat bases to race-specific defaults
    const bases = this.raceBases.getPrimaryBases(r);
    this.primaryStats.update(prev => prev.map(s => ({...s, base: bases[s.id]})));
    // Changing race invalidates previously selected profession
    this.profession.set(null);
    // and clear profession skills/talents when race changes
    this.setProfessionSkills([]);
    this.setProfessionTalents([]);
    // clear any previously-chosen free advance
    this.setFreeAdvance(null);
  }

  // --- primary stats
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

  // selected primary stat for UI (click / toggle)
  readonly selectedStat = signal<PrimaryStatId | null>(null);

  // Secondary stats used by template
  readonly secondaryStats = signal<SecondaryStats>({
    A: 1,
    W: 0,
    SB: 0,
    TB: 0,
    M: 5,
    Mag: 0,
    IP: 0,
    FP: 0,
  });

  // --- new UI state for rolling ---
  readonly lastRollDisplay = signal<string>('-');
  readonly isRolling = signal<boolean>(false);

  // --- bio stored in this service (moved from CharacterCreationStateService)
  readonly bio = signal<CharacterCreationBio>(DEFAULT_STEP_1.bio);

  // helper API to update bio from forms
  patchBio(patch: Partial<CharacterCreationBio>) {
    this.bio.update(b => ({...b, ...patch}));
  }

  setBio(b: CharacterCreationBio) {
    this.bio.set(b);
  }

  // --- step 5: wealth & trappings ---
  readonly goldCrowns = signal<number | null>(null);

  /** Rzut 2k10 na startowy majątek. Zwraca wynik 2..20 (deterministyczny przy seed). */
  rollWealth2d10 = (seed?: number): number => {
    const rng = this.dice.rngFactory(seed);
    const {total} = this.dice.roll2d10(rng);
    this.goldCrowns.set(total);
    return total;
  };

  /**
   * Parsuje `profession.trappings` do prostych pozycji listy.
   * Format źródłowy bywa tekstowy (np. "Backpack, Cloak; Sword").
   */
  readonly startingTrappings = computed(() => {
    const tr = (this.profession()?.trappings ?? '').trim();
    if (!tr) return [] as string[];

    return tr
      .split(/[\n,;]+/g)
      .map(s => s.trim())
      .filter(Boolean);
  });

  readonly characterName = computed(() => this.bio().name?.trim() ?? '');

  readonly selectedRaceLabel = computed(() => {
    const r = this.race();
    if (!r) return '—';
    return r.charAt(0).toUpperCase() + r.slice(1);
  });

  readonly primaryTotals = computed(() => {
    const ids: PrimaryStatId[] = ['WS', 'BS', 'S', 'T', 'Ag', 'Int', 'WP', 'Fel'];
    return ids.map(id => ({
      id,
      value: this.getStat(id),
    }));
  });

  readonly secondaryTotals = computed(() => {
    const s = this.secondaryStats();
    return [
      {id: 'A', value: s.A},
      {id: 'W', value: s.W},
      {id: 'SB', value: s.SB},
      {id: 'TB', value: s.TB},
      {id: 'M', value: s.M},
      {id: 'Mag', value: s.Mag},
      {id: 'IP', value: s.IP},
      {id: 'FP', value: s.FP},
    ];
  });

  // Cached values
  private lastMappedW: number | null = null;
  private lastComputedFP: number | null = null;

  // computed: lowest rolledStat across primaryStats (undefined if none)
  readonly lowestRollTotal = computed(() => {
    const arr = this.primaryStats();
    const totals = arr.map(s => s.rolledStat).filter((t): t is number => typeof t === 'number');
    if (totals.length === 0) return undefined as number | undefined;
    return Math.min(...totals);
  });

  // Helper: get primary stat total by id = base + (shallyasMercy ? 11 : rolledStat)
  getStat(id: PrimaryStatId): number {
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
    if (this.isRolling()) return;
    this.isRolling.set(true);

    console.debug('[CharacterDataService] onRollDice start, seed=', seed);

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
        console.debug(`[CharacterDataService] rolled ${s.id} ->`, total);
        return {
          ...s,
          rolledStat: total,
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
            this.lastRollDisplay.set(`${found.label}: ${found.base + 11} (Shallya +11; roll ${rolled} +${found.base})`);
          } else {
            this.lastRollDisplay.set(`${found.label}: ${found.base + 11} (Shallya +11)`);
          }
        } else if (typeof rolled === 'number') {
          this.lastRollDisplay.set(`${found.label}: ${found.base + rolled} (roll ${rolled} +${found.base})`);
        } else {
          this.lastRollDisplay.set(`${found.label}: ${found.base} (base ${found.base})`);
        }
      } else {
        const last = arr[arr.length - 1];
        if (last && typeof last.rolledStat === 'number') {
          this.lastRollDisplay.set(`${last.rolledStat} (+${base})`);
        } else {
          this.lastRollDisplay.set(`+${base}`);
        }
      }
    } else {
      const totals = arr.map(s => s.rolledStat).filter((t): t is number => typeof t === 'number');
      if (totals.length > 0) {
        const sum = totals.reduce((a, b) => a + b, 0);
        const avg = sum / totals.length;
        const avgDisplay = Number.isInteger(avg) ? `${avg}` : `${avg.toFixed(1)}`;
        this.lastRollDisplay.set(`AVG: ${avgDisplay}`);
      } else {
        this.lastRollDisplay.set(`+${base}`);
      }
    }

    // Przenieśliśmy losowanie mapped W oraz obliczanie FP do metody deriveSecondaries.
    // Przekazujemy rng, aby metoda sama wykonała potrzebne losowania i zapisała cache.
    this.deriveSecondaries(rng);

    console.debug('[CharacterDataService] primaryStats after roll:', this.primaryStats());

    this.isRolling.set(false);
  }

  // Minimal placeholder derivation rules. These can be replaced with real WFRP formulas later.
  private deriveSecondaries(mappedWOrRng?: number | any) {
    console.debug('[CharacterDataService] deriveSecondaries called with', mappedWOrRng ? 'rng' : mappedWOrRng);
    const BS = this.getStat('BS');
    const S = this.getStat('S');
    const T = this.getStat('T');
    const WP = this.getStat('WP');

    // User requested rules:
    // A and Mag are always 1
    // SB = S // 10, TB = T // 10
    const A = 1;
    const {SB, TB} = this.computeSBandTB();

    // W: jeśli przekazano rng -> wylosuj mappedW używając mapy zależnej od rasy i zapisz w cache.
    // Jeśli przekazano liczbę -> użyj jej i zapisz w cache. W przeciwnym razie użyj cache lub fallbacku.
    let W: number;
    const wMapping = this.raceBases.getWMapping(this.race());
    if (typeof mappedWOrRng !== 'undefined' && typeof mappedWOrRng !== 'number') {
      W = this.dice.mapRawToMapped(wMapping, mappedWOrRng);
      this.lastMappedW = W;
      console.debug('[CharacterDataService] mappedW via mapping ->', W);
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
    // Mag (magic) should always be 0 per requirement
    const Mag = 0;
    // IP ma zawsze wartość 0 zgodnie z wymaganiem
    const IP = 0;
    // FP: jeśli przekazano rng -> wylosuj FP używając mapy zależnej od rasy i zapisz w cache.
    // Jeśli przekazano liczbę -> użyj jej i zapisz w cache. W przeciwnym razie użyj cache lub
    // wykonaj fallbackowe obliczenie (stare zachowanie).
    let FP: number;
    const fpMapping = this.raceBases.getFPMapping(this.race());
    if (typeof mappedWOrRng !== 'undefined' && typeof mappedWOrRng !== 'number') {
      // use mapping to derive FP from a single d10 roll
      FP = this.dice.mapRawToMapped(fpMapping, mappedWOrRng);
      this.lastComputedFP = FP;
    } else if (typeof mappedWOrRng === 'number') {
      FP = mappedWOrRng;
      this.lastComputedFP = FP;
    } else if (this.lastComputedFP != null) {
      FP = this.lastComputedFP;
    } else {
      // fallback to previous formula if no rng provided
      FP = Math.max(1, Math.floor((T + WP) / 20));
      this.lastComputedFP = FP;
    }

    this.secondaryStats.set({A, W, SB, TB, M, Mag, IP, FP});
    console.debug('[CharacterDataService] secondaryStats set ->', {A, W, SB, TB, M, Mag, IP, FP});
  }

  // Wydzielona logika przeliczania SB i TB
  private computeSBandTB(): { SB: number; TB: number } {
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
    this.deriveSecondaries();
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
            this.lastRollDisplay.set(`${found.label}: ${found.base + 11} (Shallya +11; roll ${rolled} +${found.base})`);
          } else {
            this.lastRollDisplay.set(`${found.label}: ${found.base + 11} (Shallya +11)`);
          }
        } else if (typeof rolled === 'number') {
          this.lastRollDisplay.set(`${found.label}: ${found.base + rolled} (roll ${rolled} +${found.base})`);
        } else {
          this.lastRollDisplay.set(`${found.label}: ${found.base} (base ${found.base})`);
        }
      }
    } else {
      const totals = arr.map(s => s.rolledStat).filter((t): t is number => typeof t === 'number');
      if (totals.length > 0) {
        const sum = totals.reduce((a, b) => a + b, 0);
        const avg = sum / totals.length;
        const avgDisplay = Number.isInteger(avg) ? `${avg}` : `${avg.toFixed(1)}`;
        this.lastRollDisplay.set(`AVG: ${avgDisplay}`);
      } else {
        this.lastRollDisplay.set(`+${this.humanBase}`);
      }
    }
  }

  // Expose button state for Mercy UI (variant, label, disabled) as getters so template can read them
  get mercyVariant(): 'save' | 'cancel' {
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
    const hasMercy = this.primaryStats().some(s => s.shallyasMercy);
    return hasMercy || !this.selectedStat();
  }

  // Avoid arrow functions in template bindings by exposing a getter used by the template
  get primaryStatsHasMercy(): boolean {
    return this.primaryStats().some(s => s.shallyasMercy);
  }
}
