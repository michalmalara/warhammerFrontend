import {Routes} from '@angular/router';
import {CharacterCardComponent} from './features/character/components/character-card/character-card.component';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'character'},
  {path: 'character', component: CharacterCardComponent},
  {path: '**', redirectTo: 'character'}
];
