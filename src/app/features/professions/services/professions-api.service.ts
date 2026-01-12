import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import {Profession, ProfessionSummary} from '../models/profession.models';

@Injectable({providedIn: 'root'})
export class ProfessionsApiService {
  private readonly crud = inject(CrudApiService);

  /**
   * Endpointy DRF. Jeśli w backendzie są inne, zmień tylko tę stałą.
   *
   * Przykłady:
   * - '/api/professions/'
   * - '/professionsBank/professions/'
   */
  private static readonly PATH = '/api/professions/';

  list() {
    return this.crud.list<Array<ProfessionSummary | Profession>>(ProfessionsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Profession>(ProfessionsApiService.PATH, id);
  }

  create(body: Partial<Profession>) {
    return this.crud.create<Profession, Partial<Profession>>(ProfessionsApiService.PATH, body);
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
}
