import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {CharacterListService} from '../../services/character-list.service';
import {CharacterTileComponent} from '../character-tile/character-tile.component';
import type {CharacterListItem} from '../../models/character-list-item.models';

@Component({
  selector: 'characters-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CharacterTileComponent,
  ],
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.scss'],
})
export class CharactersListComponent {
  private readonly listService = inject(CharacterListService);

  readonly characters$ = this.listService.listTiles();

  trackById = (_: number, c: CharacterListItem) => c.id;
}
