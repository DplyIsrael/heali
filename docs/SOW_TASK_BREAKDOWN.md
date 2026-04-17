# Heali — Statement of Work & Task Breakdown

**Version:** 2.0
**Last Updated:** 2026-04-17
**Progress:** Phases 0–11 implemented. Phase 12 partial (notifications UI only, no Realtime backend). Phase 13 blocked (Grow credentials). Phase 14 partial (Google OAuth not wired). Phases 15–16 partially addressed.
**Stack:** Next.js 16 / TypeScript / Tailwind + shadcn/ui / Supabase / Drizzle ORM / TanStack Query v5 / next-intl / Inngest / Upstash / Resend
**UI Reference:** `UI_UX_FLOW.md` (37 sections, all Figma screens)
**Requirements:** `Heali_DEV_PRD_EN.md`, `TECHNICAL_ARCHITECTURE.md`

---

## How This Document Works

Each phase is a logical build unit. Within each phase, tasks are ordered the way I'd actually do them — dependencies first. Phases are not fully sequential; some can overlap once their prerequisites are done (e.g., Admin work can start after Phase 0 even if patient flows are still in progress).

---

## Phase 0 — Foundation & Project Setup ✅

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

### 0.4 Supabase Setup ✅
- [x] Install `@supabase/supabase-js` + `@supabase/ssr`
- [x] Create `lib/supabase/client.ts` (browser client)
- [x] Create `lib/supabase/server.ts` (server client using cookies)
- [x] Create `lib/supabase/middleware.ts` (session refresh)
- [x] Create Supabase project
- [x] Configure Supabase Auth: enable email
- [x] Configure Supabase Storage buckets: `avatars`, `certificates`, `article-images`, `package-images`
- [ ] Set bucket RLS policies (public read for images, authenticated write) — ⚠️ currently bypassed with admin client
- [ ] Configure Google OAuth in Supabase Auth dashboard — ⚠️ blocked on GCP credentials

### 0.5 Database Schema (Drizzle ORM) ✅
- [x] Install `drizzle-orm`, `drizzle-kit`, `pg` driver
- [x] Create `db/schema/` folder — one file per entity
- [x] Define all tables:
  - [x] `users` — extends Supabase auth.users (patient/practitioner role, onboarding_completed)
  - [x] `practitioner_profiles` — all fields including clinicCities array, price with default
  - [x] `practitioner_documents` — certificates, file URLs, approval status
  - [x] `treatment_domains` — name, is_active
  - [x] `specialties` — name, domain_id (FK), is_active
  - [x] `categories` — name, points_amount, field_of_knowledge
  - [x] `bookings` — all fields including price_at_booking, qr_scanned_at
  - [x] `reviews` — booking_id, rating, comment, status enum, reviewer_first_name
  - [x] `articles` — title, content, author_id, practitioner_id, category_id, background_image_url, status enum
  - [x] `treatment_packages` — name, description, num_treatments, price, background_image_url, gradient_theme
  - [x] `favorites` — patient_id (FK), practitioner_id (FK), unique constraint
  - [x] `credits` — patient_id, amount, source_booking_id, status (active/used/refunded)
  - [x] `areas` — name; `cities` — name, area_id (FK)
  - [x] `notifications` — user_id, type, payload JSONB, read_at, created_at
  - [x] `practitioner_availability` — practitioner_id, weekday, start_time, end_time
  - [x] `availability_blocks` — practitioner_id, blocked_date (for exceptions)
- [x] Define all status enums (from `TECHNICAL_ARCHITECTURE.md` Section 5.5)
- [x] Run initial migration with `drizzle-kit push`
- [x] Create `db/index.ts` — single exported `db` instance
- [x] Seed script: admin user, sample domains, specialties, cities/areas

**⚠️ Known Schema Issues:**
- [ ] Missing CASCADE on foreign keys (articles.authorId, bookings.patientId, bookings.practitionerId, reviews.bookingId, credits.sourceBookingId) — causes FK constraint errors on user deletion
- [ ] Missing unique constraint on `practitioner_availability(practitionerId, weekday)` — allows duplicate slots
- [ ] Missing `createdAt`/`updatedAt` timestamps on `practitioner_availability` and `availability_blocks`

### 0.6 App Structure ✅
- [x] Define folder structure
- [x] Create `providers.tsx` — wraps app with: QueryClientProvider, NextIntlClientProvider, UserProvider
- [x] Create `UserProvider` context — stores user role + profile, supports optimistic updates

### 0.7 Shared UI Components ✅
- [x] `<Button>`, `<Input>`, `<Textarea>`, `<Select>`, `<Modal>`, `<Badge>`, `<Avatar>`, `<ContextMenu>`, `<Spinner>`, `<Toast>`, `<ConfirmDialog>`, `<Pagination>`, `<EmptyState>`

### 0.8 Shared Layout Components ✅
- [x] `<AdminHeader>` — with nav, user dropdown, sign out
- [x] `<AdminNav>` — 7 items: דשבורד / טיפולים / מטפלים / מטופלים / קטגוריות / חבילות טיפול / מאמרים
- [x] `<PublicHeader>` — Heali logo, main nav, login/signup
- [x] `<PatientHeader>` — authenticated patient header with nav + avatar dropdown
- [x] `<PractitionerHeader>` — authenticated practitioner header with nav + notifications bell
- [x] `<Sidebar>` / mobile drawer variant

### 0.9 Middleware & Auth Guards ✅
- [x] `middleware.ts` — session refresh on every request
- [x] Route protection: redirect unauthenticated users to `/login`
- [x] Role-based redirect: admin → `/admin`, practitioner → `/dashboard`, patient → `/`
- [x] Redirect authenticated users away from `/login` and `/register`
- [x] Incomplete onboarding redirect for practitioners

**⚠️ Known Issues:**
- [ ] No try-catch around async operations in middleware — auth failures become 500 errors
- [ ] Admin can access `/practitioner` routes (intentional?) — needs clarification

---

## Phase 1 — Landing Page ✅

### 1.1 Page Structure & Layout ✅
- [x] Full-width SSR page at `/`
- [x] `<PublicHeader>` sticky at top
- [x] `<PublicFooter>` — dark bg, categories, links, social icons
- [x] Max-width 1440px centered content

### 1.2 Hero Section ✅
- [x] **Rotating video background** (3 videos with fade transitions — replaced static image per client request)
- [x] Headline: "כל המטפלים. כל הטיפולים. במקום אחד."
- [x] Animated cycling search placeholder (SEARCH_TERMS every 2.5s)
- [x] Search CTA: "תמצאו לי טיפול"
- [x] Popular category pills

### 1.3 Treatment Domains Carousel ✅
- [x] Section title + subtitle, arrow navigation
- [x] 4-column grid of domain cards with hover teal gradient

### 1.4 How It Works Section ✅
- [x] 3-step numbered flow with icons

### 1.5 Featured Practitioners Section ✅
- [x] Practitioner card grid (data from DB)

### 1.6 Testimonials / Reviews Section ✅
- [x] Quote cards with ratings (static mock data)

### 1.7 Treatment Packages Teaser ✅
- [x] 3 gradient package cards with hover scale

### 1.8 Articles Teaser ✅
- [x] 3 article cards with category tags

### 1.9 CTA / Help Banner ✅
- [x] Full-width teal banner + contact CTA
- [x] Newsletter section with email input

### 1.10 Footer ✅
- [x] Dark bg, 3 columns, social icons, legal links

---

## Phase 2 — Authentication ✅

### 2.1 Login Screen ✅
- [x] Two-column auth layout (form left, teal panel right)
- [x] Tab switcher: "התחברות" / "הרשמה"
- [x] Email + password form (React Hook Form + Zod)
- [x] Forgot password link
- [x] Google Sign-In button (present but not functional — needs GCP credentials)
- [x] Server action: `signIn(email, password)` → returns `{ redirectTo }` for client-side navigation

### 2.2 Registration — Role Selection ✅
- [x] "מטופל" / "מטפל" pill selection at `/register`

### 2.3 Patient Registration ✅
- [x] Email + password + full name form
- [x] Server action: `signUpPatient(...)` — creates auth user + `users` row
- [x] Triggers email verification via Supabase Auth

**⚠️ Bug:** Patient registration redirects to `/onboarding` ignoring `needsVerification: true`. Patients can onboard with unverified emails.

### 2.4 Practitioner Registration ✅
- [x] Personal details: name, email, password, phone, gender (pill buttons), multi-city autocomplete (70+ Israeli cities with chips)
- [x] Resume registration flow with "התחבר והמשך הרשמה" button
- [x] Server action: `signUpPractitioner(...)` — creates auth user + `users` row + `practitioner_profiles` row
- [x] Set practitioner_status = DRAFT initially

### 2.5 Email Verification ✅
- [x] Post-registration: "בדוק את המייל שלך" screen at `/verify-email`
- [x] Resend verification email CTA
- [x] Auth callback + confirm routes handle email link redirect

### 2.6 Forgot Password ✅
- [x] Forgot password screen + email reset flow
- [x] Reset password form at `/auth/reset-password`

### 2.7 Auth Infrastructure ✅
- [x] `UserProvider` — fetches user profile, stores in context
- [x] `useUser()` hook
- [x] Middleware fast-path

**⚠️ Known Issues:**
- [ ] `signOut()` has no try-catch — if sign out fails, error crashes the app
- [ ] OAuth callback doesn't check if profile insert succeeded — can cause downstream crashes
- [ ] `signInWithGoogle` silently fails if no OAuth URL returned
- [ ] `resetPasswordForEmail` has no fallback URL if `NEXT_PUBLIC_SITE_URL` is missing

---

## Phase 3 — Patient Onboarding ✅

### 3.1–3.7 All Steps Complete ✅
- [x] Multi-step wizard (welcome → about → personal details → photo → confirmation → questionnaire)
- [x] Progress bar, back/forward navigation
- [x] Avatar upload to Supabase Storage
- [x] Questionnaire with JSONB storage
- [x] Sets `onboarding_completed = true` on completion

### 3.8 Post-Onboarding — Matched Practitioners ⚠️ Partial
- [x] Display matched practitioner cards at `/onboarding/results`
- [ ] Uses hardcoded `MOCK_PRACTITIONERS` instead of real DB query
- **⚠️ Bug:** Links to `/practitioner/{id}` instead of `/practitioners/{id}` — produces 404

---

## Phase 4 — Practitioner Onboarding ✅

### 4.1–4.9 All Steps Complete ✅
- [x] 8-step wizard: domains → specialties → pricing → certificates → languages → bio → agreement → review
- [x] Draft save on every step, resume from last step
- [x] Domain/specialty multi-select with "add custom" option (evolving lists)
- [x] Pricing model: per treatment / per hour / per Heali package
- [x] Certificate upload via API route with admin client (bypasses RLS)
- [x] Language chips, bio textarea with character counter
- [x] Agreement checkbox with timestamp
- [x] Submit → `verification_status = SUBMITTED`, creates admin notification

**⚠️ Known Issues:**
- [ ] Step 8 review shows `specialtyNames: []` — missing specialty names fetch
- [ ] Hardcoded admin UUID `00000000-0000-0000-0000-000000000001` in notification creation — **will crash since all users were deleted**

### 4.10 Post-Submission Screens ✅
- [x] Pending approval screen at `/practitioner-onboarding/pending`
- [x] Approved screen at `/practitioner-onboarding/approved`
- **⚠️ Bug:** QR download link is placeholder `"#"` — not functional

---

## Phase 5 — Public Pages & Discovery ✅

### 5.1 Discovery / Search Page ✅
- [x] Client-side discovery page at `/discovery`
- [x] Filter panel: domain, specialty, city, gender, price range, rating, language
- [x] Free-text search (debounced)
- [x] Sort options
- [x] Practitioner cards with favorites toggle
- [x] Empty state when no results

### 5.2 Practitioner Public Profile ✅
- [x] SSR page at `/practitioners/[id]` with metadata generation
- [x] Sections: hero, bio, languages, certificates, reviews, articles
- [x] Favorites toggle
- [x] "Book Treatment" CTA → `/practitioners/[id]/book`
- [x] Related articles + similar practitioners

### 5.3 Favorites System ✅
- [x] Add/remove favorite with optimistic updates via TanStack Query
- [x] Favorites page at `/favorites` with tab switcher (My Favorites / My Matches)

---

## Phase 6 — Booking System ✅

### 6.1 Practitioner Availability Setup ✅
- [x] Calendar view at `/availability` with hourly grid (8:00–20:00 × 7 days)
- [x] Week navigation with arrows
- [x] Add/remove time slots per weekday
- [x] Block specific dates
- [x] Today highlighted, blocked dates in red

### 6.2 Booking Flow ✅
- [x] Booking page at `/practitioners/[id]/book`
- [x] Multi-step: treatment type → date/time selection → summary → confirmation
- [x] Calendar shows available dates from practitioner availability
- [x] Time slot selection
- [x] Booking summary with price
- [x] Creates booking with status = REQUESTED
- [ ] Payment integration — **blocked on Grow credentials** (mock layer in place)

### 6.3 My Treatments ✅
- [x] Three tabs at `/my-treatments`: active / completed / canceled
- [x] Booking cards with status badges
- [x] Cancel treatment action
- [x] Rating modal with 5-star buttons (מעולה/טוב מאוד/ממוצע/גרוע/רע מאוד)

### 6.4 Cancellation Flow ✅
- [x] Cancel modal with reason
- [x] Credit added to patient wallet on cancellation
- [ ] >24h validation — **not enforced in UI**
- [ ] Credit wallet page / refund request — **not implemented**

### 6.5 QR Code Attendance ✅
- [x] `/scan/[code]` route — attendance confirmation with success/error states
- [x] Sets `qr_scanned_at` and status = COMPLETED

### 6.6 QR Code (Practitioner-facing) ⚠️ Partial
- [ ] QR code generation on approval — **not implemented**
- [ ] QR download on approved screen — links to `"#"` placeholder

**⚠️ Known Security Issues:**
- [ ] `approveBooking`/`declineBooking` in dashboard/actions.ts — **no ownership verification**. Any authenticated user can approve/decline any booking.

---

## Phase 7 — Practitioner Dashboard ✅

### 7.1 Dashboard KPIs ✅
- [x] Stat cards at `/dashboard`: total treatments, active, patients, revenue
- [x] Recent bookings table with approve/decline actions
- [x] Recent messages sidebar

### 7.2 Bookings Management ✅
- [x] Bookings table with status filtering
- [x] Approve/decline actions per row

### 7.3 Practitioner Profile Edit ✅
- [x] Profile page at `/profile` with Business Details / Personal Details tabs
- [x] Price editable
- [x] Bio, languages, treatment areas display
- [x] Bank details fields (currently disabled/read-only)
- [x] Password change
- [ ] Bank details editing — **not functional**

### 7.4 My Articles ✅
- [x] Article list at `/practitioner-articles` with status badges
- [x] Create article modal (category, image, title, content)
- [x] Delete article action
- [x] Submit → status = SUBMITTED

**⚠️ Known Security Issue:**
- [ ] `deleteArticle` — **no authorization check**. Any user can delete any article.

---

## Phase 8 — Reviews ✅

### 8.1 Satisfaction Survey ✅
- [x] Survey page at `/survey/[bookingId]`
- [x] 1–5 star rating + free-text comment + anonymity toggle
- [x] Submit creates review with status = SUBMITTED

### 8.2 Review Display ✅
- [x] Reviews section on practitioner public profile
- [x] Only APPROVED reviews shown
- [x] First name, stars, comment, date

---

## Phase 9 — Articles & Content ✅

### 9.1 Public Articles List ✅
- [x] Client-side page at `/articles` with search and category filter
- [x] Article card grid
- [x] Title: "מרכז הידע שלנו"

### 9.2 Article Detail Page ✅
- [x] SSR page at `/articles/[slug]` with metadata
- [x] Full article content, author info, category, date
- [x] Related practitioners widget at bottom

---

## Phase 10 — Treatment Packages ✅

### 10.1 Public Packages Page ✅
- [x] Server-rendered page at `/packages`
- [x] Gradient card grid with themes (teal, green, purple, amber)

### 10.2 Package Booking ⚠️ Partial
- [ ] Book through package → practitioner selection — **not implemented**
- [ ] Track package usage per patient — **not implemented**
- [ ] "My Packages" tab — **not implemented**

---

## Phase 11 — Admin Panel ✅

### 11.1 Admin Layout & Guard ✅
- [x] Admin layout with AdminHeader
- [x] Middleware guard: role = admin only
- [x] Admin user in seed script

### 11.2 Admin Dashboard ✅
- [x] KPI stat cards at `/admin` (practitioners, patients, pending approval, packages sold)
- [x] Recent treatments table

### 11.3 Practitioners Management ✅
- [x] Practitioners list at `/admin/practitioners` with status filter tabs + search
- [x] Practitioner detail at `/admin/practitioners/[id]` with approve/reject panel
- [x] Editable price/bio in detail view
- [x] Rejection reason field
- [ ] Edit full practitioner details — **only price/bio editable**
- [ ] Approve specialty modal (Screen 38) — **not implemented**

### 11.4 Patients Management ✅
- [x] Patients list at `/admin/patients` with search
- [x] Patient detail at `/admin/patients/[id]` with treatment history + credit balance
- [ ] Block/unblock patient — **not implemented**
- [ ] Add points / site credit modals — **not implemented**

### 11.5 Categories Management ✅
- [x] Categories list at `/admin/categories` with search
- [x] Create/edit category modal (name, points, field of knowledge)
- [x] Delete category with confirm dialog

### 11.6 Treatment Packages Management ✅
- [x] Packages page at `/admin/packages` with 4 stat cards
- [x] Create package modal with gradient themes
- [x] Delete package
- [ ] Edit existing package — **not implemented**

### 11.7 Articles Management ✅
- [x] Article card grid at `/admin/articles` with search
- [x] Create article modal (category, practitioner, image, title, content)
- [x] Admin-created articles auto-approved
- [x] Approve/reject/delete actions

### 11.8 Notifications Panel ⚠️ Partial
- [x] Bell icon with unread count badge in headers
- [x] Slide-in notification panel component
- [ ] Supabase Realtime subscription — **not wired**
- [ ] Mark as read action — **not implemented**

### 11.9 Admin Profile & Settings ✅
- [x] Settings page at `/admin/settings` with password change
- [ ] Avatar upload on settings page — **not implemented**
- [ ] Full name / email display — **not implemented**

---

## Phase 12 — Notifications & Background Jobs ⚠️ Partial

### 12.1 Email Notifications (Resend) ❌ Not Started
- [ ] All 13 email templates — **blocked on Resend API key**
- Notification inserts exist in code but no email delivery

### 12.2 In-App Notifications ⚠️ Partial
- [x] `notifications` table in DB
- [x] Bell icon + panel UI in headers
- [ ] Supabase Realtime subscription — **not implemented**
- [ ] RLS policies on notifications table — **not configured**
- [ ] Mark as read / mark all as read — **not implemented**

### 12.3 Background Jobs (Inngest) ❌ Not Started
- [ ] Survey trigger (2h after QR scan)
- [ ] Practitioner approval reminder (>3 days pending)
- [ ] Inngest setup and event definitions

---

## Phase 13 — Payment Integration (Grow) ❌ Blocked

> Blocked until Grow API credentials + sandbox + docs are available.

### 13.1 Payment Setup
- [ ] Integrate Grow SDK / API
- [x] Mock payment layer in place (booking flow works without real payment)

### 13.2 Charge at Booking
- [ ] Charge on practitioner approval
- [ ] Payment webhook handling
- [ ] Payment status tracking

### 13.3 Refunds & Credits
- [x] Credit creation on cancellation (basic)
- [ ] Grow refund API integration
- [ ] Admin refund approval workflow

---

## Phase 14 — Third-Party Integrations ⚠️ Partial

### 14.1 Google OAuth ❌ Not Wired
- [x] Button exists on login page
- [ ] GCP credentials — **blocked, needs client to provide**
- [ ] Configure in Supabase Auth dashboard

### 14.2 Google Calendar ✅
- [x] Deep-link URL generation per booking

### 14.3 Waze ✅
- [x] Deep-link generation from practitioner address

### 14.4 Google Analytics 4 ❌ Not Wired
- [ ] GA4 Measurement ID — **blocked, needs client to provide**
- [ ] Event tracking setup

---

## Phase 15 — Non-Functional Requirements ⚠️ Partial

### 15.1 Rate Limiting (Upstash) ❌ Not Verified
- [ ] Rate limiting on auth/booking/contact endpoints — **needs verification**

### 15.2 SEO ✅
- [x] `generateMetadata` on practitioner profiles and articles
- [x] `robots.txt` and `sitemap.xml` generated

### 15.3 Accessibility ⚠️ Partial
- [x] `lang="he"`, `dir="rtl"` on `<html>`
- [ ] Full keyboard navigation audit — **not done**
- [ ] ARIA labels audit — **not done**

### 15.4 Mobile Responsiveness ✅
- [x] Landing page fully responsive
- [x] Hamburger menu on mobile
- [x] Responsive modals and forms

### 15.5 Performance ⚠️ Partial
- [x] SSR/SSG on public pages
- [x] Next.js `<Image>` usage
- [x] No `router.refresh()` — TanStack Query pattern used
- [ ] Core Web Vitals audit — **not done**

### 15.6 Error Handling ⚠️ Partial
- [x] Server actions return typed `{ success, error }`
- [x] Hebrew error messages in forms
- [ ] Global `error.tsx` per route segment — **not verified**
- [ ] `not-found.tsx` pages — **not verified**
- [ ] `loading.tsx` skeletons — **not verified**

---

## Phase 16 — QA & Pre-Launch Checklist ⚠️ In Progress

### 16.1 Flows to Test End-to-End
- [ ] Patient: register → onboard → find practitioner → book → QR scan → review
- [ ] Practitioner: register → onboard → get approved → set availability → approve booking → view dashboard
- [ ] Admin: log in → approve practitioner → manage categories → manage packages → manage articles
- [ ] Cancellation: patient cancels → credit added → refund request
- [ ] Admin profile: change password

### 16.2 Edge Cases to Validate
- [ ] Booking conflict (slot already taken)
- [ ] Cancellation <24h block
- [ ] Practitioner rejects booking
- [ ] Admin rejects practitioner
- [ ] Duplicate review prevention
- [ ] Role-based route blocking

### 16.3 Content Dependencies (still MISSING — coordinate with client)
- [ ] Personalized questionnaire content (questions per gender)
- [ ] Practitioner agreement legal text
- [ ] Terms of Service text
- [ ] Privacy Policy text
- [ ] Email notification copy for each event
- [ ] City / Area seed data — ✅ Done (70+ Israeli cities seeded)
- [ ] Initial treatment domains and specialties — ✅ Done (seeded)

---

## Known Bugs (from QA audit 2026-04-17)

| # | Severity | Description | Location |
|---|---|---|---|
| 1 | **Critical** | Hardcoded admin UUID `00000000-...0001` — doesn't exist after DB wipe. Notification creation will crash. | `practitioner-onboarding/actions.ts:134`, `survey/actions.ts:129` |
| 2 | **Critical** | Onboarding results links to `/practitioner/{id}` instead of `/practitioners/{id}` → 404 | `onboarding/results/page.tsx:101` |
| 3 | **Critical** | Patient registration ignores `needsVerification` — redirects to onboarding without email verification | `register/patient/page.tsx:41-42` |
| 4 | **High** | Patient profile avatar upload uses `/api/upload-certificate` endpoint → files go to wrong bucket | `patient-profile/page.tsx:67` |
| 5 | **High** | QR download link is placeholder `"#"` | `practitioner-onboarding/approved/page.tsx:28` |
| 6 | **High** | No authorization checks on `approveBooking`, `declineBooking`, `deleteAvailabilitySlot`, `deleteArticle` — any user can call these | Multiple action files |
| 7 | **High** | `signOut()` has no error handling — can crash app | `auth/actions.ts:241-245` |
| 8 | **Medium** | OAuth callback doesn't verify profile insert succeeded | `auth/callback/route.ts:24-34` |
| 9 | **Medium** | Contact form not wired to backend — fake 1s delay | `contact/page.tsx:28` |
| 10 | **Medium** | Practitioner onboarding Step 8 shows empty specialty names | `practitioner-onboarding/page.tsx:209` |
| 11 | **Medium** | Missing CASCADE on FK deletes — causes constraint errors | Multiple schema files |
| 12 | **Low** | Bank details in practitioner profile are read-only | `profile/page.tsx` |

---

## UI/UX Spec Mismatches (vs UI_UX_FLOW.md)

| Spec Screen | Expected | Actual | Gap |
|---|---|---|---|
| Screen 2: Email OTP | 5-digit OTP input | Simple "check your email" page | No OTP — uses email link instead |
| Screen 9: Google Calendar | Calendar connection step | Not implemented | Missing entirely |
| Screen 15: Auth Home | Points widget + messages sidebar | Mock data only | No points system |
| Screen 18: Booking | 3-step modal overlay | Separate `/book` page | Different UX (functional but different) |
| Screen 24: Packages | "My Packages" tab | Not implemented | No purchased packages tracking |
| Screen 26: Notifications | Reward redemption modals | Not implemented | No points/rewards system |
| Screen 29: Calendar | Mini calendar sidebar + day view | Week grid only | Different layout |
| Screen 36: Admin Treatments | Advanced filter panel | Basic search only | Missing advanced filters |
| Screen 38: Approve Specialty | Dedicated modal | Not implemented | Missing specialty approval flow |
| Screen 40: Admin Patient | Add points / site credit modals | Not implemented | Missing admin patient actions |

---

## Messaging System ❌ Shell Only

Both messaging pages exist but are completely non-functional:
- `/patient-messages` — empty `MOCK_CONVERSATIONS = []`, no backend
- `/practitioner-messages` — same empty shell
- Supabase Realtime not connected for messaging
- No message storage, sending, or receiving implemented

---

## Open Blockers (client-dependent)

| Blocker | Blocks |
|---|---|
| Grow Payment API credentials + sandbox + docs | Phase 13 (payments) |
| Google Cloud Platform OAuth credentials | Phase 14.1 (Google sign-in) |
| GA4 Measurement ID | Phase 14.4 (analytics) |
| Resend API key | Phase 12.1 (email notifications) |
| Practitioner agreement legal text | Phase 4.8 content |
| Terms of Service + Privacy Policy text | Phase 2.3 content |
| Personalized questionnaire content | Phase 3.7 content |
| WhatsApp business number | Contact page |
