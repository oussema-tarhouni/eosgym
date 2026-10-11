import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

declare const document: any;

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css'
})
export class OtpComponent implements AfterViewInit {
  email = '';
  private cooldown = false;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) {}

  private mask(e: string): string {
    const [u, d] = e.split('@');
    return u && d ? u.slice(0, 2) + '***@' + d : e;
  }

  ngAfterViewInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    const emailEl = document.getElementById('otp-phone-display');
    if (emailEl) emailEl.textContent = this.mask(this.email);

    const form = document.getElementById('otp-form');
    const btn = document.getElementById('otp-submit');
    const input = document.getElementById('otp-code');
    const errEl = document.getElementById('otp-error');
    const showErr = (m: string) => { errEl.textContent = m; errEl.classList.toggle('field__error--show', !!m); };

    input?.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 6); });

    form?.addEventListener('submit', async (e: Event) => {
      e.preventDefault();
      const code = input.value;
      if (!/^[0-9]{6}$/.test(code)) { showErr('Enter the 6-digit code'); return; }
      showErr('');
      btn.classList.add('auth-form__submit--loading');
      btn.disabled = true;
      try {
        await this.auth.verifyOtp(code);
        this.router.navigate(['/select-plan']);
      } catch (err: any) {
        showErr(err?.error?.error || 'Incorrect or expired code');
      } finally {
        btn.classList.remove('auth-form__submit--loading');
        btn.disabled = false;
      }
    });

    const resend = document.getElementById('otp-resend');
    resend?.addEventListener('click', async (e: Event) => {
      e.preventDefault();
      if (this.cooldown) return;
      this.cooldown = true;
      showErr('');
      try {
        await this.auth.sendOtp();
        resend.textContent = 'Code sent';
      } catch (err: any) {
        showErr(err?.error?.error || 'Could not send the code');
      }
      setTimeout(() => { this.cooldown = false; resend.textContent = 'Resend code'; }, 60000);
    });
  }
}
