import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {Location} from '@angular/common';

import {routes} from '../../app.routes';
import {AuthSessionService} from '../auth/services/auth-session.service';

describe('Character creation routing', () => {
  it('navigates /character/create to step-1', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: AuthSessionService,
          useValue: {
            isLoggedIn: () => true,
          },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    // Ensure router performs initial navigation + redirects.
    router.initialNavigation();

    await router.navigateByUrl('/character/create');
    await router.navigateByUrl('/character/create/step-1');

    expect(location.path()).toBe('/character/create/step-1');
  });
});
