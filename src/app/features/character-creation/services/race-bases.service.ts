import {Injectable} from '@angular/core';
import {CharacterRace} from '../models/character-creation.models';

// Local duplicate of PrimaryStatId to avoid circular imports
export type PrimaryStatId = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

@Injectable({providedIn: 'root'})
export class RaceBaseService {
  // Fallback base used when race is null or unknown
  private readonly fallbackBase = 20;

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
