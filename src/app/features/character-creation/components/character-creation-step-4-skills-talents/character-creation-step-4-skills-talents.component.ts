import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, signal, WritableSignal} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';

import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {CharacterDataService} from '../../services/character-data.service';
import {ProfessionSkill, ProfessionTalent} from '../../../professions/models/profession.models';

@Component({
  selector: 'app-character-creation-step-4-skills-talents',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCheckboxModule, BreadcrumbsComponent, WaxSealButtonComponent],
  templateUrl: './character-creation-step-4-skills-talents.component.html',
  styleUrls: ['./character-creation-step-4-skills-talents.component.scss'],
})
export class CharacterCreationStep4SkillsTalentsComponent {
  private readonly router = inject(Router);
  private readonly charData = inject(CharacterDataService);

  readonly profession = computed(() => this.charData.getProfession());

  readonly professionSkills = computed(() => this.profession()?.skills ?? []);
  readonly professionTalents = computed(() => this.profession()?.talents ?? []);

  readonly selectedProfessionSkills: WritableSignal<ProfessionSkill[]> = signal([]);
  readonly selectedProfessionTalents: WritableSignal<ProfessionTalent[]> = signal([]);

  // Computed sets for quick membership checks in template
  readonly selectedSkillIds = computed(() => new Set(this.selectedProfessionSkills().map((s) => s.id)));
  readonly selectedTalentIds = computed(() => new Set(this.selectedProfessionTalents().map((t) => t.id)));

  constructor() {
    effect(() => {
      const prof = this.profession();
      if (!prof) {
        this.selectedProfessionSkills.set([]);
        this.selectedProfessionTalents.set([]);
        return;
      }

      const skills: ProfessionSkill[] = Array.isArray(prof.skills)
        ? prof.skills.filter((s: ProfessionSkill) => !(s.alternativeSkill && s.alternativeSkill.length > 0))
        : [];

      const talents: ProfessionTalent[] = Array.isArray(prof.talents)
        ? prof.talents.filter((t: ProfessionTalent) => !(t.alternativeTalent && t.alternativeTalent.length > 0))
        : [];

      this.selectedProfessionSkills.set(skills);
      this.selectedProfessionTalents.set(talents);
    });
  }

  readonly selectedRaceLabel = computed(() => {
    const race = this.charData.race();
    if (!race) return 'Unknown race';
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

  onProfessionSkillClick(profession: ProfessionSkill) {
    const current = this.selectedProfessionSkills();
    const isSelected = this.selectedSkillIds().has(profession.id);

    if (isSelected) {
      this.selectedProfessionSkills.set(current.filter((s) => s.id !== profession.id));
      return;
    }

    const altIds: number[] = Array.isArray(profession.alternativeSkill)
      ? profession.alternativeSkill.map((a) => a?.id).filter((id): id is number => typeof id === 'number')
      : [];

    const withoutAlternatives = altIds.length > 0
      ? current.filter((s) => !altIds.includes(s.id))
      : current;

    this.selectedProfessionSkills.set([...withoutAlternatives, profession]);
  }

  goPrev() {
    void this.router.navigate(['/character-create/step-3']);
  }

  goNext() {
    void this.router.navigate(['/character-create/step-5']);
  }
}
