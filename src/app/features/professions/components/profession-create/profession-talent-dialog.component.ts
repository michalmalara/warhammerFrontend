import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';

import {catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap} from 'rxjs';

import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {TalentsApiService} from '../../../talents/services/talents-api.service';

export type ProfessionTalentDialogResult = {
  id: number;
  name: string;
  description?: string;
  alternativeTalent?: number[];
};

@Component({
  selector: 'app-profession-talent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatDialogModule,
    WaxSealButtonComponent,
  ],
  templateUrl: './profession-talent-dialog.component.html',
  styleUrls: ['./profession-talent-dialog.component.scss'],
})
export class ProfessionTalentDialogComponent {
  private readonly talentsApi = inject(TalentsApiService);
  private readonly dialogRef = inject(MatDialogRef<ProfessionTalentDialogComponent, ProfessionTalentDialogResult | undefined>);
  readonly data = inject<{
    existingTalents?: Array<{ id?: number; name?: string; alternativeTalentIds?: number[] } | string>
  }>(MAT_DIALOG_DATA, {optional: true});

  readonly talentSearchControl = new FormControl('');
  readonly descriptionControl = new FormControl('');

  selectedAlternativeIds: number[] = [];

  readonly options$ = this.talentSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) => (q.length >= 3 ? this.talentsApi.search(q).pipe(catchError(() => of([]))) : of([])))
  );

  selectedOption: { id: number; name: string } | null = null;

  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedOption = event.option.value as { id: number; name: string };
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    if (!this.selectedOption) return;
    const description = (this.descriptionControl.value ?? '').toString().trim();
    this.dialogRef.close({
      ...this.selectedOption,
      description: description || undefined,
      alternativeTalent: this.selectedAlternativeIds.length ? this.selectedAlternativeIds : undefined,
    });
  }

  private static buildAlternativeGroups(map: Map<number, Set<number>>): number[][] {
    const adjacency = new Map<number, Set<number>>();

    const ensure = (id: number) => {
      if (!adjacency.has(id)) adjacency.set(id, new Set<number>());
      return adjacency.get(id)!;
    };

    for (const [from, toSet] of map.entries()) {
      const fromAdj = ensure(from);
      for (const to of toSet) {
        if (!Number.isFinite(to)) continue;
        fromAdj.add(to);
        ensure(to).add(from);
      }
    }

    const visited = new Set<number>();
    const groups: number[][] = [];

    const ids = Array.from(adjacency.keys()).sort((a, b) => a - b);
    for (const start of ids) {
      if (visited.has(start)) continue;

      const stack = [start];
      visited.add(start);
      const group: number[] = [];

      while (stack.length) {
        const cur = stack.pop()!;
        group.push(cur);

        const neigh = adjacency.get(cur);
        if (!neigh) continue;
        for (const n of neigh) {
          if (visited.has(n)) continue;
          visited.add(n);
          stack.push(n);
        }
      }

      group.sort((a, b) => a - b);
      groups.push(group);
    }

    groups.sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0));
    return groups;
  }

  private get existingTalentAlternativeMap(): Map<number, Set<number>> {
    const m = new Map<number, Set<number>>();
    for (const t of this.existingTalentsStructured) {
      const altIds = Array.isArray((t as any).alternativeTalentIds) ? (t as any).alternativeTalentIds : [];
      const filtered = altIds.filter((id: any) => typeof id === 'number');
      if (!filtered.length) continue;
      m.set(t.id, new Set(filtered));
    }
    return m;
  }

  private getAlternativeGroupIdsFor(talentLinkId: number): number[] {
    if (!Number.isFinite(talentLinkId)) return [];

    const groupsRaw = ProfessionTalentDialogComponent.buildAlternativeGroups(this.existingTalentAlternativeMap);
    for (const g of groupsRaw) {
      if (g.includes(talentLinkId)) return g;
    }

    return [];
  }

  toggleAlternative(id: number) {
    const group = this.getAlternativeGroupIdsFor(id);

    if (group.length >= 2) {
      const allSelected = group.every((gid) => this.selectedAlternativeIds.includes(gid));
      if (allSelected) {
        this.selectedAlternativeIds = this.selectedAlternativeIds.filter((x) => !group.includes(x));
      } else {
        const next = new Set(this.selectedAlternativeIds);
        for (const gid of group) next.add(gid);
        this.selectedAlternativeIds = Array.from(next);
      }
      return;
    }

    const i = this.selectedAlternativeIds.indexOf(id);
    if (i >= 0) {
      this.selectedAlternativeIds.splice(i, 1);
    } else {
      this.selectedAlternativeIds.push(id);
    }
  }

  isAlternativeRelatedToSelected(talentLinkId: number): boolean {
    if (!Number.isFinite(talentLinkId) || !this.selectedAlternativeIds.length) return false;

    const map = this.existingTalentAlternativeMap;
    for (const selectedId of this.selectedAlternativeIds) {
      const selectedToOthers = map.get(selectedId);
      if (selectedToOthers?.has(talentLinkId)) return true;

      const candidateToOthers = map.get(talentLinkId);
      if (candidateToOthers?.has(selectedId)) return true;
    }

    return false;
  }

  get existingAlternativeGroups(): Array<{
    groupId: number;
    talents: Array<{ id: number; name: string; alternativeTalentIds?: number[] }>;
  }> {
    const all = this.existingTalentsStructured;
    if (!all.length) return [];

    const groupsRaw = ProfessionTalentDialogComponent.buildAlternativeGroups(this.existingTalentAlternativeMap);

    const groupById = new Map<number, Array<{ id: number; name: string; alternativeTalentIds?: number[] }>>();
    for (let i = 0; i < groupsRaw.length; i++) {
      const ids = new Set(groupsRaw[i]);
      const talents = all.filter((t) => ids.has(t.id)).sort((a, b) => a.name.localeCompare(b.name));
      if (talents.length >= 2) groupById.set(i + 1, talents);
    }

    const groupedIds = new Set<number>();
    for (const talents of groupById.values()) {
      for (const t of talents) groupedIds.add(t.id);
    }

    const singles = all
      .filter((t) => !groupedIds.has(t.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    const result: Array<{
      groupId: number;
      talents: Array<{ id: number; name: string; alternativeTalentIds?: number[] }>
    }> = [];

    for (const [groupId, talents] of Array.from(groupById.entries()).sort((a, b) => a[0] - b[0])) {
      result.push({groupId, talents});
    }

    let nextGroupId = (result.at(-1)?.groupId ?? 0) + 1;
    for (const t of singles) {
      result.push({groupId: nextGroupId++, talents: [t]});
    }

    return result;
  }

  get existingTalentNames(): string[] {
    const items = this.data?.existingTalents ?? [];
    return items
      .map((t: any) => (typeof t === 'string' ? t : (t?.name ?? t?.talent?.name)))
      .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }

  get existingTalentsStructured(): Array<{ id: number; name: string; alternativeTalentIds?: number[] }> {
    const items = this.data?.existingTalents ?? [];
    return items
      .map((t: any) => ({
        id: typeof t === 'object' ? t?.id : undefined,
        name: typeof t === 'object' ? (t?.name ?? t?.talent?.name) : t,
        alternativeTalentIds: typeof t === 'object' ? t?.alternativeTalentIds : undefined,
      }))
      .filter((x: any) => typeof x.id === 'number' && typeof x.name === 'string' && x.name.trim().length > 0);
  }
}
