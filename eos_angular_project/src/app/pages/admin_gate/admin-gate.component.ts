import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/admin.service';

@Component({
  selector: 'app-admin-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gate.component.html',
  styleUrl: './admin-gate.component.css',
})
export class AdminGateComponent {
  code = '';
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private admin: AdminService, private router: Router, private route: ActivatedRoute) {
    this.code = this.route.snapshot.paramMap.get('code') || '';
  }

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      await this.admin.verifyGate({
        code: this.code,
        username: this.username,
        password: this.password,
      });
      this.router.navigate(['/access-admin']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Invalid credentials';
    } finally {
      this.loading = false;
    }
  }
}
