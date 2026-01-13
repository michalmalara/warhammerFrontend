import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {catchError, Observable, of} from 'rxjs';

import {SkillsApiService} from '../../services/skills-api.service';
import type {Skill} from '../../models/skill.models';

@Component({
  selector: 'app-skills-list',
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
  templateUrl: './skills-list.component.html',
  styleUrls: ['./skills-list.component.scss'],
})
export class SkillsListComponent {
  private readonly api = inject(SkillsApiService);

  readonly skills$: Observable<Skill[] | null> = this.api.list().pipe(catchError(() => of(null)));

  trackById = (_: number, s: Skill) => s.id;
}
