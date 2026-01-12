import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { filter, map, switchMap } from 'rxjs/operators';

import { ProfessionsApiService } from '../../services/professions-api.service';

@Component({
  selector: 'app-profession-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profession-detail.component.html',
  styleUrls: ['./profession-detail.component.scss'],
})
export class ProfessionDetailComponent {
  private readonly api = inject(ProfessionsApiService);
  private readonly route = inject(ActivatedRoute);

  readonly profession$ = this.route.paramMap.pipe(
    map((pm) => pm.get('id')),
    filter((id): id is string => !!id),
    map((id) => Number(id)),
    filter((id) => Number.isFinite(id)),
    switchMap((id) => this.api.getById(id)),
  );

  trackById = (_: number, item: { id: number }) => item.id;
}
