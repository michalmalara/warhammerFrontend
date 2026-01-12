import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {Observable} from 'rxjs';

import {environment} from '../../../environments';

export interface CrudListParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Generyczny serwis CRUD dla endpointów REST.
 *
 * - automatycznie dokleja `environment.apiBaseUrl`
 * - wspiera list/detail/create/update/patch/delete
 * - params przyjmuje jako obiekt; wartości null/undefined są pomijane
 *
 * Interceptor caseConverterInterceptor zajmie się konwersją camelCase <-> snake_case.
 */
@Injectable({providedIn: 'root'})
export class CrudApiService {
  private readonly http = inject(HttpClient);

  private buildUrl(path: string): string {
    const base = environment.apiBaseUrl.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  private buildParams(params?: CrudListParams): HttpParams {
    let hp = new HttpParams();
    if (!params) return hp;

    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === undefined) continue;
      hp = hp.set(k, String(v));
    }

    return hp;
  }

  list<T>(path: string, params?: CrudListParams): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), {params: this.buildParams(params)});
  }

  detail<T>(path: string, id: number | string): Observable<T> {
    const normalized = path.endsWith('/') ? path : `${path}/`;
    return this.http.get<T>(this.buildUrl(`${normalized}${id}/`));
  }

  create<TResponse, TBody = unknown>(path: string, body: TBody): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(path), body);
  }

  update<TResponse, TBody = unknown>(path: string, id: number | string, body: TBody): Observable<TResponse> {
    const normalized = path.endsWith('/') ? path : `${path}/`;
    return this.http.put<TResponse>(this.buildUrl(`${normalized}${id}/`), body);
  }

  patch<TResponse, TBody = unknown>(path: string, id: number | string, body: TBody): Observable<TResponse> {
    const normalized = path.endsWith('/') ? path : `${path}/`;
    return this.http.patch<TResponse>(this.buildUrl(`${normalized}${id}/`), body);
  }

  delete(path: string, id: number | string): Observable<void> {
    const normalized = path.endsWith('/') ? path : `${path}/`;
    return this.http.delete<void>(this.buildUrl(`${normalized}${id}/`));
  }
}
