import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import {CreateProfessionPayload, Profession} from '../models/profession.models';

@Injectable({providedIn: 'root'})
export class ProfessionsApiService {
  private readonly crud = inject(CrudApiService);

  /**
   * Backend (warhammer/urls.py) montuje professionsBank pod '/professions/'.
   * Router DRF w professionsBank/urls.py rejestruje ProfessionView pod 'professions',
   * więc endpoint listy to '/professions/professions/'.
   */
  private static readonly PATH = '/professions/professions/';

  list() {
    // Zgodnie z serializerem ProfessionSerializer (GET): pełny obiekt Profession
    return this.crud.list<Profession[]>(ProfessionsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Profession>(ProfessionsApiService.PATH, id);
  }

  create(body: CreateProfessionPayload) {
    return this.crud.create<Profession, CreateProfessionPayload>(ProfessionsApiService.PATH, body);
  }

  update(id: number, body: Partial<Profession>) {
    return this.crud.update<Profession, Partial<Profession>>(ProfessionsApiService.PATH, id, body);
  }

  patch(id: number, body: Partial<Profession>) {
    return this.crud.patch<Profession, Partial<Profession>>(ProfessionsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(ProfessionsApiService.PATH, id);
  }

  /**
   * Wyszukiwanie profesji (autocomplete).
   * Jeśli backend wspiera parametr `search`, można to wykorzystać w przyszłości.
   */
  search(query: string) {
    const params = query ? {search: query} : undefined;
    return this.crud.list<Profession[]>(ProfessionsApiService.PATH, params);
  }
}
