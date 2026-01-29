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

import type {Armor} from '../../models/armor.models';
import {ArmorsApiService} from '../../services/armors-api.service';
import {
  ArmorDeleteConfirmDialogComponent,
  type ArmorDeleteConfirmDialogData,
} from '../../../../shared/ui/armor-delete-confirm-dialog/armor-delete-confirm-dialog.component';

@Component({
  selector: 'app-armors-list',
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
  templateUrl: './armors-list.component.html',
  styleUrls: ['./armors-list.component.scss'],
})
export class ArmorsListComponent {
  private readonly api = inject(ArmorsApiService);
  private readonly dialog = inject(Dialog);

  private readonly refreshTick = signal(0);
  readonly deletingIds = signal<Set<number>>(new Set());

  readonly armors$: Observable<Armor[] | null> = toObservable(this.refreshTick).pipe(
    switchMap(() => this.api.list()),
    catchError(() => of(null)),
  );

  readonly query = signal('');

  trackById = (_: number, a: Armor) => a.id;

  onQueryInput(value: string) {
    this.query.set(value);
  }

  matchesQuery(armor: Armor): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) return true;
    return armor.name.toLowerCase().includes(q) || armor.location.toLowerCase().includes(q);
  }

  applyFilters(armors: Armor[]): Armor[] {
    return armors.filter(a => this.matchesQuery(a));
  }

  isDeleting(armor: Armor): boolean {
    return this.deletingIds().has(armor.id);
  }

  onDeleteArmor(armor: Armor) {
    if (this.deletingIds().has(armor.id)) return;

    const data: ArmorDeleteConfirmDialogData = {
      armorId: armor.id,
      armorName: armor.name,
    };

    this.dialog
      .open<boolean>(ArmorDeleteConfirmDialogComponent, {
        data,
        disableClose: true,
        ariaLabel: $localize`:Aria@@armorsList.deleteConfirm.aria:Confirm deletion of armor ${armor.name}:armorName:`,
      })
      .closed.subscribe(ok => {
      if (!ok) return;

      this.deletingIds.update(set => {
        const next = new Set(set);
        next.add(armor.id);
        return next;
      });

      this.api.delete(armor.id).subscribe({
        next: () => {
          this.refreshTick.update(v => v + 1);
        },
        error: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(armor.id);
            return next;
          });
        },
        complete: () => {
          this.deletingIds.update(set => {
            const next = new Set(set);
            next.delete(armor.id);
            return next;
          });
        },
      });
    });
  }
}
