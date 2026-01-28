import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterSkillDto {
  id: number;
  skill: number;
  level: number;
}

@Injectable({providedIn: 'root'})
export class CharacterSkillsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  list = (characterId: number): Observable<CharacterSkillDto[]> =>
    this.crud.list<CharacterSkillDto[]>(`${CharacterSkillsApiService.PATH}/${characterId}/skills/`);
}
