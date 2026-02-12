import { Injectable, signal } from '@angular/core';
import { Task } from '../shared/api/tasks.api';

@Injectable({ providedIn: 'root' })
export class TaskStateService {
    status = signal<Task['status'] | null>(null);

    setStatus(status: Task['status']) {
        this.status.set(status);
    }
}
