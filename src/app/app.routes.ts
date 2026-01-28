import {Routes} from '@angular/router';
import {CharacterCardComponent} from './features/character/components/character-card/character-card.component';
import {CharactersListComponent} from './features/character/components/characters-list/characters-list.component';
import {ProfessionsListComponent} from './features/professions/components/professions-list/professions-list.component';
import {
  ProfessionCreateComponent
} from './features/professions/components/profession-create/profession-create.component';
import {
  ProfessionDetailComponent
} from './features/professions/components/profession-detail/profession-detail.component';
import {ProfessionEditComponent} from './features/professions/components/profession-edit/profession-edit.component';
import {SkillCreateComponent} from './features/skills/components/skill-create/skill-create.component';
import {SkillsListComponent} from './features/skills/components/skills-list/skills-list.component';
import {TalentCreateComponent} from './features/talents/components/talent-create/talent-create.component';
import {TalentsListComponent} from './features/talents/components/talents-list/talents-list.component';

import {
  CharacterCreationShellComponent
} from './features/character-creation/components/character-creation-shell/character-creation-shell.component';
import {
  CharacterCreationStep1BioRaceComponent
} from './features/character-creation/components/character-creation-step-1-bio-race/character-creation-step-1-bio-race.component';
import {
  CharacterCreationStep2AttributesComponent
} from './features/character-creation/components/character-creation-step-2-attributes/character-creation-step-2-attributes.component';
import {
  CharacterCreationStep3CareerComponent
} from './features/character-creation/components/character-creation-step-3-career/character-creation-step-3-career.component';
import {
  CharacterCreationStep4SkillsTalentsComponent
} from './features/character-creation/components/character-creation-step-4-skills-talents/character-creation-step-4-skills-talents.component';
import {
  CharacterCreationStep5FinalReviewWealthComponent
} from './features/character-creation/components/character-creation-step-5-final-review-wealth/character-creation-step-5-final-review-wealth.component';
import {LoginComponent} from './features/auth/components/login/login.component';
import {AUTH_GUARD} from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'characters'},
  {path: 'login', component: LoginComponent},
  {path: 'characters', component: CharactersListComponent, canActivate: [AUTH_GUARD]},

  // Backward-compatible route: if someone hits /character without id, go back to list.
  {path: 'character', pathMatch: 'full', redirectTo: 'characters'},
  {path: 'character/:id', component: CharacterCardComponent, canActivate: [AUTH_GUARD]},

  {
    path: 'character-create',
    component: CharacterCreationShellComponent,
    canActivate: [AUTH_GUARD],
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'step-1'},
      {path: 'step-1', component: CharacterCreationStep1BioRaceComponent},
      {
        path: 'step-2',
        component: CharacterCreationStep2AttributesComponent,
      },
      {
        path: 'step-3',
        component: CharacterCreationStep3CareerComponent,
        data: {stepLabel: 'Step 3: Career'},
      },
      {
        path: 'step-4',
        component: CharacterCreationStep4SkillsTalentsComponent,
        data: {stepLabel: 'Step 4: Skills & Talents'},
      },
      {
        path: 'step-5',
        component: CharacterCreationStep5FinalReviewWealthComponent,
        data: {stepLabel: 'Step 5: Review'},
      },
    ],
  },

  {path: 'professions', component: ProfessionsListComponent},
  {path: 'professions/new', component: ProfessionCreateComponent},
  {path: 'professions/:id/edit', component: ProfessionEditComponent},
  {path: 'professions/:id', component: ProfessionDetailComponent},

  {path: 'skills', component: SkillsListComponent},
  {path: 'skills/new', component: SkillCreateComponent},

  {path: 'talents', component: TalentsListComponent},
  {path: 'talents/new', component: TalentCreateComponent},

  {path: '**', redirectTo: 'characters'},
];
