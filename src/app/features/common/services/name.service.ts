import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CrudApiService} from '../../../shared/services/crud-api.service';


export interface RandomNameResponse {
  firstName: string;
  lastName: string;
  race: string;
  gender?: string | null;
}

/**
 * Serwis pobierający losowe imię postaci z backendu.
 * Zwraca Observable z obiektem RandomNameResponse lub fallbackowym obiektem przy błędzie.
 */
@Injectable({providedIn: 'root'})
export class NameService {
  constructor(private readonly crud: CrudApiService) {
  }

  // Wywołuje backendowy RandomNameAPIView
  getRandomName(race: string, gender: string, fallbackFirst?: string): Observable<RandomNameResponse> {
    const path = 'character-sheet/random-name/';
    const params = {race, gender};
    return this.crud.list<RandomNameResponse>(path, params).pipe(
      catchError(() => of({
        firstName: fallbackFirst ?? 'Unknown',
        lastName: '',
        race,
        gender,
      })),
    );
  }
}
