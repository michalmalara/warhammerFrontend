import {Injectable, signal} from '@angular/core';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

@Injectable({providedIn: 'root'})
export class AuthSessionService {
  private readonly _isLoggedIn = signal<boolean>(this.hasAccessToken());

  isLoggedIn = this._isLoggedIn.asReadonly();

  getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

  getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

  setTokenPair = (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    this._isLoggedIn.set(true);
  };

  setAccessToken = (access: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    this._isLoggedIn.set(true);
  };

  logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._isLoggedIn.set(false);
  };

  private hasAccessToken(): boolean {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  }
}
