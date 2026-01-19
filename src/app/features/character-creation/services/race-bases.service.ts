import {Injectable} from '@angular/core';
import {CharacterRace} from '../models/character-creation.models';
import type {DiceMapping} from '../../../shared/services/dice.service';

// Local duplicate of PrimaryStatId to avoid circular imports
export type PrimaryStatId = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

@Injectable({providedIn: 'root'})
export class RaceBaseService {
  // Fallback base used when race is null or unknown
  private readonly fallbackBase = 20;

  /**
   * Return a dice mapping used to map a raw d10 (1..10) to a wound (W) value
   * depending on race. The returned mapping must be an array of length 10.
   */
  getWMapping(race: CharacterRace | null): DiceMapping {
    switch (race) {
      case 'human':
        return {map: [10, 10, 10, 11, 11, 11, 12, 12, 12, 13]};
      case 'dwarf':
        // Dwarves are tougher: shift distribution upwards
        return {map: [11, 11, 11, 12, 12, 12, 13, 13, 13, 14]};
      case 'elf':
        // Elves are slightly more fragile in this mapping
        return {map: [9, 9, 9, 10, 10, 10, 11, 11, 11, 12]};
      case 'halfling':
        // Halflings are small; lower W on average
        return {map: [9, 9, 9, 10, 10, 10, 11, 11, 11, 11]};
      default:
        return {map: [10, 10, 10, 11, 11, 11, 12, 12, 12, 13]};
    }
  }

  /**
   * Return a dice mapping used to map a raw d10 (1..10) to an FP adjustment
   * or lookup value depending on race. These are example values and can be
   * tuned later; mapping length must be 10.
   */
  getFPMapping(race: CharacterRace | null): DiceMapping {
    switch (race) {
      case 'human':
        return {map: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4]};
      case 'dwarf':
        return {map: [1, 1, 2, 2, 2, 3, 3, 3, 4, 4]};
      case 'elf':
        return {map: [1, 1, 1, 1, 2, 2, 2, 3, 3, 3]};
      case 'halfling':
        return {map: [1, 1, 1, 2, 2, 2, 2, 3, 3, 3]};
      default:
        return {map: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4]};
    }
  }

  /**
   * Return per-stat base values for a given race.
   * These are example baseline values and can be tuned later.
   */
  getPrimaryBases(race: CharacterRace | null): Record<PrimaryStatId, number> {
    switch (race) {
      case 'human':
        return {
          WS: 20,
          BS: 20,
          S: 20,
          T: 20,
          Ag: 20,
          Int: 20,
          WP: 20,
          Fel: 20,
        };
      case 'dwarf':
        return {
          WS: 30,
          BS: 10,
          S: 20,
          T: 30,
          Ag: 10,
          Int: 20,
          WP: 30,
          Fel: 10,
        };
      case 'elf':
        return {
          WS: 20,
          BS: 30,
          S: 20,
          T: 10,
          Ag: 30,
          Int: 20,
          WP: 20,
          Fel: 20,
        };
      case 'halfling':
        return {
          WS: 10,
          BS: 30,
          S: 10,
          T: 10,
          Ag: 30,
          Int: 20,
          WP: 30,
          Fel: 30,
        };
      default:
        // All stats fallback to the same base
        return {
          WS: this.fallbackBase,
          BS: this.fallbackBase,
          S: this.fallbackBase,
          T: this.fallbackBase,
          Ag: this.fallbackBase,
          Int: this.fallbackBase,
          WP: this.fallbackBase,
          Fel: this.fallbackBase,
        };
    }
  }
}
