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
  /** Button variant: 'cancel' for secondary, 'save' for primary action */
  @Input() variant: WaxSealVariant = 'save';

  /** Icon to display inside the button */
  @Input() icon: string = 'check';

  /** Label text below the button */
  @Input() label: string = '';

  /** Whether the button is in loading state */
  @Input() loading: boolean = false;

  /** Whether the button is disabled */
  @Input() disabled: boolean = false;

  /** If provided, renders as a link instead of a button */
  @Input() routerLink: string | string[] | null = null;

  /** Button type (for form submission) */
  @Input() type: 'button' | 'submit' = 'button';

  /** Aria label for accessibility */
  @Input() ariaLabel: string = '';

  /** Emits when button is clicked (only for non-link buttons) */
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
