import {Injectable} from '@angular/core';

export type DiceMapping = { map: number[] };

@Injectable({providedIn: 'root'})
export class DiceService {
  // Seedable RNG factory (LCG). If seed omitted, uses Math.random
  rngFactory(seed?: number): () => number {
    if (typeof seed === 'number') {
      let state = seed >>> 0;
      return () => {
        // LCG parameters
        state = (1664525 * state + 1013904223) >>> 0;
        return state / 0x100000000; // [0,1)
      };
    }
    return () => Math.random();
  }

  // Unified dice API: roll a single d10 (1..10). Accepts optional rng for determinism.
  roll1d10(rng?: () => number): number {
    const usedRng = rng ?? (() => Math.random());
    return Math.floor(usedRng() * 10) + 1; // 1..10
  }

  roll2d10(rng?: () => number): { total: number; rolls: [number, number] } {
    const raw1 = this.roll1d10(rng);
    const raw2 = this.roll1d10(rng);
    return {total: raw1 + raw2, rolls: [raw1, raw2]};
  }

  // Map single raw d10 using provided mapping structure. Delegates roll to roll1d10.
  mapRawToMapped(mapping: DiceMapping | undefined, rng?: () => number): number {
    const raw = this.roll1d10(rng); // 1..10

    const idx = Math.max(0, Math.min(9, raw - 1));

    // Require an explicit mapping of at least length 10; remove previous fallbacks.
    if (!mapping || !Array.isArray(mapping.map) || mapping.map.length < 10) {
      throw new Error('mapRawToMapped requires a mapping.map array with at least 10 elements');
    }

    return mapping.map[idx];
  }
}
