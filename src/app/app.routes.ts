import {Routes} from '@angular/router';
import {CharacterCardComponent} from './features/character/components/character-card/character-card.component';
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

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'character'},
  {path: 'character', component: CharacterCardComponent},

  {path: 'professions', component: ProfessionsListComponent},
  {path: 'professions/new', component: ProfessionCreateComponent},
  {path: 'professions/:id/edit', component: ProfessionEditComponent},
  {path: 'professions/:id', component: ProfessionDetailComponent},

  {path: 'skills', component: SkillsListComponent},
  {path: 'skills/new', component: SkillCreateComponent},

  {path: 'talents', component: TalentsListComponent},
  {path: 'talents/new', component: TalentCreateComponent},

  {path: '**', redirectTo: 'character'},
];
