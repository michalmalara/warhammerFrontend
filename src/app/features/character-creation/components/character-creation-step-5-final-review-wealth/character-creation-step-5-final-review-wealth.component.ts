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
  readonly trappings = computed(() => this.charData.initialEquipmentLabels());

  readonly portraitUrl = computed(() => {
    const b = this.bio();
    const maybe = (b as any)?.portraitUrl ?? '';
    if (typeof maybe === 'string' && maybe.trim()) return maybe.trim();
    return '';
  });

  readonly primaryStats = computed(() => this.charData.primaryTotals());
  readonly secondaryStats = computed(() => this.charData.secondaryTotals());

  readonly skillsHighlights = computed(() => {
    return this.charData.getProfessionSkills().map((l) => ({
      id: l.skill?.id,
      name: l.skill?.name ?? "",
      description: l.description ?? l.skill?.description ?? "",
    }));
  });

  readonly talentsHighlights = computed(() => {
    return this.charData.getProfessionTalents().map((l) => ({
      id: l.talent?.id,
      name: l.talent?.name ?? "",
      description: l.description ?? l.talent?.description ?? "",
    }));
  });

  readonly highlights = computed(() => {
    return [...this.skillsHighlights(), ...this.talentsHighlights()].slice(0, 5);
  });

  readonly weaponOptions = [
    {id: "club", label: $localize`:Weapon label@@cc.final.weapon.club:Club`},
    {id: "sword", label: $localize`:Weapon label@@cc.final.weapon.sword:Sword`},
    {id: "axe", label: $localize`:Weapon label@@cc.final.weapon.axe:Axe`},
    {id: "hammer", label: $localize`:Weapon label@@cc.final.weapon.hammer:Hammer`},
  ] as const;

  readonly startingWeapon = computed(() => this.charData.getStartingWeapon());

  readonly selectedWeaponType = computed(() => this.charData.getStartingWeaponType());

  readonly selectedWeaponLabel = computed(() => {
    const t = this.selectedWeaponType();
    return this.weaponOptions.find((o) => o.id === t)?.label ?? $localize`:Em dash@@cc.common.emDash:—`;
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

  async goNextToSave() {
    // Reset character-creation state before navigating away
    this.charData.reset();
    await this.router.navigate(['/characters']);
  }

  // Fallback: ensure reset when component is destroyed and user left the flow
  ngOnDestroy() {
    try {
      this.charData.reset();
    } catch (e) {
      // swallow - cleanup best-effort
    }
  }

  get portraitUrlString(): string {
    return this.portraitUrl();
  }

  get portraitVisible(): boolean {
    return !!this.portraitUrl();
  }

  get portraitUrlForImg(): string {
    return this.portraitUrl();
  }

  constructor() {
    void this.charData.loadInitialEquipment();
    void this.charData.loadInitialWeapon();
  }

  selectWeaponType = async (id: (typeof this.weaponOptions)[number]["id"]) => {
    this.charData.setStartingWeaponType(id);

    const baseWeapon = this.startingWeapon();
    if (!baseWeapon) {
      await this.charData.loadInitialWeapon();
    }

    const currentWeapon = this.charData.getStartingWeapon();
    if (!currentWeapon) return;

    this.charData.setStartingWeapon({
      ...currentWeapon,
      description: this.weaponOptions.find((o) => o.id === id)?.label ?? null
    });
  };
}
