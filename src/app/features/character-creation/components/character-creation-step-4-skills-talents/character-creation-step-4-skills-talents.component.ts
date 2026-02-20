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

  readonly normalizeTalent = (pt: any): ProfessionTalent => {
    if (!pt) return {talent: {id: undefined as any, name: '', description: ''}} as ProfessionTalent;
    if (typeof pt === 'string') {
      return {talent: {id: undefined as any, name: pt, description: ''}} as ProfessionTalent;
    }
    if (typeof pt === 'number') {
      return {talent: {id: pt as any, name: '', description: ''}, id: pt} as ProfessionTalent;
    }
    const out: any = {...(pt ?? {})};
    // accept nested talent data under either 'talent' or legacy 'skill' key
    const talentObj = out.talent ?? out.skill ?? {};
    const idFromNested = talentObj?.id ?? undefined;
    const nameFromNested = talentObj?.name ?? undefined;
    const nameFromTop = out.name ?? undefined;
    const name = nameFromNested ?? nameFromTop ?? '';
    const desc = out.description ?? talentObj?.description ?? '';
    out.talent = {id: idFromNested, name, description: desc};
    out.description = desc;
    // keep top-level id for profession-talent link if present; otherwise prefer nested talent id
    if (typeof out.id !== 'number' && typeof idFromNested === 'number') {
      out.id = idFromNested;
    }
    return out as ProfessionTalent;
  };

  readonly getTalentKey = (pt: ProfessionTalent | null | undefined): string => {
    const norm = this.normalizeTalent(pt as any);
    const id = (norm.talent as any)?.id;
    const name = norm.talent?.name ?? '';
    const desc = (norm.description ?? norm.talent?.description ?? '') ?? '';
    return typeof id === 'number' && Number.isFinite(id) ? `id:${id}` : `${name}::${desc}`;
  };

  // Compare two talent-like objects robustly regardless of whether they are link objects, nested, or simple values
  private readonly talentEquals = (a: any, b: any): boolean => {
    const na = this.normalizeTalent(a as any);
    const nb = this.normalizeTalent(b as any);

    const aTalentId = (na.talent as any)?.id;
    const bTalentId = (nb.talent as any)?.id;
    if (typeof aTalentId === 'number' && typeof bTalentId === 'number') return aTalentId === bTalentId;

    const aTopId = (na as any)?.id;
    const bTopId = (nb as any)?.id;
    if (typeof aTopId === 'number' && typeof bTopId === 'number') return aTopId === bTopId;

    const aName = (na.talent?.name ?? '').toString().trim().toLowerCase();
    const bName = (nb.talent?.name ?? '').toString().trim().toLowerCase();
    if (aName && bName && aName === bName) {
      const aDesc = (na.description ?? na.talent?.description ?? '').toString().trim().toLowerCase();
      const bDesc = (nb.description ?? nb.talent?.description ?? '').toString().trim().toLowerCase();
      return aDesc === bDesc;
    }

    return false;
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

  private readonly mergeUniqueByKey = <T extends { id?: number }>(current: T[], toAdd: T[]): T[] => {
    const map = new Map<string | number, T>();
    for (const item of current ?? []) {
      const id = (item as any)?.id;
      if (typeof id === 'number') {
        map.set(id, item);
      } else {
        map.set(JSON.stringify(item), item);
      }
    }
    for (const item of toAdd ?? []) {
      const id = (item as any)?.id;
      if (typeof id === 'number') {
        map.set(id, item);
      } else {
        map.set(JSON.stringify(item), item);
      }
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
        ? prof.talents.filter((t) => !(t.alternativeTalent && t.alternativeTalent.length > 0)).map(t => this.normalizeTalent(t as any))
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
        ? raceTalentLinks
          .filter((t) => !(t.alternativeTalent && t.alternativeTalent.length > 0))
          .map(t => this.normalizeTalent(t as any))
        : [];

      this.selectedProfessionSkills.update((current) => this.mergeUniqueByKey(current, skills as any));
      this.selectedProfessionTalents.update((current) => this.mergeUniqueByKey(current, talents as any));
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

  onProfessionSkillClick(professionSkill: ProfessionSkill) {
    if (this.lockedRaceSkillKeys().has(this.getSkillKey(professionSkill))) return;
    const current = this.selectedProfessionSkills();
    const isSelected = this.selectedSkillIds().has(this.getSkillKey(professionSkill));

    if (isSelected) {
      this.selectedProfessionSkills.set(current.filter((s) => this.getSkillKey(s) !== this.getSkillKey(professionSkill)));
      return;
    }

    const altKeys: string[] = Array.isArray(professionSkill.alternativeSkill)
      ? professionSkill.alternativeSkill.map((a) => this.getSkillKey(a as ProfessionSkill))
      : [];

    const withoutAlternatives = altKeys.length > 0
      ? current.filter((s) => !altKeys.includes(this.getSkillKey(s)))
      : current;

    this.selectedProfessionSkills.set([...withoutAlternatives, professionSkill]);
  }

  onProfessionTalentClick(professionTalent: ProfessionTalent) {
    if (this.lockedRaceTalentKeys().has(this.getTalentKey(professionTalent))) return;
    const current = this.selectedProfessionTalents();
    const isSelected = this.selectedTalentIds().has(this.getTalentKey(professionTalent));

    if (isSelected) {
      this.selectedProfessionTalents.set(current.filter((t) => this.getTalentKey(t) !== this.getTalentKey(professionTalent)));
      return;
    }

    // alternatives declared on the clicked talent
    const declaredAlts: any[] = Array.isArray(professionTalent.alternativeTalent) ? professionTalent.alternativeTalent : [];

    // other race links that list this talent as an alternative (mutual references)
    const raceLinks = Array.isArray(this.raceTalentLinks()) ? this.raceTalentLinks() : [];
    const mutualAlts: any[] = raceLinks
      .filter((link) => Array.isArray(link.alternativeTalent) && link.alternativeTalent.some((a: any) => this.talentEquals(a, professionTalent)))
      .map((l) => l as any);

    const allRelatedAlts = [...declaredAlts, ...mutualAlts];

    const withoutAlternatives = allRelatedAlts.length > 0
      ? current.filter((t) => !allRelatedAlts.some((a) => this.talentEquals(a, t)))
      : current;

    const normalized = this.normalizeTalent(professionTalent as any);
    this.selectedProfessionTalents.set([...withoutAlternatives, normalized]);
  }

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
