import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterWeaponDto {
  id: number;
  weapon: number;
  ammunition: number;
  quality: number;
}

@Injectable({providedIn: 'root'})
export class CharacterWeaponsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  list = (characterId: number): Observable<CharacterWeaponDto[]> =>
    this.crud.list<CharacterWeaponDto[]>(`${CharacterWeaponsApiService.PATH}/${characterId}/weapons/`);

  create = (characterId: number, body: Omit<CharacterWeaponDto, 'id'>) =>
    this.crud.create<CharacterWeaponDto, Omit<CharacterWeaponDto, 'id'>>(
      `${CharacterWeaponsApiService.PATH}/${characterId}/weapons/`,
      body,
    );

  patch = (characterId: number, id: number, body: Partial<CharacterWeaponDto>) =>
    this.crud.patch<CharacterWeaponDto, Partial<CharacterWeaponDto>>(
      `${CharacterWeaponsApiService.PATH}/${characterId}/weapons/`,
      id,
      body,
    );

  delete = (characterId: number, id: number) =>
    this.crud.delete(`${CharacterWeaponsApiService.PATH}/${characterId}/weapons/`, id);
}

