import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

declare const setInterval: any;
declare const clearInterval: any;

@Component({
  selector: 'app-pending',
  standalone: true,
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent implements OnInit, OnDestroy {
  private poll: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Poll GET /api/me every 15s; once status === 'approved', move to the app.
    this.poll = setInterval(async () => {
      try {
        const me = await this.auth.me();
        if (me?.status === 'approved') {
          clearInterval(this.poll);
          this.router.navigate(['/dashboard']);
        }
      } catch { /* ignore transient errors while polling */ }
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.poll) clearInterval(this.poll);
  }

  logout(): void {
    this.auth.logout().finally(() => this.router.navigate(['/login']));
  }
}
