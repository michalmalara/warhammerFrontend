import {inject, Injectable} from '@angular/core';
import {map, tap} from 'rxjs';
import {AuthApiService} from './auth-api.service';
import {AuthSessionService} from './auth-session.service';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);

  isLoggedIn = this.session.isLoggedIn;

  login = (username: string, password: string) =>
    this.api.login({username, password}).pipe(
      tap((res) => this.session.setTokenPair(res.access, res.refresh)),
      map(() => void 0),
    );

  logout = () => {
    this.session.logout();
  };
}
