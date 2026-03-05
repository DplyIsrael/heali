# Heali — Statement of Work & Task Breakdown

**Version:** 1.2
**Last Updated:** 2026-03-05
**Progress:** Phase 0 complete. Phase 1 (Landing Page) ~70% complete — hero, header, domains carousel, help banner, packages teaser, newsletter, practitioners grid, testimonials, FAQ sections built. Footer and some section polish pending.
**Stack:** Next.js 15 / TypeScript / Tailwind + shadcn/ui / Supabase / Drizzle ORM / TanStack Query v5 / next-intl / Inngest / Upstash / Resend
**UI Reference:** `UI_UX_FLOW.md` (37 sections, all Figma screens)
**Requirements:** `Heali_DEV_PRD_EN.md`, `TECHNICAL_ARCHITECTURE.md`

---

## How This Document Works

Each phase is a logical build unit. Within each phase, tasks are ordered the way I'd actually do them — dependencies first. Phases are not fully sequential; some can overlap once their prerequisites are done (e.g., Admin work can start after Phase 0 even if patient flows are still in progress).

---

## Phase 0 — Foundation & Project Setup

This entire phase must be complete before any feature work. Skipping any of these creates debt that's painful to fix later.

### 0.1 Project Init ✅
- [x] `create-next-app` with TypeScript, App Router, Tailwind
- [x] Set `dir="rtl"` on `<html>` in root layout
- [x] Configure `next.config.ts` — image domains (Supabase storage), headers
- [x] `.env.local` structure — all env keys stubbed out with comments

### 0.2 Design Token System ✅
- [x] Create `tailwind.config.ts` with brand colors:
  - `primary`: `#21544E` (teal)
  - `accent`: `#7DE4A8` (green)
  - `border-input`: `#CDDBDB`
  - `background`: `#FFFFFF` (updated to white from Figma)
  - `destructive`: `#E70202`
  - `muted`: `#9F9F9F`
  - `card`: `#FFFFFF`
- [x] Register Discovery Fs font family (Light/Regular/Medium/Demi-bold/Bold) via `@font-face` in `globals.css`
- [x] Register PloniMLv2AAA-Bold for logo
- [x] Add Poppins (Google Fonts or local) for buttons + placeholders
- [x] Add font family tokens to Tailwind config

### 0.3 RTL & Internationalization ✅
- [x] Install and configure `next-intl`
- [x] Set Hebrew (`he`) as default locale
- [x] Create `messages/he.json` — translation file (all Hebrew strings from Figma as keys)
- [x] Wrap root layout with `NextIntlClientProvider`
- [x] Configure `middleware.ts` for locale detection

### 0.4 Supabase Setup ✅ (code ready, project setup pending client credentials)
- [x] Install `@supabase/supabase-js` + `@supabase/ssr`
- [x] Create `lib/supabase/client.ts` (browser client)
- [x] Create `lib/supabase/server.ts` (server client using cookies)
- [x] Create `lib/supabase/middleware.ts` (session refresh)
- [ ] Create Supabase project (needs client to provide credentials)
- [ ] Configure Supabase Auth: enable email, Google OAuth
- [ ] Configure Supabase Storage buckets: `avatars`, `certificates`, `article-images`, `package-images`
- [ ] Set bucket RLS policies (public read for images, authenticated write)

### 0.5 Database Schema (Drizzle ORM) ✅ (schema defined, migration pending Supabase credentials)
- [x] Install `drizzle-orm`, `drizzle-kit`, `pg` driver
- [x] Create `db/schema/` folder — one file per entity
- [ ] Define tables (exact columns per `TECHNICAL_ARCHITECTURE.md` Section 5):
  - [ ] `users` — extends Supabase auth.users (patient/practitioner role, onboarding_completed)
  - [ ] `practitioner_profiles` — all fields from Section 5.2
  - [ ] `practitioner_documents` — certificates, file URLs, approval status
  - [ ] `treatment_domains` — name, is_active
  - [ ] `specialties` — name, domain_id (FK), is_active
  - [ ] `categories` — name, points_amount, field_of_knowledge
  - [ ] `bookings` — all fields from Section 5.3 including price_at_booking, qr_scanned_at
  - [ ] `reviews` — booking_id, rating, comment, status enum, reviewer_first_name
  - [ ] `articles` — title, content, author_id, practitioner_id, category_id, background_image_url, status enum
  - [ ] `treatment_packages` — name, description, num_treatments, price, background_image_url, gradient_theme
  - [ ] `favorites` — patient_id (FK), practitioner_id (FK), unique constraint
  - [ ] `credits` — patient_id, amount, source_booking_id, status (active/used/refunded)
  - [ ] `areas` — name; `cities` — name, area_id (FK)
  - [ ] `notifications` — user_id, type, payload JSONB, read_at, created_at
  - [ ] `practitioner_availability` — practitioner_id, weekday, start_time, end_time
  - [ ] `availability_blocks` — practitioner_id, blocked_date (for exceptions)
- [ ] Define all status enums (from `TECHNICAL_ARCHITECTURE.md` Section 5.5)
- [ ] Run initial migration with `drizzle-kit push`
- [ ] Create `db/index.ts` — single exported `db` instance
- [ ] Seed script: admin user, sample domains, specialties, cities/areas

### 0.6 App Structure
- [ ] Define folder structure:
  ```
  app/
    (public)/          ← unauthenticated pages
    (patient)/         ← patient-authenticated
    (practitioner)/    ← practitioner-authenticated
    (admin)/           ← admin-authenticated
    api/               ← API routes
  components/
    ui/                ← shadcn primitives
    shared/            ← cross-role components
    patient/
    practitioner/
    admin/
  lib/
    supabase/
    queries/           ← TanStack Query queryFn wrappers
    mutations/         ← TanStack Query mutation wrappers
    validations/       ← Zod schemas
  db/
    schema/
    migrations/
  ```
- [ ] Create `providers.tsx` — wraps app with: QueryClientProvider, NextIntlClientProvider, UserProvider
- [ ] Create `UserProvider` context — stores user role + profile, supports optimistic updates

### 0.7 Shared UI Components
These are needed everywhere — build them before any screen.
- [ ] `<Button>` — variants: primary (teal), secondary (gray), destructive (red), ghost
- [ ] `<Input>` — RTL, Discovery Fs label above, Poppins placeholder, border `#CDDBDB`, h-48px
- [ ] `<Textarea>` — same as Input, variable height
- [ ] `<Select>` / `<Dropdown>` — with angle-down-small icon, RTL options
- [ ] `<Modal>` — white card, rounded-16px, X close button, overlay; wider variant (636px) for article modal
- [ ] `<Badge>` / `<StatusBadge>` — approved (green), pending (yellow), rejected (red)
- [ ] `<Avatar>` — circular, fallback initials
- [ ] `<ContextMenu>` / `<ThreeDotsMenu>` — white card, shadow, RTL options, destructive in red
- [ ] `<Spinner>` / `<Skeleton>` — loading states
- [ ] `<Toast>` — success/error notifications (hook into shadcn)
- [ ] `<ConfirmDialog>` — used before destructive actions (delete, etc.)
- [ ] `<Pagination>` — for tables
- [ ] `<EmptyState>` — when lists are empty

### 0.8 Shared Layout Components
- [ ] `<AdminHeader>` — 80px, white, logo left, nav center, user avatar + dropdown right (bell, message, user dropdown with "אזור אישי" / "התנתקות")
- [ ] `<AdminNav>` — 7 items: דשבורד / טיפולים / מטפלים / מטופלים / קטגוריות / חבילות טיפול / מאמרים, active = Demi-bold, inactive = Light
- [ ] `<PublicHeader>` — Heali logo, main nav, login/signup (for patient/public pages)
- [ ] `<Sidebar>` / mobile drawer variant

### 0.9 Middleware & Auth Guards
- [ ] `middleware.ts` — session refresh on every request (Supabase SSR pattern)
- [ ] Route protection: redirect unauthenticated users to `/login`
- [ ] Role-based redirect: admin → `/admin`, practitioner → `/dashboard`, patient → `/`
- [ ] Redirect authenticated users away from `/login` and `/register`

---


---

## Phase 1 — Landing Page

> Build the public-facing landing page first. It is the entry point of the app, requires no auth, and lets us validate the design system, layout components, and RTL rendering before touching any logic-heavy flows.

`UI_UX_FLOW.md` Section 6 (all 10 sub-sections).

### 1.1 Page Structure & Layout ✅
- [x] Full-width SSR page at `/` — `app/(public)/page.tsx`
- [x] `<PublicHeader>` sticky at top — Figma-accurate (logo, nav, auth buttons, RTL-correct)
- [x] `<PublicFooter>` — dark `#08190C` bg, categories column, links column, Heali logo, social icons
- [x] Max-width 1440px centered content, white page bg

### 1.2 Hero Section (Section 6.2) ✅
- [x] Background park photo + girl cutout (hero-girl-hq.png), rounded card with padding
- [x] Headline: "כל הכלים במקום אחד..." (last line bold), correct font sizes
- [x] Dark gradient overlay on right side for text readability (no blur bleed)
- [x] Glassmorphism search container with green-border input + gradient CTA button + magicpen icon
- [x] Popular category pills: פסיכולוגיה | יוגה | מדיטציה | דיקור סיני
- [x] Full RTL layout — content anchored to visual right side

### 1.3 Treatment Domains Carousel (Section 6.3) ✅
- [x] Section title + subtitle, centered, with arrow navigation buttons
- [x] 4-column grid of domain cards with hover state (teal gradient)
- [x] Each card: checkerboard pattern background, domain name, practitioner count, pill CTA
- [x] Hover: card turns teal gradient, checkerboard adapts, text turns white
- [x] Pill: "צפייה בכל המטפלים" + arrow icon, RTL-correct (text right, icon left), w-fit
- [x] Paginated — ChevronLeft/Right navigation

### 1.4 How It Works Section (Section 6.4) ⏳ (placeholder — needs Figma comparison)
- [ ] 3-step numbered flow explaining the platform
- [ ] Icon per step

### 1.5 Featured Practitioners Section (Section 6.5) ✅ (static data, needs Figma polish)
- [x] Section title + subtitle
- [x] Grid of practitioner cards (static mock data)
- [x] Each card: avatar, name, domains, rating + count, price, location, "לפרופיל" CTA

### 1.6 Testimonials / Reviews Section (Section 6.6) ✅ (static data, needs Figma polish)
- [x] Quote cards with reviewer name + star rating
- [x] Static mock data, horizontal layout

### 1.7 Treatment Packages Teaser (Section 6.7) ✅
- [x] Section title + "לכל החבילות" CTA link
- [x] 3 gradient package cards (teal, green, purple) with hover scale
- [x] Each card: icon, name, description, price per treatment, treatment count

### 1.8 Articles Teaser (Section 6.8) ⏳ (not yet built)
- [ ] Section title
- [ ] 3 article cards (thumbnail + title + category tag)
- [ ] "לכל המאמרים" CTA

### 1.9 CTA Banner (Section 6.9) ✅
- [x] Full-width teal banner (help-banner.tsx): "צריכים עזרה?" headline + "צור איתנו קשר" button
- [x] Newsletter section: email input + submit button, RTL-correct

### 1.10 Footer (Section 6.10) ✅
- [x] Dark `#08190C` bg
- [x] 3 columns: categories list, links list, logo + tagline
- [x] Social icons row: YouTube, Instagram, TikTok, Facebook
- [x] Bottom row: legal links (נגישות | פרטיות | תנאי שימוש) + "© 2025 Heali"

## Phase 2 — Authentication

All screens: `UI_UX_FLOW.md` Section 4. Two-column layout (60/40), green progress bar at top, RTL throughout.

### 2.1 Login Screen (Section 4.1)
- [ ] Two-column auth layout component (reused across all auth screens)
  - Left: form area (white)
  - Right: teal panel (`#21544E`) with grid pattern overlay + Heali branding text
  - Progress bar (green, grows per step)
- [ ] Tab switcher: "התחברות" / "הרשמה" (pill toggle, active = green bg)
- [ ] Email + password form (React Hook Form + Zod)
- [ ] "שכחתי את הסיסמה שלי" link
- [ ] Login button — full width, teal, Assistant Bold 16px
- [ ] Divider with "או"
- [ ] Google Sign-In button (Supabase OAuth)
- [ ] "התחברות עם מייל" button (magic link / OTP — confirm with client)
- [ ] Legal consent text at bottom
- [ ] Server action: `signIn(email, password)`
- [ ] Error states: wrong credentials, unverified email

### 2.2 Registration — Role Selection (Section 4.2)
- [ ] "הרשמה" tab active state
- [ ] Role selection: "מטופל" / "מטפל" — two pill/card options
- [ ] Store selected role, route to correct registration flow

### 2.3 Patient Registration (Sections 4.3–4.4)
- [ ] Screen 1: email + password + full name (fields from Figma)
- [ ] Screen 2: terms acceptance + submit
- [ ] Server action: `signUpPatient(...)` — creates auth user + `users` row with role=patient
- [ ] Trigger email verification on signup

### 2.4 Practitioner Registration (Sections 4.5–4.10)
- [ ] Personal details form (name, email, password, phone, city)
- [ ] Professional details step
- [ ] Treatment areas selection step
- [ ] Google Calendar connection step (optional / future)
- [ ] Submission confirmation screen
- [ ] Account approved screen (static — shown after admin approval email)
- [ ] Server action: `signUpPractitioner(...)` — creates auth user + `users` row with role=practitioner
- [ ] Set practitioner_status = DRAFT initially

### 2.5 Email Verification (Section 4.3 flow)
- [ ] Post-registration: "בדוק את המייל שלך" screen
- [ ] Resend verification email CTA
- [ ] Supabase handles the verification link; redirect on confirm

### 2.6 Forgot Password (Section 4.x)
- [ ] "שכחתי סיסמה" screen: email input
- [ ] Server action: `resetPassword(email)` via Supabase Auth
- [ ] Confirmation screen: "שלחנו לך מייל"
- [ ] Reset password form (new password + confirm) — accessed from email link

### 2.7 Auth Infrastructure
- [ ] `UserProvider` — on load, fetch user profile from DB, store in context
- [ ] `useUser()` hook — exposes user, role, onboarding status
- [ ] Cache `getUser()` per request in Server Components using `React.cache`
- [ ] Middleware fast-path: skip `getUser()` if no auth cookie

---

## Phase 3 — Patient Onboarding

All screens: `UI_UX_FLOW.md` Sections 5–12. 6-step flow with progress indicator.

### 3.1 Onboarding Shell
- [ ] Onboarding layout: full-screen, centered card, step counter, back/forward navigation
- [ ] Progress bar or step dots
- [ ] Guard: if `onboarding_completed = true`, redirect to home

### 3.2 Step 1 — Welcome Screen (Section 5)
- [ ] Welcome illustration + headline
- [ ] CTA button → Step 2

### 3.3 Step 2 — About Screen (Section 6)
- [ ] Explanation of what Heali does
- [ ] CTA → Step 3

### 3.4 Step 3 — Personal Details (Section 7)
- [ ] Form: full name, date of birth, gender (enum: male/female/other), city (dropdown from cities table), phone
- [ ] All fields required (Zod validation)
- [ ] Save to DB (partial — not committed until final step)

### 3.5 Step 4 — Profile Photo (Section 8)
- [ ] Upload component: drag/drop or click, preview
- [ ] Upload to Supabase Storage `avatars` bucket
- [ ] Optional — can skip

### 3.6 Step 5 — Confirmation (Section 9)
- [ ] Summary of all entered data with edit links per section
- [ ] "אישור" → proceeds to questionnaire

### 3.7 Step 6 — Questionnaire (Section 10)
- [ ] Dynamic question renderer (content from DB or config — marked MISSING in PRD, build dynamic renderer)
- [ ] Store responses as JSONB in `questionnaire_responses`
- [ ] On complete: set `onboarding_completed = true`, run matching

### 3.8 Post-Onboarding — Matched Practitioners (Sections 11–12)
- [ ] Run matching query: filter practitioners by patient's city/area + at least one shared domain + gender preference + rating
- [ ] Display 3–4 matched practitioner cards
- [ ] "Other" option to browse all practitioners
- [ ] CTA to view individual profiles

---

## Phase 4 — Practitioner Onboarding

`UI_UX_FLOW.md` Sections 13–22. 8-step flow with draft save/resume.

### 4.1 Onboarding Shell
- [ ] Multi-step shell with step counter (8 steps)
- [ ] Draft save on every step (update `practitioner_profiles` with current step data)
- [ ] Resume from last saved step on re-login
- [ ] Progress bar grows per step

### 4.2 Step 1 — Treatment Domains (Section 13)
- [ ] Multi-select grid of domains (from `treatment_domains` table)
- [ ] Validation: at least 1 required

### 4.3 Step 2 — Specialties (Section 14)
- [ ] Filtered by selected domains
- [ ] Multi-select checkboxes or chips
- [ ] Validation: at least 1 required

### 4.4 Step 3 — Pricing (Section 15)
- [ ] Pricing model dropdown (per treatment / per hour / per package)
- [ ] Price input (ILS, numeric)
- [ ] Currency formatted as ₪

### 4.5 Step 4 — Certificates / Documents (Section 16)
- [ ] Upload multiple files (PDF, JPG, PNG)
- [ ] Upload to Supabase Storage `certificates` bucket
- [ ] List uploaded files with remove option
- [ ] At least 1 required

### 4.6 Step 5 — Languages (Section 17)
- [ ] Multi-select language chips (from predefined list: Hebrew, English, Arabic, Russian, French, etc.)

### 4.7 Step 6 — Bio / Profile Summary (Section 18)
- [ ] Textarea, RTL, min character count
- [ ] Character counter

### 4.8 Step 7 — Practitioner Agreement (Section 19)
- [ ] Display agreement text (MISSING — placeholder)
- [ ] Digital signature input or checkbox
- [ ] Timestamp stored in DB

### 4.9 Step 8 — Review & Submit (Section 20)
- [ ] Full summary of all entered data
- [ ] Submit button → server action: `submitPractitionerForApproval()`
  - Set `verification_status = SUBMITTED`
  - Trigger email to practitioner: "פרופיל שלך בבדיקה"
  - Create admin notification: new practitioner submission

### 4.10 Post-Submission Screens (Sections 21–22)
- [ ] "Pending approval" status screen — shown after submit
- [ ] "Account approved" screen — accessed after admin approves (email link or on login)
- [ ] Welcome email sent via Resend when admin approves

---

## Phase 5 — Public Pages & Discovery

`UI_UX_FLOW.md` Sections 23–26.


### 5.1 Discovery / Search Page (Section 23–24)
- [ ] Server-rendered initial list of approved practitioners (paginated)
- [ ] Client-side filter panel (TanStack Query takes over after first load):
  - Treatment domain
  - Specialty
  - City / Area
  - Gender
  - Price range (slider)
  - Rating
  - Language
- [ ] Free-text search (debounced, across name/domain/city)
- [ ] Sort options: rating, price asc/desc, newest
- [ ] `<PractitionerCard>` component:
  - Avatar, name, domains, rating + count, price, location
  - Favorites heart toggle
- [ ] Infinite scroll or pagination
- [ ] Empty state when no results

### 5.2 Practitioner Public Profile (Section 25)
- [ ] SSR page for SEO (`/practitioners/[slug]`)
- [ ] Sections: hero (photo, name, domains, rating, price), bio, languages, certificates, reviews, booking CTA
- [ ] Rating display (stars + count)
- [ ] Unique QR code display (barcode) — generated on approval
- [ ] Favorites toggle (requires auth)
- [ ] "Book Treatment" CTA → booking flow
- [ ] Related articles widget at bottom (matching logic TBD — use domain tags for now)

### 5.3 Favorites System
- [ ] Add/remove favorite — optimistic update via TanStack Query
- [ ] Favorites page (authenticated patients) — shows saved practitioners

---

## Phase 6 — Booking System

`UI_UX_FLOW.md` Sections (booking flow screens, My Treatments).

### 6.1 Practitioner Availability Setup (Practitioner-facing)
- [ ] Weekly schedule grid: select recurring time slots per weekday
- [ ] Block specific dates (calendar date picker)
- [ ] Save to `practitioner_availability` and `availability_blocks`

### 6.2 Booking Flow (Patient-facing)
- [ ] From practitioner profile → "Book Treatment" opens booking modal or page
- [ ] Calendar view: show available dates (computed from weekly schedule minus blocks minus already-booked slots)
- [ ] Time slot grid for selected date
- [ ] Booking summary: practitioner, date, time, price
- [ ] Confirm booking → server action:
  - Create `booking` row with status = REQUESTED
  - Trigger payment via Grow (charge card on file or redirect to payment)
  - On payment success: status = PENDING_PRACTITIONER_APPROVAL
  - Send email to practitioner: "טיפול חדש ממתין לאישורך"
  - Show patient: "נשלח למטפל לאישור"

### 6.3 My Treatments (Patient-facing)
- [ ] Three tabs: upcoming / completed / canceled
- [ ] Each booking row:
  - Practitioner avatar + name, domain, date/time
  - Status badge
  - Price
  - Actions per status (cancel / re-book / rate)
- [ ] Booking detail modal / page:
  - Full details: order number, treatment type, date/time, location + Waze link
  - Add to Google Calendar link
  - Contact practitioner button (opens email/chat — TBD)
  - Cancel button (if >24h before scheduled time)

### 6.4 Cancellation Flow
- [ ] Cancel button → modal: select cancellation reason
- [ ] Confirm → server action:
  - Validate >24h rule
  - Set booking status = CANCELED
  - Charge reversed → credit added to patient wallet (`credits` table)
  - Show confirmation: "ביטול אושר, הסכום זוכה לארנק שלך"
- [ ] Credit wallet page: balance, history, "Request Refund" button
- [ ] Refund request → creates admin task (email + admin panel notification)

### 6.5 QR Code Attendance (Patient scan flow)
- [ ] `/scan/[practitioner-qr-code]` route — public page
- [ ] On load: lookup practitioner by QR token, find nearest upcoming booking for this patient
- [ ] Confirm attendance → set `booking.qr_scanned_at = now()`, status = COMPLETED
- [ ] Show confirmation to patient
- [ ] Trigger Inngest background job: wait 2 hours → send satisfaction survey link to patient

### 6.6 QR Code (Practitioner-facing)
- [ ] QR code generated on practitioner approval (use `qrcode` library, store URL in `qr_code_url`)
- [ ] Display in practitioner dashboard: viewable + printable

---

## Phase 7 — Practitioner Dashboard

`UI_UX_FLOW.md` Sections (Practitioner dashboard screens).

### 7.1 Dashboard KPIs
- [ ] Stat cards (TanStack Query, client-side):
  - Total treatments
  - Upcoming treatments
  - Completed: paid / pending payout
  - Canceled
  - Revenue: paid / pending payout
- [ ] Filter bar: date range picker + patient name search
- [ ] Each card clickable → drills into filtered booking list

### 7.2 Bookings Management
- [ ] Bookings table: practitioner can filter by status, date range, patient name
- [ ] Per-row actions:
  - Approve booking → status = CONFIRMED, payment charged, confirmation email to patient
  - Decline booking → status = DECLINED, no charge, patient notified
- [ ] View booking detail

### 7.3 Practitioner Profile Edit (Post-approval restricted)
- [ ] Phase 1 rule: only price editable directly
- [ ] All other fields: display with "לשינוי, צור קשר עם תמיכה" message
- [ ] Price update form — saves to `practitioner_profiles.price`

### 7.4 My Articles (Practitioner-facing)
- [ ] List of own articles with status badges (draft / submitted / approved / rejected)
- [ ] "Create Article" → article creation form (rich text editor)
  - Title, content, category, background image upload
  - Submit → status = SUBMITTED, creates admin moderation task
- [ ] Edit own draft articles
- [ ] Approved articles are locked (read-only, "request edit" to admin)

---

## Phase 8 — Reviews

### 8.1 Satisfaction Survey
- [ ] Survey page at `/survey/[booking-id]` — linked from Inngest-triggered email
- [ ] Auth check: only booking's patient can access
- [ ] Form: 1–5 star rating + free-text comment + optional anonymity toggle
- [ ] Submit → create `review` with status = SUBMITTED
- [ ] Admin gets notification for new review to moderate

### 8.2 Review Display
- [ ] Reviews section on practitioner public profile
- [ ] Only APPROVED reviews shown
- [ ] Display: first name only (anonymized if toggled), rating stars, comment, date
- [ ] Average rating recomputed on each approval (trigger or computed column)

---

## Phase 9 — Articles & Content

`UI_UX_FLOW.md` Section 37 (Admin view) + public article pages.

### 9.1 Public Articles List
- [ ] SSG/ISR page — card grid (5 columns desktop, responsive)
- [ ] Article card: thumbnail (rounded-16.749px), title, truncated description, author name + avatar, category tag, date tag
- [ ] Category filter + free-text search
- [ ] Pagination

### 9.2 Article Detail Page (SSR/SEO)
- [ ] Dynamic route `/articles/[slug]`
- [ ] Full article content (rendered rich text / markdown)
- [ ] Author info, date, category
- [ ] Related practitioners widget at bottom (matched by article category/domain)
- [ ] Social share (optional)

---

## Phase 10 — Treatment Packages

`UI_UX_FLOW.md` Section 35 (Admin view) + public packages page.

### 10.1 Public Packages Page
- [ ] Gradient card grid (matching admin view): 4 columns
- [ ] Each card: gradient bg, glassmorphism icon, title, description, price, arrow nav button
- [ ] Package detail page: full description, included treatments, price, book CTA

### 10.2 Package Booking
- [ ] Book a package → links to practitioner selection + booking flow
- [ ] Track package usage per patient (how many sessions used)

---

## Phase 11 — Admin Panel

`UI_UX_FLOW.md` Sections 27–37 (all admin screens). Admin layout uses `<AdminHeader>` + `<AdminNav>`.

### 11.1 Admin Layout & Guard
- [ ] Admin layout: full-width 1440px, AdminHeader + page content
- [ ] Middleware guard: `role = admin` only
- [ ] Admin user seeded in DB (from Phase 0 seed script)

### 11.2 Admin Dashboard (Section 27.1)
- [ ] Stat cards (TanStack Query):
  - Total users, total practitioners, total patients, total bookings
  - New registrations (period filter)
  - Revenue summary
  - Average platform rating
- [ ] Top practitioners widget
- [ ] Recent activity feed

### 11.3 Practitioners Management (Sections 27–29)

#### Practitioners List Table (Section 27.2)
- [ ] Table columns: avatar, name, domains, status badge, city, join date, actions (3-dots)
- [ ] Status filter tabs: All / Pending / Approved / Rejected
- [ ] Free-text search
- [ ] 3-dots context menu per row:
  - View Profile → admin view of practitioner profile
  - Edit Details → edit modal/page
  - Approve / Reject specialty

#### Practitioner Profile — Admin View (Section 27.2 / 32)
- [ ] Read-only view of full practitioner profile
- [ ] Tabs: personal info, documents, treatments, reviews
- [ ] Download certificate files
- [ ] Approve practitioner button → set status = APPROVED, send welcome email, generate QR code
- [ ] Reject with reason → set status = REJECTED, send rejection email

#### Edit Practitioner Details (Section 29)
- [ ] Full editable form (admin can edit any field):
  - Personal info: name, email, phone, city
  - Treatment domains + specialties (multi-select)
  - Pricing model + price
  - Certificates management (view existing, upload new)
- [ ] Save → update `practitioner_profiles` directly

#### Approve Add Specialty Modal (Section 33)
- [ ] Triggered from practitioner's request to add a new specialty
- [ ] Modal: practitioner avatar + name, treatment area dropdown, specialization dropdown, pricing model + price, certification document row
- [ ] Approve → add specialty to practitioner profile
- [ ] Reject → dismiss request

### 11.4 Patients Management (Sections 28, 30)

#### Patients List Table (Section 28.1 / 30)
- [ ] Table columns: avatar, name, email, phone, city, join date, total treatments, actions
- [ ] Search by name / email
- [ ] Click row → patient profile

#### Patient Profile — Admin View (Section 28.1)
- [ ] Patient details header
- [ ] Treatment history table: practitioner, domain, date, status, price
- [ ] Credit wallet balance + history

### 11.5 Categories Management (Section 34)

#### Categories List
- [ ] Table: name, specialties count (underlined, clickable → specialty list), points, creation date, 3-dots
- [ ] Free-text search
- [ ] "הוספת קטגוריה +" button → New Category modal

#### New / Edit Category Modal
- [ ] Fields: שם הקטגוריה, סכום נקודות, תחום דעת
- [ ] "הוספת שדה נוסף +" — dynamic field addition
- [ ] Submit → create/update category

#### Delete Category
- [ ] 3-dots → "מחיקת קטגוריה" (red) → `<ConfirmDialog>` → delete

### 11.6 Treatment Packages Management (Section 35)

#### Packages Page
- [ ] 4 stat cards: best-selling area, least sold, most sold, total sold
- [ ] "הוספת חבילה חדשה +" button
- [ ] Gradient card grid (4 columns):
  - Gradient bg (4 theme options), glassmorphism icon, title, description
  - 3-dots menu per card: edit / delete

#### Create / Edit Package Modal
- [ ] Fields: שם החבילה, תיאור החבילה, כמות טיפולים בחבילה, מחיר לטיפול
- [ ] Background image upload (Supabase Storage → `package-images`)
- [ ] Gradient theme selector (4 options matching Figma colors)

### 11.7 Articles Management (Section 37)

#### Articles List (Admin)
- [ ] Card grid — same layout as public view but with admin controls
- [ ] 3-dots per card: edit / delete
- [ ] "העלאת מאמר חדש +" button

#### Create / Edit Article Modal
- [ ] Fields: סוג קטגוריה (dropdown), שיוך למטפל (dropdown — links article to a practitioner), background image upload, שם המאמר, תוכן המאמר (large textarea h-576px)
- [ ] Modal width: 636px, rounded-20px (wider than standard)
- [ ] Submit → create/update article, status = APPROVED (admin auto-approved)

#### Delete Article
- [ ] 3-dots → "מחיקת מאמר" (red) → confirm dialog

### 11.8 Notifications Panel (Section 31)
- [ ] Bell icon in AdminHeader — unread count badge
- [ ] Slide-in panel from right (or dropdown):
  - "התראות" title + X close button
  - Scrollable notification list
  - Two notification types:
    - Specialty add request: avatar + name + "רוצה להוסיף תחום הסמכה חדש" + green "צפייה בפרטים" button
    - New practitioner registration: avatar + name + "נרשמה למערכת" + green "צפייה בפרופיל" button
  - Horizontal dividers between rows
- [ ] Mark as read on open
- [ ] Supabase Realtime subscription for live updates

### 11.9 Admin Profile & Settings (Section 36)
- [ ] Header user dropdown: "אזור אישי" (→ settings page) + "התנתקות" (red, → sign out)
- [ ] Settings page — two-column layout:
  - Left: avatar upload (144px, gray bg, upload arrow icon) + full name + email
  - Right: "שינוי סיסמה" section (current password, new password, confirm) + "החלפת סיסמה" teal link
- [ ] Footer buttons: "שמירת שינויים" (green) + "ביטול שינויים" (gray)
- [ ] Avatar upload → Supabase Storage `avatars`
- [ ] Password change → Supabase Auth `updateUser`

---

## Phase 12 — Notifications & Background Jobs

### 12.1 Email Notifications (Resend)
Create one React Email template per event:
- [ ] Patient: email verification
- [ ] Patient: booking confirmed (with Google Calendar link + Waze link)
- [ ] Patient: booking declined
- [ ] Patient: booking canceled + credit added
- [ ] Patient: satisfaction survey (2h after QR scan)
- [ ] Patient: refund status update
- [ ] Practitioner: new booking request
- [ ] Practitioner: profile under review (post-submit)
- [ ] Practitioner: profile approved (welcome email)
- [ ] Practitioner: profile rejected (with reason)
- [ ] Practitioner: new review pending moderation
- [ ] Admin: new practitioner submission
- [ ] Admin: new review submitted

### 12.2 In-App Notifications (Supabase Realtime)
- [ ] `notifications` table with RLS (users see only their own)
- [ ] Realtime subscription in `UserProvider` — updates unread count
- [ ] Bell icon badge in header
- [ ] Notification list panel (admin: Section 31 style; patient/practitioner: similar)
- [ ] Mark all as read action

### 12.3 Background Jobs (Inngest)
- [ ] Survey trigger: `booking.completed` event → wait 2 hours → send survey email
- [ ] Practitioner approval reminder: if practitioner submission is PENDING for >3 days → notify admin
- [ ] Future: scheduled payout reminders, credit expiry warnings

---

## Phase 13 — Payment Integration (Grow)

> Blocked until Grow API credentials + sandbox + docs are available (see `TECHNICAL_ARCHITECTURE.md` Section 10.1).

### 13.1 Payment Setup
- [ ] Integrate Grow SDK / API
- [ ] Build mock payment layer first (stub that always returns success)
- [ ] Swap mock → real on credential delivery

### 13.2 Charge at Booking
- [ ] On booking confirmation (practitioner approval): charge `price_at_booking` via Grow
- [ ] Store `payment_reference` on `bookings` row
- [ ] Handle Grow webhook: confirm charge success → update `payment_status = charged`
- [ ] Handle charge failure → notify patient, cancel booking

### 13.3 Refunds & Credits
- [ ] On cancellation >24h: reverse charge via Grow OR store as credit
- [ ] Patient requests refund → admin reviews → approve = Grow refund API call
- [ ] Update `credits` record accordingly

---

## Phase 14 — Third-Party Integrations

### 14.1 Google OAuth
- [ ] Configure in Supabase Auth dashboard (GCP client ID/secret)
- [ ] Test Google Sign-In flow end-to-end

### 14.2 Google Calendar
- [ ] Generate `add to Google Calendar` deep-link URL per booking (event title, date/time, practitioner location)
- [ ] Display as button in booking confirmation + My Treatments booking detail

### 14.3 Waze
- [ ] Generate Waze deep-link from practitioner address/coordinates
- [ ] Display in booking detail page

### 14.4 Google Analytics 4
- [ ] Install `@next/third-parties` GA4 component
- [ ] Add GA4 Measurement ID to root layout
- [ ] Track key events: registration, booking completed, article read, package view

---

## Phase 15 — Non-Functional Requirements

### 15.1 Rate Limiting (Upstash)
- [ ] Install `@upstash/ratelimit`
- [ ] Apply to: `/api/auth/*`, booking creation endpoint, contact form
- [ ] Return 429 with Hebrew error message

### 15.2 SEO
- [ ] `generateMetadata` per route for practitioner profiles and articles
- [ ] `robots.txt` — index public, block auth/admin
- [ ] `sitemap.xml` — generated from approved practitioners + articles
- [ ] OpenGraph image per practitioner/article

### 15.3 Accessibility
- [ ] `lang="he"` on `<html>`, `dir="rtl"` throughout
- [ ] All interactive elements keyboard-navigable
- [ ] ARIA labels on icon-only buttons (3-dots, close X, bell)
- [ ] Sufficient color contrast for all text (test against `#9F9F9F` and faded placeholders)
- [ ] Focus management in modals (trap focus, restore on close)

### 15.4 Mobile Responsiveness
- [ ] All public pages: mobile-first, test at 375px, 768px, 1440px
- [ ] Admin panel: minimum 1024px (admin is desktop-first per PRD)
- [ ] Header: hamburger menu for public nav on mobile
- [ ] Booking calendar: touch-friendly slot selection
- [ ] Modals: full-screen on mobile

### 15.5 Performance
- [ ] All public SSR/SSG pages: Core Web Vitals green
- [ ] Lazy-load images below fold (`loading="lazy"`)
- [ ] Next.js `<Image>` for all images with correct sizing
- [ ] No `router.refresh()` — all mutations go through TanStack Query cache (per architecture rules)
- [ ] Optimistic UI on all patient-facing mutations (favorites, booking, cancel)

### 15.6 Error Handling
- [ ] Global error boundary (`error.tsx` per route segment)
- [ ] Not found pages (`not-found.tsx`)
- [ ] Loading skeletons (`loading.tsx` per route segment)
- [ ] All server actions return typed `{ success, error }` — never throw to client
- [ ] All forms show field-level + global error messages in Hebrew

---

## Phase 16 — QA & Pre-Launch Checklist

### 16.1 Flows to Test End-to-End
- [ ] Patient: register → onboard → find practitioner → book → QR scan → review
- [ ] Practitioner: register → onboard → get approved → set availability → approve booking → view dashboard
- [ ] Admin: log in → approve practitioner → manage categories → manage packages → manage articles → handle notification
- [ ] Cancellation: patient cancels >24h → credit added → patient requests refund → admin approves
- [ ] Admin profile: change password + upload avatar

### 16.2 Edge Cases to Validate
- [ ] Booking conflict (slot already taken between selection and confirm)
- [ ] Cancellation <24h — UI correctly blocks and explains
- [ ] Practitioner rejects booking — patient notified, no charge
- [ ] Admin rejects practitioner — rejection email sent with reason
- [ ] Patient tries to submit review twice for same booking
- [ ] Practitioner tries to book another practitioner (should be blocked by role)

### 16.3 Content Dependencies (still MISSING — coordinate with client)
- [ ] Personalized questionnaire content (questions per gender)
- [ ] Practitioner agreement legal text
- [ ] Terms of Service text
- [ ] Privacy Policy text
- [ ] Email notification copy for each event
- [ ] Heali logo + branding assets (SVG)
- [ ] City / Area seed data (all Israeli cities organized by area)
- [ ] Initial treatment domains and specialties seed data

---

## Open Decisions Still Pending (from PRD / Architecture)

These are flagged and must be resolved before the relevant feature can be finalized:

| Decision | Blocks |
|---|---|
| Questionnaire content (male/female questions) | Phase 3.7 |
| Practitioner agreement legal text | Phase 4.8 |
| Terms of Service + Privacy Policy | Phase 2.3 |
| Email approval flow: email link vs dashboard-only | Phase 6.2 + Phase 7.2 |
| Article-to-practitioner matching logic | Phase 5.2 + Phase 9.2 |
| Grow API credentials + sandbox | Phase 12 |
| GCP OAuth credentials | Phase 14.1 |
| GA4 Measurement ID | Phase 14.4 |
| Cancellation credit expiry policy | Phase 6.4 |
| Phase 2 matching: run on every login or first time only | Phase 5.2 |
| SMS/WhatsApp notification scope | Phase 11 |
