import {inject, Injectable} from '@angular/core';
import {CanDeactivateFn, RouterStateSnapshot} from '@angular/router';
import {CharacterDataService} from '../services/character-data.service';
import {CharacterSaveService} from '../services/character-save.service';

/**
 * CanDeactivate guard used to perform cleanup when leaving the character-creation flow.
 * It's implemented as a function provider (CanDeactivateFn) for simplicity and tree-shakability.
 */
@Injectable({providedIn: 'root'})
export class CharacterCreationExitGuard {
  private readonly charData = inject(CharacterDataService);
  private readonly characterSave = inject(CharacterSaveService);

  canDeactivate(): boolean {
    try {
      this.charData.reset();
    } catch (e) {
      // best-effort
      // eslint-disable-next-line no-console
      console.warn('[CharacterCreationExitGuard] failed to reset CharacterDataService', e);
    }

    try {
      this.characterSave.reset();
    } catch (e) {
      // best-effort
      // eslint-disable-next-line no-console
      console.warn('[CharacterCreationExitGuard] failed to reset CharacterSaveService', e);
    }

    return true;
  }
}

// Also export a functional CanDeactivate guard for route config convenience
export const characterCreationExitGuard: CanDeactivateFn<unknown> = (_component, _currentRoute, _currentState, nextState: RouterStateSnapshot | null) => {
  const charData = inject(CharacterDataService);
  const characterSave = inject(CharacterSaveService);

  // If nextState is null or the next url still is under /character-create, skip reset.
  try {
    const nextUrl = nextState ? nextState.url : '';
    if (!nextUrl || !nextUrl.startsWith('/character-create')) {
      charData.reset();
      try {
        characterSave.reset();
      } catch (e) { /* best-effort */
      }
    }
  } catch (e) {
    // swallow
  }
  return true;
};
