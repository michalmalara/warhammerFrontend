import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {CreateSkillPayload, Skill} from '../models/skill.models';

@Injectable({providedIn: 'root'})
export class SkillsApiService {
  private readonly crud = inject(CrudApiService);

  /**
   * DRF router w Django: `path('professions/', include('professionsBank.urls'))`
   * + `router.register('skills', SkillView)`
   * => /professions/skills/
   */
  private static readonly PATH = '/professions/skills/';

  list() {
    return this.crud.list<Skill[]>(SkillsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Skill>(SkillsApiService.PATH, id);
  }

  create(body: CreateSkillPayload) {
    return this.crud.create<Skill, CreateSkillPayload>(SkillsApiService.PATH, body);
  }

  update(id: number, body: Partial<Skill>) {
    return this.crud.update<Skill, Partial<Skill>>(SkillsApiService.PATH, id, body);
  }

  patch(id: number, body: Partial<Skill>) {
    return this.crud.patch<Skill, Partial<Skill>>(SkillsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(SkillsApiService.PATH, id);
  }
}

