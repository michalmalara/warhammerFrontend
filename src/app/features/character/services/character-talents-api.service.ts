import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterTalentDto {
  id: number;
  talent: number;
  description?: string | null;
}

@Injectable({providedIn: 'root'})
export class CharacterTalentsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  list = (characterId: number): Observable<CharacterTalentDto[]> =>
    this.crud.list<CharacterTalentDto[]>(`${CharacterTalentsApiService.PATH}/${characterId}/talents/`);
}
