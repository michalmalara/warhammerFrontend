import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {ProfessionHistoryEntry} from './profession-history.types';
import {ProfessionXpPanelComponent} from './profession-xp-panel.component';

@Component({
  selector: 'profession-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, ProfessionXpPanelComponent],
  templateUrl: './profession-history.component.html',
  styleUrl: './profession-history.component.scss'
})
export class ProfessionHistoryComponent {
  @Input({required: true}) entries: ProfessionHistoryEntry[] = [];

  @Input() xpCurrent = 0;
  @Input() xpMax = 0;
  @Input() xpToSpend = 0;
  @Input() xpTotalEarned = 0;
}
