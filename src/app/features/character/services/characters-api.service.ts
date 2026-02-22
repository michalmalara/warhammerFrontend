import {inject, Injectable} from '@angular/core';
import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {Character, CharacterCreatePayload} from '../models/character.models';
import {CHARACTERS_PATH} from './character-endpoints.util';

@Injectable({providedIn: 'root'})
export class CharactersApiService {
  private readonly crud = inject(CrudApiService);

  list() {
    return this.crud.list<Character[]>(CHARACTERS_PATH);
  }

  getById(id: number) {
    return this.crud.detail<Character>(CHARACTERS_PATH, id);
  }

  create(body: CharacterCreatePayload) {
    return this.crud.create<Character, CharacterCreatePayload>(CHARACTERS_PATH, body);
  }

  patch(id: number, body: Partial<CharacterCreatePayload>) {
    return this.crud.patch<Character, Partial<CharacterCreatePayload>>(CHARACTERS_PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(CHARACTERS_PATH, id);
  }
}
