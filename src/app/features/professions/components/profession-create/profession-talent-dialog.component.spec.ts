import {TestBed} from '@angular/core/testing';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {of} from 'rxjs';

import {ProfessionTalentDialogComponent} from './profession-talent-dialog.component';
import {TalentsApiService} from '../../../talents/services/talents-api.service';

describe('ProfessionTalentDialogComponent', () => {
  const build = (existingTalents: any[]) => {
    const talentsApiMock = {
      search: () => of([]),
    };

    TestBed.configureTestingModule({
      imports: [ProfessionTalentDialogComponent],
      providers: [
        {provide: TalentsApiService, useValue: talentsApiMock},
        {provide: MAT_DIALOG_DATA, useValue: {existingTalents}},
        {provide: MatDialogRef, useValue: {close: () => undefined}},
      ],
    });

    return TestBed.createComponent(ProfessionTalentDialogComponent).componentInstance;
  };

  it('should group transitively connected alternatives into one group', () => {
    const component = build([
      {id: 1, name: 'A', alternativeTalentIds: [2]},
      {id: 2, name: 'B', alternativeTalentIds: [3]},
      {id: 3, name: 'C', alternativeTalentIds: []},
      {id: 10, name: 'X', alternativeTalentIds: []},
    ]);

    const groups = component.existingAlternativeGroups.filter((g) => g.talents.length >= 2);
    expect(groups.length).toBe(1);

    const ids = groups[0].talents.map((t) => t.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('should toggle whole alternative group when clicking any member', () => {
    const component = build([
      {id: 1, name: 'A', alternativeTalentIds: [2]},
      {id: 2, name: 'B', alternativeTalentIds: []},
      {id: 3, name: 'C', alternativeTalentIds: []},
    ]);

    component.toggleAlternative(1);
    expect(component.selectedAlternativeIds.sort((a, b) => a - b)).toEqual([1, 2]);

    component.toggleAlternative(2);
    expect(component.selectedAlternativeIds).toEqual([]);

    component.toggleAlternative(3);
    expect(component.selectedAlternativeIds).toEqual([3]);
  });
});
