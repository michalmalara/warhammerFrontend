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
   * Backend base URL.
   * API routes are mounted in Django under `/character-sheet/`.
   */
  private readonly baseUrl = '';

  getCharacterProfile = (id: number): Observable<CharacterProfileDto> =>
    this.http.get<CharacterProfileDto>(`${this.baseUrl}/character-sheet/characters/${id}/profile/`);
}
