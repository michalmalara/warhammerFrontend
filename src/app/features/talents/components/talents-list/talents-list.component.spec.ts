import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {of, throwError} from 'rxjs';
import {vi} from 'vitest';
import {Dialog} from '@angular/cdk/dialog';

import {TalentsListComponent} from './talents-list.component';
import {TalentsApiService} from '../../services/talents-api.service';

describe('TalentsListComponent', () => {
  it('renders talents from API', async () => {
    await TestBed.configureTestingModule({
      imports: [TalentsListComponent],
      providers: [
        provideRouter([]),
        {provide: Dialog, useValue: {open: vi.fn()}},
        {
          provide: TalentsApiService,
          useValue: {
            list: () => of([{id: 1, name: 'Hardy', description: 'Tough as nails'}]),
            delete: () => of(void 0),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TalentsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Hardy');
  });

  it('renders error state when API fails', async () => {
    await TestBed.configureTestingModule({
      imports: [TalentsListComponent],
      providers: [
        provideRouter([]),
        {provide: Dialog, useValue: {open: vi.fn()}},
        {
          provide: TalentsApiService,
          useValue: {
            list: () => throwError(() => new Error('boom')),
            delete: () => of(void 0),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TalentsListComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('The Great Library of Talents');
    expect(el.textContent).not.toContain('Hardy');
  });
});
