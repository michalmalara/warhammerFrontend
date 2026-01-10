import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatCardModule, MatIconModule],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent {
  @Input() name = 'Gottfried von Hollen';
  @Input() title = 'Roadwarden';
  @Input() subtitle = 'CHARACTER DASHBOARD';
  @Input() xpCurrent = 450;
  @Input() xpMax = 1000;
  @Input() avatarUrl = '/assets/avatar-placeholder.png';

  // Wounds state (for the Wounds panel)
  woundsCurrent = 9;
  woundsMax = 12;

  // Increment wounds (cannot exceed max)
  incWounds() {
    if (this.woundsCurrent < this.woundsMax) this.woundsCurrent++;
  }

  // Decrement wounds (cannot go below 0)
  decWounds() {
    if (this.woundsCurrent > 0) this.woundsCurrent--;
  }

  // Display wounds with two-digit padding like the mockup
  get woundsDisplay(): string {
    return String(this.woundsCurrent).padStart(2, '0');
  }

  // Simple status string based on thresholds (adjustable)
  get woundsStatus(): string {
    if (this.woundsCurrent >= Math.ceil(this.woundsMax * 0.75)) return 'HEAVILY WOUNDED';
    if (this.woundsCurrent >= Math.ceil(this.woundsMax * 0.5)) return 'WOUNDED';
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
}
