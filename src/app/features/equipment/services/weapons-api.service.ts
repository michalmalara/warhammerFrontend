import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {CreateWeaponPayload, Weapon} from '../models/weapon.models';

@Injectable({providedIn: 'root'})
export class WeaponsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/equipment/weapons/';

  list() {
    return this.crud.list<Weapon[]>(WeaponsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Weapon>(WeaponsApiService.PATH, id);
  }

  create(body: CreateWeaponPayload) {
    return this.crud.create<Weapon, CreateWeaponPayload>(WeaponsApiService.PATH, body);
  }

  update(id: number, body: Partial<Weapon>) {
    return this.crud.update<Weapon, Partial<Weapon>>(WeaponsApiService.PATH, id, body);
  }

  patch(id: number, body: Partial<Weapon>) {
    return this.crud.patch<Weapon, Partial<Weapon>>(WeaponsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(WeaponsApiService.PATH, id);
  }
}
