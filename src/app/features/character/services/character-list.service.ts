import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, tap} from 'rxjs';

import {CharactersApiService} from './characters-api.service';
import type {Character} from '../models/character.models';
import type {CharacterListItem} from '../models/character-list-item.models';

@Injectable({providedIn: 'root'})
export class CharacterListService {
  private readonly api = inject(CharactersApiService);

  listTiles = (): Observable<CharacterListItem[]> =>
    this.api.list().pipe(
      tap(list => console.debug('[CharacterListService] Loaded characters:', list)),
      map(cs => cs.map(this.toListItem)),
      catchError(err => {
        console.error('[CharacterListService] Failed to load characters list', err);
        return of([] as CharacterListItem[]);
      }),
    );

  private readonly toListItem = (c: Character): CharacterListItem => {
    const anyC = c as unknown as {
      lastName?: string | null;
      last_name?: string | null;
      allowDraft?: boolean | null;
      allow_draft?: boolean | null;
      current_profession_name?: string | null;
    };

    return {
      id: c.id,
      name: c.name,
      lastName: anyC.lastName ?? anyC.last_name ?? null,
      race: c.race ?? null,
      allowDraft: anyC.allowDraft ?? anyC.allow_draft ?? null,
      currentProfessionName: anyC.current_profession_name ?? null,
    };
  };
}
