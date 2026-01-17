import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

import {CharacterCreationStateService} from '../../services/character-creation-state.service';

type PrimaryStatId = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

type PrimaryStat = {
  id: PrimaryStatId;
  label: string;
  fullName: string;
  value: number;
  deltaFromBase: number;
};

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

  // minimal UI: prezentujemy dane przykładowe z mockupa
  readonly humanBase = 20;

  readonly primaryStats = signal<PrimaryStat[]>([
    {id: 'WS', label: 'WS', fullName: 'Weapon Skill', value: 38, deltaFromBase: 18},
    {id: 'BS', label: 'BS', fullName: 'Ballistic Skill', value: 24, deltaFromBase: 4},
    {id: 'S', label: 'S', fullName: 'Strength', value: 22, deltaFromBase: 2},
    {id: 'T', label: 'T', fullName: 'Toughness', value: 31, deltaFromBase: 11},
    {id: 'Ag', label: 'Ag', fullName: 'Agility', value: 40, deltaFromBase: 20},
    {id: 'Int', label: 'Int', fullName: 'Intelligence', value: 35, deltaFromBase: 15},
    {id: 'WP', label: 'WP', fullName: 'Willpower', value: 29, deltaFromBase: 9},
    {id: 'Fel', label: 'Fel', fullName: 'Fellowship', value: 32, deltaFromBase: 12},
  ]);

  readonly selectedRaceLabel = computed(() => {
    const race = this.state.step1().race;
    if (!race) return 'Unknown';
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  goPrev() {
    void this.router.navigate(['/character/create/step-1']);
  }

  goNext() {
    // jeszcze nie implementujemy logiki akceptacji, więc pozwalamy przejść dalej.
    void this.router.navigate(['/character/create/step-3']);
  }
}
