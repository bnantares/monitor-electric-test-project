import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="flex-1 p-6 overflow-auto">
      <router-outlet></router-outlet>
    </main>
  `
})
export class MainAreaComponent {}
