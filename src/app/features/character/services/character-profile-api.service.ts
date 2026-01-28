import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {CrudApiService} from '../../../shared/services/crud-api.service';

export interface CharacterProfileDto {
  id: number;

  weaponSkills: number;
  weaponSkillsDevelopment: number;
  weaponSkillsModifier: number;

  ballisticSkills: number;
  ballisticSkillsDevelopment: number;
  ballisticSkillsModifier: number;

  strength: number;
  strengthDevelopment: number;
  strengthModifier: number;

  toughness: number;
  toughnessDevelopment: number;
  toughnessModifier: number;

  agility: number;
  agilityDevelopment: number;
  agilityModifier: number;

  intelligence: number;
  intelligenceDevelopment: number;
  intelligenceModifier: number;

  willpower: number;
  willpowerDevelopment: number;
  willpowerModifier: number;

  fellowship: number;
  fellowshipDevelopment: number;
  fellowshipModifier: number;

  attacks: number;
  attacksDevelopment: number;
  attacksModifier: number;

  wounds: number;
  woundsDevelopment: number;
  woundsModifier: number;

  movement: number;
  movementDevelopment: number;
  movementModifier: number;

  magic: number;
  magicDevelopment: number;
  magicModifier: number;

  insanityPoints: number;
  fatePoints: number;

  strengthBonusModifier: number;
  toughnessBonusModifier: number;
}

@Injectable({providedIn: 'root'})
export class CharacterProfileApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/character-sheet/characters';

  getCharacterProfile = (id: number): Observable<CharacterProfileDto> =>
    this.crud.list<CharacterProfileDto>(`${CharacterProfileApiService.PATH}/${id}/profile/`);
}
