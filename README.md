# EOS update

Copy these files over your repo (same paths) and delete the files in DELETE_THESE_FILES.txt. Restart backend + frontend.

## Database — run ONE (from the backend/ folder, use `sudo mysql eos < ...` on Ubuntu)
- Never ran an earlier zip:    database/migrations/001_signup_fields_remove_otp.sql
- Already ran the first zip:   database/migrations/002_fix_onboarding_fields.sql
- Fresh install:               database/eos_schema.sql

## Admin
node src/scripts/access-admin.js -> open the printed link.
Notifications page = Send (one / selected / everyone, optional home-feed pin) + Home feed + Sent to members.

## Env
Delete ADMIN_GATE_DB_USERNAME, ADMIN_GATE_DB_PASSWORD and WHATSAPP_* lines. Rotate the secrets that are public on GitHub.
