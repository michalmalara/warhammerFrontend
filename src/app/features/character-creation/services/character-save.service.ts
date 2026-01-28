import {inject, Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';

import {CharacterDataService, type PrimaryStatId} from './character-data.service';
import {CrudApiService} from '../../../shared/services/crud-api.service';
import {CharactersApiService} from '../../character/services/characters-api.service';
import type {CharacterCreatePayload} from '../../character/models/character.models';

type CharacterProfileCreateDto = {
  weaponSkills: number;
  ballisticSkills: number;
  strength: number;
  toughness: number;
  agility: number;
  intelligence: number;
  willpower: number;
  fellowship: number;

  attacks: number;
  wounds: number;
  movement: number;
  magic: number;
  insanityPoints: number;
  fatePoints: number;

  strengthBonusModifier?: number;
  toughnessBonusModifier?: number;

  // optional development fields - incremented when a free advance is selected
  weaponSkillsDevelopment?: number;
  ballisticSkillsDevelopment?: number;
  strengthDevelopment?: number;
  toughnessDevelopment?: number;
  agilityDevelopment?: number;
  intelligenceDevelopment?: number;
  willpowerDevelopment?: number;
  fellowshipDevelopment?: number;

  attacksDevelopment?: number;
  woundsDevelopment?: number;
  movementDevelopment?: number;
  magicDevelopment?: number;
};

type CharacterSkillCreateDto = { skill: number; level?: number };

type CharacterTalentCreateDto = { talent: number };

type CharacterProfessionCreateDto = { profession: number };

/**
 * Orkiestruje zapis postaci do backendu korzystając z istniejących endpointów w `characterSheet/urls.py`.
 *
 * Kontrakt:
 * - wejście: stan z `CharacterDataService`
 * - wyjście: utworzony Character (z id) z `/characters/`
 */
@Injectable({providedIn: 'root'})
export class CharacterSaveService {
  private readonly charData = inject(CharacterDataService);
  private readonly crud = inject(CrudApiService);
  private readonly charactersApi = inject(CharactersApiService);

  private static readonly CHARACTER_SHEET_PREFIX = 'character-sheet';

  private readonly toProfileDto = (): CharacterProfileCreateDto => {
    const primary = this.charData.primaryTotals();
    const secondary = this.charData.secondaryTotals();

    const getPrimary = (id: PrimaryStatId) => primary.find(s => s.id === id)?.value ?? 0;
    const getSecondary = (id: string) => secondary.find(s => s.id === id)?.value ?? 0;

    // attacks and magic are currently derived as constants in CharacterDataService
    const baseDto: CharacterProfileCreateDto = {
      weaponSkills: getPrimary('WS'),
      ballisticSkills: getPrimary('BS'),
      strength: getPrimary('S'),
      toughness: getPrimary('T'),
      agility: getPrimary('Ag'),
      intelligence: getPrimary('Int'),
      willpower: getPrimary('WP'),
      fellowship: getPrimary('Fel'),

      attacks: getSecondary('A'),
      wounds: getSecondary('W'),
      movement: getSecondary('M'),
      magic: getSecondary('Mag'),
      insanityPoints: getSecondary('IP'),
      fatePoints: getSecondary('FP'),

      strengthBonusModifier: 0,
      toughnessBonusModifier: 0,

      // start development values at 0 (optional)
      weaponSkillsDevelopment: 0,
      ballisticSkillsDevelopment: 0,
      strengthDevelopment: 0,
      toughnessDevelopment: 0,
      agilityDevelopment: 0,
      intelligenceDevelopment: 0,
      willpowerDevelopment: 0,
      fellowshipDevelopment: 0,

      attacksDevelopment: 0,
      woundsDevelopment: 0,
      movementDevelopment: 0,
      magicDevelopment: 0,
    };

    // If user selected a free advance (selectedCharacteristic), increment appropriate development
    const selected = this.charData.getSelectedCharacteristic();
    if (selected) {
      switch (selected) {
        // primary stats -> increment corresponding *Development
        case 'WS':
          baseDto.weaponSkillsDevelopment = (baseDto.weaponSkillsDevelopment ?? 0) + 1;
          break;
        case 'BS':
          baseDto.ballisticSkillsDevelopment = (baseDto.ballisticSkillsDevelopment ?? 0) + 1;
          break;
        case 'S':
          baseDto.strengthDevelopment = (baseDto.strengthDevelopment ?? 0) + 1;
          break;
        case 'T':
          baseDto.toughnessDevelopment = (baseDto.toughnessDevelopment ?? 0) + 1;
          break;
        case 'Ag':
          baseDto.agilityDevelopment = (baseDto.agilityDevelopment ?? 0) + 1;
          break;
        case 'Int':
          baseDto.intelligenceDevelopment = (baseDto.intelligenceDevelopment ?? 0) + 1;
          break;
        case 'WP':
          baseDto.willpowerDevelopment = (baseDto.willpowerDevelopment ?? 0) + 1;
          break;
        case 'Fel':
          baseDto.fellowshipDevelopment = (baseDto.fellowshipDevelopment ?? 0) + 1;
          break;

        // secondary stats -> map to their development fields
        case 'A':
          baseDto.attacksDevelopment = (baseDto.attacksDevelopment ?? 0) + 1;
          break;
        case 'W':
          baseDto.woundsDevelopment = (baseDto.woundsDevelopment ?? 0) + 1;
          break;
        case 'M':
          baseDto.movementDevelopment = (baseDto.movementDevelopment ?? 0) + 1;
          break;
        case 'Mag':
          baseDto.magicDevelopment = (baseDto.magicDevelopment ?? 0) + 1;
          break;

        // SB, TB, IP, FP do not have backend development fields - ignore them
        default:
          // no-op for unsupported selections
          break;
      }
    }

    return baseDto;
  };

  private readonly createProfile = async (): Promise<number> => {
    const path = `${CharacterSaveService.CHARACTER_SHEET_PREFIX}/profiles/`;
    const dto = this.toProfileDto();
    const created = await firstValueFrom(this.crud.create<{ id: number }, CharacterProfileCreateDto>(path, dto));
    return created.id;
  };

  private readonly createProfessionWrapper = async (): Promise<number> => {
    const profession = this.charData.getProfession();
    if (!profession) {
      throw new Error('Profession is required to save a character.');
    }
    const path = `${CharacterSaveService.CHARACTER_SHEET_PREFIX}/professions/`;
    const dto: CharacterProfessionCreateDto = {profession: profession.id};
    const created = await firstValueFrom(this.crud.create<{ id: number }, CharacterProfessionCreateDto>(path, dto));
    return created.id;
  };

  private readonly createSkillWrappers = async (): Promise<number[]> => {
    const skills = this.charData.getProfessionSkills();
    if (!skills.length) return [];

    const path = `${CharacterSaveService.CHARACTER_SHEET_PREFIX}/skills/`;

    const ids: number[] = [];
    for (const s of skills) {
      const dto: CharacterSkillCreateDto = {skill: s.id, level: 0};
      const created = await firstValueFrom(this.crud.create<{ id: number }, CharacterSkillCreateDto>(path, dto));
      ids.push(created.id);
    }
    return ids;
  };

  private readonly createTalentWrappers = async (): Promise<number[]> => {
    const talents = this.charData.getProfessionTalents();
    if (!talents.length) return [];

    const path = `${CharacterSaveService.CHARACTER_SHEET_PREFIX}/talents/`;

    const ids: number[] = [];
    for (const t of talents) {
      const dto: CharacterTalentCreateDto = {talent: t.id};
      const created = await firstValueFrom(this.crud.create<{ id: number }, CharacterTalentCreateDto>(path, dto));
      ids.push(created.id);
    }
    return ids;
  };

  save = async (): Promise<void> => {
    const b = this.charData.bio();
    const p = this.charData.getProfession() ?? {id: 0, trappings: ''};

    // 1) create dependent records
    const [characterProfileId, currentProfessionId, skillIds, talentIds] = await Promise.all([
      this.createProfile(),
      this.createProfessionWrapper(),
      this.createSkillWrappers(),
      this.createTalentWrappers(),
    ]);

    // 2) create character
    const payload: CharacterCreatePayload = {
      name: (b.name || 'Unnamed').trim(),
      race: (this.charData.race() ?? 'human') as string,
      gender: b.gender,
      age: b.age,
      eyes: b.eyeColor,
      hair: b.hairColor,
      currentProfession: currentProfessionId,
      characterProfile: characterProfileId,
      equipment: (p.trappings ?? '').trim(),
      goldCrowns: this.charData.goldCrowns?.() ?? undefined,
      characterSkills: skillIds,
      characterTalents: talentIds,
      careerPath: [currentProfessionId],
    };

    await firstValueFrom(this.charactersApi.create(payload));
  };
}
