import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

const SECTIONS = [
  { title: 'The short version', body: "We collect what we need to run your membership and bookings well, we never sell your data, and you can always ask to see, fix, or delete what we hold on you. The details are below." },
  { title: 'What we collect', body: "Account basics like your name, email, and phone number; membership and billing details; your fitness level and any health notes you choose to share with trainers; and usage data such as class bookings, attendance, and how you use the app." },
  { title: 'How we use it', body: "To run your membership — approving your account, processing bookings, tracking class credits, and renewing your plan. To keep you safe, by matching you to the right class level. To reach you about bookings, schedule changes, or renewals. And to see what's working in the app so we can improve it." },
  { title: 'Who sees it', body: "Trainers see what they need to run your session safely (your name, level, and any notes you've shared). We don't sell your personal data to anyone, ever. We share the minimum necessary with the service providers who keep the app and payments running — for example our hosting and payment processors — and only under contracts that protect your data." },
  { title: 'How long we keep it', body: "We keep your account and booking history for as long as your membership is active, plus a reasonable period after for legal, tax, and support purposes. If you ask us to delete your account, we'll remove what we can beyond what we're required to retain." },
  { title: 'Keeping it safe', body: "Your data is stored on secured servers with access limited to staff who need it to do their job. No system is perfectly unbreakable, but we take reasonable, industry-standard steps to protect what you share with us." },
  { title: 'Your rights', body: "You can ask to see, correct, export, or delete your personal data at any time — just message our support team in the app. You can also turn off non-essential notifications from your profile settings whenever you like." },
  { title: 'Changes to this policy', body: "If we make a meaningful change to how we handle your data, we'll let you know in the app before it takes effect." },
];

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="legal-page">
      <button type="button" class="theme-btn" aria-label="Toggle theme" (click)="toggle()"><svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></svg><svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg></button>
      <div class="legal-card">
        <a routerLink="/signup" class="legal-back">← Back</a>
        <h1>Privacy Policy</h1>
        <p class="legal-updated">Last updated: August 2026</p>

        @for (s of sections; track s.title) {
          <h2>{{ s.title }}</h2>
          <p>{{ s.body }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .legal-page { --bg:#f6f5f1; --white:#1a1a17; --gray:#66645a; --gray-dim:#8f8d82; --gold-light:#8a6d10; }
    :host-context([data-theme="dark"]) .legal-page { --bg:#0e0e0d; --white:#f5f4f0; --gray:#9a988d; --gray-dim:#605e54; --gold-light:#e6cc7a; }
    .theme-btn { position:fixed; top:18px; right:18px; width:38px; height:38px; border-radius:12px; border:1px solid rgba(128,128,128,.35); background:transparent; color:var(--white); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; }
    .theme-btn svg { width:18px; height:18px; }
    .theme-btn .i-sun { display:none; }
    :host-context([data-theme="dark"]) .theme-btn .i-sun { display:block; }
    :host-context([data-theme="dark"]) .theme-btn .i-moon { display:none; }
    .legal-page { min-height:100vh; background:var(--bg); color:var(--white); display:flex; justify-content:center; padding:60px 20px; font-family:'Poppins',sans-serif; }
    .legal-card { max-width:680px; width:100%; }
    .legal-back { color:var(--gray); text-decoration:none; font-size:14px; }
    h1 { margin:16px 0 4px; font-size:32px; }
    .legal-updated { color:var(--gray-dim); font-size:13px; margin-bottom:28px; }
    h2 { color:var(--gold-light); font-size:16px; margin:24px 0 8px; }
    p { color:var(--gray); line-height:1.6; font-size:14.5px; }
  `]
})
export class PrivacyComponent implements OnInit {
  sections = SECTIONS;
  ngOnInit(): void {
    let th = 'light';
    try { th = localStorage.getItem('theme') || 'light'; } catch {}
    document.documentElement.setAttribute('data-theme', th);
  }
  toggle(): void {
    const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n);
    try { localStorage.setItem('theme', n); } catch {}
  }
}
