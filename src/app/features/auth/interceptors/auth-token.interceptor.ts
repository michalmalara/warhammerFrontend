import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, switchMap, throwError} from 'rxjs';
import {AuthApiService} from '../services/auth-api.service';
import {AuthSessionService} from '../services/auth-session.service';

const isAuthEndpoint = (url: string) => url.includes('/auth/token');

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(AuthSessionService);
  const api = inject(AuthApiService);

  const access = session.getAccessToken();
  const refresh = session.getRefreshToken();

  const authReq = access
    ? req.clone({setHeaders: {Authorization: `Bearer ${access}`}})
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (err.status !== 401 || !refresh || isAuthEndpoint(req.url)) {
        return throwError(() => err);
      }

      return api.refresh({refresh}).pipe(
        switchMap((res) => {
          session.setAccessToken(res.access);
          const retryReq = req.clone({setHeaders: {Authorization: `Bearer ${res.access}`}});
          return next(retryReq);
        }),
        catchError((refreshErr) => {
          session.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};

// Alias used by app config (helps some IDEs with unused export inspections)
export const AUTH_TOKEN_INTERCEPTOR = authTokenInterceptor;
