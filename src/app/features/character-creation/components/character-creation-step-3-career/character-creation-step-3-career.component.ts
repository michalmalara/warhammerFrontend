import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {firstValueFrom} from 'rxjs';
import {ProfessionsApiService} from '../../../professions/services/professions-api.service';
import {CharacterDataService} from '../../services/character-data.service';
import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';

@Component({
  selector: 'app-character-creation-step-3-career',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-3-career.component.html',
  styleUrls: ['./character-creation-step-3-career.component.scss'],
})
export class CharacterCreationStep3CareerComponent {
  private readonly api = inject(ProfessionsApiService);
  private readonly charData = inject(CharacterDataService);
  private readonly router = inject(Router);

  // UI state
  readonly isLoading = signal(false);
  readonly lastRoll = signal<number | null>(null);
  readonly profession = signal<any | null>(null);
  readonly fallback = signal<boolean | null>(null);
  readonly candidates = signal<number | null>(null);

  // Race label from CharacterDataService
  readonly selectedRace = computed(() => this.charData.race() ?? 'human');

  readonly selectedRaceLabel = computed(() => {
    const race = this.selectedRace();
    return race.charAt(0).toUpperCase() + race.slice(1);
  });

  readonly canAccept = computed(() => !!this.profession());

  readonly entryText = computed(() => {
    const p = this.profession();
    const list = (p?.entryProfessions ?? []) as Array<any>;
    return list.map((x) => x?.name ?? String(x)).join(', ');
  });

  readonly exitText = computed(() => {
    const p = this.profession();
    const list = (p?.exitProfessions ?? []) as Array<any>;
    return list.map((x) => x?.name ?? String(x)).join(', ');
  });

  readonly displaySkills = computed(() => {
    const p = this.profession();
    const skills = (p?.skills ?? []) as Array<any>;

    const hiddenIds = new Set<number>();
    const hiddenNames = new Set<string>();
    for (const s of skills) {
      const alts = (s?.alternativeSkill ?? s?.alternative_skill ?? []) as Array<any>;
      for (const a of alts ?? []) {
        const id = a?.id;
        if (typeof id === 'number') hiddenIds.add(id);
        const name = a?.name ?? a?.skill?.name ?? (typeof a === 'string' ? a : String(a));
        if (name) hiddenNames.add(String(name).trim().toLowerCase());
      }
    }

    // Jeśli dany element występuje jako alternatywa u innego — nie wyświetlamy go jako osobnej pozycji.
    return skills.filter((s) => {
      const id = s?.id;
      const name = s?.name ?? s?.skill?.name ?? String(s);
      const lname = name ? String(name).trim().toLowerCase() : null;
      if (typeof id === 'number' && hiddenIds.has(id)) return false;
      if (lname && hiddenNames.has(lname)) return false;
      return true;
    });
  });

  readonly displayTalents = computed(() => {
    const p = this.profession();
    const talents = (p?.talents ?? []) as Array<any>;

    const hiddenIds = new Set<number>();
    for (const t of talents) {
      const alts = (t?.alternativeTalent ?? t?.alternative_talent ?? []) as Array<any>;
      for (const a of alts ?? []) {
        const id = a?.id;
        if (typeof id === 'number') hiddenIds.add(id);
      }
    }

    return talents.filter((t) => {
      const id = t?.id;
      return !(typeof id === 'number' && hiddenIds.has(id));
    });
  });

  skillName(item: any): string {
    if (!item) return '';
    return item.name ?? item.skill?.name ?? String(item);
  }

  skillAlternatives(item: any): string[] {
    const alts = (item?.alternativeSkill ?? item?.alternative_skill ?? []) as Array<any>;
    if (!Array.isArray(alts) || alts.length === 0) return [];
    // backend/FE model: [{ id, skill: { name } }]
    return alts
      .map((x) => x?.name ?? x?.skill?.name ?? String(x))
      .filter((x) => !!x);
  }

  talentName(item: any): string {
    if (!item) return '';
    return item.name ?? item.talent?.name ?? String(item);
  }

  talentAlternatives(item: any): string[] {
    const alts = (item?.alternativeTalent ?? item?.alternative_talent ?? []) as Array<any>;
    if (!Array.isArray(alts) || alts.length === 0) return [];
    // backend/FE model: [{ id, talent: { name } }]
    return alts
      .map((x) => x?.name ?? x?.talent?.name ?? String(x))
      .filter((x) => !!x);
  }

  async drawCareer() {
    const race = this.selectedRace();
    this.isLoading.set(true);
    this.profession.set(null);
    this.lastRoll.set(null);
    this.fallback.set(null);
    this.candidates.set(null);

    try {
      const res = await firstValueFrom(this.api.draw(race));
      // backend returns { roll, matches: [profession], fallback, candidates? }
      this.lastRoll.set(res.roll ?? null);
      this.fallback.set(res.fallback ?? false);
      this.candidates.set(res.candidates ?? null);
      const first = Array.isArray(res.matches) && res.matches.length > 0 ? res.matches[0] : null;
      this.profession.set(first);
    } catch (err) {
      // TODO: better error handling / snackbars
      console.error('Failed to draw profession', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  goPrev() {
    void this.router.navigate(['/character/create/step-2']);
  }

  reroll() {
    void this.drawCareer();
  }

  acceptCareer() {
    // TODO: Persist chosen career to CharacterDataService / backend in later step.
    // For now we just move forward.
    if (!this.canAccept()) return;
    void this.router.navigate(['/character/create/step-4']);
  }
}
