import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {environment} from '../../../../environments';
import {CharactersApiService} from './characters-api.service';
import {caseConverterInterceptor} from '../../../shared/http/case-converter.interceptor';

describe('CharactersApiService', () => {
  let service: CharactersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CharactersApiService,
        provideHttpClient(withInterceptors([caseConverterInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CharactersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a character', () => {
    service
      .create({
        name: 'Klaus von Reuter',
        race: 'human',
        currentProfession: 1,
        characterProfile: 1,
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/character-sheet/characters/`);
    expect(req.request.method).toBe('POST');
    req.flush({id: 123});
  });

  it('patches a character', () => {
    service.patch(123, {goldCrowns: 11}).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/character-sheet/characters/123/`);
    expect(req.request.method).toBe('PATCH');
    req.flush({id: 123, goldCrowns: 11});
  });

  it('list returns mapped character objects', () => {
    service.list().subscribe((characters) => {
      expect(characters.length).toBe(1);
      expect(characters[0].id).toBe(1);
      expect(characters[0].name).toBe('A');
      expect(characters[0].currentProfessionName).toBe('Warrior');
    });

    httpMock
      .expectOne(`${environment.apiBaseUrl}/character-sheet/characters/`)
      .flush([{id: 1, name: 'A', current_profession_name: 'Warrior'}]);
  });
});
