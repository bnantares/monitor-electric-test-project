import { Component, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RequestsApi } from '../shared/api/requests.api';
import { Task, TasksApi } from '../shared/api/tasks.api';
import { UsersApi, User } from '../shared/api/users.api';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';
import { TaskStateService } from './task-state.service';
import { Location } from '@angular/common';
import { PowerObjectsApi, PowerObject } from '../shared/api/power-objects.api';

@Component({
    selector: 'app-task-editor',
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './task-editor.component.html'
})

export class TaskEditorComponent {
    private route = inject(ActivatedRoute);
    private tasksApi = inject(TasksApi);
    private requestsApi = inject(RequestsApi);
    private usersApi = inject(UsersApi);
    private taskState = inject(TaskStateService)
    private powerObjectsApi = inject(PowerObjectsApi)

    constructor(private location: Location) { }

    request = signal<any | null>(null);
    users = signal<User[]>([]);
    taskId = signal<number | null>(null);
    isEditMode = signal(false);
    powerObjects = signal<PowerObject[]>([]);

    isLocked = computed(() =>
        this.taskState.status() !== null
        && this.taskState.status() !== 'created'
    );

    lockEffect = effect(() => {
        if (this.isLocked()) {
            this.taskForm.disable();
        } else {
            this.taskForm.enable();
        }
    });

    taskForm = new FormGroup({
        requestId: new FormControl<number | null>(null),
        executorId: new FormControl<number | null>(null),
        scheduledStart: new FormControl(''),
        scheduledEnd: new FormControl(''),
        purpose: new FormControl(''),
        powerObjectIds: new FormControl<number[]>([]),
        status: new FormControl('created')
    });

    powerObjectNameMap = computed(() => {
        const map = new Map<number, string>();
        this.powerObjects().forEach(obj => {
            map.set(obj.id, obj.name);
        });
        return map;
    });

    powerObjectNames = computed(() => {
        const ids = this.taskForm.value.powerObjectIds ?? [];
        const map = this.powerObjectNameMap();

        return ids
            .map(id => map.get(id))
            .filter(Boolean)
            .join(', ');
    });

    ngOnInit() {
        const requestId = Number(this.route.snapshot.queryParamMap.get('requestId'));
        const taskId = Number(this.route.snapshot.paramMap.get('id'));

        // Загружаем список электромонтеров
        this.usersApi.getAll().subscribe(res => this.users.set(res.filter(u => u.type === 'electrician')));

        // Загружаем список энергообьектов
        this.powerObjectsApi.getAll().subscribe(objects => this.powerObjects.set(objects));

        // Режим создания
        if (requestId) {

            this.isEditMode.set(false);

            this.requestsApi.getById(requestId).subscribe(req => {
                this.request.set(req);
                this.taskState.setStatus(null);

                const scheduledStart = req.startAt
                    ? formatDate(req.startAt, "yyyy-MM-dd'T'HH:mm", 'en-US')
                    : '';
                const scheduledEnd = req.endAt
                    ? formatDate(req.endAt, "yyyy-MM-dd'T'HH:mm", 'en-US')
                    : '';

                this.taskForm.setValue({
                    requestId: req.id,
                    executorId: null,
                    scheduledStart,
                    scheduledEnd,
                    purpose: req.purpose,
                    powerObjectIds: req.powerObject ? [req.powerObject.id] : [],
                    status: 'created'
                });

            });

            return;
        }

        // Режим редактирования
        if (taskId) {
            this.isEditMode.set(true);
            this.taskId.set(taskId);

            this.tasksApi.getById(taskId).subscribe(task => {

                this.taskState.setStatus(task.status);
                this.taskForm.setValue({
                    requestId: task.requestId,
                    executorId: task.executorId,
                    scheduledStart: task.scheduledStart,
                    scheduledEnd: task.scheduledEnd,
                    purpose: task.purpose,
                    powerObjectIds: task.powerObjectIds,
                    status: task.status
                });

            });
        }
    }

    create() {
        const formValue = this.taskForm.value;

        if (!formValue.requestId || !formValue.scheduledStart || !formValue.scheduledEnd || !formValue.executorId) {
            alert('Не все обязательные поля заполнены!');
            return;
        }

        if (formValue.scheduledStart > formValue.scheduledEnd) {
            alert('Дата начала раньше даты окончания!');
            return;
        }

        const newTask: Task = {
            requestId: formValue.requestId,
            executorId: formValue.executorId ?? undefined,
            scheduledStart: formValue.scheduledStart,
            scheduledEnd: formValue.scheduledEnd,
            purpose: formValue.purpose ?? '',
            powerObjectIds: formValue.powerObjectIds ?? [],
            status: 'created',
            closedWithIssuesComment: null
        };

        if (this.isEditMode()) {
            this.tasksApi.update({
                ...newTask,
                id: this.taskId() ?? undefined
            }).subscribe(() => this.redirectBack())
        } else {
            this.tasksApi.create(newTask).subscribe({
                next: () => this.redirectBack(),
                error: () => alert('Ошибка создания')
            });
        }

    }

    redirectBack() {
        this.location.back();
    }

    selectPowerObject(id: number, checked: boolean) {
        const current = this.taskForm.value.powerObjectIds ?? [];
        if (checked) {
            this.taskForm.controls['powerObjectIds'].setValue([...current, id]);
        } else {
            this.taskForm.controls['powerObjectIds'].setValue(current.filter(x => x !== id));
        }
    }
}
