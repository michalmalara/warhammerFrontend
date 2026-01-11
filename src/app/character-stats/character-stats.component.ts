import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

type Stat = {
  label: string;
  /** Bazowa wartość cechy (np. 31) */
  base?: number;
  /** Rozwój (advances) dodawany do bazy (np. 3) */
  adv?: number;
  /** Wartość końcowa do wyświetlenia (gdy niepodana: base + adv) */
  total?: number;
  /** Czy stat ma być pokazany jako procent (domyślnie dla primary) */
  isPercent?: boolean;
};

type StatGroup = 'primary' | 'secondary';

@Component({
  selector: 'character-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-stats.component.html',
  styleUrls: ['./character-stats.component.scss']
})
export class CharacterStatsComponent {
  @Input() primaryStats: Stat[] = [];
  @Input() secondaryStats: Stat[] = [];

  statTotal(s: Stat, group: StatGroup = 'secondary'): number {
    if (typeof s.total === 'number') return s.total;
    const base = typeof s.base === 'number' ? s.base : 0;
    const adv = typeof s.adv === 'number' ? s.adv : 0;
    const advMultiplier = group === 'primary' ? 5 : 1;
    return base + adv * advMultiplier;
  }

  isPercent(s: Stat, defaultValue: boolean): boolean {
    return typeof s.isPercent === 'boolean' ? s.isPercent : defaultValue;
  }
}
