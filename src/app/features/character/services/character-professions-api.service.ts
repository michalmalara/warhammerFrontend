import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterProfessionDto {
  id: number;
  profession: number;
}

export interface CharacterProfessionsListDto {
  currentProfession: CharacterProfessionDto | null;
  careerPath: CharacterProfessionDto[];
}

@Injectable({providedIn: 'root'})
export class CharacterProfessionsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  list = (characterId: number): Observable<CharacterProfessionsListDto> =>
    this.crud.list<CharacterProfessionsListDto>(`${CharacterProfessionsApiService.PATH}/${characterId}/professions/`);

  create = (characterId: number, body: Omit<CharacterProfessionDto, 'id'>, options?: {
    setCurrent?: boolean;
    addToCareerPath?: boolean
  }) => {
    const params: Record<string, string> = {};
    if (options?.setCurrent) params['set_current'] = '1';
    if (options?.addToCareerPath === false) params['add_to_career_path'] = '0';
    // CrudApiService.create nie przyjmuje params; for now create without params — components can append query params separately if needed
    return this.crud.create<CharacterProfessionDto, Omit<CharacterProfessionDto, 'id'>>(
      `${CharacterProfessionsApiService.PATH}/${characterId}/professions/`,
      body,
    );
  }

  patch = (characterId: number, id: number, body: Partial<CharacterProfessionDto>) =>
    this.crud.patch<CharacterProfessionDto, Partial<CharacterProfessionDto>>(
      `${CharacterProfessionsApiService.PATH}/${characterId}/professions/`,
      id,
      body,
    );

  delete = (characterId: number, id: number) =>
    this.crud.delete(`${CharacterProfessionsApiService.PATH}/${characterId}/professions/`, id);
}
