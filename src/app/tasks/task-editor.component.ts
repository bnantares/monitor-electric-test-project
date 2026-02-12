import { Component, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RequestsApi } from '../shared/api/requests.api';
import { Task, TasksApi } from '../shared/api/tasks.api';
import { UsersApi, User } from '../shared/api/users.api';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { TaskStateService } from './task-state.service';

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

    // private _lockEffect = effect(() => {
    //     this.updateLockedFields();
    // });

    // private lockedFieldNames: (keyof typeof this.taskForm['controls'])[] = [
    //     'scheduledStart',
    //     'scheduledEnd',
    //     'executorId',
    // ];

    request = signal<any | null>(null);
    users = signal<User[]>([]);
    taskId = signal<number | null>(null);
    isEditMode = signal(false);
    isLocked = computed(() =>
        this.taskForm.controls['status'].value !== 'created'
    );

    taskForm = new FormGroup({
        requestId: new FormControl<number | null>(null),
        executorId: new FormControl<number | null>(null),
        scheduledStart: new FormControl(''),
        scheduledEnd: new FormControl(''),
        purpose: new FormControl(''),
        powerObjectIds: new FormControl<number[]>([]),
        status: new FormControl('created')
    });

    ngOnInit() {
        const requestId = Number(this.route.snapshot.queryParamMap.get('requestId'));
        const taskId = Number(this.route.snapshot.paramMap.get('id'));

        // Загружаем список электромонтеров
        this.usersApi.getAll().subscribe(res => this.users.set(res.filter(u => u.type === 'electrician')));

        // 🔵 режим создания
        if (requestId) {

            this.isEditMode.set(false);

            this.requestsApi.getById(requestId).subscribe(req => {
                this.request.set(req);

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

        // 🟢 режим редактирования
        if (taskId) {

            this.isEditMode.set(true);
            this.taskId.set(taskId);

            this.tasksApi.getById(taskId).subscribe(task => {

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

            // this.updateLockedFields();

            // this.taskForm.controls['status'].valueChanges.subscribe(() => {
            //     this.updateLockedFields();
            // });
        }
    }

    // updateLockedFields() {
    //     const locked = this.isLocked();

    //     this.lockedFieldNames.forEach(name => {
    //         const control = this.taskForm.controls[name];
    //         if (locked && !control.disabled) {
    //             control.disable({ emitEvent: false });
    //         } else if (!locked && control.disabled) {
    //             control.enable({ emitEvent: false });
    //         }
    //     });
    // }

    create() {
        const formValue = this.taskForm.value;

        if (!formValue.requestId || !formValue.scheduledStart || !formValue.scheduledEnd || !formValue.executorId) {
            alert('Не все обязательные поля заполнены!');
            return;
        }

        const newTask: Task = {
            requestId: formValue.requestId,
            executorId: formValue.executorId ?? undefined,
            scheduledStart: formValue.scheduledStart,
            scheduledEnd: formValue.scheduledEnd,
            purpose: formValue.purpose ?? '',
            powerObjectIds: formValue.powerObjectIds ?? [],
            status: formValue.status as Task['status']
        };

        if (this.isEditMode()) {
            this.tasksApi.update({
                ...newTask,
                id: this.taskId() ?? undefined
            }).subscribe(() => alert('Задача обновлена'))
        } else {
            this.tasksApi.create(newTask).subscribe({
                next: (task) => alert(`Задача создана ID ${task.id}`),
                error: () => alert('Ошибка создания')
            });
        }

        // this.tasksApi.create(newTask).subscribe({
        //     next: (task) => alert(`Задача создана ID ${task.id}`),
        //     error: () => alert('Ошибка создания')
        // });
    }
}
