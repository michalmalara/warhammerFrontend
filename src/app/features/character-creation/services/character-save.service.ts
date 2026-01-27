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
    return {
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
    };
  };

  private readonly createProfile = async (): Promise<number> => {
    // Brak osobnego endpointu create dla profilu, więc tworzymy „pustą” postać? Nie.
    // Żeby zachować zgodność z zadaniem (użyć podanych endpointów), tworzymy profile w CharacterViewSet
    // przez minimalny POST potrzebujący character_profile. W backendzie nie ma create profilu.
    // Dlatego id profilu musimy uzyskać z backendu inaczej.
    // Najprostsze: stworzyć CharacterProfile bezpośrednio przez admin API? Tego nie ma.
    // => implementujemy minimalny endpoint w backendzie: POST /character-sheet/profiles/.
    // (Zrobimy to w backendzie w tej samej zmianie.)
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
    const bio = this.charData.bio();
    const race = this.charData.race() ?? 'human';

    // 1) create dependent records
    const [characterProfileId, currantProfessionId, skillIds, talentIds] = await Promise.all([
      this.createProfile(),
      this.createProfessionWrapper(),
      this.createSkillWrappers(),
      this.createTalentWrappers(),
    ]);

    // 2) create character
    const payload: CharacterCreatePayload = {
      name: (bio.name || 'Unnamed').trim(),
      race: race as string,
      gender: bio.gender,
      age: bio.age,
      eyes: bio.eyeColor,
      hair: bio.hairColor,
      currantProfession: currantProfessionId,
      careerPath: [currantProfessionId],
      characterProfile: characterProfileId,
      characterSkills: skillIds,
      characterTalents: talentIds,
      equipment: (this.charData.getProfession()?.trappings ?? '').trim(),
      goldCrowns: this.charData.goldCrowns() ?? undefined,
    };

    await firstValueFrom(this.charactersApi.create(payload));
  };
}
