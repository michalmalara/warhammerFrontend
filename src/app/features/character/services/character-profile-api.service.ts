import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface CharacterProfileDto {
  id: number;
  name: string;
  last_name?: string | null;
  allow_draft?: boolean;
}

@Injectable({providedIn: 'root'})
export class CharacterProfileApiService {
  private readonly http = inject(HttpClient);

  /**
   * Default base URL for the backend API.
   * If the app already provides a better URL via an interceptor, you can keep this as-is.
   */
  private readonly baseUrl = '/api';

  getCharacterProfile = (id: number): Observable<CharacterProfileDto> =>
    this.http.get<CharacterProfileDto>(`${this.baseUrl}/character-sheet/characters/${id}/`);
}
