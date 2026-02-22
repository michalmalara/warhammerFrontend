import {inject, Injectable} from "@angular/core";

import {CrudApiService} from "../../../shared/services/crud-api.service";
import type {Weapon} from "../models/weapon.models";

@Injectable({providedIn: "root"})
export class InitialWeaponApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = "/equipment/initial-weapon/";

  getInitialWeapon = () => this.crud.list<Weapon>(InitialWeaponApiService.PATH);
}
