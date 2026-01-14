import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {vi} from 'vitest';

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
            delete: () => of(void 0),
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
            delete: () => of(void 0),
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
            delete: () => of(void 0),
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
            delete: () => of(void 0),
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
            delete: () => of(void 0),
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

  it('calls delete when trash button clicked', async () => {
    const listSpy = vi
      .fn()
      .mockReturnValueOnce(
        of([
          {id: 1, name: 'Stealth', associatedCharacteristic: 'agility'},
          {id: 2, name: 'Melee', associatedCharacteristic: 'weapon_skills'},
        ]),
      )
      .mockReturnValueOnce(of([{id: 2, name: 'Melee', associatedCharacteristic: 'weapon_skills'}]));

    const deleteSpy = vi.fn().mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: SkillsApiService,
          useValue: {
            list: listSpy,
            delete: deleteSpy,
          },
        },
      ],
    }).compileComponents();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      const fixture = TestBed.createComponent(SkillsListComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      const el: HTMLElement = fixture.nativeElement;
      const deleteButtons = Array.from(
        el.querySelectorAll('button[aria-label="Usuń umiejętność"]'),
      ) as HTMLButtonElement[];
      expect(deleteButtons.length).toBeGreaterThan(0);

      const listCallsBefore = listSpy.mock.calls.length;

      deleteButtons[0].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      const calledWithId = deleteSpy.mock.calls[0]?.[0];
      expect([1, 2]).toContain(calledWithId);

      const listCallsAfter = listSpy.mock.calls.length;
      expect(listCallsAfter).toBeGreaterThan(listCallsBefore);
    } finally {
      confirmSpy.mockRestore();
    }
  });
});
