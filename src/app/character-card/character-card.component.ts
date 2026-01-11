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

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, MatIconModule, MatTabsModule, CharacterStatsComponent, WoundsPanelComponent, EquipmentTableComponent, SkillsComponent, TalentsComponent],
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
  @Input() avatarUrl = '/assets/avatar-placeholder.png';

  // Primary / Secondary stats moved to a separate component
  primaryStats: { label: string; value: number }[] = [
    {label: 'WS', value: 34},
    {label: 'BS', value: 31},
    {label: 'S', value: 35},
    {label: 'T', value: 38},
    {label: 'A', value: 32},
    {label: 'Int', value: 29},
    {label: 'WP', value: 36},
    {label: 'Fel', value: 30}
  ];
  secondaryStats: { label: string; value: number }[] = [
    {label: 'A', value: 1}, {label: 'W', value: 12}, {label: 'SB', value: 3}, {label: 'TB', value: 3}, {
      label: 'M',
      value: 4
    }, {label: 'MAG', value: 0}, {label: 'IP', value: 2}, {label: 'FP', value: 3}
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
      advPlus10: false,
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
}
