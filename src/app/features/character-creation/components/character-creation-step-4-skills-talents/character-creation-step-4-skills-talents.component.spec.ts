import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {routes} from '../../../../app.routes';
import {CharacterCreationStep4SkillsTalentsComponent} from './character-creation-step-4-skills-talents.component';
import {CharacterDataService} from '../../services/character-data.service';

describe('CharacterCreationStep4SkillsTalentsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCreationStep4SkillsTalentsComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep4SkillsTalentsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render empty state when no profession selected', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep4SkillsTalentsComponent);
    const charData = TestBed.inject(CharacterDataService);

    charData.setProfession(null);

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No career selected');
  });

  it('should auto-select racial skills without alternatives', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep4SkillsTalentsComponent);
    const charData = TestBed.inject(CharacterDataService);

    charData.raceSkillLinks.set([
      {id: 101, alternativeSkill: [], skill: {id: 1, name: 'A'} as any} as any,
      {id: 102, alternativeSkill: [{id: 999}] as any, skill: {id: 2, name: 'B'} as any} as any,
    ] as any);

    charData.setProfession({
      id: 1,
      name: 'Test',
      skills: [],
      talents: [],
    } as any);

    fixture.detectChanges();

    const selectedIds = fixture.componentInstance.selectedSkillIds();
    expect(selectedIds.has('A::')).toBe(true);
    expect(selectedIds.has('B::')).toBe(false);
  });

  it('should not duplicate auto-selected racial skills on re-run', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep4SkillsTalentsComponent);
    const charData = TestBed.inject(CharacterDataService);

    charData.raceSkillLinks.set([
      {id: 201, alternativeSkill: [], skill: {id: 1, name: 'A'} as any} as any,
    ] as any);

    charData.setProfession({
      id: 1,
      name: 'Test',
      skills: [],
      talents: [],
    } as any);

    fixture.detectChanges();

    const first = fixture.componentInstance.selectedProfessionSkills().filter((s) => s.id === 201).length;
    expect(first).toBe(1);

    charData.raceSkillLinks.set([
      {id: 201, alternativeSkill: [], skill: {id: 1, name: 'A'} as any} as any,
    ] as any);

    fixture.detectChanges();

    const second = fixture.componentInstance.selectedProfessionSkills().filter((s) => s.id === 201).length;
    expect(second).toBe(1);
  });
});
