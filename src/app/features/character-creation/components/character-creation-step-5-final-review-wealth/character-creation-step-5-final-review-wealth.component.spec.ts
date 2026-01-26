import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {routes} from '../../../../app.routes';
import {
  CharacterCreationStep5FinalReviewWealthComponent
} from './character-creation-step-5-final-review-wealth.component';

describe('CharacterCreationStep5FinalReviewWealthComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCreationStep5FinalReviewWealthComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CharacterCreationStep5FinalReviewWealthComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
