import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { initAuthSlideshow, initPasswordToggles, initPasswordStrength, initFakeSubmit } from '../../shared/auth-common';

declare const window: any;
declare const document: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements AfterViewInit {
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    window.AUTH_SLIDES = [
      { img: 'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?auto=format&fit=crop&w=1400&q=80', eyebrow: 'Get started', title: 'Your first rep starts here', text: 'Create a free account and set up your membership in under a minute.' },
      { img: 'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&w=1400&q=80', eyebrow: 'Group classes', text: 'From HIIT to reformer pilates, book your spot before it fills up.', title: 'Classes for every kind of training day' },
      { img: 'https://images.unsplash.com/photo-1541600383005-565c949cf777?auto=format&fit=crop&w=1400&q=80', eyebrow: 'Stay accountable', title: 'Track workouts, streaks, and personal bests', text: 'Your membership card, class schedule, and progress — all in one place.' },
    ];

    initAuthSlideshow();
    initPasswordToggles();
    initPasswordStrength();

    const checkPasswordsMatch = () => {
      const pw = document.getElementById('su-password').value;
      const cf = document.getElementById('su-confirm');
      const err = document.getElementById('confirm-error');
      const mismatch = cf.value.length > 0 && cf.value !== pw;
      cf.classList.toggle('field--invalid', mismatch);
      err.classList.toggle('field__error--show', mismatch);
    };
    document.getElementById('su-confirm').addEventListener('input', checkPasswordsMatch);
    document.getElementById('su-password').addEventListener('input', checkPasswordsMatch);

    initFakeSubmit('signup-form', 'signup-submit', () => {
      this.router.navigate(['/app']);
    });
  }
}
