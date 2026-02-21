import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterEquipmentDto {
  id: number;
  item: number;
  quality: number;
  quantity: number;
}

@Injectable({providedIn: 'root'})
export class CharacterEquipmentApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  list = (characterId: number): Observable<CharacterEquipmentDto[]> =>
    this.crud.list<CharacterEquipmentDto[]>(`${CharacterEquipmentApiService.PATH}/${characterId}/equipment/`);

  create = (characterId: number, body: Omit<CharacterEquipmentDto, 'id'>) =>
    this.crud.create<CharacterEquipmentDto, Omit<CharacterEquipmentDto, 'id'>>(
      `${CharacterEquipmentApiService.PATH}/${characterId}/equipment/`,
      body,
    );

  patch = (characterId: number, id: number, body: Partial<CharacterEquipmentDto>) =>
    this.crud.patch<CharacterEquipmentDto, Partial<CharacterEquipmentDto>>(
      `${CharacterEquipmentApiService.PATH}/${characterId}/equipment/`,
      id,
      body,
    );

  delete = (characterId: number, id: number) =>
    this.crud.delete(`${CharacterEquipmentApiService.PATH}/${characterId}/equipment/`, id);
}

