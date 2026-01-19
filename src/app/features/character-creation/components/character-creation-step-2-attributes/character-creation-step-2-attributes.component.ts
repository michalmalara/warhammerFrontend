import {CommonModule} from '@angular/common';
import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

import {CharacterCreationStateService} from '../../services/character-creation-state.service';
import {CharacterDataService, PrimaryStatId} from '../../services/character-data.service';

@Component({
  selector: 'app-character-creation-step-2-attributes',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-2-attributes.component.html',
  styleUrls: ['./character-creation-step-2-attributes.component.scss'],
})
export class CharacterCreationStep2AttributesComponent {
  private readonly router = inject(Router);
  private readonly state = inject(CharacterCreationStateService);

  // Inject new CharacterDataService which now owns stats and rolling logic
  readonly charData = inject(CharacterDataService);

  // minimal UI: prezentujemy dane przykładowe z mockupa
  readonly humanBase = this.charData.humanBase;

  readonly primaryStats = this.charData.primaryStats;
  readonly selectedStat = this.charData.selectedStat;
  readonly secondaryStats = this.charData.secondaryStats;

  // expose values (not Signal objects) for template compatibility
  get lastRollDisplay(): string {
    return this.charData.lastRollDisplay();
  }

  get isRolling(): boolean {
    return this.charData.isRolling();
  }

  readonly lowestRollTotal = this.charData.lowestRollTotal;

  readonly selectedRaceLabel = computed(() => {
    const race = this.charData.race();
    if (!race) return 'Unknown';
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  goPrev() {
    void this.router.navigate(['/character/create/step-1']);
  }

  goNext() {
    void this.router.navigate(['/character/create/step-3']);
  }

  // Forward UI actions to service
  onRollDice(seed?: number) {
    this.charData.onRollDice(seed);
  }

  applyShallyasMercy() {
    this.charData.applyShallyasMercy();
  }

  onSelectPrimary(id: PrimaryStatId) {
    this.charData.onSelectPrimary(id);
  }

  get mercyVariant() {
    return this.charData.mercyVariant;
  }

  get mercyLabel() {
    return this.charData.mercyLabel;
  }

  get mercyDisabled() {
    return this.charData.mercyDisabled;
  }

  get primaryStatsHasMercy(): boolean {
    return this.charData.primaryStatsHasMercy;
  }
}
