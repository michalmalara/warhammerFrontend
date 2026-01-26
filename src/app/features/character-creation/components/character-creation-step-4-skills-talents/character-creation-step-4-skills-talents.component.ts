import {CommonModule} from '@angular/common';
import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {CharacterDataService} from '../../services/character-data.service';

@Component({
  selector: 'app-character-creation-step-4-skills-talents',
  standalone: true,
  imports: [CommonModule, MatIconModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-4-skills-talents.component.html',
  styleUrls: ['./character-creation-step-4-skills-talents.component.scss'],
})
export class CharacterCreationStep4SkillsTalentsComponent {
  private readonly router = inject(Router);
  private readonly charData = inject(CharacterDataService);

  readonly profession = computed(() => this.charData.getProfession());
  readonly skills = computed(() => this.charData.getProfessionSkills());
  readonly talents = computed(() => this.charData.getProfessionTalents());

  readonly selectedRaceLabel = computed(() => {
    const race = this.charData.race();
    if (!race) return 'Unknown race';
    // Keep labels aligned with step-1 cards.
    switch (race) {
      case 'human':
        return 'Human';
      case 'dwarf':
        return 'Dwarf';
      case 'elf':
        return 'Elf';
      case 'halfling':
        return 'Halfling';
      default:
        return String(race);
    }
  });

  goPrev() {
    void this.router.navigate(['/character/create/step-3']);
  }

  goNext() {
    // Navigate to step-5 (Final Review & Wealth)
    void this.router.navigate(['/character/create/step-5']);
  }
}
