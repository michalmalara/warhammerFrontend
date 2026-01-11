import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ProfessionHistoryEntry} from './profession-history.types';

@Component({
  selector: 'profession-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './profession-history.component.html',
  styleUrl: './profession-history.component.scss'
})
export class ProfessionHistoryComponent {
  @Input({required: true}) entries: ProfessionHistoryEntry[] = [];
}
