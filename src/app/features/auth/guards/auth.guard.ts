import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthSessionService} from '../services/auth-session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  if (session.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {returnUrl: state.url},
  });
};

export const AUTH_GUARD = authGuard;
