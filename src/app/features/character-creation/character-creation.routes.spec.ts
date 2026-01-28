import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {Location} from '@angular/common';

import {routes} from '../../app.routes';

describe('Character creation routing', () => {
  it('navigates /character/create to step-1', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);

    await router.navigateByUrl('/character/create');
    expect(location.path()).toBe('/character/create/step-1');
  });
});
