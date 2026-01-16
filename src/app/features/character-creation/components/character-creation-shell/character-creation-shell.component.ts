import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-character-creation-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './character-creation-shell.component.html',
  styleUrls: ['./character-creation-shell.component.scss'],
})
export class CharacterCreationShellComponent {
}
