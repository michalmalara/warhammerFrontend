import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';

import {ProfessionsApiService} from '../../services/professions-api.service';
import type {Profession} from '../../models/profession.models';
import {Dialog} from '@angular/cdk/dialog';
import {toObservable} from '@angular/core/rxjs-interop';
import {
  ProfessionDeleteConfirmDialogComponent,
  type ProfessionDeleteConfirmDialogData,
} from '../../../../shared/ui/profession-delete-confirm-dialog/profession-delete-confirm-dialog.component';

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
  private readonly dialog = inject(Dialog);

  /**
   * Trik na łatwe odświeżanie listy po operacjach mutujących (np. delete).
   */
  private readonly refreshTick = signal(0);

  /** Idki profesji aktualnie usuwanych (UI disable na przycisku). */
  readonly deletingIds = signal<Set<number>>(new Set());

  // LISTA ma pochodzić z API (/api/professions/) i odpowiadać serializerowi ProfessionSerializer
  readonly professions$: Observable<Profession[]> = toObservable(this.refreshTick).pipe(
    switchMap(() => this.api.list()),
    catchError(() => of([])),
  );

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
    return p.type === 'basic' ? 'Advanced' : 'Basic';
  }

  isDeleting(p: Profession): boolean {
    return this.deletingIds().has(p.id);
  }

  onDeleteProfession(profession: Profession) {
    // Guard przed wieloklikiem.
    if (this.deletingIds().has(profession.id)) return;

    const data: ProfessionDeleteConfirmDialogData = {
      professionId: profession.id,
      professionName: profession.name,
    };

    this.dialog
      .open<boolean>(ProfessionDeleteConfirmDialogComponent, {
        data,
        disableClose: true,
        ariaLabel: `Confirm deletion of profession ${profession.name}`,
      })
      .closed.subscribe((ok) => {
      if (!ok) return;

      this.deletingIds.update((set) => {
        const next = new Set(set);
        next.add(profession.id);
        return next;
      });

      this.api.delete(profession.id).subscribe({
        next: () => {
          this.refreshTick.update((v) => v + 1);
        },
        error: () => {
          this.deletingIds.update((set) => {
            const next = new Set(set);
            next.delete(profession.id);
            return next;
          });
        },
        complete: () => {
          this.deletingIds.update((set) => {
            const next = new Set(set);
            next.delete(profession.id);
            return next;
          });
        },
      });
    });
  }
}
