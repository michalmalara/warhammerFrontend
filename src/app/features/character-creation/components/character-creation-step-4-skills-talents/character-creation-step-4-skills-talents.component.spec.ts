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
});
