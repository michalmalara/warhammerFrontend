import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {vi} from 'vitest';
import {Dialog} from '@angular/cdk/dialog';

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
    // Stable smoke-check: view renders, list items are not present.
    expect(el.textContent).toContain('The Great Library of Skills');
    expect(el.textContent).not.toContain('Stealth');
  });

  it('calls delete when trash button clicked and dialog is confirmed', async () => {
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
    const dialogOpenSpy = vi.fn().mockReturnValue({closed: of(true)});

    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {provide: SkillsApiService, useValue: {list: listSpy, delete: deleteSpy}},
        {provide: Dialog, useValue: {open: dialogOpenSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const deleteButtons = Array.from(
      el.querySelectorAll('button[aria-label="Delete skill"]'),
    ) as HTMLButtonElement[];
    expect(deleteButtons.length).toBeGreaterThan(0);

    const listCallsBefore = listSpy.mock.calls.length;

    deleteButtons[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogOpenSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledTimes(1);

    const listCallsAfter = listSpy.mock.calls.length;
    expect(listCallsAfter).toBeGreaterThan(listCallsBefore);
  });

  it('does not call delete when dialog is cancelled', async () => {
    const listSpy = vi.fn().mockReturnValue(
      of([
        {id: 1, name: 'Stealth', associatedCharacteristic: 'agility'},
        {id: 2, name: 'Melee', associatedCharacteristic: 'weapon_skills'},
      ]),
    );

    const deleteSpy = vi.fn().mockReturnValue(of(void 0));
    const dialogOpenSpy = vi.fn().mockReturnValue({closed: of(false)});

    await TestBed.configureTestingModule({
      imports: [SkillsListComponent],
      providers: [
        provideRouter([]),
        {provide: SkillsApiService, useValue: {list: listSpy, delete: deleteSpy}},
        {provide: Dialog, useValue: {open: dialogOpenSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const deleteButtons = Array.from(
      el.querySelectorAll('button[aria-label="Delete skill"]'),
    ) as HTMLButtonElement[];
    expect(deleteButtons.length).toBeGreaterThan(0);

    deleteButtons[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogOpenSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
