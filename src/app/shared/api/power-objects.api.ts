import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


export interface PowerObject {
  id: number;
  name: string;
  type: string
}

@Injectable({ providedIn: 'root' })
export class PowerObjectsApi {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<PowerObject[]>(`${this.api}/powerObjectsWithSwitches`);
  }

  getById(id: number) {
    return this.http.get<PowerObject>(`${this.api}/powerObjectsWithSwitches/${id}`);
  }
}
