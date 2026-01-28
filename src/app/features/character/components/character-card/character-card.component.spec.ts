import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {of} from 'rxjs';

import {CharacterCardComponent} from './character-card.component';
import {CharactersApiService} from '../../services/characters-api.service';
import {CharacterProfileApiService} from '../../services/character-profile-api.service';
import {CharacterSkillsApiService} from '../../services/character-skills-api.service';
import {CharacterTalentsApiService} from '../../services/character-talents-api.service';
import {SkillsApiService} from '../../../skills/services/skills-api.service';
import {TalentsApiService} from '../../../talents/services/talents-api.service';

describe('CharacterCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCardComponent],
      providers: [
        {
          provide: CharactersApiService,
          useValue: {
            getById: () =>
              of({
                id: 1,
                name: 'Test Character',
                race: 'human',
                currentProfessionName: 'Roadwarden',
                experiencePoints: 100,
                totalExperiencePoints: 200,
              }),
          },
        },
        {
          provide: CharacterProfileApiService,
          useValue: {
            getCharacterProfile: () =>
              of({
                id: 10,
                weaponSkills: 30,
                weaponSkillsDevelopment: 0,
                weaponSkillsModifier: 0,
                ballisticSkills: 31,
                ballisticSkillsDevelopment: 0,
                ballisticSkillsModifier: 0,
                strength: 32,
                strengthDevelopment: 0,
                strengthModifier: 0,
                toughness: 33,
                toughnessDevelopment: 0,
                toughnessModifier: 0,
                agility: 34,
                agilityDevelopment: 0,
                agilityModifier: 0,
                intelligence: 35,
                intelligenceDevelopment: 0,
                intelligenceModifier: 0,
                willpower: 36,
                willpowerDevelopment: 0,
                willpowerModifier: 0,
                fellowship: 37,
                fellowshipDevelopment: 0,
                fellowshipModifier: 0,
                attacks: 1,
                attacksDevelopment: 0,
                attacksModifier: 0,
                wounds: 12,
                woundsDevelopment: 0,
                woundsModifier: 0,
                movement: 4,
                movementDevelopment: 0,
                movementModifier: 0,
                magic: 0,
                magicDevelopment: 0,
                magicModifier: 0,
                insanityPoints: 0,
                fatePoints: 2,
                strengthBonusModifier: 1,
                toughnessBonusModifier: 2,
              }),
          },
        },
        {
          provide: CharacterSkillsApiService,
          useValue: {
            list: () => of([{id: 1000, skill: 101, level: 2}]),
          },
        },
        {
          provide: CharacterTalentsApiService,
          useValue: {
            list: () => of([{id: 2000, talent: 201}]),
          },
        },
        {
          provide: SkillsApiService,
          useValue: {
            list: () =>
              of([
                {
                  id: 101,
                  name: 'Skill A',
                  associatedCharacteristic: 'weapon_skills',
                },
              ]),
          },
        },
        {
          provide: TalentsApiService,
          useValue: {
            list: () =>
              of([
                {
                  id: 201,
                  name: 'Talent A',
                  description: 'Talent description',
                },
              ]),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({id: '1'})),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders placeholder when portraitUrl is not provided', async () => {
    const fixture = TestBed.createComponent(CharacterCardComponent);
    fixture.componentInstance.portraitUrl = undefined;
    fixture.componentInstance.avatarUrl = './assetsassets/img/character-portrait-placeholder.png';
    fixture.detectChanges();
    await fixture.whenStable();

    const img = (fixture.nativeElement as HTMLElement).querySelector('.portrait img') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('src/src/assets/img/character-portrait-placeholder.png');
    expect(img!.getAttribute('alt')).toContain('Portrait');
  });

  it('renders character name from backend', async () => {
    const fixture = TestBed.createComponent(CharacterCardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const title = (fixture.nativeElement as HTMLElement).querySelector('h1.title')?.textContent ?? '';
    expect(title).toContain('Test Character');
  });

  it('renders skills and talents from backend', async () => {
    const fixture = TestBed.createComponent(CharacterCardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Skill A');
    expect(text).toContain('Talent A');
  });

  it('renders SB/TB modifiers from profile', async () => {
    const fixture = TestBed.createComponent(CharacterCardComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // strength=32, strengthModifier=0 => floor(32/10)=3 + strengthBonusModifier(1) => 4
    // toughness=33, toughnessModifier=0 => floor(33/10)=3 + toughnessBonusModifier(2) => 5
    expect(text).toContain('SB');
    expect(text).toContain('4');
    expect(text).toContain('TB');
    expect(text).toContain('5');
  });
});
