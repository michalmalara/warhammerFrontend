import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // placeholder nav items; could be replaced by Inputs or a service
  nav = [
    { label: 'Character', icon: 'person' },
    { label: 'Inventory', icon: 'inventory' },
    { label: 'Journal', icon: 'book' },
    { label: 'Bestiary', icon: 'pets' }
  ];
}

