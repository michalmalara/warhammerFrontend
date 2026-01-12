import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {Observable} from 'rxjs';

import {ProfessionsApiService} from '../../services/professions-api.service';
import type {Profession, ProfessionSummary} from '../../models/profession.models';

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
  ],
  templateUrl: './professions-list.component.html',
  styleUrls: ['./professions-list.component.scss'],
})
export class ProfessionsListComponent {
  private readonly api = inject(ProfessionsApiService);

  readonly professions$: Observable<Array<ProfessionSummary | Profession>> = this.api.list();

  trackById = (_: number, item: ProfessionSummary | Profession) => item.id;
}

