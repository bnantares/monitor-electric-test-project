import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Task, TasksApi } from '../shared/api/tasks.api';
import { TaskOperationsComponent } from '../operations/task-operations.component';
import { RouterModule } from '@angular/router';
import { User, UsersApi } from '../shared/api/users.api';
import { TaskStateService } from './task-state.service';

@Component({
    selector: 'app-tasks-detail',
    standalone: true,
    imports: [
        DatePipe,
        TaskOperationsComponent,
        RouterModule
    ],
    templateUrl: './task-detail.component.html',
})

export class TaskDetailComponent {

    private route = inject(ActivatedRoute);
    private api = inject(TasksApi);
    private usersApi = inject(UsersApi);
    private taskState = inject(TaskStateService)

    task = signal<any | null>(null);
    executor = signal<User | null>(null);

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        this.api.getById(id).subscribe(res => {
            this.task.set(res);

            if (res.executorId) {
                this.usersApi.getById(res.executorId).subscribe(user => {
                    this.executor.set(user);
                });
            }
        });
    }

    setStatus(status: Task['status']) {
        const updated = {
            ...this.task(),
            status
        };

        this.api.update(updated).subscribe(res => {
            this.task.set(res);
        });
        // this.api.update({ ...this.task(), status }).subscribe(res => {
        //     this.task.set(res);
        //     this.taskState.setStatus(res.status); 
        // });
    }

}
