import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of} from 'rxjs';
import {vi} from 'vitest';
import {TalentCreateComponent} from './talent-create.component';
import {TalentsApiService} from '../../services/talents-api.service';

describe('TalentCreateComponent', () => {
  it('does not call API when form invalid', async () => {
    const createSpy = vi.fn(() => of({id: 1, name: 'x', description: null}));

    await TestBed.configureTestingModule({
      imports: [TalentCreateComponent],
      providers: [
        provideRouter([]),
        {provide: TalentsApiService, useValue: {create: createSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TalentCreateComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.controls.name.setValue('');
    fixture.componentInstance.save();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('calls API and navigates on success', async () => {
    const createSpy = vi.fn(() => of({id: 1, name: 'Hardy', description: 'x'}));

    await TestBed.configureTestingModule({
      imports: [TalentCreateComponent],
      providers: [
        provideRouter([]),
        {provide: TalentsApiService, useValue: {create: createSpy}},
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    const fixture = TestBed.createComponent(TalentCreateComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.controls.name.setValue('Hardy');
    fixture.componentInstance.form.controls.description.setValue('x');
    fixture.componentInstance.save();

    expect(createSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalled();
  });
});
