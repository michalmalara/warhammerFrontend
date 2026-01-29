import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatOptionModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

import {catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap} from 'rxjs';

import {SkillsApiService} from '../../../skills/services/skills-api.service';

@Component({
  selector: 'app-profession-skill-dialog',
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
    MatSelectModule,
    WaxSealButtonComponent,
  ],
  templateUrl: './profession-skill-dialog.component.html',
  styleUrls: ['./profession-skill-dialog.component.scss'],
})
export class ProfessionSkillDialogComponent {
  private readonly skillsApi = inject(SkillsApiService);
  private readonly dialogRef = inject(MatDialogRef<ProfessionSkillDialogComponent, {
    id: number;
    name: string
  } | undefined>);
  readonly data = inject<{
    existingSkills?: Array<{ id?: number; name?: string; alternativeSkillIds?: number[] } | string>
  }>(MAT_DIALOG_DATA, {optional: true});

  readonly skillSearchControl = new FormControl('');
  readonly descriptionControl = new FormControl('');

  // Holds IDs of already-added profession-skill links chosen as alternatives
  selectedAlternativeIds: number[] = [];

  readonly options$ = this.skillSearchControl.valueChanges.pipe(
    startWith(''),
    map((v) => (typeof v === 'string' ? v : '').toString().trim()),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((q) => (q.length >= 3 ? this.skillsApi.search(q).pipe(catchError(() => of([]))) : of([])))
  );

  selectedOption: { id: number; name: string } | null = null;

  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedOption = event.option.value as { id: number; name: string };
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

  private getAlternativeGroupIdsFor(skillLinkId: number): number[] {
    if (!Number.isFinite(skillLinkId)) return [];

    const groupsRaw = ProfessionSkillDialogComponent.buildAlternativeGroups(this.existingSkillAlternativeMap);
    for (const g of groupsRaw) {
      if (g.includes(skillLinkId)) return g;
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

  cancel() {
    this.dialogRef.close();
  }

  add() {
    if (!this.selectedOption) return;
    const description = (this.descriptionControl.value ?? '').toString().trim();
    // include alternativeSkill if any selected
    this.dialogRef.close({
      ...this.selectedOption,
      description: description || undefined,
      alternativeSkill: this.selectedAlternativeIds.length ? this.selectedAlternativeIds : undefined,
    } as any);
  }

  get existingSkillNames(): string[] {
    const items = this.data?.existingSkills ?? [];
    return items
      .map((s: any) => (typeof s === 'string' ? s : (s?.name ?? s?.skill?.name)))
      .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }

  private get existingSkillAlternativeMap(): Map<number, Set<number>> {
    const m = new Map<number, Set<number>>();
    for (const s of this.existingSkillsStructured) {
      const altIds = Array.isArray((s as any).alternativeSkillIds) ? (s as any).alternativeSkillIds : [];
      const filtered = altIds.filter((id: any) => typeof id === 'number');
      if (!filtered.length) continue;
      m.set(s.id, new Set(filtered));
    }
    return m;
  }

  get existingAlternativeGroups(): Array<{
    groupId: number;
    skills: Array<{ id: number; name: string; alternativeSkillIds?: number[] }>
  }> {
    const all = this.existingSkillsStructured;
    if (!all.length) return [];

    const map = this.existingSkillAlternativeMap;
    const groupsRaw = ProfessionSkillDialogComponent.buildAlternativeGroups(map);

    const groupById = new Map<number, Array<{ id: number; name: string; alternativeSkillIds?: number[] }>>();
    for (let i = 0; i < groupsRaw.length; i++) {
      const ids = new Set(groupsRaw[i]);
      const skills = all.filter((s) => ids.has(s.id)).sort((a, b) => a.name.localeCompare(b.name));
      if (skills.length >= 2) groupById.set(i + 1, skills);
    }

    const groupedIds = new Set<number>();
    for (const skills of groupById.values()) {
      for (const s of skills) groupedIds.add(s.id);
    }

    const singles = all
      .filter((s) => !groupedIds.has(s.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    const result: Array<{
      groupId: number;
      skills: Array<{ id: number; name: string; alternativeSkillIds?: number[] }>
    }> = [];

    for (const [groupId, skills] of Array.from(groupById.entries()).sort((a, b) => a[0] - b[0])) {
      result.push({groupId, skills});
    }

    let nextGroupId = (result.at(-1)?.groupId ?? 0) + 1;
    for (const s of singles) {
      result.push({groupId: nextGroupId++, skills: [s]});
    }

    return result;
  }

  isAlternativeRelatedToSelected(skillLinkId: number): boolean {
    if (!Number.isFinite(skillLinkId) || !this.selectedAlternativeIds.length) return false;

    const map = this.existingSkillAlternativeMap;
    for (const selectedId of this.selectedAlternativeIds) {
      const selectedToOthers = map.get(selectedId);
      if (selectedToOthers?.has(skillLinkId)) return true;

      const candidateToOthers = map.get(skillLinkId);
      if (candidateToOthers?.has(selectedId)) return true;
    }

    return false;
  }

  // Helper used by template to expose structured existing skills (id + name)
  get existingSkillsStructured(): Array<{ id: number; name: string; alternativeSkillIds?: number[] }> {
    const items = this.data?.existingSkills ?? [];
    return items
      .map((s: any) => ({
        id: typeof s === 'object' ? s?.id : undefined,
        name: typeof s === 'object' ? (s?.name ?? s?.skill?.name) : s,
        alternativeSkillIds: typeof s === 'object' ? s?.alternativeSkillIds : undefined,
      }))
      .filter((x: any) => typeof x.id === 'number' && typeof x.name === 'string' && x.name.trim().length > 0);
  }
}
