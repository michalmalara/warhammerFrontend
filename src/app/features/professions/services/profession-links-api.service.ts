import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import {ProfessionSkill, ProfessionTalent} from '../models/profession.models';

export type CreateProfessionSkillPayload = {
  skill: number;
  alternativeSkill?: number[];
};

export type CreateProfessionTalentPayload = {
  talent: number;
  alternativeTalent?: number[];
};

@Injectable({providedIn: 'root'})
export class ProfessionLinksApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PROFESSION_SKILLS_PATH = '/professions/professions-skill/';
  private static readonly PROFESSION_TALENTS_PATH = '/professions/professions-talent/';

  createProfessionSkill(body: CreateProfessionSkillPayload) {
    return this.crud.create<ProfessionSkill, CreateProfessionSkillPayload>(
      ProfessionLinksApiService.PROFESSION_SKILLS_PATH,
      body
    );
  }

  createProfessionTalent(body: CreateProfessionTalentPayload) {
    return this.crud.create<ProfessionTalent, CreateProfessionTalentPayload>(
      ProfessionLinksApiService.PROFESSION_TALENTS_PATH,
      body
    );
  }

  deleteProfessionSkill(id: number) {
    return this.crud.delete(ProfessionLinksApiService.PROFESSION_SKILLS_PATH, id);
  }

  deleteProfessionTalent(id: number) {
    return this.crud.delete(ProfessionLinksApiService.PROFESSION_TALENTS_PATH, id);
  }
}
