import {CommonModule} from '@angular/common';
import {Component, inject, signal} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {catchError, Observable, of} from 'rxjs';

import {SkillsApiService} from '../../services/skills-api.service';
import {
  type Skill,
  SKILL_CHARACTERISTICS_META,
  SKILL_TYPES,
  type SkillCharacteristic,
  type SkillType,
} from '../../models/skill.models';

@Component({
  selector: 'app-skills-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './skills-list.component.html',
  styleUrls: ['./skills-list.component.scss'],
})
export class SkillsListComponent {
  private readonly api = inject(SkillsApiService);

  readonly skills$: Observable<Skill[] | null> = this.api.list().pipe(catchError(() => of(null)));

  /** UI state */
  readonly query = signal('');
  readonly isFiltersOpen = signal(false);
  /** null = brak filtra */
  readonly typeFilter = signal<SkillType | null>(null);
  /** null = brak filtra */
  readonly characteristicFilter = signal<SkillCharacteristic | null>(null);

  /** Metadane do UI */
  readonly characteristics = SKILL_CHARACTERISTICS_META;
  readonly skillTypes = SKILL_TYPES;

  trackById = (_: number, s: Skill) => s.id;

  onQueryInput(value: string) {
    this.query.set(value);
  }

  toggleFiltersPanel() {
    this.isFiltersOpen.update(v => !v);
  }

  clearFilters() {
    this.typeFilter.set(null);
    this.characteristicFilter.set(null);
  }

  setTypeFilter(value: SkillType | null) {
    this.typeFilter.set(value);
  }

  setCharacteristicFilter(value: SkillCharacteristic | null) {
    this.characteristicFilter.set(value);
  }

  characteristicLabel(value: Skill['associatedCharacteristic']): string {
    const meta = SKILL_CHARACTERISTICS_META.find(m => m.value === (value as SkillCharacteristic));
    return meta ? `${meta.label} (${meta.shortLabel})` : String(value);
  }

  characteristicShortLabel(value: SkillCharacteristic | null): string {
    if (!value) return 'Any';
    const meta = SKILL_CHARACTERISTICS_META.find(m => m.value === value);
    return meta?.shortLabel ?? String(value);
  }

  typeMeta(value: Skill['type']): { label: string; value: string } | null {
    if (!value) return null;
    const meta = SKILL_TYPES.find(t => t.value === (value as SkillType));
    return meta ? {label: meta.label, value: meta.value} : {label: String(value), value: String(value)};
  }

  shortDescription(desc: Skill['description']): string | null {
    if (!desc) return null;
    const s = String(desc).trim();
    return s.length ? s : null;
  }

  matchesQuery(skill: Skill): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) return true;
    return skill.name.toLowerCase().includes(q);
  }

  matchesFilters(skill: Skill): boolean {
    const type = this.typeFilter();
    if (type) {
      // backend domyślnie zwraca 'basic'; frontend w modelu dopuszcza string
      if (String(skill.type ?? 'basic') !== type) return false;
    }

    const c = this.characteristicFilter();
    if (c) {
      if (String(skill.associatedCharacteristic) !== c) return false;
    }

    return true;
  }

  matchesAll(skill: Skill): boolean {
    return this.matchesQuery(skill) && this.matchesFilters(skill);
  }

  applyFilters(skills: Skill[]): Skill[] {
    return skills.filter(s => this.matchesAll(s));
  }
}
