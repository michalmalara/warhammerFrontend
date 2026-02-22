import {inject, Injectable} from "@angular/core";

import {CrudApiService} from "../../../shared/services/crud-api.service";
import type {Item} from "../models/item.models";

@Injectable({providedIn: "root"})
export class InitialEquipmentApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = "/equipment/initial-equipment/";

  getInitialEquipment = () => this.crud.list<Item[]>(InitialEquipmentApiService.PATH);
}

