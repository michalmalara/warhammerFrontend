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

import {toObservable} from '@angular/core/rxjs-interop';
import {Dialog} from '@angular/cdk/dialog';

import {catchError, Observable, of, switchMap} from 'rxjs';

import type {Talent} from '../../models/talent.models';
import {TalentsApiService} from '../../services/talents-api.service';
import {
  TalentDeleteConfirmDialogComponent,
  type TalentDeleteConfirmDialogData,
} from '../../../../shared/ui/talent-delete-confirm-dialog/talent-delete-confirm-dialog.component';

@Component({
  selector: 'app-talents-list',
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
  templateUrl: './talents-list.component.html',
  styleUrls: ['./talents-list.component.scss'],
})
export class TalentsListComponent {
  private readonly api = inject(TalentsApiService);
  private readonly dialog = inject(Dialog);

  private readonly refreshTick = signal(0);
  readonly deletingIds = signal<Set<number>>(new Set());

  readonly hasLoadError = signal(false);

  readonly talents$: Observable<Talent[] | null> = toObservable(this.refreshTick).pipe(
    switchMap(() => this.api.list()),
    catchError(() => of(null)),
  );

  readonly query = signal('');

  trackById = (_: number, t: Talent) => t.id;

  onQueryInput(value: string) {
    this.query.set(value);
  }

  matchesQuery(talent: Talent): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) return true;
    return talent.name.toLowerCase().includes(q);
  }

  applyFilters(talents: Talent[]): Talent[] {
    return talents.filter(t => this.matchesQuery(t));
  }

  shortDescription(desc: Talent['description']): string | null {
    if (!desc) return null;
    const s = String(desc).trim();
    return s.length ? s : null;
  }

  isDeleting(talent: Talent): boolean {
    return this.deletingIds().has(talent.id);
  }

  onDeleteTalent(talent: Talent) {
    if (this.deletingIds().has(talent.id)) return;

    const data: TalentDeleteConfirmDialogData = {
      talentId: talent.id,
      talentName: talent.name,
    };

    this.dialog
      .open<boolean>(TalentDeleteConfirmDialogComponent, {
        data,
        disableClose: true,
        ariaLabel: `Confirm deletion of talent ${talent.name}`,
      })
      .closed.subscribe(ok => {
      if (!ok) return;

      this.deletingIds.update(set => {
        const next = new Set(set);
        next.add(talent.id);
        return next;
      });

      this.api.delete(talent.id).subscribe({
        next: () => {
          this.refreshTick.update(v => v + 1);
        },
        error: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(talent.id);
            return next;
          });
        },
        complete: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(talent.id);
            return next;
          });
        },
      });
    });
  }
}
