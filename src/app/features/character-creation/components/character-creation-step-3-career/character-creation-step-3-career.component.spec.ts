import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {CharacterCreationStep3CareerComponent} from './character-creation-step-3-career.component';
import {ProfessionsApiService} from '../../../professions/services/professions-api.service';
import {CharacterDataService} from '../../services/character-data.service';
import {Profession} from '../../../professions/models/profession.models';

class CharacterDataServiceStub {
  race() {
    return 'human';
  }
}

class ProfessionsApiServiceStub {
  draw() {
    return of({roll: 1, matches: [], fallback: false, candidates: 0});
  }
}

describe('CharacterCreationStep3CareerComponent (advance scheme)', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [CharacterCreationStep3CareerComponent],
      providers: [
        provideRouter([]),
        {provide: CharacterDataService, useClass: CharacterDataServiceStub},
        {provide: ProfessionsApiService, useClass: ProfessionsApiServiceStub},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CharacterCreationStep3CareerComponent);
    fixture.detectChanges();
    return {fixture, component: fixture.componentInstance};
  }

  it('renders dashes when no profession is set', async () => {
    const {component} = await setup();

    expect(component.primaryAdvanceRow()).toEqual(['-', '-', '-', '-', '-', '-', '-', '-']);
    expect(component.secondaryAdvanceRow()).toEqual(['-', '-', '-', '-', '-', '-', '-', '-']);
  });

  it('maps primary developments to +5% steps and secondary to +1', async () => {
    const {component} = await setup();

    const p = {
      id: 1,
      name: 'Test',
      description: '',
      type: 'base',
      weaponSkillsDevelopment: 1,
      ballisticSkillsDevelopment: 2,
      strengthDevelopment: 0,
      toughnessDevelopment: 6,
      agilityDevelopment: 3,
      intelligenceDevelopment: 0,
      willpowerDevelopment: 1,
      fellowshipDevelopment: 0,
      attacksDevelopment: 2,
      woundsDevelopment: 0,
      movementDevelopment: 1,
      magicDevelopment: 0,
      talents: [],
      skills: [],
      entryProfessions: [],
      exitProfessions: [],
    } satisfies Profession;

    component.profession.set(p);

    expect(component.primaryAdvanceRow()).toEqual(['+5%', '+10%', '-', '+30%', '+15%', '-', '+5%', '-']);
    expect(component.secondaryAdvanceRow()).toEqual(['+2', '-', '-', '-', '+1', '-', '-', '-']);
  });

  it('uses name and description from skill/talent nested objects', async () => {
    const {component} = await setup();

    const p = {
      id: 1,
      name: 'Test',
      description: '',
      type: 'base',
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
      skills: [
        {
          id: 10,
          description: 'Relation skill desc',
          skill: {id: 1, name: 'Athletics', associatedCharacteristic: 'S', description: 'Base skill desc'},
          alternativeSkill: [
            {
              id: 11,
              description: 'Alt rel desc',
              skill: {id: 2, name: 'Climb', associatedCharacteristic: 'S', description: 'Alt base skill desc'}
            },
          ],
        },
      ],
      talents: [
        {
          id: 20,
          description: 'Relation talent desc',
          talent: {id: 3, name: 'Coolheaded', description: 'Base talent desc'},
          alternativeTalent: [
            {
              id: 21,
              description: 'Alt talent rel desc',
              talent: {id: 4, name: 'Savvy', description: 'Alt base talent desc'}
            },
          ],
        },
      ],
      entryProfessions: [],
      exitProfessions: [],
    } satisfies Profession;

    component.profession.set(p);

    const skillItem = component.displaySkills()[0];
    expect(component.skillName(skillItem)).toBe('Athletics');
    expect(component.skillDescription(skillItem)).toBe('Base skill desc');
    expect(component.skillAlternativeDescription(skillItem, 'Climb')).toBe('Alt base skill desc');

    const talentItem = component.displayTalents()[0];
    expect(component.talentName(talentItem)).toBe('Coolheaded');
    expect(component.talentDescription(talentItem)).toBe('Base talent desc');
    expect(component.talentAlternativeDescription(talentItem, 'Savvy')).toBe('Alt base talent desc');
  });
});
