import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CharacterStatsComponent } from '../character-stats/character-stats.component';
import { WoundsPanelComponent } from '../wounds-panel/wounds-panel.component';
import { EquipmentTableComponent } from '../equipment-table/equipment-table.component';

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, MatIconModule, MatTabsModule, CharacterStatsComponent, WoundsPanelComponent, EquipmentTableComponent],
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
    { label: 'WS', value: 34 },
    { label: 'BS', value: 31 },
    { label: 'S',  value: 35 },
    { label: 'T',  value: 38 },
    { label: 'A',  value: 32 },
    { label: 'Int',value: 29 },
    { label: 'WP', value: 36 },
    { label: 'Fel',value: 30 }
  ];
  secondaryStats: { label: string; value: number }[] = [
    {label:'A',value:1},{label:'W',value:12},{label:'SB',value:3},{label:'TB',value:3},{label:'M',value:4},{label:'MAG',value:0},{label:'IP',value:2},{label:'FP',value:3}
  ];

  // Wounds state (kept as simple fields so parent can persist/observe value)
  woundsMax = 12;
  woundsCurrent = this.woundsMax;

  get xpPercent() {
    if (!this.xpMax) return 0;
    return Math.round((this.xpCurrent / this.xpMax) * 100);
  }

  // equipment moved to EquipmentTableComponent

  // Wound-state getters moved to WoundsPanelComponent
}
