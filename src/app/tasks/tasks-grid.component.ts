import { Component, inject, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { TasksApi } from "../shared/api/tasks.api";
import { Router } from "@angular/router";

@Component({
  selector: 'app-tasks-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks-grid.component.html'
})

export class TasksGridComponent {
  private tasksApi = inject(TasksApi);
  private router = inject(Router);

  tasks = signal<any[]>([]);
  // selectedTask = signal<any | null>(null);

  ngOnInit() {
    this.tasksApi.getAll().subscribe(res => {
      this.tasks.set(res);
    });
  }

  open(task: any) {
    this.router.navigate(['/tasks', task.id]);
  }
}
