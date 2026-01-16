import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {CharacterCreationStep1BioRaceComponent} from './character-creation-step-1-bio-race.component';
import {routes} from '../../../../app.routes';

describe('CharacterCreationStep1BioRaceComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCreationStep1BioRaceComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep1BioRaceComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render race cards and biographical form inputs', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep1BioRaceComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('.race-card').length).toBeGreaterThanOrEqual(4);
    expect(el.querySelector('input[formControlName="name"]')).toBeTruthy();
    expect(el.querySelector('select[formControlName="gender"]')).toBeTruthy();
    expect(el.querySelector('input[formControlName="age"]')).toBeTruthy();
  });
});
