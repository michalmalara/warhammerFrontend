import {APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

import {routes} from './app.routes';
import {caseConverterInterceptor} from './shared/http/case-converter.interceptor';
import {AUTH_TOKEN_INTERCEPTOR} from './features/auth/interceptors/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([caseConverterInterceptor, AUTH_TOKEN_INTERCEPTOR])),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => () => {
        iconRegistry.addSvgIcon('d10', sanitizer.bypassSecurityTrustResourceUrl('/icons/d10-svgrepo-com.svg'));
      },
      deps: [MatIconRegistry, DomSanitizer],
    },
  ],
};
