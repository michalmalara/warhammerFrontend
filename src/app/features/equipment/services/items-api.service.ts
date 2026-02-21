import {inject, Injectable} from '@angular/core';

import {CrudApiService} from '../../../shared/services/crud-api.service';
import type {CreateItemPayload, Item} from '../models/item.models';

@Injectable({providedIn: 'root'})
export class ItemsApiService {
  private readonly crud = inject(CrudApiService);

  private static readonly PATH = '/equipment/items/';

  list() {
    return this.crud.list<Item[]>(ItemsApiService.PATH);
  }

  getById(id: number) {
    return this.crud.detail<Item>(ItemsApiService.PATH, id);
  }

  create(body: CreateItemPayload) {
    return this.crud.create<Item, CreateItemPayload>(ItemsApiService.PATH, body);
  }

  update(id: number, body: Partial<Item>) {
    return this.crud.update<Item, Partial<Item>>(ItemsApiService.PATH, id, body);
  }

  patch(id: number, body: Partial<Item>) {
    return this.crud.patch<Item, Partial<Item>>(ItemsApiService.PATH, id, body);
  }

  delete(id: number) {
    return this.crud.delete(ItemsApiService.PATH, id);
  }
}

