import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../../environments';
import {CharactersApiService} from './characters-api.service';

describe('CharactersApiService', () => {
  let service: CharactersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CharactersApiService],
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
        currantProfession: 1,
        characterProfile: 1,
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/characters/`);
    expect(req.request.method).toBe('POST');
    req.flush({id: 123});
  });

  it('patches a character', () => {
    service.patch(123, {goldCrowns: 11}).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/characters/123/`);
    expect(req.request.method).toBe('PATCH');
    req.flush({id: 123, goldCrowns: 11});
  });
});
