import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {environment} from '../../../../environments';
import {TalentsApiService} from './talents-api.service';

describe('TalentsApiService', () => {
  let service: TalentsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TalentsApiService],
    });

    service = TestBed.inject(TalentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists talents', () => {
    service.list().subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/professions/talents/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a talent', () => {
    service
      .create({
        name: 'Strike Mighty Blow',
        description: 'Deliver a powerful attack.',
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/professions/talents/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Strike Mighty Blow',
      description: 'Deliver a powerful attack.',
    });
    req.flush({id: 1, name: 'Strike Mighty Blow', description: 'Deliver a powerful attack.'});
  });
});

