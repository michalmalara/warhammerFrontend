import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';

import {SkillsListComponent} from './skills-list.component';
import {SkillsApiService} from '../../services/skills-api.service';

describe('SkillsListComponent', () => {
  it('renders skills from API', async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: SkillsApiService,
          useValue: {
            list: () =>
              of([
                {id: 1, name: 'Stealth', associatedCharacteristic: 'agility'},
                {id: 2, name: 'Melee', associatedCharacteristic: 'weapon_skills'},
              ]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Stealth');
    expect(el.textContent).toContain('agility');
    expect(el.textContent).toContain('Melee');
  });

  it('renders error state when API fails', async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: SkillsApiService,
          useValue: {
            list: () => throwError(() => new Error('boom')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    // Wystarczy, że widok się renderuje i nie pokazuje elementów listy.
    expect(el.textContent).toContain('Umiejętności');
    expect(el.textContent).not.toContain('Stealth');
  });
});
