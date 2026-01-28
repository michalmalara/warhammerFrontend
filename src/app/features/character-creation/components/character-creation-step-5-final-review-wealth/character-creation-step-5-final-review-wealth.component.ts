import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {CharacterDataService} from '../../services/character-data.service';
import {CharacterSaveService} from '../../services/character-save.service';

@Component({
  selector: 'app-character-creation-step-5-final-review-wealth',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-5-final-review-wealth.component.html',
  styleUrls: ['./character-creation-step-5-final-review-wealth.component.scss'],
})
export class CharacterCreationStep5FinalReviewWealthComponent {
  private readonly router = inject(Router);
  private readonly charData = inject(CharacterDataService);
  private readonly characterSave = inject(CharacterSaveService);

  readonly isSaving = signal(false);

  readonly selectedRaceLabel = computed(() => this.charData.selectedRaceLabel());
  readonly profession = computed(() => this.charData.getProfession());

  readonly bio = computed(() => this.charData.bio());
  readonly goldCrowns = computed(() => this.charData.goldCrowns());
  readonly trappings = computed(() => this.charData.startingTrappings());

  readonly portraitUrl = computed(() => {
    const b = this.bio();
    const maybe = (b as any)?.portraitUrl ?? '';
    if (typeof maybe === 'string' && maybe.trim()) return maybe.trim();
    return '';
  });

  readonly primaryStats = computed(() => this.charData.primaryTotals());
  readonly secondaryStats = computed(() => this.charData.secondaryTotals());

  readonly skillsHighlights = computed(() => this.charData.getProfessionSkills().map(s => s.name));
  readonly talentsHighlights = computed(() => this.charData.getProfessionTalents().map(t => t.name));

  readonly highlights = computed(() => {
    return [...this.skillsHighlights(), ...this.talentsHighlights()].slice(0, 5);
  });

  rollForWealth = () => {
    this.charData.rollWealth2d10();
  };

  goPrev = () => {
    this.router.navigate(['/character-create/step-4']);
  };

  commitCharacter = async () => {
    if (this.isSaving()) return;

    const p = this.profession();
    if (!p) {
      await this.router.navigate(['/character-create/step-3']);
      return;
    }

    this.isSaving.set(true);
    try {
      await this.characterSave.save();
      await this.router.navigate(['/character']);
    } finally {
      this.isSaving.set(false);
    }
  };

  get portraitUrlString(): string {
    return this.portraitUrl();
  }

  get portraitVisible(): boolean {
    return !!this.portraitUrl();
  }

  get portraitUrlForImg(): string {
    return this.portraitUrl();
  }
}
