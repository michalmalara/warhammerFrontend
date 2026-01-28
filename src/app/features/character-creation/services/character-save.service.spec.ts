import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';

import {CharacterSaveService} from './character-save.service';
import {CrudApiService} from '../../../shared/services/crud-api.service';
import {CharactersApiService} from '../../character/services/characters-api.service';
import {CharacterDataService} from './character-data.service';

describe('CharacterSaveService', () => {
  it('creates profile wrappers and then creates character', async () => {
    const crud = {
      create: vi.fn((path: string) => {
        if (path.endsWith('/profiles/')) return of({id: 10});
        if (path.endsWith('/professions/')) return of({id: 20});
        if (path.endsWith('/skills/')) return of({id: 30});
        if (path.endsWith('/talents/')) return of({id: 40});
        return of({id: 99});
      }),
    } as unknown as CrudApiService;

    const charactersApi = {
      create: vi.fn(() => of({id: 1})),
    } as unknown as CharactersApiService;

    const charData = {
      bio: () => ({
        name: 'Test Name',
        gender: 'male',
        age: 25,
        starSign: '',
        eyeColor: 'Blue',
        hairColor: 'Brown',
        physicalMarkings: '',
      }),
      race: () => 'human',
      goldCrowns: () => 12,
      getProfession: () => ({id: 7, trappings: 'Backpack'}),
      getProfessionSkills: () => [{id: 101, name: 'Skill A'}],
      getProfessionTalents: () => [{id: 201, name: 'Talent A'}],
      getSelectedCharacteristic: () => null,
      primaryTotals: () => [
        {id: 'WS', value: 30},
        {id: 'BS', value: 31},
        {id: 'S', value: 32},
        {id: 'T', value: 33},
        {id: 'Ag', value: 34},
        {id: 'Int', value: 35},
        {id: 'WP', value: 36},
        {id: 'Fel', value: 37},
      ],
      secondaryTotals: () => [
        {id: 'A', value: 1},
        {id: 'W', value: 12},
        {id: 'SB', value: 3},
        {id: 'TB', value: 3},
        {id: 'M', value: 5},
        {id: 'Mag', value: 0},
        {id: 'IP', value: 0},
        {id: 'FP', value: 2},
      ],
    } as unknown as CharacterDataService;

    await TestBed.configureTestingModule({
      providers: [
        CharacterSaveService,
        {provide: CrudApiService, useValue: crud},
        {provide: CharactersApiService, useValue: charactersApi},
        {provide: CharacterDataService, useValue: charData},
      ],
    }).compileComponents();

    const service = TestBed.inject(CharacterSaveService);
    await service.save();

    expect((crud.create as any)).toHaveBeenCalledWith('character-sheet/profiles/', expect.anything());
    expect((crud.create as any)).toHaveBeenCalledWith('character-sheet/professions/', {profession: 7});
    expect((crud.create as any)).toHaveBeenCalledWith('character-sheet/skills/', {skill: 101, level: 0});
    expect((crud.create as any)).toHaveBeenCalledWith('character-sheet/talents/', {talent: 201});

    expect((charactersApi.create as any)).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Name',
        race: 'human',
        currentProfession: 20,
        characterProfile: 10,
        characterSkills: [30],
        characterTalents: [40],
        careerPath: [20],
      }),
    );
  });
});
