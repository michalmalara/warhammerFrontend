import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {CreateTalentPayload, Talent} from '../models/talent.models';

@Injectable({providedIn: 'root'})
export class TalentsApiService {
  private readonly crud = inject(CrudApiService);

  /**
   * DRF router w Django: `path('professions/', include('professionsBank.urls'))`
   * + `router.register('talents', TalentView)`
   * => /professions/talents/
   */
  private static readonly PATH = '/professions/talents/';

  list() {
    return this.crud.list<Talent[]>(TalentsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Talent>(TalentsApiService.PATH, id);
  }

  create(body: CreateTalentPayload) {
    return this.crud.create<Talent, CreateTalentPayload>(TalentsApiService.PATH, body);
  }

  update(id: number, body: Partial<Talent>) {
    return this.crud.update<Talent, Partial<Talent>>(TalentsApiService.PATH, id, body);
  }

  patch(id: number, body: Partial<Talent>) {
    return this.crud.patch<Talent, Partial<Talent>>(TalentsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(TalentsApiService.PATH, id);
  }

  /**
   * Wyszukiwanie talentów (autocomplete).
   * Backend: TalentView ma filter_backends = [FullTextSearchFilter].
   */
  search(query: string) {
    const q = (query || '').trim();
    const params = q ? {search: q} : undefined;
    return this.crud.list<Talent[]>(TalentsApiService.PATH, params);
  }
}
