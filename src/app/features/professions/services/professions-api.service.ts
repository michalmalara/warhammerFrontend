import {inject, Injectable} from '@angular/core';
import {map} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import {CreateProfessionPayload, Profession} from '../models/profession.models';

// Payload dla update/patch (backend oczekuje ID w polach relacji, a nie zagnieżdżonych obiektów)
export type ProfessionUpsertPayload =
  Partial<Omit<Profession, 'skills' | 'talents' | 'entryProfessions' | 'exitProfessions'>>
  & {
  skills?: number[];
  talents?: number[];
  entryProfessions?: number[];
  exitProfessions?: number[];
  weapons?: number[];
  armors?: number[];
  trappings?: string;
};

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

  update(id: number, body: ProfessionUpsertPayload) {
    return this.crud.update<Profession, ProfessionUpsertPayload>(ProfessionsApiService.PATH, id, body);
  }

  patch(id: number, body: ProfessionUpsertPayload) {
    return this.crud.patch<Profession, ProfessionUpsertPayload>(ProfessionsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(ProfessionsApiService.PATH, id);
  }

  /**
   * Draw a profession for a given race using backend action 'draw'.
   * Returns the raw response from backend: { roll, matches, fallback, ... }
   * We normalize the response to ensure frontend always sees camelCase aliases for
   * alternative_skill / alternative_talent (alternativeSkill / alternativeTalent).
   */
  draw(race: string) {
    const url = `${ProfessionsApiService.PATH}draw/`;
    const params = race ? {race} : undefined;
    // Use list() to perform a GET with params against the custom action URL.
    return this.crud.list<any>(url, params).pipe(
      map((res: any) => this.normalizeDrawResponse(res)),
    );
  }

  /**
   * Wyszukiwanie profesji (autocomplete).
   * Jeżeli backend wspiera parametr `search`, można to wykorzystać w przyszłości.
   */
  search(query: string) {
    const params = query ? {search: query} : undefined;
    return this.crud.list<Profession[]>(ProfessionsApiService.PATH, params);
  }

  /**
   * Pobiera listę profesji możliwych do wylosowania dla danej rasy (backend action 'eligible').
   * Odpowiedź backendu to { race, count, eligible: Profession[] }.
   * Normalize eligible professions the same way as draw response.
   */
  eligible(race: string) {
    const url = `${ProfessionsApiService.PATH}eligible/`;
    const params = race ? {race} : undefined;
    return this.crud.list<any>(url, params).pipe(
      map((res: any) => {
        if (!res) return res;
        if (Array.isArray(res.eligible)) {
          res.eligible = res.eligible.map((p: any) => this.normalizeProfession(p));
        }
        return res;
      }),
    );
  }

  private normalizeDrawResponse(res: any): any {
    if (!res) return res;

    if (Array.isArray(res.matches)) {
      res.matches = res.matches.map((p: any) => this.normalizeProfession(p));
    }

    if (res.profession) {
      res.profession = this.normalizeProfession(res.profession);
    }

    return res;
  }

  private normalizeProfession(p: any): any {
    if (!p || typeof p !== 'object') return p;

    // normalize skills
    if (Array.isArray(p.skills)) {
      p.skills = p.skills.map((s: any) => {
        if (!s || typeof s !== 'object') return s;
        // prefer existing camelCase; fall back to snake_case
        if (!s.alternativeSkill && s.alternative_skill) s.alternativeSkill = s.alternative_skill;

        // ensure alternatives themselves are preserved
        if (Array.isArray(s.alternativeSkill)) {
          s.alternativeSkill = s.alternativeSkill.map((alt: any) => alt);
        }
        return s;
      });
    }

    // normalize talents
    if (Array.isArray(p.talents)) {
      p.talents = p.talents.map((t: any) => {
        if (!t || typeof t !== 'object') return t;
        if (!t.alternativeTalent && t.alternative_talent) t.alternativeTalent = t.alternative_talent;
        if (Array.isArray(t.alternativeTalent)) {
          t.alternativeTalent = t.alternativeTalent.map((alt: any) => alt);
        }
        return t;
      });
    }

    return p;
  }
}
