import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Switch {
  id: number;
  name: string;
  powerObjectId: number;
  lastState: number;
  currentState: number;
  stateChangedAt: string;
}
@Injectable({ providedIn: 'root' })
export class SwitchesApi {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<Switch[]>(`${this.api}/switches`);
  }
}
