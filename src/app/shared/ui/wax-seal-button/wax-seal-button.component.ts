import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

export type WaxSealVariant = 'cancel' | 'save';

@Component({
  selector: 'app-wax-seal-button',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './wax-seal-button.component.html',
  styleUrls: ['./wax-seal-button.component.scss'],
})
export class WaxSealButtonComponent {
  @Input() variant: WaxSealVariant = 'save';
  @Input() icon: string = 'check';
  @Input() label: string = '';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() routerLink: string | string[] | null = null;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() ariaLabel: string = '';

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    return `wax-seal wax-seal-${this.variant}`;
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get labelClasses(): string {
    return this.variant === 'save' ? 'action-label action-label-accent' : 'action-label';
  }

  onClick(): void {
    if (!this.isDisabled) {
      this.clicked.emit();
    }
  }
}
