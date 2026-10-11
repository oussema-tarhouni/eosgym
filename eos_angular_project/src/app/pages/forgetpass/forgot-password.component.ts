import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { initThemeToggle } from '../../shared/auth-common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements AfterViewInit {
  email = '';
  error = '';
  sent = false;
  loading = false;

  constructor(private auth: AuthService) {}

  ngAfterViewInit(): void { initThemeToggle(); }

  async submit(): Promise<void> {
    if (!/^\S+@\S+\.\S+$/.test(this.email)) { this.error = 'Enter a valid email'; return; }
    this.error = ''; this.loading = true;
    try { await this.auth.forgotPassword(this.email.trim()); this.sent = true; }
    catch (e: any) { this.error = e?.error?.error || 'Something went wrong, please try again'; }
    finally { this.loading = false; }
  }
}
