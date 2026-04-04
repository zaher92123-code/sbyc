# ⚓ Al Seeb Bay Marina — Boat Parking Management System

A production-ready full-stack web application for managing boat parking at Al Seeb Bay, Muscat, Oman.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js 14 App                      │
│                    (App Router + TS)                     │
├───────────────────┬────────────────────┬────────────────┤
│   Server Pages    │   Client Pages     │   API Routes   │
│  (RSC, no hydra)  │  (forms, map,      │  /api/*        │
│                   │   modals)          │  /api/cron/*   │
├───────────────────┴────────────────────┴────────────────┤
│                    Supabase Layer                        │
│  Auth │ PostgreSQL │ Row-Level Security │ Realtime       │
├─────────────────────────────────────────────────────────┤
│               External Services                          │
│         Resend (email)  │  OpenStreetMap (map tiles)     │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions
- **Server Components by default** — data fetching at the server, zero client JS for read pages
- **Client Components only where needed** — forms, map, interactive modals
- **Supabase RLS** — all data access enforced at the database layer
- **Generated column** — `remaining_balance` is always `total_due - total_paid`, computed by Postgres
- **Unique partial index** — enforces one active session per parking spot at DB level
- **Trigger-driven totals** — payments trigger updates to session `total_paid` automatically

---

## 📁 Project Structure

```
al-seeb-bay/
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql      # Full schema, views, functions, triggers
│       ├── 002_rls.sql         # Row-level security policies
│       └── 003_seed.sql        # Realistic demo data
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Login page
│   │   ├── (dashboard)/        # Protected dashboard layout + pages
│   │   │   ├── dashboard/      # Main dashboard with stats
│   │   │   ├── map/            # Interactive Leaflet map
│   │   │   ├── boats/          # List, detail, new boat
│   │   │   ├── owners/         # List, detail, new owner
│   │   │   ├── sessions/       # List, detail, new session
│   │   │   ├── payments/       # List, new payment
│   │   │   ├── reminders/      # Reminder center
│   │   │   ├── reports/        # Reports + CSV export
│   │   │   └── settings/       # Users, rules, berths
│   │   └── api/
│   │       ├── boats/          # CRUD API
│   │       ├── owners/         # CRUD API
│   │       ├── sessions/       # CRUD + extend/close
│   │       ├── payments/       # Payment recording
│   │       ├── spots/          # Spot management
│   │       ├── audit/          # Audit log API
│   │       ├── export/         # CSV export endpoint
│   │       └── cron/reminders/ # Daily reminder cron job
│   ├── components/
│   │   ├── layout/             # Sidebar, TopBar
│   │   ├── ui/                 # Badges, Modal, StatCard, etc.
│   │   ├── map/                # MapClient (Leaflet)
│   │   ├── sessions/           # SessionActions (extend/close)
│   │   └── reports/            # ReportExportClient
│   ├── lib/
│   │   ├── supabase/           # Browser + server clients
│   │   ├── email/              # Templates + Resend sender
│   │   └── utils.ts            # OMR formatting, dates, helpers
│   ├── types/                  # Full TypeScript type definitions
│   └── middleware.ts            # Auth route protection
├── .env.example
├── vercel.json                  # Cron schedule
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 🗄 Database Schema

| Table | Purpose |
|-------|---------|
| `roles` | Admin, Staff role definitions |
| `users` | Extends Supabase auth, stores role + profile |
| `owners` | Boat owner contact info |
| `boats` | Vessel registry with type, size, status |
| `boat_owners` | Many-to-many: boats ↔ owners |
| `parking_spots` | Berth definitions with GeoJSON coordinates |
| `parking_sessions` | Core session data with computed `remaining_balance` |
| `payments` | Payment ledger; triggers update session totals |
| `reminder_rules` | Configurable reminder schedule |
| `reminders` | Per-session reminder log |
| `notification_logs` | Email delivery receipts |
| `audit_logs` | Full action history |

**Key constraints:**
- `UNIQUE INDEX` on `parking_sessions(parking_spot_id)` WHERE status in active states → only one active session per spot
- `GENERATED ALWAYS AS` column for `remaining_balance` → always accurate, never stale
- Payment `INSERT/UPDATE/DELETE` trigger → auto-updates `total_paid` and `last_payment_date`

---

## 🔔 Reminder Workflow

```
Daily Cron (06:00 Muscat) → /api/cron/reminders
  │
  ├─ 1. refresh_session_statuses() — updates active/ending_soon/overdue
  │
  ├─ 2. generate_reminders_for_session() — creates pending reminder rows
  │      for sessions that need them (schedule: 30/20/10/7/3/1/0/-7 days)
  │
  ├─ 3. Fetch all pending reminders where scheduled_date ≤ today
  │
  ├─ 4. For each reminder:
  │      ├─ Customer reminder → send to owner's email via Resend
  │      ├─ Staff reminder → send to all active staff emails
  │      ├─ Log result in notification_logs
  │      └─ Update reminder status (sent/failed/skipped)
  │
  └─ 5. Create next overdue follow-up (+7 days) for still-overdue sessions
```

**Reminder schedule:**
| Days Before End | Template |
|---|---|
| 30 | `reminder_30d` |
| 20 | `reminder_20d` |
| 10 | `reminder_10d` |
| 7 | `reminder_7d` |
| 3 | `reminder_3d` |
| 1 | `reminder_1d` |
| 0 (due date) | `reminder_due` |
| -7, -14, ... (post-due) | `reminder_overdue` (repeating) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Resend account (free tier: 100 emails/day)
- Vercel account (for deployment + cron jobs)

### 1. Clone & Install

```bash
git clone <your-repo>
cd al-seeb-bay
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in order:
   ```
   supabase/migrations/001_schema.sql
   supabase/migrations/002_rls.sql
   supabase/migrations/003_seed.sql
   ```
3. Copy your project URL and keys from **Settings → API**

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Al Seeb Bay Marina

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=generate-a-strong-random-string-here
```

### 4. Create First Admin User

1. Go to your Supabase dashboard → **Authentication → Users**
2. Click **Add User** → enter email and password
3. In SQL Editor, update their role to admin:
   ```sql
   UPDATE users
   SET role_id = (SELECT id FROM roles WHERE name = 'admin')
   WHERE email = 'your-email@example.com';
   ```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add RESEND_API_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
# ... etc
```

The `vercel.json` file configures the daily cron job at 06:00 UTC (10:00 Muscat time).

### 7. Test the Cron Job Manually

```bash
curl -X GET https://your-app.vercel.app/api/cron/reminders \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🔌 API Reference

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List active sessions (filter by status, unpaid) |
| POST | `/api/sessions` | Create new parking session |
| GET | `/api/sessions/:id` | Get session details with payments |
| PATCH | `/api/sessions/:id` | Extend, close, or update session |
| DELETE | `/api/sessions/:id` | Delete closed session (admin only) |

**Extend session:**
```json
{ "action": "extend", "new_end_date": "2025-06-01", "new_total_due": 300.000 }
```

**Close session:**
```json
{ "action": "close", "actual_exit_date": "2025-03-15" }
```

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List payments (filter by date range) |
| POST | `/api/payments` | Record payment or adjustment |

### Boats, Owners, Spots
Standard CRUD at `/api/boats`, `/api/owners`, `/api/spots`.

### Export
```
GET /api/export?type=sessions   # → sessions CSV
GET /api/export?type=payments   # → payments CSV
GET /api/export?type=owners     # → owners CSV
```

### Cron
```
GET  /api/cron/reminders   # Trigger manually (requires Authorization header)
POST /api/cron/reminders   # Trigger from dashboard button
```

---

## 🎨 Design System

**Colors:**
- Navy `#0A1628` — sidebar background
- Teal `#0E7490` — primary actions, map markers
- Gold `#D4A853` — active nav highlight, VIP badges
- Emerald — success / paid
- Amber — ending soon / warnings
- Red — overdue / danger

**Typography:**
- `Playfair Display` — headings and page titles
- `DM Sans` — body text and UI elements
- `DM Mono` — numbers, codes, registrations

---

## 🌍 Localization Notes

The application is architected to support Arabic localization:
- Layout uses `dir="ltr"` on the `<html>` tag — change to `"rtl"` for Arabic
- All spacing uses logical CSS properties where possible
- Currency uses OMR with 3 decimal places (Omani standard)
- All dates display in `dd MMM yyyy` format (readable in both languages)
- Timezone hardcoded to `Asia/Muscat` (UTC+4, no DST)

---

## 🔮 Extension Points

The system is ready to extend with:

1. **SMS / WhatsApp** — Add `twilio` or WhatsApp Business API; plug into `sendReminderJob()`
2. **Online Payments** — Integrate Thawani (Oman), Stripe, or MyFatoorah; add `payment_gateway` field to payments table
3. **Arabic UI** — Change `dir="ltr"` to `dir="rtl"`, swap fonts to Noto Kufi Arabic, translate string literals
4. **Real-time updates** — Add Supabase Realtime subscriptions for live map spot status changes
5. **Mobile app** — Expose existing API routes; add push notification support via Expo
6. **Vessel photos** — Add Supabase Storage bucket, link to boats table
7. **Invoice generation** — Use `@react-pdf/renderer` to generate PDF invoices per session

---

## 🔒 Security

- All routes protected by Supabase Auth middleware
- Row-Level Security on all tables (staff can read/write, admin can delete/configure)
- Cron endpoint protected by secret header
- Audit log records all create/update/delete actions with user ID and timestamp
- No sensitive data in client-side code (service role key server-only)
- Input validation with Zod on all API routes

---

## 📧 Email Configuration

Emails are sent only **outbound** to stored customer email addresses. The system never:
- Accesses customer email inboxes
- Stores email credentials of customers
- Sends to unverified addresses without prior configuration

To use a custom domain with Resend, verify your domain at [resend.com/domains](https://resend.com/domains) and update `RESEND_FROM_EMAIL`.

---

## 🐛 Troubleshooting

**Map not loading:** Ensure `leaflet/dist/leaflet.css` imports correctly. The map is client-side only and uses dynamic imports.

**Reminder cron not running:** Check Vercel Functions logs. Ensure `CRON_SECRET` matches between environment and your test request.

**RLS blocking queries:** If you see empty data, confirm the logged-in user has a valid row in the `users` table with a role assigned.

**Seed data failing:** Run migrations in order (001 → 002 → 003). The seed depends on schema and RLS being set up first.

---

© 2024 Al Seeb Bay Marina Management System. Built with Next.js, Supabase, and ❤️
