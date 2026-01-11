import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'wounds-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './wounds-panel.component.html',
  styleUrls: ['./wounds-panel.component.scss']
})
export class WoundsPanelComponent {
  // Inputs/Outputs
  @Input() woundsMax: number = 15;
  @Input() woundsCurrent: number = 12;
  @Output() woundsCurrentChange = new EventEmitter<number>();

  // Increment wounds (healing)
  incWounds(): void {
    if (this.woundsCurrent < this.woundsMax) {
      this.woundsCurrent++;
      this.woundsCurrentChange.emit(this.woundsCurrent);
    }
  }

  // Decrement wounds (damage)
  decWounds(): void {
    if (this.woundsCurrent > 0) {
      this.woundsCurrent--;
      this.woundsCurrentChange.emit(this.woundsCurrent);
    }
  }

  // Display wounds with two-digit padding like the mockup
  get woundsDisplay(): string {
    return String(this.woundsCurrent).padStart(2, '0');
  }

  // Helper: remaining wounds as fraction (0..1)
  get woundsFraction(): number {
    if (!this.woundsMax) return 0;
    return this.woundsCurrent / this.woundsMax;
  }

  // Percentage-based thresholds (relative to woundsMax)
  private readonly _healthyThreshold = 11 / 12;
  private readonly _slightlyThreshold = 6 / 12;
  private readonly _criticalThreshold = 3 / 12;

  // Simple status string based on percentage thresholds
  get woundsStatus(): string {
    if (this.woundsCurrent === 0) return 'Critical';

    const frac = this.woundsFraction;

    if (frac >= this._healthyThreshold) return 'healthy';
    if (frac >= this._slightlyThreshold) return 'SLIGHTLY WOUNDED';
    if (frac > this._criticalThreshold) return 'WOUNDED';
    return 'HEAVILY WOUNDED';
  }

  // Convenience getters used by template for setting wound-state classes
  get isCritical(): boolean {
    return this.woundsFraction <= this._criticalThreshold;
  }

  get isWounded(): boolean {
    return this.woundsFraction > this._criticalThreshold && this.woundsFraction < this._slightlyThreshold;
  }

  get isHealthy(): boolean {
    return this.woundsFraction >= this._healthyThreshold;
  }

  get isSlightlyWounded(): boolean {
    return this.woundsFraction >= this._slightlyThreshold && this.woundsFraction < this._healthyThreshold;
  }
}
