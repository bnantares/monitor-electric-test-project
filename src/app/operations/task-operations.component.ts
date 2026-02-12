import { Component, Input, inject, signal } from '@angular/core';
import { OperationsApi, Operation } from '../shared/api/operations.api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-operations.component.html'
})
export class TaskOperationsComponent {
  private api = inject(OperationsApi);

  @Input() taskId!: number;

  operations = signal<Operation[]>([]);

  ngOnInit() {
    if (this.taskId) {
      this.api.getByTask(this.taskId).subscribe(ops => this.operations.set(ops));
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
}
