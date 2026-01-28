import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments';
import {
  TokenObtainPairRequest,
  TokenPairResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from '../models/auth.models';

@Injectable({providedIn: 'root'})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  login = (payload: TokenObtainPairRequest) =>
    this.http.post<TokenPairResponse>(`${this.baseUrl}/auth/token/`, payload);

  refresh = (payload: TokenRefreshRequest) =>
    this.http.post<TokenRefreshResponse>(`${this.baseUrl}/auth/token/refresh/`, payload);
}
