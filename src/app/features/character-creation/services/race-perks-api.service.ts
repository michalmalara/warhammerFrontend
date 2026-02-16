import {inject, Injectable} from "@angular/core";

import {CrudApiService} from "../../../shared/services/crud-api.service";
import type {CharacterRace} from "../models/character-creation.models";
import type {ProfessionSkill, ProfessionTalent} from "../../professions/models/profession.models";

@Injectable({providedIn: "root"})
export class RacePerksApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly RACE_SKILLS_PATH = "/professions/race-skills/";
  private static readonly RACE_TALENTS_PATH = "/professions/race-talents/";

  getRaceSkills(race: CharacterRace) {
    return this.crud.list<ProfessionSkill[]>(RacePerksApiService.RACE_SKILLS_PATH, {race});
  }

  getRaceTalents(race: CharacterRace) {
    return this.crud.list<ProfessionTalent[]>(RacePerksApiService.RACE_TALENTS_PATH, {race});
  }
}

