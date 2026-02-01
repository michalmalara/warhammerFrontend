import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {ProfessionArmor, ProfessionWeapon} from '../models/profession.models';

export type CreateProfessionWeaponPayload = {
  weapon: number;
};

export type CreateProfessionArmorPayload = {
  armor: number;
};

@Injectable({providedIn: 'root'})
export class ProfessionEquipmentLinksApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PROFESSION_WEAPONS_PATH = '/professions/professions-weapon/';
  private static readonly PROFESSION_ARMORS_PATH = '/professions/professions-armor/';

  createProfessionWeapon(body: CreateProfessionWeaponPayload) {
    return this.crud.create<ProfessionWeapon, CreateProfessionWeaponPayload>(
      ProfessionEquipmentLinksApiService.PROFESSION_WEAPONS_PATH,
      body
    );
  }

  deleteProfessionWeapon(id: number) {
    return this.crud.delete(ProfessionEquipmentLinksApiService.PROFESSION_WEAPONS_PATH, id);
  }

  createProfessionArmor(body: CreateProfessionArmorPayload) {
    return this.crud.create<ProfessionArmor, CreateProfessionArmorPayload>(
      ProfessionEquipmentLinksApiService.PROFESSION_ARMORS_PATH,
      body
    );
  }

  deleteProfessionArmor(id: number) {
    return this.crud.delete(ProfessionEquipmentLinksApiService.PROFESSION_ARMORS_PATH, id);
  }
}
