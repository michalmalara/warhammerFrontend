import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ProfessionsApiService} from '../../services/professions-api.service';
import type {Profession} from '../../models/profession.models';

type TierFilter = 'all' | 'basic' | 'advanced';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './professions-list.component.html',
  styleUrls: ['./professions-list.component.scss'],
})
export class ProfessionsListComponent {
  private readonly api = inject(ProfessionsApiService);

  // LISTA ma pochodzić z API (/api/professions/) i odpowiadać serializerowi ProfessionSerializer
  readonly professions$: Observable<Profession[]> = this.api.list();

  private readonly tierFilterSubject = new BehaviorSubject<TierFilter>('all');
  readonly tierFilter$ = this.tierFilterSubject.asObservable();

  private readonly searchSubject = new BehaviorSubject<string>('');
  readonly search$ = this.searchSubject.asObservable();

  readonly filteredProfessions$ = combineLatest([
    this.professions$,
    this.tierFilter$,
    this.search$.pipe(startWith('')),
  ]).pipe(
    map(([professions, tier, search]) => {
      const q = (search ?? '').trim().toLowerCase();

      return professions
        .filter((p) => {
          if (!q) return true;
          const hay = `${p.name ?? ''} ${p.description ?? ''} ${p.type ?? ''}`.toLowerCase();
          return hay.includes(q);
        })
        .filter((p) => {
          if (tier === 'all') return true;
          const isAdvanced = (p.entryProfessions?.length ?? 0) > 0;
          return tier === 'advanced' ? isAdvanced : !isAdvanced;
        });
    }),
  );

  setTierFilter(tier: TierFilter) {
    this.tierFilterSubject.next(tier);
  }

  setSearch(value: string) {
    this.searchSubject.next(value);
  }

  trackById = (_: number, item: Profession) => item.id;

  getProfessionClassLabel(p: Profession): string {
    return p.type || 'Career';
  }

  getProfessionTierLabel(p: Profession): 'Basic' | 'Advanced' {
    return (p.entryProfessions?.length ?? 0) > 0 ? 'Advanced' : 'Basic';
  }
}
