import {TestBed} from '@angular/core/testing';
import {firstValueFrom, of, throwError} from 'rxjs';

import {NameService} from './name.service';
import {CrudApiService} from '../shared/services/crud-api.service';

describe('NameService', () => {
  let service: NameService;
  let crudStub: Partial<CrudApiService>;

  beforeEach(() => {
    crudStub = {
      list: (path: string, params?: any) => of({
        first_name: 'Jan',
        last_name: 'Kowalski',
        race: params?.race,
        gender: params?.gender
      }) as any,
    };

    TestBed.configureTestingModule({
      providers: [
        NameService,
        {provide: CrudApiService, useValue: crudStub},
      ],
    });

    service = TestBed.inject(NameService);
  });

  it('powinien zwracać imię z endpointu', async () => {
    const value = await firstValueFrom(service.getRandomName('Human', 'male'));
    expect(value.firstName).toBe('Jan');
    expect(value.lastName).toBe('Kowalski');
    expect(value.race).toBe('Human');
    expect(value.gender).toBe('male');
  });

  it('powinien zwracać fallback przy błędzie', async () => {
    (crudStub as any).list = () => throwError(() => new Error('boom'));
    const value = await firstValueFrom(service.getRandomName('Orc', 'female', 'Fallback'));
    expect(value.firstName).toBe('Fallback');
    expect(value.lastName).toBe('');
    expect(value.race).toBe('Orc');
    expect(value.gender).toBe('female');
  });
});
