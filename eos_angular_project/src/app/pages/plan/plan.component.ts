import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { initThemeToggle } from '../../shared/auth-common';
import { AuthService } from '../../core/auth.service';

declare const document: any;
declare const sessionStorage: any;

interface Tier { key: number; planId: number | null; label: string; price: number; }
interface Group { title: string; tiers: Tier[]; note?: string; }
interface CategoryTab { key: string; label: string; groups: Group[]; }

// key = membership_plans.code (see seed_plans.sql)
const CATEGORIES: CategoryTab[] = [
  {
    key: 'Strength', label: 'Musculation',
    groups: [
      { title: 'MEMBERSHIP', tiers: [
        { key: 101, planId: null, label: '1 Month', price: 90 },
        { key: 102, planId: null, label: '2 Months', price: 160 },
        { key: 103, planId: null, label: '3 Months', price: 180 },
        { key: 104, planId: null, label: '6 Months', price: 340 },
        { key: 105, planId: null, label: '12 Months', price: 700 },
      ]},
      { title: 'PRIVATE COACHING', tiers: [
        { key: 106, planId: null, label: '1 Session', price: 30 },
        { key: 107, planId: null, label: '8 Sessions', price: 200 },
        { key: 108, planId: null, label: '16 Sessions', price: 320 },
        { key: 109, planId: null, label: 'Drop-in floor session', price: 10 },
      ]},
    ],
  },
  {
    key: 'Pilates', label: 'Pilates',
    groups: [
      { title: 'REFORMER — ESSENTIEL', tiers: [
        { key: 201, planId: null, label: '8 sessions · 30 days', price: 260 },
        { key: 202, planId: null, label: '12 sessions · 45 days', price: 360 },
        { key: 203, planId: null, label: '24 sessions · 90 days', price: 550 },
        { key: 204, planId: null, label: '48 sessions · 180 days', price: 1050 },
      ]},
      { title: 'REFORMER + PRIVÉ — PREMIUM', tiers: [
        { key: 205, planId: null, label: '5R + 3P · 30 days', price: 290 },
        { key: 206, planId: null, label: '7R + 5P · 45 days', price: 420 },
        { key: 207, planId: null, label: '16R + 8P · 90 days', price: 750 },
        { key: 208, planId: null, label: '38R + 10P · 180 days', price: 1300 },
      ]},
      { title: 'PILATES + MUSCULATION — INTÉGRAL', tiers: [
        { key: 209, planId: null, label: '1 Month · 8 R', price: 320 },
        { key: 210, planId: null, label: '3 Months · 24 R', price: 700 },
        { key: 211, planId: null, label: '6 Months · 48 R', price: 1350 },
        { key: 212, planId: null, label: '12 Months · 100 R', price: 2650 },
      ]},
      { title: 'PRIVATE SESSIONS', note: 'R = Reformer  P = Privé (Cadillac, Wunda Chair, Barrel, Tower)', tiers: [
        { key: 213, planId: null, label: 'Reformer', price: 35 },
        { key: 214, planId: null, label: 'Private (any machine)', price: 45 },
        { key: 215, planId: null, label: '8 Private sessions', price: 340 },
      ]},
    ],
  },
];

@Component({
  selector: 'app-select-plan',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.css'
})
export class PlanComponent implements OnInit, AfterViewInit {
  categories: CategoryTab[] = [...CATEGORIES];
  activeCategory: CategoryTab = CATEGORIES[0];
  selectedKey: number | null = null;
  selectedPlanId: number | null = null;
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void { initThemeToggle(); }

  async ngOnInit(): Promise<void> {
    const saved = sessionStorage.getItem('signup_category');
    const match = CATEGORIES.find(c => c.key === saved);
    if (match) this.activeCategory = match;

    try {
      const realPlans = await this.auth.getPlans(); // [{ id, price, category, ... }]
      const active = realPlans.filter((p: any) => p.is_active === undefined || Number(p.is_active) === 1);
      const norm = (v: any) => String(v ?? '').trim().toLowerCase();
      for (const cat of CATEGORIES) {
        for (const g of cat.groups) {
          for (const t of g.tiers) {
            // 1) match by code, 2) fallback: same category + same price
            const found =
              active.find((p: any) => p.code != null && Number(p.code) === t.key) ||
              active.find((p: any) => Number(p.price) === t.price && norm(p.category) === norm(cat.key));
            t.planId = found ? found.id : null;
          }
        }
      }
      // Extra categories added by the admin (e.g. CAF) -> one tab each, built from the DB
      const known = new Set(CATEGORIES.map(c => norm(c.key)));
      const extra = new Map<string, Tier[]>();
      for (const p of active) {
        const cat = String(p.category ?? '').trim();
        if (!cat || known.has(norm(cat))) continue;
        if (!extra.has(cat)) extra.set(cat, []);
        extra.get(cat)!.push({ key: 1000 + Number(p.id), planId: p.id, label: p.name, price: Number(p.price) });
      }
      for (const [cat, tiers] of extra) {
        if (this.categories.some(c => c.key === cat)) continue;
        tiers.sort((x, y) => x.price - y.price);
        this.categories.push({ key: cat, label: cat, groups: [{ title: cat.toUpperCase(), tiers }] });
      }
      const saved2 = this.categories.find(c => c.key === saved);
      if (saved2) this.activeCategory = saved2;
    } catch {
      this.error = 'Could not load plans, please try again';
    }
  }

  setCategory(cat: CategoryTab): void {
    this.activeCategory = cat;
    this.selectedKey = null;
    this.selectedPlanId = null;
    this.error = '';
  }

  select(t: Tier): void {
    if (!t.planId) {
      this.error = 'This plan is not available right now';
      return;
    }
    this.selectedKey = t.key;
    this.selectedPlanId = t.planId;
    this.error = '';
  }

  async confirm(): Promise<void> {
    if (!this.selectedPlanId) {
      this.error = 'Please select a plan';
      return;
    }
    const btn = document.getElementById('plan-continue');
    btn?.classList.add('auth-form__submit--loading');
    if (btn) btn.disabled = true;
    this.loading = true;

    try {
      await this.auth.setSubscription(this.activeCategory.key, this.selectedPlanId); // POST /api/auth/subscription
      sessionStorage.removeItem('signup_category');
      this.router.navigate(['/pending']);
    } catch (err: any) {
      this.error = err?.error?.error || 'Something went wrong, please try again';
    } finally {
      btn?.classList.remove('auth-form__submit--loading');
      if (btn) btn.disabled = false;
      this.loading = false;
    }
  }
}
