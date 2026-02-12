import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestsApi } from '../shared/api/requests.api';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-requests-detail',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './request-detail.component.html',
})

export class RequestsDetailComponent {
    private route = inject(ActivatedRoute);
    private api = inject(RequestsApi);
    private router = inject(Router);
    
    request = signal<any | null>(null);

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        this.api.getById(id).subscribe(res => {
            this.request.set(res);
        });
    }

    createTask(req: any) {
        this.router.navigate(['/tasks/new'], {
            queryParams: { requestId: req.id }
        });
    }
}
