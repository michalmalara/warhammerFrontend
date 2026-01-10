import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'equipment-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './equipment-table.component.html',
  styleUrls: ['./equipment-table.component.scss']
})
export class EquipmentTableComponent {
  // Equipment for the material table (moved from character-card)
  equipment = [
    { name: 'Broadsword', enc: 50, dmg: 'SB', range: '--', qualities: 'Standard' },
    { name: 'Crossbow', enc: 120, dmg: '4', range: '30/60', qualities: 'Reload (full)' },
    { name: 'Mail Shirt', enc: 80, dmg: '--', range: '--', qualities: 'Armour (1) Body' }
  ];

  displayedColumns: string[] = ['name', 'enc', 'dmg', 'range', 'qualities'];
  dataSource = this.equipment;
}

