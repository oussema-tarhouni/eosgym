import { Component, AfterViewInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { initAuthSlideshow, initPasswordToggles, initFakeSubmit } from '../../shared/auth-common';

declare const window: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    window.AUTH_SLIDES = [
      { img: 'https://images.unsplash.com/photo-1541600383005-565c949cf777?auto=format&fit=crop&w=1400&q=80', eyebrow: 'Strength', title: 'Train like the work actually matters', text: 'Free weights, machines, and a floor built for serious lifting — open early, open late.' },
      { img: 'https://images.unsplash.com/photo-1754257319747-df51c384c0fa?auto=format&fit=crop&w=1400&q=80', eyebrow: 'Pilates', title: 'Balance and control, session after session', text: 'Reformer and mat classes led by instructors who actually watch your form.' },
      { img: 'https://images.unsplash.com/photo-1517130038641-a774d04afb3c?auto=format&fit=crop&w=1400&q=80', eyebrow: 'Community', title: 'A gym that knows your name', text: 'Group classes, a members-only app, and a front desk that remembers your goals.' },
    ];

    initAuthSlideshow();
    initPasswordToggles();
    initFakeSubmit('login-form', 'login-submit', () => {
      this.router.navigate(['/app']);
    });
  }
}
