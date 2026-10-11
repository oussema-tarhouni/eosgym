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

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  resources = RESOURCES;
  active: ResourceDef = RESOURCES[0];
  rows: any[] = [];
  loading = false;
  error = '';

  showForm = false;
  editingId: number | null = null;
  formModel: any = {};

  stats: any = null;

  // CHANGED — pending-account approvals
  activeSection: 'resource' | 'approvals' | 'send' = 'resource';
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
    await this.select(this.resources[0]);
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
    this.activeSection = 'resource'; // CHANGED
    this.active = res;
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

  // CHANGED — pending-account approvals
  async showApprovals() {
    this.activeSection = 'approvals';
    this.showForm = false;
    this.error = '';
    this.approvalsLoading = true;
    try {
      this.pendingApprovals = await this.admin.pendingApprovals();
    } catch (e: any) {
      this.error = e?.error?.error || 'Failed to load pending approvals';
      this.pendingApprovals = [];
    } finally {
      this.approvalsLoading = false;
    }
  }

  async showSend() {
    this.activeSection = 'send';
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

  async approveUser(row: any) {
    try {
      await this.admin.approveUser(row.id);
      await this.showApprovals();
    } catch (e: any) {
      this.error = e?.error?.error || 'Approval failed';
    }
  }

  async rejectUser(row: any) {
    if (!confirm(`Reject ${row.name}'s account request?`)) return;
    try {
      await this.admin.rejectUser(row.id);
      await this.showApprovals();
    } catch (e: any) {
      this.error = e?.error?.error || 'Rejection failed';
    }
  }
}
