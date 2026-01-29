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

  it('should group transitively connected alternatives into one group', () => {
    const component = build([
      {id: 1, name: 'A', alternativeSkillIds: [2]},
      {id: 2, name: 'B', alternativeSkillIds: [3]},
      {id: 3, name: 'C', alternativeSkillIds: []},
      {id: 10, name: 'X', alternativeSkillIds: []},
    ]);

    const groups = component.existingAlternativeGroups.filter((g) => g.skills.length >= 2);
    expect(groups.length).toBe(1);

    const ids = groups[0].skills.map((s) => s.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('should create separate groups for disconnected alternative sets', () => {
    const component = build([
      {id: 1, name: 'A', alternativeSkillIds: [2]},
      {id: 2, name: 'B', alternativeSkillIds: []},
      {id: 3, name: 'C', alternativeSkillIds: [4]},
      {id: 4, name: 'D', alternativeSkillIds: []},
    ]);

    const groups = component.existingAlternativeGroups.filter((g) => g.skills.length >= 2);
    expect(groups.length).toBe(2);

    const groupIds = groups
      .map((g) => g.skills.map((s) => s.id).sort((a, b) => a - b))
      .sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0));

    expect(groupIds).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});
