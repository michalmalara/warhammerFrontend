import {Routes} from '@angular/router';
import {CharacterCardComponent} from './features/character/components/character-card/character-card.component';
import {ProfessionsListComponent} from './features/professions/components/professions-list/professions-list.component';
import {
  ProfessionCreateComponent
} from './features/professions/components/profession-create/profession-create.component';
import {
  ProfessionDetailComponent
} from './features/professions/components/profession-detail/profession-detail.component';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'character'},
  {path: 'character', component: CharacterCardComponent},

  {path: 'professions', component: ProfessionsListComponent},
  {path: 'professions/new', component: ProfessionCreateComponent},
  {path: 'professions/:id', component: ProfessionDetailComponent},

  {path: '**', redirectTo: 'character'}
];
