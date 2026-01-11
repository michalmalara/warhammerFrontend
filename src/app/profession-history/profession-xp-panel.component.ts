import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'profession-xp-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './profession-xp-panel.component.html',
  styleUrl: './profession-xp-panel.component.scss'
})
export class ProfessionXpPanelComponent {
  @Input() xpCurrent = 0;
  @Input() xpMax = 0;

  /** Unspent experience points. */
  @Input() xpToSpend = 0;

  /** Total experience points earned so far. */
  @Input() xpTotalEarned = 0;

  get xpPercent(): number {
    if (!this.xpMax) return 0;
    if (this.xpCurrent <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((this.xpCurrent / this.xpMax) * 100)));
  }

  /** How much XP is missing to switch to the next profession. */
  get xpMissingToProfession(): number {
    return Math.max(0, (this.xpMax ?? 0) - (this.xpCurrent ?? 0));
  }
}

