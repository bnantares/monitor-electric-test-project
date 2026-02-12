import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Request {
  id: number;
  name: string;
  startAt: string;
  endAt: string;
  purpose: string;
  powerObject?: { id: number; name: string };
}

@Injectable({ providedIn: 'root' })
export class RequestsApi {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<Request[]>(`${this.api}/requestsWithPowerObject`);
  }

  getById(id: number) {
    return this.http.get<Request>(`${this.api}/requests/${id}?_expand=powerObject`);
  }

}
