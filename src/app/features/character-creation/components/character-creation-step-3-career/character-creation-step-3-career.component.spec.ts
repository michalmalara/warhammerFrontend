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

});
