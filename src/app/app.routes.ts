import { Routes } from '@angular/router';
import { RequestsGridComponent } from './requests/requests-grid.component';
import { TasksGridComponent } from './tasks/tasks-grid.component';
import { RequestsDetailComponent } from './requests/request-detail.component';
import { TaskEditorComponent } from './tasks/task-editor.component';
import { TaskDetailComponent } from './tasks/task-detail.component'

export const routes: Routes = [
    { path: 'requests', component: RequestsGridComponent },
    { path: 'requests/:id', component: RequestsDetailComponent },

    { path: 'tasks', component: TasksGridComponent },
    { path: 'tasks/new', component: TaskEditorComponent },
    { path: 'tasks/:id', component: TaskDetailComponent },
    { path: 'tasks/:id/edit', component: TaskEditorComponent },

    
    { path: '', redirectTo: 'requests', pathMatch: 'full' }
];
