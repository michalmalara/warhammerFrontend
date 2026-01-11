import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CharacterSkill} from './skills.types';

@Component({
  selector: 'skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  @Input({required: true}) skills: CharacterSkill[] = [];

  /**
   * Blokuje możliwość klikania kontrolek (TAKEN / +10% / +20%).
   * Domyślnie true – zgodnie z prośbą.
   */
  @Input() disabled = true;

  /** Emisja zmian (na przyszłość pod zapis do backendu). */
  @Output() skillsChange = new EventEmitter<CharacterSkill[]>();

  trackById = (_: number, s: CharacterSkill) => s.id;

  displayPercent(s: CharacterSkill): number {
    const bonus = (s.advPlus10 ? 10 : 0) + (s.advPlus20 ? 20 : 0);
    return s.basePercent + bonus;
  }

  toggleTaken(skill: CharacterSkill, nextValue: boolean): void {
    if (this.disabled) return;
    skill.taken = nextValue;
    this.skillsChange.emit(this.skills);
  }

  toggleBonus(skill: CharacterSkill, value: 10 | 20): void {
    if (this.disabled) return;
    if (value === 10) {
      skill.advPlus10 = !skill.advPlus10;
    } else {
      skill.advPlus20 = !skill.advPlus20;
    }
    this.skillsChange.emit(this.skills);
  }
}
