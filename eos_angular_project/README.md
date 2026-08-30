# EOS Fitness & Pilates — Angular App

Converted from the original static HTML/CSS/JS site into a standalone-component Angular 18 app.

## Structure
- `src/app/pages/landing` — home page (was `index.html`)
- `src/app/pages/login` — login page
- `src/app/pages/signup` — signup page
- `src/app/pages/dashboard` — member app/dashboard (was `eos-fitness-app.html`)
- `src/app/shared/auth-common.ts` — shared slideshow / password-toggle / password-strength / fake-submit logic used by login & signup
- `src/assets` — logo.svg, profile.png, hero.mp4

## Routing
- `/` → landing
- `/login` → login
- `/signup` → signup
- `/app` → dashboard

## Notes on the conversion
The original pages were vanilla DOM-manipulation scripts (querySelector, event listeners, etc.) rather than a data-bound framework app. To preserve 100% of the original behavior while moving into Angular:
- Each page's script runs inside `ngAfterViewInit()`, operating on the real rendered DOM — same logic as before, just triggered by Angular's lifecycle instead of `DOMContentLoaded`.
- Inline `onclick="..."` attributes (which Angular's compiler disallows for security) were replaced with `data-action` / `data-arg` attributes plus a single `(click)="__run($event)"` handler per component that dispatches to the original functions (still attached to `window` for that purpose).
- Internal page links (`login.html`, `signup.html`, `index.html`) became `routerLink`; the dashboard's logout does a full navigation to `/login`.

## Run
```
npm install
npm start
```
