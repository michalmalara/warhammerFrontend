import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {Talent} from './talents.types';

@Component({
  selector: 'talents',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './talents.component.html',
  styleUrls: ['./talents.component.scss']
})
export class TalentsComponent {
  @Input({required: true}) talents: Talent[] = [];

  trackById = (_: number, t: Talent) => t.id;
}
