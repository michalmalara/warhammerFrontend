import {Injectable, signal} from '@angular/core';

import {type CharacterCreationStep1, DEFAULT_STEP_1} from '../models/character-creation.models';

@Injectable({providedIn: 'root'})
export class CharacterCreationStateService {
  private readonly _step1 = signal<CharacterCreationStep1>(DEFAULT_STEP_1);

  readonly step1 = this._step1.asReadonly();

  patchBio(patch: Partial<CharacterCreationStep1['bio']>) {
    this._step1.update((s) => ({...s, bio: {...s.bio, ...patch}}));
  }

  reset() {
    this._step1.set(DEFAULT_STEP_1);
  }
}
