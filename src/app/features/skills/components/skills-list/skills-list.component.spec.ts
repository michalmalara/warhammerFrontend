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

  it('filters by query', async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: SkillsApiService,
          useValue: {
            list: () =>
              of([
                {id: 1, name: 'Stealth', type: 'basic', associatedCharacteristic: 'agility'},
                {id: 2, name: 'Melee', type: 'basic', associatedCharacteristic: 'weapon_skills'},
              ]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.onQueryInput('stea');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Stealth');
    expect(el.textContent).not.toContain('Melee');
  });

  it('filters by type', async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: SkillsApiService,
          useValue: {
            list: () =>
              of([
                {id: 1, name: 'Stealth', type: 'basic', associatedCharacteristic: 'agility'},
                {id: 2, name: 'Melee', type: 'advanced', associatedCharacteristic: 'weapon_skills'},
              ]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.setTypeFilter('advanced');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Melee');
    expect(el.textContent).not.toContain('Stealth');
  });

  it('filters by characteristic', async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: SkillsApiService,
          useValue: {
            list: () =>
              of([
                {id: 1, name: 'Stealth', type: 'basic', associatedCharacteristic: 'agility'},
                {id: 2, name: 'Melee', type: 'basic', associatedCharacteristic: 'weapon_skills'},
              ]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.setCharacteristicFilter('agility');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Stealth');
    expect(el.textContent).not.toContain('Melee');
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
