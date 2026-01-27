import {inject, Injectable} from '@angular/core';
import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {Character, CharacterCreatePayload} from '../models/character.models';

@Injectable({providedIn: 'root'})
export class CharactersApiService {
  private readonly crud = inject(CrudApiService);

  /**
   * Backend: `warhammer/urls.py` mounts CharacterSheet under `/character-sheet/`.
   * CharacterSheet router: `router.register('characters', CharacterViewSet)`
   * => `/character-sheet/characters/`
   */
  private static readonly PATH = '/character-sheet/characters/';

  list() {
    return this.crud.list<Character[]>(CharactersApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Character>(CharactersApiService.PATH, id);
  }

  create(body: CharacterCreatePayload) {
    return this.crud.create<Character, CharacterCreatePayload>(CharactersApiService.PATH, body);
  }

  patch(id: number, body: Partial<CharacterCreatePayload>) {
    return this.crud.patch<Character, Partial<CharacterCreatePayload>>(CharactersApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(CharactersApiService.PATH, id);
  }
}
