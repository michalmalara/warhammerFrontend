import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterArmorDto {
  id: number;
  armor: number;
  quality: number;
}

@Injectable({providedIn: 'root'})
export class CharacterArmorApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  list = (characterId: number): Observable<CharacterArmorDto[]> =>
    this.crud.list<CharacterArmorDto[]>(`${CharacterArmorApiService.PATH}/${characterId}/armor/`);

  create = (characterId: number, body: Omit<CharacterArmorDto, 'id'>) =>
    this.crud.create<CharacterArmorDto, Omit<CharacterArmorDto, 'id'>>(
      `${CharacterArmorApiService.PATH}/${characterId}/armor/`,
      body,
    );

  patch = (characterId: number, id: number, body: Partial<CharacterArmorDto>) =>
    this.crud.patch<CharacterArmorDto, Partial<CharacterArmorDto>>(
      `${CharacterArmorApiService.PATH}/${characterId}/armor/`,
      id,
      body,
    );

  delete = (characterId: number, id: number) =>
    this.crud.delete(`${CharacterArmorApiService.PATH}/${characterId}/armor/`, id);
}

