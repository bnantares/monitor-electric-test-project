import { Component, Input, computed, inject, signal } from '@angular/core';
import { OperationsApi, Operation } from '../shared/api/operations.api';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PowerObject, PowerObjectsApi } from '../shared/api/power-objects.api';
import { Switch, SwitchesApi } from '../shared/api/swithces.api';
import { TaskStatus } from '../shared/api/tasks.api';
import { TaskStateService } from '../tasks/task-state.service';

@Component({
  selector: 'app-task-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './task-operations.component.html'
})

export class TaskOperationsComponent {
  private api = inject(OperationsApi);
  private powerObjectsApi = inject(PowerObjectsApi);
  private switchesApi = inject(SwitchesApi);
  private taskState = inject(TaskStateService);

  @Input() taskId!: number;
  @Input() taskStatus!: TaskStatus;
  @Input() taskPowerObjectsIds: number[] = [];

  operations = signal<Operation[]>([]);
  selectedOperation = signal<Operation | null>(null);
  draftComment = signal('');
  isCreateModalOpen = signal(false);
  powerObjects = signal<PowerObject[]>([]);
  switches = signal<Switch[]>([]);
  filteredSwitches = signal<Switch[]>([]);

  createForm = new FormGroup({
    switchId: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    powerObjectId: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    targetState: new FormControl<0 | 1>(0, { nonNullable: true }),
  });

  readonly isEditable = computed(() => this.taskState.status() === 'created');

  readonly isFullyBlocked = computed(() => {
    const status = this.taskState.status();
    return status === 'closed_success' || status === 'closed_with_issues';
  });

  readonly powerObjectMap = computed(() => {
    const map = new Map<number, string>();
    for (const obj of this.powerObjects()) {
      map.set(obj.id, obj.name)
    }

    return map;
  })

  readonly switchesMap = computed(() => {
    const map = new Map<number, string>();
    for (const obj of this.switches()) {
      map.set(obj.id, obj.name)
    }

    return map;
  })

  readonly allowedPowerObjects = computed(() => {
    return this.powerObjects().filter(po => this.taskPowerObjectsIds.includes(po.id));
  });

  readonly allOperationsFinished = computed(() => {
    const ops = this.operations();
    return ops.length > 0 && ops.every(op => op.executionStatus !== 'not_executed');
  });

  ngOnInit() {
    if (this.taskId) {
      this.api.getByTask(this.taskId)
        .subscribe(ops => this.operations.set(ops));
    }

    this.powerObjectsApi.getAll()
      .subscribe(objects => this.powerObjects.set(objects));

    this.switchesApi.getAll()
      .subscribe(sws => this.switches.set(sws));
  }

  onStatusChange(op: Operation) {
    if (op.executionStatus === 'not_executed') {
      op.comment = '';
      op.executionTime = undefined;
    }

    if (op.executionStatus === 'success') {
      op.comment = '';
      if (!op.executionTime) {
        op.executionTime = new Date().toISOString();
      }
    }

    if (op.executionStatus === 'fail') {
      if (!op.executionTime) {
        op.executionTime = new Date().toISOString();
      }
    }

    this.update(op);
  }

  onPowerObjectChange(objId: number | null) {
    if (!objId) {
      this.filteredSwitches.set([]);
      this.createForm.controls['switchId'].setValue(null);
      return;
    }

    const filtered = this.switches().filter(sw => sw.powerObjectId === objId);
    this.filteredSwitches.set(filtered);

    // Если есть хотя бы один — ставим первый как дефолт
    if (filtered.length) {
      this.createForm.controls['switchId'].setValue(filtered[0].id);
    } else {
      this.createForm.controls['switchId'].setValue(null);
    }
  }


  update(op: Operation) {
    this.api.update(op).subscribe(updated => {
      const ops = this.operations();
      const idx = ops.findIndex(o => o.id === updated.id);
      if (idx !== -1) ops[idx] = updated;
      this.operations.set([...ops]);
    });
  }


  // Блок модалки комментария операции
  isCommentDisabled(op: Operation) {
    return op.executionStatus !== 'fail';
  }

  isExecutionTimeDisabled(op: Operation) {
    return op.executionStatus === 'not_executed';
  }

  openCommentModal(op: Operation) {
    this.selectedOperation.set(op);
    this.draftComment.set(op.comment ?? '');
  }

  closeCommentModal() {
    this.selectedOperation.set(null);
  }

  saveComment() {
    const op = this.selectedOperation();
    if (!op) return;

    op.comment = this.draftComment();
    this.update(op);

    this.closeCommentModal();
  }

  getCommentPreview(op: Operation) {
    if (!op.comment) return 'добавьте комментарий';
    return op.comment.length > 30
      ? op.comment.slice(0, 30) + '...'
      : op.comment;
  }

  // Блок модалки и создания операции
  openCreateOperationModal() {
    this.createForm.reset({
      switchId: null,
      targetState: 0
    });

    this.isCreateModalOpen.set(true);
  }

  closeCreateOperationModal() {
    this.isCreateModalOpen.set(false);
  }

  createOperation() {
    if (this.createForm.invalid) return;

    const nextOrder =
      this.operations().length
        ? Math.max(...this.operations().map(o => o.order)) + 1
        : 1;

    const operation: Operation = {
      taskId: this.taskId,
      switchId: this.createForm.value.switchId!,
      powerObjectId: this.createForm.value.powerObjectId!,
      targetState: this.createForm.value.targetState!,
      executionStatus: 'not_executed',
      order: nextOrder
    };

    this.api.create(operation).subscribe(created => {
      this.operations.update(list => [...list, created]);
      this.closeCreateOperationModal();
    });
  }

  moveUp(op: Operation) {
    const ops = [...this.operations()];
    const idx = ops.findIndex(o => o.id === op.id);
    if (idx > 0) {
      [ops[idx - 1], ops[idx]] = [ops[idx], ops[idx - 1]];
      this.reindexOperations(ops);
    }
  }

  moveDown(op: Operation) {
    const ops = [...this.operations()];
    const idx = ops.findIndex(o => o.id === op.id);
    if (idx < ops.length - 1) {
      [ops[idx], ops[idx + 1]] = [ops[idx + 1], ops[idx]];
      this.reindexOperations(ops);
    }
  }

  reindexOperations(ops: Operation[]) {
    ops.forEach((o, i) => o.order = i + 1);
    this.operations.set(ops);

    ops.forEach(o => this.api.update(o).subscribe());
  }

}
