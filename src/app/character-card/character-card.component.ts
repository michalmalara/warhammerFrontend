import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CharacterStatsComponent } from '../character-stats/character-stats.component';

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, MatIconModule, CharacterStatsComponent],
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
  primaryStats: number[] = [34,31,35,38,32,29,36,30];
  secondaryStats: { label: string; value: number }[] = [
    {label:'A',value:1},{label:'W',value:12},{label:'SB',value:3},{label:'TB',value:3},{label:'M',value:4},{label:'MAG',value:0},{label:'IP',value:2},{label:'FP',value:3}
  ];

  // Wounds state (for the Wounds panel)
  woundsMax = 12;
  // start at full (max) and decrease as damage is taken
  woundsCurrent = this.woundsMax;

  // Increment wounds (cannot exceed max)
  incWounds() {
    // healing: increase remaining wounds up to max
    if (this.woundsCurrent < this.woundsMax) this.woundsCurrent++;
  }

  // Decrement wounds (cannot go below 0)
  decWounds() {
    // take damage: decrease remaining wounds down to 0
    if (this.woundsCurrent > 0) this.woundsCurrent--;
  }

  // Display wounds with two-digit padding like the mockup
  get woundsDisplay(): string {
    return String(this.woundsCurrent).padStart(2, '0');
  }

  // Simple status string based on thresholds (adjustable)
  get woundsStatus(): string {
    // If no remaining wounds => critical
    if (this.woundsCurrent === 0) return 'Critical';
    const woundsTaken = this.woundsMax - this.woundsCurrent;
    if (woundsTaken >= Math.ceil(this.woundsMax * 0.75)) return 'HEAVILY WOUNDED';
    if (woundsTaken >= Math.ceil(this.woundsMax * 0.5)) return 'WOUNDED';
    return '';
  }

  get xpPercent() {
    if (!this.xpMax) return 0;
    return Math.round((this.xpCurrent / this.xpMax) * 100);
  }

  // Equipment for the material table
  equipment = [
    { name: 'Broadsword', enc: 50, dmg: 'SB', range: '--', qualities: 'Standard' },
    { name: 'Crossbow', enc: 120, dmg: '4', range: '30/60', qualities: 'Reload (full)' },
    { name: 'Mail Shirt', enc: 80, dmg: '--', range: '--', qualities: 'Armour (1) Body' }
  ];

  displayedColumns: string[] = ['name', 'enc', 'dmg', 'range', 'qualities'];
  dataSource = this.equipment;

  // Convenience getters used by template for setting wound-state classes
  get isCritical(): boolean {
    const woundsTaken = this.woundsMax - this.woundsCurrent;
    return woundsTaken >= Math.ceil(this.woundsMax * 0.75);
  }

  get isWounded(): boolean {
    const woundsTaken = this.woundsMax - this.woundsCurrent;
    return woundsTaken >= Math.ceil(this.woundsMax * 0.5) && woundsTaken < Math.ceil(this.woundsMax * 0.75);
  }

  // Healthy flag: when remaining wounds is above 10
  get isHealthy(): boolean {
    return this.woundsCurrent > 10;
  }
}
