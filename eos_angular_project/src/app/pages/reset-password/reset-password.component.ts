import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { initThemeToggle, initPasswordToggles } from '../../shared/auth-common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements AfterViewInit {
  password = ''; confirm = ''; error = '';
  done = false; loading = false;
  token: string;

  constructor(private auth: AuthService, route: ActivatedRoute, private router: Router) {
    this.token = route.snapshot.queryParamMap.get('token') || '';
  }

  ngAfterViewInit(): void { initThemeToggle(); initPasswordToggles(); }

  async submit(): Promise<void> {
    if (!this.token) { this.error = 'Invalid or missing reset link'; return; }
    if (this.password.length < 8) { this.error = 'Password must be at least 8 characters'; return; }
    if (this.password !== this.confirm) { this.error = 'Passwords do not match'; return; }
    this.error = ''; this.loading = true;
    try {
      await this.auth.resetPassword(this.token, this.password);
      this.done = true;
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (e: any) { this.error = e?.error?.error || 'Link expired or invalid'; }
    finally { this.loading = false; }
  }
}
