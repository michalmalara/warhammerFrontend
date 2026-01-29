import {CommonModule} from '@angular/common';
import {Component, inject, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-character-creation-step-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="placeholder">
      <h1>Character creation: {{ stepLabel }}</h1>
      <p>This step isn't implemented yet.</p>
    </section>
  `,
  styles: [
    `
      .placeholder {
        padding: 2rem;
        color: var(--color-text);
      }
    `,
  ],
})
export class CharacterCreationStepPlaceholderComponent {
  @Input() stepLabel = inject(ActivatedRoute).snapshot.data['stepLabel'] ?? 'Unknown step';
}
