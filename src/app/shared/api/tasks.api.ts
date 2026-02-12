import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Task {
  id?: number;
  requestId: number;
  executorId: number | null;
  scheduledStart: string;
  scheduledEnd: string;
  powerObjectIds: number[];
  purpose: string;
  status: 'created' | 'allowed' | 'closed_success' | 'closed_with_issues';
}

@Injectable({ providedIn: 'root' })
export class TasksApi {

  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<Task[]>(`${this.api}/tasks`);
  }

  getById(id: number) {
    return this.http.get<Task>(`${this.api}/tasks/${id}`);
  }

  create(task: Task) {
    return this.http.post<Task>(`${this.api}/tasks`, task);
  }

  update(task: Task) {
    return this.http.put<Task>(`${this.api}/tasks/${task.id}`, task);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/tasks/${id}`);
  }
}
