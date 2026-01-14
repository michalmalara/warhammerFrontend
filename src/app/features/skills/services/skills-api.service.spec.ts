import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {environment} from '../../../../environments';
import {SkillsApiService} from './skills-api.service';

describe('SkillsApiService', () => {
  let service: SkillsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SkillsApiService],
    });

    service = TestBed.inject(SkillsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists skills', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/professions/skills/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a skill', () => {
    service
      .create({name: 'Stealth', type: 'basic', associatedCharacteristic: 'AG'})
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/professions/skills/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({name: 'Stealth', type: 'basic', associatedCharacteristic: 'AG'});
    req.flush({id: 1, name: 'Stealth', type: 'basic', associatedCharacteristic: 'AG'});
  });
});

