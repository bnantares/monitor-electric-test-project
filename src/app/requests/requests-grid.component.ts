import { Component, inject, signal } from '@angular/core';
import { RequestsApi } from '../shared/api/requests.api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requests-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests-grid.component.html'
})

export class RequestsGridComponent {
  private api = inject(RequestsApi);
  private router = inject(Router);

  requests = signal<any[]>([]);

  ngOnInit() {
    this.api.getAll().subscribe(res => {
      this.requests.set(res);
    });
  }

  open(req: any) {
    this.router.navigate(['/requests', req.id]);
  }
}
