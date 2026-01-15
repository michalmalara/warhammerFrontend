import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of} from 'rxjs';
import {vi} from 'vitest';
import {Dialog} from '@angular/cdk/dialog';

import {ProfessionsListComponent} from './professions-list.component';
import {ProfessionsApiService} from '../../services/professions-api.service';

describe('ProfessionsListComponent', () => {
  it('calls delete when trash button clicked and dialog is confirmed', async () => {
    const listSpy = vi
      .fn()
      .mockReturnValueOnce(
        of([
          {
            id: 1,
            name: 'Rat Catcher',
            description: 'Keeps the streets clean',
            type: 'Career',
            entryProfessions: [],
          },
          {
            id: 2,
            name: 'Witch Hunter',
            description: 'Purge the heresy',
            type: 'Career',
            entryProfessions: [],
          },
        ]),
      )
      .mockReturnValueOnce(
        of([
          {
            id: 2,
            name: 'Witch Hunter',
            description: 'Purge the heresy',
            type: 'Career',
            entryProfessions: [],
          },
        ]),
      );

    const deleteSpy = vi.fn().mockReturnValue(of(void 0));
    const dialogOpenSpy = vi.fn().mockReturnValue({closed: of(true)});

    await TestBed.configureTestingModule({
      imports: [ProfessionsListComponent],
      providers: [
        provideRouter([]),
        {provide: ProfessionsApiService, useValue: {list: listSpy, delete: deleteSpy}},
        {provide: Dialog, useValue: {open: dialogOpenSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfessionsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const deleteButtons = Array.from(
      el.querySelectorAll('button[aria-label="Delete profession"]'),
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
        {
          id: 1,
          name: 'Rat Catcher',
          description: 'Keeps the streets clean',
          type: 'Career',
          entryProfessions: [],
        },
      ]),
    );

    const deleteSpy = vi.fn().mockReturnValue(of(void 0));
    const dialogOpenSpy = vi.fn().mockReturnValue({closed: of(false)});

    await TestBed.configureTestingModule({
      imports: [ProfessionsListComponent],
      providers: [
        provideRouter([]),
        {provide: ProfessionsApiService, useValue: {list: listSpy, delete: deleteSpy}},
        {provide: Dialog, useValue: {open: dialogOpenSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfessionsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const deleteButtons = Array.from(
      el.querySelectorAll('button[aria-label="Delete profession"]'),
    ) as HTMLButtonElement[];
    expect(deleteButtons.length).toBeGreaterThan(0);

    deleteButtons[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogOpenSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

