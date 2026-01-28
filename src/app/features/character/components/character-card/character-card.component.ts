import {Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {ActivatedRoute} from '@angular/router';
import {catchError, filter, forkJoin, map, Observable, of, startWith, switchMap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

import {CharactersApiService} from '../../services/characters-api.service';
import {CharacterProfileApiService, CharacterProfileDto} from '../../services/character-profile-api.service';
import {CharacterSkillDto, CharacterSkillsApiService} from '../../services/character-skills-api.service';
import {CharacterTalentDto, CharacterTalentsApiService} from '../../services/character-talents-api.service';
import {SkillsApiService} from '../../../skills/services/skills-api.service';
import {TalentsApiService} from '../../../talents/services/talents-api.service';
import type {Character} from '../../models/character.models';
import type {Skill} from '../../../skills/models/skill.models';
import type {Talent as TalentDef} from '../../../talents/models/talent.models';

import {CharacterStatsComponent} from '../character-stats/character-stats.component';
import {WoundsPanelComponent} from '../wounds-panel/wounds-panel.component';
import {EquipmentTableComponent} from '../equipment-table/equipment-table.component';
import {SkillsComponent} from '../skills/skills.component';
import {CharacterSkill} from '../skills/skills.types';
import {TalentsComponent} from '../talents/talents.component';
import {Talent} from '../talents/talents.types';
import {FatePointsComponent} from '../fate-points/fate-points.component';
import {ProfessionXpPanelComponent} from '../profession-history/profession-xp-panel.component';

// View model exposed to the template
type CharacterCardVm = {
  loading: boolean;
  error: string | null;
  character: Character | null;
  profile: CharacterProfileDto | null;
  skillsUi: CharacterSkill[];
  talentsUi: Talent[];
  primaryStats: { label: string; base: number; adv: number; total?: number }[];
  secondaryStats: { label: string; base: number; adv: number; total?: number }[];
  woundsMax: number;
  woundsCurrent: number;
  fateMax: number;
  fateCurrent: number;
  xpCurrent: number;
  xpTotalEarned: number;
  currentProfession: string;
};

@Component({
  selector: 'character-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    CharacterStatsComponent,
    WoundsPanelComponent,
    EquipmentTableComponent,
    SkillsComponent,
    TalentsComponent,
    FatePointsComponent,
    ProfessionXpPanelComponent,
  ],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss'],
})
export class CharacterCardComponent {
  // expose global Math to the template (Angular templates only see component properties)
  readonly Math = Math;

  private readonly api = inject(CharactersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly profileApi = inject(CharacterProfileApiService);
  private readonly charSkillsApi = inject(CharacterSkillsApiService);
  private readonly charTalentsApi = inject(CharacterTalentsApiService);
  private readonly skillsApi = inject(SkillsApiService);
  private readonly talentsApi = inject(TalentsApiService);

  private readonly mapProfileToPrimaryStats = (p: CharacterProfileDto): {
    label: string;
    base: number;
    adv: number;
    total?: number;
  }[] => [
    {label: 'WS', base: p.weaponSkills, adv: p.weaponSkillsDevelopment},
    {label: 'BS', base: p.ballisticSkills, adv: p.ballisticSkillsDevelopment},
    {label: 'S', base: p.strength, adv: p.strengthDevelopment},
    {label: 'T', base: p.toughness, adv: p.toughnessDevelopment},
    {label: 'Ag', base: p.agility, adv: p.agilityDevelopment},
    {label: 'Int', base: p.intelligence, adv: p.intelligenceDevelopment},
    {label: 'WP', base: p.willpower, adv: p.willpowerDevelopment},
    {label: 'Fel', base: p.fellowship, adv: p.fellowshipDevelopment},
  ];

  private readonly mapProfileToSecondaryStats = (p: CharacterProfileDto): {
    label: string;
    base: number;
    adv: number;
    total?: number;
  }[] => {
    const strengthTotal = (p.strength ?? 0) + (p.strengthModifier ?? 0);
    const toughnessTotal = (p.toughness ?? 0) + (p.toughnessModifier ?? 0);

    const sb = Math.floor(strengthTotal / 10) + (p.strengthBonusModifier ?? 0);
    const tb = Math.floor(toughnessTotal / 10) + (p.toughnessBonusModifier ?? 0);

    return [
      {label: 'A', base: p.attacks, adv: p.attacksDevelopment},
      {label: 'W', base: p.wounds, adv: p.woundsDevelopment},

      {label: 'SB', base: 0, adv: 0, total: sb},
      {label: 'TB', base: 0, adv: 0, total: tb},

      {label: 'M', base: p.movement, adv: p.movementDevelopment},
      {label: 'MAG', base: p.magic, adv: p.magicDevelopment},
      {label: 'IP', base: p.insanityPoints, adv: 0},
      {label: 'FP', base: p.fatePoints, adv: 0},
    ];
  };

  private readonly listSkillDefinitionsByIds = (ids: number[]) =>
    this.skillsApi.list().pipe(map((list) => list.filter((s) => ids.includes(s.id))));

  private readonly listTalentDefinitionsByIds = (ids: number[]) =>
    this.talentsApi.list().pipe(map((list) => list.filter((t) => ids.includes(t.id))));

  private readonly mapCharacterSkillsToUi = (
    wrappers: CharacterSkillDto[],
    defs: Skill[],
    profile: CharacterProfileDto,
  ): CharacterSkill[] => {
    const byId = new Map<number, Skill>(defs.map((s) => [s.id, s]));

    const getCharacteristicValue = (assoc: string): number => {
      switch (assoc) {
        case 'weapon_skills':
          return (profile.weaponSkills ?? 0) + (profile.weaponSkillsDevelopment ?? 0) * 5;
        case 'ballistic_skills':
          return (profile.ballisticSkills ?? 0) + (profile.ballisticSkillsDevelopment ?? 0) * 5;
        case 'strength':
          return (profile.strength ?? 0) + (profile.strengthDevelopment ?? 0) * 5;
        case 'toughness':
          return (profile.toughness ?? 0) + (profile.toughnessDevelopment ?? 0) * 5;
        case 'agility':
          return (profile.agility ?? 0) + (profile.agilityDevelopment ?? 0) * 5;
        case 'intelligence':
          return (profile.intelligence ?? 0) + (profile.intelligenceDevelopment ?? 0) * 5;
        case 'willpower':
          return (profile.willpower ?? 0) + (profile.willpowerDevelopment ?? 0) * 5;
        case 'fellowship':
          return (profile.fellowship ?? 0) + (profile.fellowshipDevelopment ?? 0) * 5;
        default:
          return 0;
      }
    };

    return wrappers.flatMap((w) => {
      const def = byId.get(w.skill);
      if (!def) return [];

      const characteristic =
        def.associatedCharacteristic === 'weapon_skills'
          ? 'WS'
          : def.associatedCharacteristic === 'ballistic_skills'
            ? 'BS'
            : def.associatedCharacteristic === 'strength'
              ? 'S'
              : def.associatedCharacteristic === 'toughness'
                ? 'T'
                : def.associatedCharacteristic === 'agility'
                  ? 'AG'
                  : def.associatedCharacteristic === 'intelligence'
                    ? 'INT'
                    : def.associatedCharacteristic === 'willpower'
                      ? 'WP'
                      : def.associatedCharacteristic === 'fellowship'
                        ? 'FEL'
                        : String(def.associatedCharacteristic);

      const advPlus10 = w.level >= 1;
      const advPlus20 = w.level >= 2;

      const basePercent = getCharacteristicValue(def.associatedCharacteristic);

      const ui: CharacterSkill = {
        id: String(w.id),
        skill: {
          id: String(def.id),
          name: def.name,
          characteristic,
        },
        basePercent,
        taken: true,
        advPlus10,
        advPlus20,
      };

      return [ui];
    });
  };

  private readonly mapCharacterTalentsToUi = (wrappers: CharacterTalentDto[], defs: TalentDef[]): Talent[] => {
    const byId = new Map<number, TalentDef>(defs.map((t) => [t.id, t]));

    return wrappers.flatMap((w) => {
      const def = byId.get(w.talent);
      if (!def) return [];

      const ui: Talent = {
        id: String(def.id),
        name: def.name,
        description: def.description ?? '',
      };

      return [ui];
    });
  };

  readonly vm$: Observable<CharacterCardVm> = this.route.paramMap.pipe(
    map((pm) => pm.get('id')),
    filter((id): id is string => !!id),
    map((id) => Number(id)),
    filter((id) => Number.isFinite(id) && id > 0),
    switchMap((id) =>
      forkJoin({
        character: this.api.getById(id),
        profile: this.profileApi.getCharacterProfile(id),
        skillWrappers: this.charSkillsApi.list(id),
        talentWrappers: this.charTalentsApi.list(id),
      }).pipe(
        switchMap(({character, profile, skillWrappers, talentWrappers}) => {
          const skillIds = [...new Set(skillWrappers.map((w) => w.skill))];
          const talentIds = [...new Set(talentWrappers.map((w) => w.talent))];

          return forkJoin({
            character: of(character),
            profile: of(profile),
            skillsUi: skillIds.length
              ? this.listSkillDefinitionsByIds(skillIds).pipe(map((defs) => this.mapCharacterSkillsToUi(skillWrappers, defs, profile)))
              : of([] as CharacterSkill[]),
            talentsUi: talentIds.length
              ? this.listTalentDefinitionsByIds(talentIds).pipe(map((defs) => this.mapCharacterTalentsToUi(talentWrappers, defs)))
              : of([] as Talent[]),
          });
        }),
        map(({character, profile, skillsUi, talentsUi}) => ({
          loading: false,
          error: null as string | null,
          character,
          profile,
          skillsUi,
          talentsUi,
          primaryStats: this.mapProfileToPrimaryStats(profile),
          secondaryStats: this.mapProfileToSecondaryStats(profile),
          woundsMax: profile.wounds,
          woundsCurrent: profile.wounds,
          fateMax: profile.fatePoints,
          fateCurrent: profile.fatePoints,
          // expose XP and current profession at top-level of the VM for simpler bindings
          xpCurrent: character?.experiencePoints ?? this.xpCurrent,
          xpTotalEarned: character?.totalExperiencePoints ?? this.xpTotalEarned,
          currentProfession: character?.currentProfessionName ?? this.currentProfession,
        })),
        startWith({
          loading: true,
          error: null as string | null,
          character: null as Character | null,
          profile: null as CharacterProfileDto | null,
          skillsUi: [] as CharacterSkill[],
          talentsUi: [] as Talent[],
          primaryStats: this.primaryStats,
          secondaryStats: this.secondaryStats,
          woundsMax: this.woundsMax,
          woundsCurrent: this.woundsCurrent,
          fateMax: this.fateMax,
          fateCurrent: this.fateCurrent,
          // initial XP/profession values come from component inputs
          xpCurrent: this.xpCurrent,
          xpTotalEarned: this.xpTotalEarned,
          currentProfession: this.currentProfession,
        }),
        catchError((err) => {
          const http = err instanceof HttpErrorResponse ? err : null;
          if (http) {
            console.error('[CharacterCardComponent] HTTP error', {
              status: http.status,
              statusText: http.statusText,
              url: http.url,
              error: http.error,
            });
          } else {
            console.error('[CharacterCardComponent] Failed to load character dashboard', err);
          }

          return of({
            loading: false,
            error: 'Failed to load character. Please try again later.',
            character: null as Character | null,
            profile: null as CharacterProfileDto | null,
            skillsUi: [] as CharacterSkill[],
            talentsUi: [] as Talent[],
            primaryStats: this.primaryStats,
            secondaryStats: this.secondaryStats,
            woundsMax: this.woundsMax,
            woundsCurrent: this.woundsCurrent,
            fateMax: this.fateMax,
            fateCurrent: this.fateCurrent,
            // ensure XP/profession fields are present on error branch
            xpCurrent: this.xpCurrent,
            xpTotalEarned: this.xpTotalEarned,
            currentProfession: this.currentProfession,
          });
        }),
      ),
    ),
  );

  // --- current API kept as fallbacks (used when component is embedded elsewhere)
  @Input() name = 'Gottfried von Hollen';
  @Input() title = 'Roadwarden';
  @Input() subtitle = 'CHARACTER DASHBOARD';
  @Input() xpCurrent = 0;
  @Input() xpMax = 0;

  /** Aktualna profesja postaci (wyświetlana w karcie Experience). */
  @Input() currentProfession = this.title;

  /** Punkty doświadczenia dostępne do wydania (niewydane). */
  @Input() xpToSpend = 0;

  /** Suma wszystkich zdobytych punktów doświadczenia (łącznie). */
  @Input() xpTotalEarned = 0;

  /**
   * Wsteczna kompatybilność (używane też w sidebarze). Jeśli nie podasz `portraitUrl`,
   * komponent spróbuje użyć `avatarUrl`.
   */
  @Input() avatarUrl = 'assets/img/character-portrait-placeholder.png';

  /** URL portretu postaci do wyświetlenia obok imienia. */
  @Input() portraitUrl?: string;

  /** Tekst alternatywny dla portretu (dostępność / screenreadery). */
  @Input() portraitAlt?: string;

  get effectivePortraitUrl(): string {
    const url = (this.portraitUrl ?? '').trim() || (this.avatarUrl ?? '').trim();
    return url || 'assets/img/character-portrait-placeholder.png';
  }

  get effectivePortraitAlt(): string {
    const alt = (this.portraitAlt ?? '').trim();
    return alt || `Portrait: ${this.name}`;
  }

  // Primary / Secondary stats moved to a separate component
  primaryStats: { label: string; base: number; adv: number }[] = [
    {label: 'WS', base: 31, adv: 3},
    {label: 'BS', base: 26, adv: 5},
    {label: 'S', base: 35, adv: 0},
    {label: 'T', base: 33, adv: 5},
    {label: 'A', base: 27, adv: 5},
    {label: 'Int', base: 29, adv: 0},
    {label: 'WP', base: 31, adv: 5},
    {label: 'Fel', base: 30, adv: 0},
  ];

  secondaryStats: { label: string; base: number; adv: number }[] = [
    {label: 'A', base: 1, adv: 1},
    {label: 'W', base: 12, adv: 3},
    {label: 'SB', base: 3, adv: 0},
    {label: 'TB', base: 3, adv: 0},
    {label: 'M', base: 4, adv: 0},
    {label: 'MAG', base: 0, adv: 0},
    {label: 'IP', base: 2, adv: 0},
    {label: 'FP', base: 3, adv: 0},
  ];

  // Wounds state (kept as simple fields so parent can persist/observe value)
  woundsMax = 15;
  woundsCurrent = this.woundsMax;

  /** Mock danych dla taba Skills – do podpięcia pod backend w kolejnym kroku. */
  skills: CharacterSkill[] = [
    {
      id: 'animal-care',
      skill: {id: 'animal-care', name: 'Animal Care', characteristic: 'INT'},
      basePercent: 29,
      taken: true,
      advPlus10: false,
      advPlus20: false,
    },
    {
      id: 'gossip',
      skill: {id: 'gossip', name: 'Gossip', characteristic: 'FEL'},
      basePercent: 40,
      taken: true,
      advPlus10: true,
      advPlus20: false,
    },
    {
      id: 'search',
      skill: {id: 'search', name: 'Search', characteristic: 'INT'},
      basePercent: 29,
      taken: true,
      advPlus10: true,
      advPlus20: true,
    },
    {
      id: 'common-knowledge-empire',
      skill: {
        id: 'common-knowledge-empire',
        name: 'Common Knowledge (Empire)',
        characteristic: 'INT',
      },
      basePercent: 39,
      taken: true,
      advPlus10: true,
      advPlus20: false,
    },
    {
      id: 'outdoor-survival',
      skill: {id: 'outdoor-survival', name: 'Outdoor Survival', characteristic: 'INT'},
      basePercent: 29,
      taken: true,
      advPlus10: false,
      advPlus20: false,
    },
    {
      id: 'speak-language-reikspiel',
      skill: {
        id: 'speak-language-reikspiel',
        name: 'Speak Language (Reikspiel)',
        characteristic: 'INT',
      },
      basePercent: 39,
      taken: true,
      advPlus10: false,
      advPlus20: false,
    },
    {
      id: 'drive',
      skill: {id: 'drive', name: 'Drive', characteristic: 'S'},
      basePercent: 35,
      taken: true,
      advPlus10: false,
      advPlus20: false,
    },
    {
      id: 'perception',
      skill: {id: 'perception', name: 'Perception', characteristic: 'INT'},
      basePercent: 39,
      taken: true,
      advPlus10: true,
      advPlus20: false,
    },
    {
      id: 'swim',
      skill: {id: 'swim', name: 'Swim', characteristic: 'S'},
      basePercent: 35,
      taken: true,
      advPlus10: false,
      advPlus20: false,
    },
  ];

  /** Mock danych dla taba Talents – do podpięcia pod backend w kolejnym kroku. */
  talents: Talent[] = [
    {
      id: 'coolheaded',
      name: 'Coolheaded',
      description: 'You can retry one failed Cool Test per session.',
    },
    {
      id: 'night-vision',
      name: 'Night Vision',
      description: 'You can see in the dark as if it were dim light.',
    },
    {
      id: 'hardy',
      name: 'Hardy',
      description: 'Increase your Wounds by +1.',
    },
    {
      id: 'rapid-reload',
      name: 'Rapid Reload',
      description: 'You reload ranged weapons faster than normal.',
    },
  ];

  /** Fate/Fortune – mock pod kartę Fate Points (zgodnie z mockupem). */
  fateMax = 4;
  fateCurrent = 3;
  fortuneCurrent = 2;

  onPortraitError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;

    // avoid loop if placeholder is already set
    if (img.src.endsWith('assets/img/character-portrait-placeholder.png')) return;
    img.src = 'assets/img/character-portrait-placeholder.png';
  }
}
