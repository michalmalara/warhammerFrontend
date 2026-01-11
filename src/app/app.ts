import {Component, signal} from '@angular/core';
import {CharacterCardComponent} from './character-card/character-card.component';

@Component({
  selector: 'app-root',
  imports: [CharacterCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
