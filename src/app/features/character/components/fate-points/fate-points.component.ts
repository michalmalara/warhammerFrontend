import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'fate-points',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './fate-points.component.html',
  styleUrls: ['./fate-points.component.scss']
})
export class FatePointsComponent {
  /** Stałe "Fate" (max liczbą punktów przeznaczenia). */
  @Input() fateMax = 4;

  /** Dostępne Fate (wyświetlane jako wypełnione kropki). */
  @Input() fateCurrent = 3;

  /** Fortune (bieżąca pula do wydania; w mockupie po prawej). */
  @Input() fortuneCurrent = 2;

  get clampedFateCurrent(): number {
    return Math.max(0, Math.min(this.fateCurrent, this.fateMax));
  }

  dots(): number[] {
    return Array.from({length: this.fateMax}, (_, i) => i);
  }

  isFilledDot(i: number): boolean {
    return i < this.clampedFateCurrent;
  }
}

