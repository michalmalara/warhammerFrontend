import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {of, throwError} from 'rxjs';

import {SkillCreateComponent} from './skill-create.component';
import {SkillsApiService} from '../../services/skills-api.service';

describe('SkillCreateComponent', () => {
  it('does not call API when form invalid', async () => {
    const createSpy = vi.fn(() => of({id: 1, name: 'x', associatedCharacteristic: 'INT'}));

    await TestBed.configureTestingModule({
      imports: [SkillCreateComponent],
      providers: [
        provideRouter([]),
        {provide: SkillsApiService, useValue: {create: createSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillCreateComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.controls.name.setValue('');
    fixture.componentInstance.save();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('calls API and navigates on success', async () => {
    const createSpy = vi.fn(() => of({id: 1, name: 'Stealth', associatedCharacteristic: 'AG'}));

    await TestBed.configureTestingModule({
      imports: [SkillCreateComponent],
      providers: [
        provideRouter([]),
        {provide: SkillsApiService, useValue: {create: createSpy}},
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(SkillCreateComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({name: 'Stealth', associatedCharacteristic: 'AG'});
    fixture.componentInstance.save();

    expect(createSpy).toHaveBeenCalledWith({name: 'Stealth', associatedCharacteristic: 'AG'});
    expect(navSpy).toHaveBeenCalledWith(['/skills']);
  });

  it('shows error flow when API fails', async () => {
    const createSpy = vi.fn(() => throwError(() => new Error('fail')));

    await TestBed.configureTestingModule({
      imports: [SkillCreateComponent],
      providers: [
        provideRouter([]),
        {provide: SkillsApiService, useValue: {create: createSpy}},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SkillCreateComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({name: 'Stealth', associatedCharacteristic: 'AG'});
    fixture.componentInstance.save();

    expect(createSpy).toHaveBeenCalled();
    // snackbara nie asertujemy (Material w testach), wystarczy że ścieżka error nie rzuca.
    expect(fixture.componentInstance.isSaving).toBe(false);
  });
});
