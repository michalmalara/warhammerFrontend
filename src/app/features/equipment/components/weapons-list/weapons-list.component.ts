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

import type {Weapon} from '../../models/weapon.models';
import {WeaponsApiService} from '../../services/weapons-api.service';
import {
  WeaponDeleteConfirmDialogComponent,
  type WeaponDeleteConfirmDialogData,
} from '../../../../shared/ui/weapon-delete-confirm-dialog/weapon-delete-confirm-dialog.component';

@Component({
  selector: 'app-weapons-list',
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
  templateUrl: './weapons-list.component.html',
  styleUrls: ['./weapons-list.component.scss'],
})
export class WeaponsListComponent {
  private readonly api = inject(WeaponsApiService);
  private readonly dialog = inject(Dialog);

  private readonly refreshTick = signal(0);
  readonly deletingIds = signal<Set<number>>(new Set());

  readonly weapons$: Observable<Weapon[] | null> = toObservable(this.refreshTick).pipe(
    switchMap(() => this.api.list()),
    catchError(() => of(null)),
  );

  readonly query = signal('');

  trackById = (_: number, w: Weapon) => w.id;

  onQueryInput(value: string) {
    this.query.set(value);
  }

  matchesQuery(weapon: Weapon): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) return true;
    return weapon.name.toLowerCase().includes(q) || weapon.type.toLowerCase().includes(q);
  }

  applyFilters(weapons: Weapon[]): Weapon[] {
    return weapons.filter(w => this.matchesQuery(w));
  }

  shortDescription(desc: Weapon['description']): string | null {
    if (!desc) return null;
    const s = String(desc).trim();
    return s.length ? s : null;
  }

  isDeleting(weapon: Weapon): boolean {
    return this.deletingIds().has(weapon.id);
  }

  onDeleteWeapon(weapon: Weapon) {
    if (this.deletingIds().has(weapon.id)) return;

    const data: WeaponDeleteConfirmDialogData = {
      weaponId: weapon.id,
      weaponName: weapon.name,
    };

    this.dialog
      .open<boolean>(WeaponDeleteConfirmDialogComponent, {
        data,
        disableClose: true,
        ariaLabel: $localize`:Aria@@weaponsList.deleteConfirm.aria:Confirm deletion of weapon ${weapon.name}:weaponName:`,
      })
      .closed.subscribe(ok => {
      if (!ok) return;

      this.deletingIds.update(set => {
        const next = new Set(set);
        next.add(weapon.id);
        return next;
      });

      this.api.delete(weapon.id).subscribe({
        next: () => {
          this.refreshTick.update(v => v + 1);
        },
        error: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(weapon.id);
            return next;
          });
        },
        complete: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(weapon.id);
            return next;
          });
        },
      });
    });
  }
}
