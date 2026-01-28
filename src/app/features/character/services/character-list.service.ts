import {inject, Injectable} from '@angular/core';
import {catchError, Observable, of, tap} from 'rxjs';

import {CharactersApiService} from './characters-api.service';
import type {CharacterListItem} from '../models/character-list-item.models';

@Injectable({providedIn: 'root'})
export class CharacterListService {
  private readonly api = inject(CharactersApiService);

  listTiles = (): Observable<CharacterListItem[]> =>
    this.api.list().pipe(
      tap(list => console.debug('[CharacterListService] Loaded characters:', list)),
      catchError(err => {
        console.error('[CharacterListService] Failed to load characters list', err);
        return of([] as CharacterListItem[]);
      }),
    );
}
