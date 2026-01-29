import {TestBed} from '@angular/core/testing';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {of} from 'rxjs';

import {ProfessionSkillDialogComponent} from './profession-skill-dialog.component';
import {SkillsApiService} from '../../../skills/services/skills-api.service';

describe('ProfessionSkillDialogComponent', () => {
  const build = (existingSkills: any[]) => {
    const skillsApiMock = {
      search: () => of([]),
    };

    TestBed.configureTestingModule({
      imports: [ProfessionSkillDialogComponent],
      providers: [
        {provide: SkillsApiService, useValue: skillsApiMock},
        {provide: MAT_DIALOG_DATA, useValue: {existingSkills}},
        {provide: MatDialogRef, useValue: {close: () => undefined}},
      ],
    });

    return TestBed.createComponent(ProfessionSkillDialogComponent).componentInstance;
  };

  it('should detect alternative relation in either direction', () => {
    const component = build([
      {id: 1, name: 'A', alternativeSkillIds: [2]},
      {id: 2, name: 'B', alternativeSkillIds: []},
      {id: 3, name: 'C', alternativeSkillIds: [1]},
    ]);

    component.selectedAlternativeIds = [1];

    expect(component.isAlternativeRelatedToSelected(2)).toBeTruthy();
    expect(component.isAlternativeRelatedToSelected(3)).toBeTruthy();
    expect(component.isAlternativeRelatedToSelected(1)).toBeFalsy();
  });

  it('should return false when nothing is selected', () => {
    const component = build([
      {id: 1, name: 'A', alternativeSkillIds: [2]},
      {id: 2, name: 'B', alternativeSkillIds: [1]},
    ]);

    component.selectedAlternativeIds = [];
    expect(component.isAlternativeRelatedToSelected(2)).toBeFalsy();
  });
});
