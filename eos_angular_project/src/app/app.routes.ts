import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OtpComponent } from './pages/otp/otp.component';
import { ForgotPasswordComponent } from './pages/forgetpass/forgot-password.component';
import { authGuard } from '../app/core/auth.guard';
import { gateCodeGuard, adminSessionGuard } from '../app/core/gate-code.guard';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminGateComponent } from './pages/admin_gate/admin-gate.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { resetGuard } from './core/reset.guard';



export const routes: Routes = [
  { path: '', component: LandingComponent },
{ path: 'reset-password', component: ResetPasswordComponent, canActivate: [resetGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'app', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin/:code', component: AdminGateComponent, canActivate: [gateCodeGuard] },
  { path: 'access-admin', component: AdminComponent, canActivate: [adminSessionGuard] },
  { path: 'terms', loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent) },
  { path: 'privacy', loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent) },
  { path: 'verify-otp', component: OtpComponent },
  { path: 'select-plan', loadComponent: () => import('./pages/plan/plan.component').then(m => m.PlanComponent), canActivate: [authGuard] }, // CHANGED
  { path: 'pending', loadComponent: () => import('./pages/pending/pending.component').then(m => m.PendingComponent), canActivate: [authGuard] }, // CHANGED
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '**', redirectTo: '' }
];
