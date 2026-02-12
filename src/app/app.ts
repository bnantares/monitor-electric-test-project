import { Component } from '@angular/core';
import { SidebarComponent } from './layout/sidebar.component';
import { MainAreaComponent } from './layout/main-area.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, MainAreaComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <app-sidebar></app-sidebar>
      <app-main></app-main>
    </div>
  `
})

export class App {

}
