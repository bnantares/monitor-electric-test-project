import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SwitchesApi {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get(`${this.api}/switches`);
  }
}
