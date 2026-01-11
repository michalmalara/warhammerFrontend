import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {CharacterStatsComponent} from '../character-stats/character-stats.component';
import {WoundsPanelComponent} from '../wounds-panel/wounds-panel.component';
import {EquipmentTableComponent} from '../equipment-table/equipment-table.component';
import {SkillsComponent} from '../skills/skills.component';
import {CharacterSkill} from '../skills/skills.types';
import {TalentsComponent} from '../talents/talents.component';
import {Talent} from '../talents/talents.types';
import {FatePointsComponent} from '../fate-points/fate-points.component';
import {ProfessionHistoryComponent} from '../profession-history/profession-history.component';
import {ProfessionHistoryEntry} from '../profession-history/profession-history.types';

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, MatIconModule, MatTabsModule, CharacterStatsComponent, WoundsPanelComponent, EquipmentTableComponent, SkillsComponent, TalentsComponent, FatePointsComponent, ProfessionHistoryComponent],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent {
  // expose global Math to the template (Angular templates only see component properties)
  readonly Math = Math;
  @Input() name = 'Gottfried von Hollen';
  @Input() title = 'Roadwarden';
  @Input() subtitle = 'CHARACTER DASHBOARD';
  @Input() xpCurrent = 450;
  @Input() xpMax = 1000;

  /**
   * Wsteczna kompatybilność (używane też w sidebarze). Jeśli nie podasz `portraitUrl`,
   * komponent spróbuje użyć `avatarUrl`.
   */
  @Input() avatarUrl = '/assets/avatar-placeholder.png';

  /** URL portretu postaci do wyświetlenia obok imienia. */
  @Input() portraitUrl?: string;

  /** Tekst alternatywny dla portretu (dostępność / screenreadery). */
  @Input() portraitAlt?: string;

  get effectivePortraitUrl(): string {
    const url = (this.portraitUrl ?? '').trim() || (this.avatarUrl ?? '').trim();
    return url || '/assets/avatar-placeholder.png';
  }

  get effectivePortraitAlt(): string {
    const alt = (this.portraitAlt ?? '').trim();
    return alt || `Portret: ${this.name}`;
  }

  /** Historia profesji (mock) – docelowo do podpięcia pod backend. */
  professionHistory: ProfessionHistoryEntry[] = [
    {
      id: 'ph-3',
      profession: 'Roadwarden',
      dateLabel: 'Current',
      note: 'Assigned to patrol the Altdorf–Bogenhafen road. Keeps records of incidents and tolls.'
    },
    {
      id: 'ph-2',
      profession: 'Watchman',
      dateLabel: 'Earlier',
      note: 'Served in the city watch. Learned to spot trouble and keep order.'
    },
    {
      id: 'ph-1',
      profession: 'Recruit',
      dateLabel: 'Past',
      note: 'First steps in the militia.'
    }
  ];

  // Primary / Secondary stats moved to a separate component
  primaryStats: { label: string; base: number; adv: number }[] = [
    {label: 'WS', base: 31, adv: 3},
    {label: 'BS', base: 26, adv: 5},
    {label: 'S', base: 35, adv: 0},
    {label: 'T', base: 33, adv: 5},
    {label: 'A', base: 27, adv: 5},
    {label: 'Int', base: 29, adv: 0},
    {label: 'WP', base: 31, adv: 5},
    {label: 'Fel', base: 30, adv: 0}
  ];
  secondaryStats: { label: string; base: number; adv: number }[] = [
    {label: 'A', base: 1, adv: 1},
    {label: 'W', base: 12, adv: 3},
    {label: 'SB', base: 3, adv: 0},
    {label: 'TB', base: 3, adv: 0},
    {label: 'M', base: 4, adv: 0},
    {label: 'MAG', base: 0, adv: 0},
    {label: 'IP', base: 2, adv: 0},
    {label: 'FP', base: 3, adv: 0}
  ];

  // Wounds state (kept as simple fields so parent can persist/observe value)
  woundsMax = 15;
  woundsCurrent = this.woundsMax;

  get xpPercent() {
    if (!this.xpMax) return 0;
    return Math.round((this.xpCurrent / this.xpMax) * 100);
  }

  // equipment moved to EquipmentTableComponent

  // Wound-state getters moved to WoundsPanelComponent

  /** Mock danych dla taba Skills – do podpięcia pod backend w kolejnym kroku. */
  skills: CharacterSkill[] = [
    {
      id: 'animal-care',
      skill: {id: 'animal-care', name: 'Animal Care', characteristic: 'INT'},
      basePercent: 29,
      taken: true,
      advPlus10: false,
      advPlus20: false
    },
    {
      id: 'gossip',
      skill: {id: 'gossip', name: 'Gossip', characteristic: 'FEL'},
      basePercent: 40,
      taken: true,
      advPlus10: true,
      advPlus20: false
    },
    {
      id: 'search',
      skill: {id: 'search', name: 'Search', characteristic: 'INT'},
      basePercent: 29,
      taken: true,
      advPlus10: true,
      advPlus20: true
    },
    {
      id: 'common-knowledge-empire',
      skill: {id: 'common-knowledge-empire', name: 'Common Knowledge (Empire)', characteristic: 'INT'},
      basePercent: 39,
      taken: true,
      advPlus10: true,
      advPlus20: false
    },
    {
      id: 'outdoor-survival',
      skill: {id: 'outdoor-survival', name: 'Outdoor Survival', characteristic: 'INT'},
      basePercent: 29,
      taken: true,
      advPlus10: false,
      advPlus20: false
    },
    {
      id: 'speak-language-reikspiel',
      skill: {id: 'speak-language-reikspiel', name: 'Speak Language (Reikspiel)', characteristic: 'INT'},
      basePercent: 39,
      taken: true,
      advPlus10: false,
      advPlus20: false
    },
    {
      id: 'drive',
      skill: {id: 'drive', name: 'Drive', characteristic: 'S'},
      basePercent: 35,
      taken: true,
      advPlus10: false,
      advPlus20: false
    },
    {
      id: 'perception',
      skill: {id: 'perception', name: 'Perception', characteristic: 'INT'},
      basePercent: 39,
      taken: true,
      advPlus10: true,
      advPlus20: false
    },
    {
      id: 'swim',
      skill: {id: 'swim', name: 'Swim', characteristic: 'S'},
      basePercent: 35,
      taken: true,
      advPlus10: false,
      advPlus20: false
    }
  ];

  /** Mock danych dla taba Talents – do podpięcia pod backend w kolejnym kroku. */
  talents: Talent[] = [
    {
      id: 'coolheaded',
      name: 'Coolheaded',
      description: 'You can retry one failed Cool Test per session.'
    },
    {
      id: 'night-vision',
      name: 'Night Vision',
      description: 'You can see in the dark as if it were dim light.'
    },
    {
      id: 'hardy',
      name: 'Hardy',
      description: 'Increase your Wounds by +1.'
    },
    {
      id: 'rapid-reload',
      name: 'Rapid Reload',
      description: 'You reload ranged weapons faster than normal.'
    }
  ];

  /** Fate/Fortune – mock pod kartę Fate Points (zgodnie z mockupem). */
  fateMax = 4;
  fateCurrent = 3;
  fortuneCurrent = 2;

  onPortraitError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;

    // unikamy pętli, jeśli placeholder też byłby niedostępny
    if (img.src.endsWith('/assets/avatar-placeholder.png')) return;
    img.src = '/assets/avatar-placeholder.png';
  }
}
