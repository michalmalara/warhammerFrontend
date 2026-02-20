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

  readonly raceSkillLinks = computed(() => this.charData.raceSkillLinks());
  readonly raceTalentLinks = computed(() => this.charData.raceTalentLinks());

  private readonly hasNoAlternatives = (alternatives: unknown): boolean => {
    if (!alternatives) return true;
    return Array.isArray(alternatives) ? alternatives.length === 0 : true;
  };

  readonly getSkillKey = (ps: ProfessionSkill | null | undefined): string => {
    if (!ps) return '';
    const name = ps.skill?.name ?? '';
    const desc = (ps.description ?? ps.skill?.description ?? '') ?? '';
    return `${name}::${desc}`;
  };

  readonly getTalentKey = (pt: ProfessionTalent | null | undefined): string => {
    if (!pt) return '';
    const name = pt.talent?.name ?? '';
    const desc = (pt.description ?? pt.talent?.description ?? '') ?? '';
    return `${name}::${desc}`;
  };

  private readonly lockedRaceSkillKeys = computed(() => {
    const links = this.raceSkillLinks();
    const locked = (Array.isArray(links) ? links : []).filter((s) => this.hasNoAlternatives(s?.alternativeSkill));
    return new Set(locked.map((s) => this.getSkillKey(s as ProfessionSkill)));
  });

  private readonly lockedRaceTalentKeys = computed(() => {
    const links = this.raceTalentLinks();
    const locked = (Array.isArray(links) ? links : []).filter((t) => this.hasNoAlternatives(t?.alternativeTalent));
    return new Set(locked.map((t) => this.getTalentKey(t as ProfessionTalent)));
  });

  private readonly mergeUniqueByKey = <T>(current: T[], toAdd: T[], keyOf: (t: T) => string): T[] => {
    const map = new Map<string, T>();
    for (const item of current ?? []) {
      const k = keyOf(item as T);
      if (k) map.set(k, item);
    }
    for (const item of toAdd ?? []) {
      const k = keyOf(item as T);
      if (k) map.set(k, item);
    }
    return Array.from(map.values());
  };

  constructor() {
    effect(() => {
      const prof = this.profession();
      if (!prof) {
        this.selectedProfessionSkills.set([]);
        this.selectedProfessionTalents.set([]);
        return;
      }

      const skills: ProfessionSkill[] = Array.isArray(prof.skills)
        ? prof.skills.filter((s) => !(s.alternativeSkill && s.alternativeSkill.length > 0))
        : [];

      const talents: ProfessionTalent[] = Array.isArray(prof.talents)
        ? prof.talents.filter((t) => !(t.alternativeTalent && t.alternativeTalent.length > 0))
        : [];

      this.selectedProfessionSkills.set(skills);
      this.selectedProfessionTalents.set(talents);
    });

    effect(() => {
      const prof = this.profession();
      if (!prof) return;

      const raceSkillLinks = this.raceSkillLinks();
      const raceTalentLinks = this.raceTalentLinks();

      const skills: ProfessionSkill[] = Array.isArray(raceSkillLinks)
        ? raceSkillLinks.filter((s) => !(s.alternativeSkill && s.alternativeSkill.length > 0))
        : [];

      const talents: ProfessionTalent[] = Array.isArray(raceTalentLinks)
        ? raceTalentLinks.filter((t) => !(t.alternativeTalent && t.alternativeTalent.length > 0))
        : [];

      console.log(skills, talents)

      this.selectedProfessionSkills.update((current) => this.mergeUniqueByKey(current, skills as any, this.getSkillKey as any));
      this.selectedProfessionTalents.update((current) => this.mergeUniqueByKey(current, talents as any, this.getTalentKey as any));

      console.log(this.selectedProfessionSkills(), this.selectedProfessionTalents())
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

  readonly selectedProfessionSkills: WritableSignal<ProfessionSkill[]> = signal([]);
  readonly selectedProfessionTalents: WritableSignal<ProfessionTalent[]> = signal([]);

  readonly selectedSkillIds = computed(() => new Set(this.selectedProfessionSkills().map((s) => this.getSkillKey(s))));
  readonly selectedTalentIds = computed(() => new Set(this.selectedProfessionTalents().map((t) => this.getTalentKey(t))));

  onProfessionSkillClick(profession: ProfessionSkill) {
    if (this.lockedRaceSkillKeys().has(this.getSkillKey(profession))) return;
    const current = this.selectedProfessionSkills();
    const isSelected = this.selectedSkillIds().has(this.getSkillKey(profession));

    if (isSelected) {
      this.selectedProfessionSkills.set(current.filter((s) => this.getSkillKey(s) !== this.getSkillKey(profession)));
      return;
    }

    const altKeys: string[] = Array.isArray(profession.alternativeSkill)
      ? profession.alternativeSkill.map((a) => `${a?.skill?.name ?? ''}::${a?.description ?? ''}`)
      : [];

    const withoutAlternatives = altKeys.length > 0
      ? current.filter((s) => !altKeys.includes(this.getSkillKey(s)))
      : current;

    this.selectedProfessionSkills.set([...withoutAlternatives, profession]);
  }

  onProfessionTalentClick(professionTalent: ProfessionTalent) {
    if (this.lockedRaceTalentKeys().has(this.getTalentKey(professionTalent))) return;
    const current = this.selectedProfessionTalents();
    const isSelected = this.selectedTalentIds().has(this.getTalentKey(professionTalent));

    if (isSelected) {
      this.selectedProfessionTalents.set(current.filter((t) => this.getTalentKey(t) !== this.getTalentKey(professionTalent)));
      return;
    }

    const altKeys: string[] = Array.isArray(professionTalent.alternativeTalent)
      ? professionTalent.alternativeTalent.map((a) => `${a?.talent?.name ?? ''}::${a?.description ?? ''}`)
      : [];

    const withoutAlternatives = altKeys.length > 0
      ? current.filter((t) => !altKeys.includes(this.getTalentKey(t)))
      : current;

    this.selectedProfessionTalents.set([...withoutAlternatives, professionTalent]);
  }

  // Add aliases matching template bindings
  onSkillTileClick(skill: ProfessionSkill) {
    if (this.lockedRaceSkillKeys().has(this.getSkillKey(skill))) return;
    if ((skill.alternativeSkill ?? []).length === 0) return;
    this.onProfessionSkillClick(skill);
  }

  onTalentTileClick(talent: ProfessionTalent) {
    if (this.lockedRaceTalentKeys().has(this.getTalentKey(talent))) return;
    if ((talent.alternativeTalent ?? []).length === 0) return;
    this.onProfessionTalentClick(talent);
  }

  goPrev() {
    void this.router.navigate(['/character-create/step-3']);
  }

  goNext() {
    // Save selected profession skills and talents into CharacterDataService before navigating
    const skills = this.selectedProfessionSkills().map(ps => ps.skill);
    const talents = this.selectedProfessionTalents().map(pt => pt.talent);

    this.charData.setProfessionSkills(skills);
    this.charData.setProfessionTalents(talents);

    void this.router.navigate(['/character-create/step-5']);
  }
}
