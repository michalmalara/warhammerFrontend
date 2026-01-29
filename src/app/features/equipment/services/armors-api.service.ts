import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {Armor, CreateArmorPayload} from '../models/armor.models';

@Injectable({providedIn: 'root'})
export class ArmorsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/equipment/armors/';

  list() {
    return this.crud.list<Armor[]>(ArmorsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Armor>(ArmorsApiService.PATH, id);
  }

  create(body: CreateArmorPayload) {
    return this.crud.create<Armor, CreateArmorPayload>(ArmorsApiService.PATH, body);
  }

  update(id: number, body: Partial<Armor>) {
    return this.crud.update<Armor, Partial<Armor>>(ArmorsApiService.PATH, id, body);
  }

  patch(id: number, body: Partial<Armor>) {
    return this.crud.patch<Armor, Partial<Armor>>(ArmorsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(ArmorsApiService.PATH, id);
  }
}
