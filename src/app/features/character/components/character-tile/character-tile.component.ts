import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';

import type {CharacterListItem} from '../../models/character-list-item.models';

@Component({
  selector: 'character-tile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './character-tile.component.html',
  styleUrls: ['./character-tile.component.scss'],
})
export class CharacterTileComponent {
  @Input({required: true}) character!: CharacterListItem;

  get displayName(): string {
    const last = (this.character.lastName ?? '').trim();
    return last ? `${this.character.name} ${last}` : this.character.name;
  }
}
