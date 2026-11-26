import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { CLASS_CATEGORIES } from '../../core/class.categories';

interface FieldDef { key: string; label: string; type?: 'text' | 'number' | 'datetime-local' | 'date' | 'select' | 'checkbox' | 'textarea' | 'image'; options?: string[]; }
interface ResourceDef {
  key: string;           // API path segment
  title: string;
  columns: string[];     // fields shown in table
  fields: FieldDef[];    // fields shown in the add/edit form
}

const RESOURCES: ResourceDef[] = [
  {
    key: 'users', title: 'Users',
    columns: ['id', 'name', 'email', 'phone', 'role', 'level', 'status', 'preferred_category', 'email_verified_at', 'phone_verified_at'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role', type: 'select', options: ['user', 'admin'] },
      { key: 'level', label: 'Level', type: 'select', options: ['Initiation', 'Debutant', 'Intermediaire', 'Avancee', 'Expert'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending_category', 'pending_approval', 'approved', 'rejected'] },
      { key: 'preferred_category', label: 'Preferred Category', type: 'select', options: ['', ...CLASS_CATEGORIES] },
      { key: 'avatar', label: 'Avatar', type: 'image' },
    ],
  },
  {
    key: 'trainers', title: 'Trainers',
    columns: ['id', 'name', 'specialty'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'specialty', label: 'Specialty' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'avatar', label: 'Avatar', type: 'image' },
    ],
  },
  {
    key: 'classes', title: 'Classes',
    columns: ['id', 'name', 'trainer_name', 'category', 'location', 'level', 'starts_at', 'ends_at', 'capacity', 'spots_left'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'trainer_id', label: 'Trainer ID', type: 'number' },
      { key: 'category', label: 'Category', type: 'select', options: ['', ...CLASS_CATEGORIES] },
      { key: 'level', label: 'Level (Pilates)', type: 'select', options: ['', 'Initiation', 'Debutant', 'Intermediaire', 'Avancee', 'Expert'] },
      { key: 'location', label: 'Location' },
      { key: 'starts_at', label: 'Starts At', type: 'datetime-local' },
      { key: 'ends_at', label: 'Ends At', type: 'datetime-local' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
    ],
  },
  {
    key: 'class-categories', title: 'Class Categories',
    columns: ['id', 'name', 'is_active', 'sort_order'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ],
  },
  {
    key: 'plans', title: 'Membership Plans',
    columns: ['id', 'name', 'price', 'classes_per_month', 'duration_months', 'category', 'is_active'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'classes_per_month', label: 'Classes/Month (blank=unlimited)', type: 'number' },
      { key: 'duration_months', label: 'Duration (months)', type: 'number' },
      { key: 'category', label: 'Category', type: 'select', options: [] },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'memberships', title: 'Memberships',
    columns: ['id', 'user_name', 'plan_name', 'status', 'classes_used_this_month', 'started_at', 'renews_at'],
    fields: [
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'active', 'expired', 'cancelled'] },
      { key: 'plan_id', label: 'Plan ID', type: 'number' },
      { key: 'classes_used_this_month', label: 'Classes Used This Month', type: 'number' },
      { key: 'started_at', label: 'Started At', type: 'date' },
      { key: 'renews_at', label: 'Renews At', type: 'date' },
    ],
  },
  {
    key: 'bookings', title: 'Bookings',
    columns: ['id', 'user_name', 'class_name', 'starts_at', 'status'],
    fields: [
      { key: 'status', label: 'Status', type: 'select', options: ['booked', 'cancelled', 'attended', 'no_show'] },
    ],
  },
  {
    key: 'workouts', title: 'Workouts',
    columns: ['id', 'user_name', 'type', 'duration_minutes', 'calories_burned', 'performed_at'],
    fields: [
      { key: 'user_id', label: 'User ID', type: 'number' },
      { key: 'class_id', label: 'Class ID (optional)', type: 'number' },
      { key: 'type', label: 'Type' },
      { key: 'duration_minutes', label: 'Duration (min)', type: 'number' },
      { key: 'calories_burned', label: 'Calories Burned', type: 'number' },
      { key: 'performed_at', label: 'Performed At', type: 'date' },
    ],
  },
  {
    key: 'diet-logs', title: 'Diet Logs',
    columns: ['id', 'user_name', 'meal_type', 'description', 'calories', 'logged_at'],
    fields: [
      { key: 'user_id', label: 'User ID', type: 'number' },
      { key: 'meal_type', label: 'Meal Type', type: 'select', options: ['breakfast', 'lunch', 'dinner', 'snack'] },
      { key: 'description', label: 'Description' },
      { key: 'calories', label: 'Calories', type: 'number' },
      { key: 'logged_at', label: 'Logged At', type: 'date' },
    ],
  },
  {
    key: 'products', title: 'Store',
    columns: ['id', 'name', 'category', 'price', 'stock', 'is_active'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category', type: 'select', options: ['supplements', 'apparel', 'accessories'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'stock', label: 'Stock', type: 'number' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'posters', title: 'Posters',
    columns: ['id', 'username', 'location', 'text', 'created_at'],
    fields: [
      { key: 'username', label: 'Username' },
      { key: 'location', label: 'Location' },
      { key: 'text', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image (optional)', type: 'image' },
    ],
  },
  {
    key: 'notifications', title: 'Notifications',
    columns: ['id', 'user_id', 'message', 'is_read', 'created_at'],
    fields: [
      { key: 'user_id', label: 'User ID', type: 'number' },
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'is_read', label: 'Read', type: 'checkbox' },
    ],
  },
];


// ---- Dashboard UI config (sidebar groups, icons) ----
const ICONS: Record<string, string> = {
  overview: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  trainers: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  classes: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  'class-categories': 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  plans: 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22',
  memberships: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 11l2 2 4-4',
  bookings: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9zM9 14l2 2 4-4',
  workouts: 'M22 12h-4l-3 9L9 3l-3 9H2',
  'diet-logs': 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
  products: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  posters: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  notifications: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  approvals: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 11l2 2 4-4',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  plus: 'M12 5v14M5 12h14',
  menu: 'M3 12h18M3 6h18M3 18h18',
  back: 'M19 12H5M12 19l-7-7 7-7',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z',
  trash: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  close: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  chevL: 'M15 18l-6-6 6-6',
  chevR: 'M9 18l6-6-6-6',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
};

const NAV_GROUPS: { label: string; items: string[] }[] = [
  { label: 'People',   items: ['users', 'trainers', 'memberships'] },
  { label: 'Training', items: ['classes', 'class-categories', 'bookings', 'workouts', 'diet-logs'] },
  { label: 'Business', items: ['plans', 'products', 'posters'] },
  { label: 'Messaging', items: ['notifications'] },
];

const STAT_CARDS = [
  { key: 'users', label: 'Total users', icon: 'users', tone: 'gold', go: 'users' },
  { key: 'trainers', label: 'Trainers', icon: 'trainers', tone: 'green', go: 'trainers' },
  { key: 'upcoming_classes', label: 'Upcoming classes', icon: 'classes', tone: 'blue', go: 'classes' },
  { key: 'active_memberships', label: 'Active memberships', icon: 'memberships', tone: 'purple', go: 'memberships' },
  { key: 'bookings_today', label: 'Bookings today', icon: 'bookings', tone: 'orange', go: 'bookings' },
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  resources = RESOURCES;
  icons = ICONS;
  statCards = STAT_CARDS;
  navGroups = NAV_GROUPS.map(g => ({
    label: g.label,
    items: g.items.map(k => RESOURCES.find(r => r.key === k)!).filter(Boolean),
  }));
  active: ResourceDef = RESOURCES[0];

  // table UX
  search = '';
  page = 1;
  pageSize = 10;
  sidebarOpen = false;

  // overview data
  recentBookings: any[] = [];
  bookingsByStatus: { label: string; count: number; pct: number; tone: string }[] = [];
  usersByStatus: { label: string; count: number; pct: number; tone: string }[] = [];
  overviewLoading = false;
  today = new Date();
  rows: any[] = [];
  loading = false;
  error = '';

  showForm = false;
  editingId: number | null = null;
  formModel: any = {};

  stats: any = null;
  activeSection: 'overview' | 'resource' | 'approvals' | 'send' = 'overview';
  notifMessage = '';
  notifAudience: 'all' | 'selected' = 'all';
  notifUsers: any[] = [];
  notifSelected = new Set<number>();
  notifSending = false;
  notifInfo = '';
  pendingApprovals: any[] = [];
  approvalsLoading = false;

  constructor(private admin: AdminService) {}

  async ngOnInit() {
    this.stats = await this.admin.stats().catch(() => null);
    await this.loadCategories();
    await this.showOverview();
    this.admin.pendingApprovals().then(r => this.pendingCount = r.length).catch(() => {});
  }

  pendingCount = 0;

  // ---------- Overview ----------
  async showOverview() {
    this.activeSection = 'overview';
    this.showForm = false;
    this.error = '';
    this.sidebarOpen = false;
    this.overviewLoading = true;
    try {
      const [stats, users, bookings, pending] = await Promise.all([
        this.admin.stats().catch(() => this.stats),
        this.admin.list('users').catch(() => [] as any[]),
        this.admin.list('bookings').catch(() => [] as any[]),
        this.admin.pendingApprovals().catch(() => [] as any[]),
      ]);
      this.stats = stats;
      this.pendingApprovals = pending;
      this.pendingCount = pending.length;
      this.recentBookings = [...bookings]
        .sort((a, b) => String(b.starts_at).localeCompare(String(a.starts_at)))
        .slice(0, 6);
      this.bookingsByStatus = this.distribution(bookings, 'status');
      this.usersByStatus = this.distribution(users.filter((u: any) => u.role !== 'admin'), 'status');
    } finally {
      this.overviewLoading = false;
    }
  }

  private distribution(list: any[], key: string) {
    const counts = new Map<string, number>();
    for (const r of list) {
      const k = String(r[key] ?? 'unknown');
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const total = list.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label: this.pretty(label), count, pct: Math.round((count / total) * 100), tone: this.tone(label) }));
  }

  go(key: string) {
    const r = this.resources.find(x => x.key === key);
    if (r) this.select(r);
  }

  // ---------- Table helpers ----------
  get filteredRows(): any[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(r => this.active.columns.some(c => String(r[c] ?? '').toLowerCase().includes(q)));
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)); }
  get pagedRows(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }
  get rangeLabel(): string {
    const n = this.filteredRows.length;
    if (!n) return '0 results';
    const a = (this.page - 1) * this.pageSize + 1;
    return `${a}–${Math.min(n, a + this.pageSize - 1)} of ${n}`;
  }
  onSearch() { this.page = 1; }
  prevPage() { if (this.page > 1) this.page--; }
  nextPage() { if (this.page < this.totalPages) this.page++; }

  pretty(v: string): string {
    const t = String(v).replace(/_/g, ' ').trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  colLabel(c: string): string {
    if (c === 'id') return 'ID';
    return this.pretty(c.replace(/_at$/, '').replace(/_id$/, ' ID'));
  }
  cellKind(c: string): 'avatar' | 'badge' | 'bool' | 'date' | 'money' | 'verified' | 'text' {
    if (['name', 'user_name', 'username'].includes(c)) return 'avatar';
    if (['status', 'role', 'level'].includes(c)) return 'badge';
    if (['is_active', 'is_read'].includes(c)) return 'bool';
    if (c === 'email_verified_at' || c === 'phone_verified_at') return 'verified';
    if (c.endsWith('_at')) return 'date';
    if (c === 'price') return 'money';
    return 'text';
  }
  tone(v: any): string {
    const s = String(v ?? '').toLowerCase();
    if (['approved', 'active', 'attended', '1', 'true', 'user', 'verified'].includes(s)) return 'green';
    if (['pending', 'pending_approval', 'pending_category'].includes(s)) return 'amber';
    if (['rejected', 'cancelled', 'expired', 'no_show', '0', 'false'].includes(s)) return 'red';
    if (['booked'].includes(s)) return 'blue';
    if (['admin', 'expert'].includes(s)) return 'purple';
    return 'gray';
  }
  initials(name: any): string {
    const parts = String(name ?? '?').trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p.charAt(0).toUpperCase()).join('') || '?';
  }
  hue(name: any): number {
    let h = 0;
    for (const ch of String(name ?? '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }
  get headline(): string {
    const b = Number(this.stats?.bookings_today ?? 0);
    const p = this.pendingCount;
    const bookings = `${b} booking${b === 1 ? '' : 's'} today`;
    if (!p) return `${bookings}, nobody waiting for approval`;
    return `${bookings}, ${p} sign-up${p === 1 ? '' : 's'} to review`;
  }
  get sideStats() { return this.statCards.filter(c => c.key !== 'bookings_today'); }

  get sectionTitle(): string {
    switch (this.activeSection) {
      case 'overview': return 'Dashboard';
      case 'approvals': return 'Pending approvals';
      case 'send': return 'Send notification';
      default: return this.active.title;
    }
  }

  // Category dropdowns are built from the class-categories table (admin can add/delete freely)
  async loadCategories() {
    try {
      const cats: any[] = await this.admin.list('class-categories');
      const names = cats.filter(c => c.is_active !== 0 && c.is_active !== false).map(c => c.name);
      for (const r of this.resources) {
        for (const f of r.fields) {
          if ((r.key === 'users' && f.key === 'preferred_category') || (r.key === 'classes' && f.key === 'category')) {
            f.options = ['', ...names];
          } else if (r.key === 'plans' && f.key === 'category') {
            f.options = names;
          }
        }
      }
    } catch {}
  }

  async select(res: ResourceDef) {
    this.activeSection = 'resource';
    this.active = res;
    this.search = '';
    this.page = 1;
    this.sidebarOpen = false;
    this.showForm = false;
    this.error = '';
    this.loading = true;
    try {
      this.rows = await this.admin.list(res.key);
    } catch (e: any) {
      this.error = e?.error?.error || 'Failed to load data';
      this.rows = [];
    } finally {
      this.loading = false;
    }
  }

  openCreate() {
    this.editingId = null;
    this.formModel = {};
    this.showForm = true;
  }

  openEdit(row: any) {
    this.editingId = row.id;
    this.formModel = { ...row };
    for (const f of this.active.fields) {
      const v = this.formModel[f.key];
      if (typeof v === 'string' && v) {
        if (f.type === 'date') this.formModel[f.key] = v.slice(0, 10);
        else if (f.type === 'datetime-local') this.formModel[f.key] = v.replace(' ', 'T').slice(0, 16);
      }
    }
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  onFileChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.formModel[key] = file;
  }

  async save() {
    try {
      if (this.editingId) {
        await this.admin.update(this.active.key, this.editingId, this.formModel);
      } else {
        await this.admin.create(this.active.key, this.formModel);
      }
      this.showForm = false;
      if (this.active.key === 'class-categories') await this.loadCategories();
      await this.select(this.active);
    } catch (e: any) {
      this.error = e?.error?.error || 'Save failed';
    }
  }

  async remove(row: any) {
    if (!confirm(`Delete this ${this.active.title.slice(0, -1)}?`)) return;
    try {
      await this.admin.remove(this.active.key, row.id);
      if (this.active.key === 'class-categories') await this.loadCategories();
      await this.select(this.active);
    } catch (e: any) {
      this.error = e?.error?.error || 'Delete failed';
    }
  }
  async showApprovals() {
    this.activeSection = 'approvals';
    this.sidebarOpen = false;
    this.showForm = false;
    this.error = '';
    this.approvalsLoading = true;
    try {
      this.pendingApprovals = await this.admin.pendingApprovals();
      this.pendingCount = this.pendingApprovals.length;
    } catch (e: any) {
      this.error = e?.error?.error || 'Failed to load pending approvals';
      this.pendingApprovals = [];
    } finally {
      this.approvalsLoading = false;
    }
  }

  async showSend() {
    this.activeSection = 'send';
    this.sidebarOpen = false;
    this.showForm = false;
    this.error = '';
    this.notifInfo = '';
    try {
      this.notifUsers = (await this.admin.list('users')).filter((u: any) => u.role !== 'admin');
    } catch (e: any) {
      this.error = e?.error?.error || 'Failed to load users';
    }
  }

  toggleNotifUser(id: number) {
    this.notifSelected.has(id) ? this.notifSelected.delete(id) : this.notifSelected.add(id);
  }

  async sendNotification() {
    const message = this.notifMessage.trim();
    const ids = this.notifAudience === 'all' ? this.notifUsers.map(u => u.id) : [...this.notifSelected];
    this.error = ''; this.notifInfo = '';
    if (!message) { this.error = 'Message is required'; return; }
    if (!ids.length) { this.error = 'No recipients selected'; return; }
    this.notifSending = true;
    try {
      for (let i = 0; i < ids.length; i += 10) {
        await Promise.all(ids.slice(i, i + 10).map(id => this.admin.create('notifications', { user_id: id, message })));
      }
      this.notifInfo = `Sent to ${ids.length} user(s).`;
      this.notifMessage = '';
      this.notifSelected.clear();
    } catch (e: any) {
      this.error = e?.error?.error || 'Sending failed';
    } finally {
      this.notifSending = false;
    }
  }

  private async refreshApprovalsView() {
    if (this.activeSection === 'overview') await this.showOverview();
    else await this.showApprovals();
  }

  async approveUser(row: any) {
    try {
      await this.admin.approveUser(row.id);
      await this.refreshApprovalsView();
    } catch (e: any) {
      this.error = e?.error?.error || 'Approval failed';
    }
  }

  async rejectUser(row: any) {
    if (!confirm(`Reject ${row.name}'s account request?`)) return;
    try {
      await this.admin.rejectUser(row.id);
      await this.refreshApprovalsView();
    } catch (e: any) {
      this.error = e?.error?.error || 'Rejection failed';
    }
  }
}
