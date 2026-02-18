import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Operation {
  id?: number;
  taskId: number;
  switchId: number;
  powerObjectId: number;
  targetState: 0 | 1;
  executionStatus: 'not_executed' | 'success' | 'fail';
  executionTime?: string;
  comment?: string;
  order: number
}

@Injectable({ providedIn: 'root' })
export class OperationsApi {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<Operation[]>(`${this.api}/operations`);
  }

  getByTask(taskId: number) {
    return this.http.get<Operation[]>(`${this.api}/operations?taskId=${taskId}`);
  }

  create(op: Operation) {
    return this.http.post<Operation>(`${this.api}/operations`, op);
  }

  update(op: Operation) {
    return this.http.put<Operation>(`${this.api}/operations/${op.id}`, op);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/operations/${id}`);
  }

}
