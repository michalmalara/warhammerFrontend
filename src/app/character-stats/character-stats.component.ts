import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'character-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-stats.component.html',
  styleUrls: ['./character-stats.component.scss']
})
export class CharacterStatsComponent {
  @Input() primaryStats: { label: string; value: number }[] = [];
  @Input() secondaryStats: { label: string; value: number }[] = [];
}
