import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
    id: number,
    name: string,
    type: string
}

@Injectable({ providedIn: 'root' })
export class UsersApi {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.api}/users/${id}`);
  }
}