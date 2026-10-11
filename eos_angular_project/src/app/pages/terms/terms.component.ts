import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

const SECTIONS = [
  { title: '1. Welcome', body: "These terms cover your use of the EOS Fitness & Pilates app and membership. By creating an account, you're agreeing to them, so give them a quick read. If something here doesn't sit right with you, reach out to us before signing up." },
  { title: '2. Your account', body: "You're responsible for keeping your login details private and your profile information accurate — name, phone number, and health/level details in particular, since trainers rely on these to keep classes safe. One account per person, please; sharing logins with friends or family isn't allowed." },
  { title: '3. Membership & billing', body: "Your plan renews automatically unless you turn auto-renew off in your profile before the renewal date. Prices, class credits, and plan tiers are shown at checkout and can change for future billing cycles — we'll always notify you before a price change affects you. Membership is activated once our team approves your account, usually within a business day." },
  { title: '4. Bookings & cancellations', body: "Book classes through the app up to your plan's limit. If you can't make it, cancel at least 4 hours ahead so someone else can take the spot. Repeated late cancellations or no-shows may lead to a temporary booking restriction — we'd rather give the spot to someone who'll use it." },
  { title: '5. Refunds', body: "Membership fees are generally non-refundable once a billing cycle has started, except where required by law or at our discretion for documented medical reasons. If something's wrong with a charge, contact support and we'll sort it out." },
  { title: '6. Health & safety', body: "Exercise carries inherent risk. Tell your trainer about any injury, condition, or limitation before a class, and use your own judgment about what your body can handle that day. Class levels (initiation through expert) exist to keep you training safely — please book within your level." },
  { title: '7. Acceptable use', body: "Be a good member: don't attempt to access another member's account, resell or transfer your membership, harass staff or other members, or try to interfere with the app's normal operation. We may suspend accounts that violate this." },
  { title: '8. Our content', body: "Everything in the app — the EOS name, logo, class descriptions, photos, and program content — belongs to EOS Fitness & Pilates or our licensors. You're welcome to use it for your own personal, non-commercial enjoyment of the service, not to republish or resell." },
  { title: '9. Liability', body: "We run a tight, well-maintained facility, but we can't guarantee an injury-free experience. To the extent permitted by law, EOS Fitness & Pilates isn't liable for injuries arising from normal exercise risk, except where caused by our negligence." },
  { title: '10. Ending your membership', body: "You can cancel anytime from your profile settings; cancellation takes effect at the end of your current billing cycle. We may also suspend or close accounts that seriously or repeatedly breach these terms." },
  { title: '11. Changes to these terms', body: "We may update these terms as the app and our services evolve. We'll flag meaningful changes in the app, and continuing to use EOS after that means you accept the update." },
  { title: '12. Questions', body: "Something unclear, or a situation these terms don't quite cover? Message our support team in the app — we'd rather talk it through than leave you guessing." },
];

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="legal-page">
      <button type="button" class="theme-btn" aria-label="Toggle theme" (click)="toggle()"><svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></svg><svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg></button>
      <div class="legal-card">
        <a routerLink="/signup" class="legal-back">← Back</a>
        <h1>Terms of Service</h1>
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
export class TermsComponent implements OnInit {
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
