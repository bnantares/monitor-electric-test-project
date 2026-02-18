import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TasksApi, TaskStatus } from '../shared/api/tasks.api';
import { TaskOperationsComponent } from '../operations/task-operations.component';
import { RouterModule } from '@angular/router';
import { User, UsersApi } from '../shared/api/users.api';
import { TaskStateService } from './task-state.service';
import { PowerObject, PowerObjectsApi } from '../shared/api/power-objects.api';

@Component({
    selector: 'app-tasks-detail',
    standalone: true,
    imports: [
        DatePipe,
        TaskOperationsComponent,
        RouterModule,
        FormsModule
    ],
    templateUrl: './task-detail.component.html',
})

export class TaskDetailComponent {

    private route = inject(ActivatedRoute);
    private api = inject(TasksApi);
    private usersApi = inject(UsersApi);
    private taskState = inject(TaskStateService);
    private powerObjectsApi = inject(PowerObjectsApi);

    readonly statusMeta = {
        created: { label: 'Создано', color: 'text-gray-600' },
        allowed: { label: 'В исполнении', color: 'text-blue-600' },
        closed_success: { label: 'Завершено успешно', color: 'text-green-600' },
        closed_with_issues: { label: 'Завершено с замечаниями', color: 'text-red-600' }
    } as const;

    readonly operationsCmp = viewChild(TaskOperationsComponent);
    readonly operationsReady = computed(() => {
        return this.operationsCmp()?.allOperationsFinished() ?? false;
    });

    task = signal<any | null>(null);
    powerObjects = signal<PowerObject[]>([]);
    isCloseWithIssuesModalOpen = signal(false);
    draftCloseComment = signal('');

    powerObjectNameMap = computed(() => {
        const map = new Map<number, string>();
        this.powerObjects().forEach(obj => {
            map.set(obj.id, obj.name);
        });
        console.log(map)
        return map;
    });

    powerObjectNames = computed((): string => {
        const task = this.task();
        const powerObjects = this.powerObjects();

        if (!task || !powerObjects.length) return '';

        const map = new Map<number, string>();
        powerObjects.forEach((obj: PowerObject) => map.set(obj.id, obj.name));

        return (task.powerObjectIds ?? [])
            .map((id: number) => map.get(id) ?? `ID:${id}`)
            .join(', ');
    });

    getStatusInfo(status: TaskStatus) {
        return status ? this.statusMeta[status as Exclude<TaskStatus, null>] : { label: 'Не задано', color: 'text-gray-400' };
    }

    executor = signal<User | null>(null);

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        this.powerObjectsApi.getAll().subscribe(objects => this.powerObjects.set(objects));

        this.api.getById(id).subscribe(res => {
            this.task.set(res);
            this.taskState.setStatus(res.status)

            if (res.executorId) {
                this.usersApi.getById(res.executorId).subscribe(user => {
                    this.executor.set(user);
                });
            }
        });
    }

    setStatus(status: Task['status']) {
        const current = this.task();
        if (!current) return;

        const updated: Task = {
            ...current,
            status
        };

        this.api.update(updated).subscribe(res => {
            this.task.set(res);
            this.taskState.setStatus(res.status);
        });
    }

    // Закрытие с модалкой

    openCloseWithIssuesModal() {
        this.draftCloseComment.set('');
        this.isCloseWithIssuesModalOpen.set(true);
    }

    closeCloseWithIssuesModal() {
        this.isCloseWithIssuesModalOpen.set(false);
    }

    confirmCloseWithIssues() {
        const updatedTask = {
            ...this.task(),
            status: 'closed_with_issues',
            closedWithIssuesComment: this.draftCloseComment()
        };

        this.api.update(updatedTask).subscribe(task => {
            this.task.set(task);
            this.taskState.setStatus(task.status);
            this.closeCloseWithIssuesModal();
        });
    }
}
