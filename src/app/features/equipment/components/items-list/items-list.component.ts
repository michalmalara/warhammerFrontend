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

import {catchError, Observable, of, switchMap} from 'rxjs';

import type {Item} from '../../models/item.models';
import {ItemsApiService} from '../../services/items-api.service';

@Component({
  selector: 'app-items-list',
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
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent {
  private readonly api = inject(ItemsApiService);

  private readonly refreshTick = signal(0);
  readonly items$: Observable<Item[] | null> = toObservable(this.refreshTick).pipe(
    switchMap(() => this.api.list()),
    catchError(() => of(null)),
  );

  readonly query = signal('');

  trackById = (_: number, i: Item) => i.id;

  onQueryInput(value: string) {
    this.query.set(value);
  }

  matchesQuery(item: Item): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q);
  }

  applyFilters(items: Item[]): Item[] {
    return items.filter(i => this.matchesQuery(i));
  }

  shortDescription(desc: Item['description']): string | null {
    if (!desc) return null;
    const s = String(desc).trim();
    return s.length ? s : null;
  }
}

