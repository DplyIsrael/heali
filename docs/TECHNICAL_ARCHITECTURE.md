# Heali — Technical Architecture Document

**Version:** 2.2
**Status:** Draft (Figma review complete)
**Last Updated:** 2026-03-05
**Sources:** PRD, Technical Feasibility Doc (agency), internal review

---

## 1. Document Purpose

This document defines the technical architecture for the Heali platform. All entries are sourced from the PRD, the agency feasibility document, or explicitly marked as recommendations. No undocumented assumptions are made.

---

## 2. Confirmed Tech Stack

### 2.1 Frontend

| Layer | Technology | Cost | Source |
|---|---|---|---|
| **Framework** | Next.js 15 (React) | Free | Feasibility doc (upgraded from 14+) |
| **Language** | TypeScript | Free | Feasibility doc |
| **UI Components** | Tailwind CSS + shadcn/ui | Free | Feasibility doc |
| **Form Handling** | React Hook Form + Zod | Free | Feasibility doc |
| **Server State Management** | TanStack Query (React Query) v5 | Free | Recommendation — see Section 12 |
| **Internationalization** | next-intl | Free | Feasibility doc |
| **Image Optimization** | Next.js `<Image>` component | Free | Recommendation — built-in, no extra service needed |

### 2.2 Backend

| Layer | Technology | Cost | Source |
|---|---|---|---|
| **Runtime** | Node.js | Free | User confirmed |
| **API Layer** | Next.js API Routes + Server Actions | Free | Feasibility doc (simplified — see note below) |
| **Database** | Supabase (PostgreSQL) | Free tier available | User confirmed |
| **ORM** | Drizzle ORM | Free | Recommendation (replacing Prisma — see note below) |
| **Authentication** | Supabase Auth | Free tier available | Feasibility doc |
| **File Storage** | Supabase Storage | Free tier available | Feasibility doc |
| **Real-time** | Supabase Realtime | Free tier available | Feasibility doc |
| **Rate Limiting** | Upstash Ratelimit | Free tier available | Recommendation — needed for auth and booking endpoints |

### 2.3 Cloud & Services

| Layer | Technology | Cost | Source |
|---|---|---|---|
| **Hosting** | Vercel | Free tier available | Feasibility doc |
| **Database & Auth** | Supabase | Free tier available | Feasibility doc |
| **Payment** | Grow Payment App | TBD | PRD |
| **Email Notifications** | Resend | Free (100 emails/day) | Feasibility doc |
| **SMS** | Plivo | Paid (pay per SMS) | Feasibility doc |
| **WhatsApp** | Meta / Green API | Paid | Feasibility doc |
| **In-App Notifications** | Supabase Realtime | Free tier available | Feasibility doc |
| **Analytics** | Google Analytics 4 | Free | PRD |
| **Background Jobs** | Inngest | Free tier available | Feasibility doc (picked over Trigger.dev — better Vercel integration) |

### 2.4 Key Stack Changes from Feasibility Doc

**Prisma → Drizzle ORM**
- Drizzle has significantly faster cold starts on Vercel serverless (Prisma is known to be slow here)
- Better TypeScript type inference — types are derived directly from schema, no code generation step
- More native PostgreSQL support — closer to writing actual SQL
- Lighter bundle size
- Free, open source

**tRPC → Server Actions (hybrid)**
- Next.js 15 Server Actions handle mutations cleanly without tRPC boilerplate
- For complex client-side data fetching, standard API routes + React Query (TanStack Query) can be used
- Removes a dependency and reduces learning curve
- If tRPC is preferred later, it can be added — but start simple

**Next.js 14+ → Next.js 15**
- Stable since late 2024, well-proven by now
- Better Server Components, improved caching model, Turbopack stable

**Inngest chosen over Trigger.dev**
- Better DX and simpler setup
- Native Vercel integration
- Handles the delayed review survey (~2h after QR scan) and other scheduled tasks

**Added: Upstash Ratelimit**
- Free tier covers development and moderate production traffic
- Essential for auth endpoints, booking creation, and public API routes
- Serverless-native, works perfectly with Vercel

**Added: TanStack Query (React Query) v5**
- All client-side data fetching and mutations go through TanStack Query
- Enables optimistic updates, cache invalidation, and surgical UI updates
- Eliminates the need for `router.refresh()` after mutations
- Free, open source
- See Section 12 for full architectural rules

---

## 3. Users and Roles (from PRD)

| Role | Description |
|---|---|
| **Patient** | Registers, completes onboarding, browses/books practitioners, manages bookings, scans QR for attendance, submits reviews, manages wallet credits |
| **Practitioner** | Registers, completes multi-step onboarding with credential upload, submits for verification, manages availability and pricing, approves bookings, views dashboard |
| **Admin** | Approves practitioners, moderates reviews and articles, manages refunds, configures domains/specialties, views platform analytics |

### 3.1 Navigation per Role (from Feasibility Doc)

**Patient:** Home / Discovery, Practitioner Profile, My Bookings, My Wallet, Articles, Profile, Notifications

**Practitioner:** Dashboard, My Bookings, My Profile, My Articles, Availability, Notifications

**Admin (Figma-confirmed nav, RTL order):** דשבורד (Dashboard), טיפולים (Treatments), מטפלים (Practitioners), מטופלים (Patients), קטגוריות (Categories), חבילות טיפול (Treatment Packages), מאמרים (Articles)

---

## 4. Authentication (from PRD + Feasibility Doc)

| Feature | Details | Source |
|---|---|---|
| Email + password | Registration and login | PRD |
| Google Sign-In | Via Supabase Auth (Google OAuth) | PRD + Feasibility |
| Email verification | Mandatory before accessing core features | PRD |
| Forgot password | Email-based reset flow | PRD |
| Legal consent | Terms + Privacy checkboxes, timestamp stored | PRD |
| Session management | JWT-based via Supabase Auth with auto-refresh | Feasibility doc |
| Role selection | Patient or Practitioner at signup | Feasibility doc |

---

## 5. Data Models (from PRD + Feasibility Doc)

### 5.1 Patient

| Field | Type | Required | Source |
|---|---|---|---|
| id | UUID | Auto | Feasibility |
| email | String | Yes | PRD |
| full_name | String | Yes | PRD |
| date_of_birth | Date | Yes | PRD |
| gender | Enum (male/female/other) | Yes | PRD |
| city | String | Yes | PRD |
| area | String | Yes | PRD |
| phone | String | Yes | PRD |
| profile_photo_url | String | No | PRD |
| questionnaire_responses | JSONB | No | Feasibility |
| terms_accepted_at | Timestamp | Yes | Feasibility |
| onboarding_completed | Boolean | Yes | Feasibility |
| created_at / updated_at | Timestamp | Auto | Feasibility |

### 5.2 Practitioner Profile

| Field | Type | Required | Source |
|---|---|---|---|
| id | UUID | Auto | Feasibility |
| user_id | UUID | Yes | Feasibility |
| treatment_domains | UUID[] | Yes | PRD |
| specialties | UUID[] | Yes | PRD |
| price | Decimal | Yes | PRD |
| certificates | JSONB | Yes | PRD |
| languages | String[] | Yes | PRD |
| bio | Text | Yes | PRD |
| verification_status | Enum | Yes | PRD |
| rejection_reason | Text | No | Feasibility |
| qr_code_url | String | No | PRD |
| city / area | String | Yes | PRD |
| average_rating | Decimal | Computed | Feasibility |
| total_reviews | Integer | Computed | Feasibility |
| is_publicly_visible | Boolean | Default false | Feasibility |
| created_at / updated_at | Timestamp | Auto | Feasibility |

### 5.3 Booking

| Field | Type | Required | Source |
|---|---|---|---|
| id | UUID | Auto | Feasibility |
| patient_id | UUID | Yes | PRD |
| practitioner_id | UUID | Yes | PRD |
| domain_id | UUID | Yes | Feasibility |
| scheduled_date | Date | Yes | PRD |
| scheduled_time | Time | Yes | PRD |
| status | Enum (requested/confirmed/completed/declined/canceled) | Yes | PRD |
| price_at_booking | Decimal | Yes | Feasibility |
| payment_status | Enum (pending/charged/refunded/credited) | Yes | Feasibility |
| payment_reference | String | No | Feasibility |
| qr_scanned_at | Timestamp | No | Feasibility |
| cancellation_reason | Text | No | PRD |
| created_at / updated_at | Timestamp | Auto | Feasibility |

### 5.4 Additional Entities (from PRD)

| Entity | Description |
|---|---|
| TreatmentDomain | Top-level categories (e.g., Acupuncture, Reflexology). Admin-managed |
| Specialty | Sub-categories under each domain. One-to-many relationship |
| Review | 1-5 star rating, free-text comment, one per booking, admin-moderated |
| Article | Title, content, author (practitioner or admin), category_id, practitioner_id, background_image_url, approval status. Card-grid display with category + date tags |
| TreatmentPackage | Name, description, number of treatments, price per treatment, background_image_url, gradient theme. Admin-managed. Displayed as gradient cards (not table) |
| Category | Name, points_amount (נקודות), field_of_knowledge (תחום דעת). Admin-managed. Linked to specialties/domains. Supports dynamic field addition |
| Credit/Refund | Patient wallet credit from cancellations |
| Favorites | Patient ↔ Practitioner relationship |
| Areas / Cities | Geographic hierarchy for matching |
| Notifications | System notifications across channels |

### 5.5 Key Status Enums (from PRD)

```
practitioner_verification_status:
  DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED | REJECTED

booking_status:
  REQUESTED → PENDING_PRACTITIONER_APPROVAL → CONFIRMED → COMPLETED | CANCELED | DECLINED

review_status:
  SUBMITTED → APPROVED | REJECTED | REMOVED

article_status:
  DRAFT → SUBMITTED → APPROVED | REJECTED
```

### 5.6 Key Relationships (from PRD)

- Patients can favorite practitioners
- Patients book treatments with practitioners
- Patients review practitioners (after completed treatments, admin-moderated)
- Practitioners belong to treatment domains and specialties
- Practitioners create articles (admin approval required)
- Areas contain cities (used for geographic matching)
- Credits are linked to patients (from cancellations)
- Domains contain specialties (one-to-many)

---

## 6. Core Business Logic (from PRD)

### 6.1 Practitioner Matching

- Runs at end of patient onboarding
- Shows 3-4 matched practitioners + "Other" option
- Matching parameters: rating, at least one matching treatment domain, gender, geographic location (area/city)
- Phase 2 decision: whether matching runs on every login or first registration only

### 6.2 Booking Lifecycle

1. Practitioner sets recurring weekly schedule with time slots; can block specific dates (Feasibility doc)
2. Patient selects practitioner, date, and time from available slots
3. Status: Requested → "Sent to practitioner for approval"
4. Practitioner approves or declines from dashboard
5. If approved: payment charged via Grow, confirmation email + Google Calendar link sent to patient
6. If declined: patient notified, no charge
7. Practitioner approval via email link — implementation TBD

### 6.3 Treatment Attendance (QR)

- Unique QR code generated per practitioner upon approval
- Patient scans QR code via mobile camera/browser to confirm attendance
- Fallback: manual code entry for devices with camera issues (Feasibility doc)
- Booking marked as Completed with qr_scanned_at timestamp
- ~2 hours after scan: satisfaction survey link sent to patient (via Inngest background job)
- Survey results linked to practitioner profile (subject to admin moderation)

### 6.4 Cancellation & Credits

- Payment charged at booking time
- Cancellation allowed only if >24 hours before scheduled time
- Patient selects cancellation reason, confirms
- Paid amount converted to wallet credit (not automatic cash refund)
- Patient can apply credits toward future bookings
- Patient can request cash refund — admin approves or rejects
- <24h before treatment: cancellation not allowed

### 6.5 Dynamic Pricing

- Practitioner can change pricing at any time
- Changes only affect future bookings, not already booked/closed treatments
- price_at_booking field locks the price at time of booking

### 6.6 Reviews

- Triggered ~2 hours after QR scan via background job
- 1-5 star rating, free-text comment, optional anonymity toggle (Feasibility doc)
- One review per booking
- Admin moderation required before display
- Display reviewer's first name only
- Admin can approve, reject, or remove reviews
- Practitioner average_rating and total_reviews updated on approval

### 6.7 Profile Edit Rules

**Patient (post-onboarding):**
- Only city/area editable by patient
- Email/phone changes handled offline by admin

**Practitioner (post-approval, Phase 1):**
- Only price can be updated directly
- All other changes forwarded to admin

**Practitioner (during review / pre-approval):**
- All fields editable except email

---

## 7. Feature Scope Summary (from PRD + Feasibility Doc)

### 7.1 Patient Onboarding (6 Steps)

| Step | Details |
|---|---|
| 1 — Welcome | Intro screen with Heali value proposition |
| 2 — About | Brief explanation of onboarding |
| 3 — Personal Details | Full name, DOB, gender, city/area, phone (all required) |
| 4 — Photo | Optional profile photo upload |
| 5 — Confirmation | Summary with edit option |
| 6 — Questionnaire | Personalized matching questionnaire (content MISSING) |
| Post-onboarding | 3-4 recommended practitioners based on city, domain, gender, rating |

### 7.2 Practitioner Onboarding (8 Steps)

| Step | Details |
|---|---|
| 1 — Domains | Select from admin-configured treatment domains |
| 2 — Specialties | Select specialties filtered by chosen domains |
| 3 — Pricing | Set price per treatment in ILS |
| 4 — Certificates | Upload credential documents (PDF, JPG, PNG) |
| 5 — Languages | Select languages for treatments |
| 6 — Bio | Free-text biography |
| 7 — Agreement | Digital signature on practitioner agreement (text TBD) |
| 8 — Submit | Final review and submit for admin verification |

Draft save/resume supported during onboarding (Feasibility doc).

### 7.3 Discovery & Search

| Feature | Details | Source |
|---|---|---|
| Listing | Paginated grid of approved practitioners | Feasibility |
| Search | Free-text across names, domains, specialties, city | Feasibility |
| Filters | Domain, specialty, city/area, gender, price range, rating, language | Feasibility |
| Sorting | Rating, price (low/high), newest | Feasibility |
| Profile page | SSR for SEO | Feasibility |

### 7.4 Practitioner Dashboard KPIs (from PRD)

- Total treatments
- Upcoming treatments
- Completed treatments: paid / pending payout
- Canceled treatments
- Revenue: paid / pending payout
- Filterable bookings table (by date range and patient name)
- QR code viewable and printable from dashboard
- Phase 2: trend indicators vs previous periods (TBD)

### 7.5 Article / Blog System

| Feature | Details | Source |
|---|---|---|
| Creation | Rich text editor for practitioners and admins | Feasibility |
| Moderation | Practitioner articles require admin approval; admin articles auto-approved | Feasibility |
| Display | SSR/SSG for SEO | Feasibility |
| Related practitioners | 2-3 shown at bottom of each article (matching logic TBD) | PRD |

### 7.6 Notification System

| Channel | Technology | Scope | Source |
|---|---|---|---|
| Email | Resend | Verification, booking events, approval/rejection, review survey, cancellation | Feasibility |
| In-App | Supabase Realtime | Bell icon with unread count, notification list | Feasibility |
| SMS | Plivo | Potential future channel, exact scope TBD | Feasibility |
| WhatsApp | Meta / Green API | Potential future channel, exact scope TBD | Feasibility |

### 7.7 Admin Panel (Figma-confirmed)

| Feature | Figma Status | Details |
|---|---|---|
| Dashboard | Confirmed | Stat cards: total users/practitioners/patients/treatments; new registrations, revenue |
| Practitioners Management | Confirmed | Table with status badges (approved/pending/rejected), 3-dots menu: view profile, edit, approve/reject specialty |
| Approve Specialty Modal | Confirmed | Modal: treatment area + specialization + pricing model + price + certification doc review; approve/reject buttons |
| Edit Practitioner Details | Confirmed | Full form: personal info, domains, specialties, pricing model, price, certifications |
| Patients Management | Confirmed | Table with treatment history; patient profile view |
| Categories | Confirmed | Table: name, specialties count (clickable), points, creation date; CRUD with modal |
| Treatment Packages | Confirmed | Gradient card grid (not table); stat cards: best-selling area, most/least sold, total; create/edit modal |
| Articles | Confirmed | Card grid (5-col, not table): thumbnail + title + description + author + category/date tags; create modal with category + practitioner assignment + large content textarea |
| Notifications Panel | Confirmed | Bell icon panel; two types: specialty add requests + new registrations; green CTA per notification |
| Admin Profile / Settings | Confirmed | Two-column: avatar upload + name/email (left) | password change (right); save/cancel footer |
| Review Moderation | From PRD | Approve or reject pending reviews (not yet in Figma) |
| Refund Management | From PRD | Approve or reject refund requests (not yet in Figma) |

---

## 8. Third-Party Integrations

| Service | Purpose | Status | Source |
|---|---|---|---|
| Supabase Auth | Authentication (email/password, Google OAuth, verification, reset) | Required | Feasibility |
| Supabase Storage | Certificates, profile photos, article images | Required | Feasibility |
| Supabase Realtime | In-app notifications | Required | Feasibility |
| Google OAuth | Social login via Supabase Auth | Required — needs GCP credentials | PRD |
| Google Analytics 4 | User behavior tracking | Required — needs GA4 measurement ID | PRD |
| Google Calendar | Add-to-calendar link for confirmed bookings | Required | PRD |
| Waze | Deep-link for practitioner location | Required | PRD |
| Grow Payment App | Payment processing and refunds | TBD — needs API credentials, sandbox, docs | PRD |
| Resend | Transactional email notifications | Required — needs API key | Feasibility |
| Plivo | SMS notifications | Future — exact scope TBD | Feasibility |
| Meta / Green API | WhatsApp notifications | Future — exact scope TBD | Feasibility |
| Inngest | Background jobs (delayed survey, scheduled tasks) | Required | Recommendation |
| Upstash | Rate limiting on API endpoints | Required | Recommendation |

---

## 9. Non-Functional Requirements (from PRD)

- RTL-first user experience (Hebrew default)
- Mobile-first responsive design
- Secure authentication and data storage
- Accessibility compliance (standard TBD)
- Analytics and tracking integration (Google Analytics)
- SSR/SSG for SEO on practitioner profiles and articles

---

## 10. Third-Party Access — Action Required (from Feasibility Doc)

### 10.1 Credentials Needed

| Service | What's Needed | What It Blocks |
|---|---|---|
| Grow Payment App | API credentials, sandbox account, API documentation | Payment integration, booking confirmation, refunds |
| Google Cloud Platform | OAuth credentials for Sign-In | Google authentication |
| Google Analytics | GA4 measurement ID | Analytics tracking |
| Domain & SSL | Production domain, DNS access | Production deployment, email deliverability |
| Resend | API key | Email notifications |

### 10.2 Content & Decisions Pending

| Item | Status |
|---|---|
| Personalized questionnaire (male/female) | MISSING — questions and matching logic needed |
| Practitioner agreement | MISSING — legal text needed |
| Terms of Service | MISSING — legal text needed |
| Privacy Policy | MISSING — legal text needed |
| Cancellation / credit expiry policy | Pending decision — confirm 24h rule and credit expiry |
| Email approval flow for bookings | Pending decision — email link vs dashboard-only |
| Article-to-practitioner matching logic | Pending decision — domain tags only or additional criteria |
| Notification templates | MISSING — email copy for each notification type |
| Heali logo & branding assets | MISSING |

---

## 11. Risks & Mitigations (from Feasibility Doc)

| Risk | Mitigation |
|---|---|
| Delayed Grow Payment API credentials | Build with mock payment layer; swap in real integration when credentials arrive |
| Questionnaire content not delivered | Build questionnaire UI as dynamic renderer; ship with placeholder questions |
| Practitioner agreement text delayed | Implement signing step with placeholder text |
| Terms / Privacy Policy not delivered | Use placeholder for development; blocks production launch |
| Grow API has limitations / poor docs | Prepare fallback (Stripe or PayPlus) if Grow proves unworkable |
| Hebrew RTL layout bugs | Configure RTL from project init; test continuously |
| QR scanning unreliable on some devices | Fallback: manual code entry |
| Missing logo and branding assets | Blocks polished UI |
| Google OAuth credentials delayed | Blocks Google Sign-In |

---

## 12. Performance Architecture & Data Flow Rules

> **Source:** Lessons learned from Petran project (Next.js + Supabase). These are mandatory architectural rules for Heali — not suggestions.

### 12.1 Banned Patterns

| Pattern | Why It's Banned |
|---|---|
| `router.refresh()` after mutations | Triggers full server re-render (auth check + all data re-fetch + full page reconciliation). Causes 500ms-2s delays on every CRUD operation. |
| `revalidatePath()` / `revalidateTag()` as primary update mechanism | Forces server round-trip to reflect changes. Acceptable only for cross-user cache busting, never as the primary UI update path. |
| Double invalidation (server revalidate + client refresh) | Doing the same work twice. Pick one path. |
| Full page data re-fetch to update a single item | If a user deletes one booking, don't re-fetch all bookings. Update the local cache. |
| Server Actions as the sole data mutation path without client cache updates | Server Actions are fine for the mutation itself, but the UI must update via TanStack Query cache — not by re-fetching the page. |

### 12.2 Required Patterns

#### Data Fetching: TanStack Query for All Client-Side Data

Every piece of dynamic data displayed in client components flows through TanStack Query:

```
Client Component
  → useQuery({ queryKey: ['bookings', userId], queryFn: fetchBookings })
  → TanStack Query cache
  → UI renders from cache
```

- Server Components can still fetch data for initial SSR (SEO pages like practitioner profiles, articles).
- Once hydrated on the client, TanStack Query takes over for all subsequent data operations.
- Use `queryKey` conventions consistently (e.g., `['practitioners', id]`, `['bookings', { status: 'upcoming' }]`).

#### Mutations: Optimistic Updates First, Server Sync Background

Every mutation follows this flow:

```
User Action (e.g., cancel booking)
  → useMutation fires
  → onMutate: optimistically update TanStack Query cache (UI updates instantly)
  → Server Action / API Route executes in background
  → onSuccess: confirm cache update (or adjust if server returned different data)
  → onError: roll back optimistic update, show error toast
```

This means:
- UI updates in <50ms (feels instant)
- Server processes in background
- Errors gracefully roll back

#### Cache Invalidation: Surgical, Not Nuclear

After a mutation, invalidate only the affected queries:

```
// GOOD: Invalidate only the specific query
queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })

// GOOD: Invalidate a list that changed
queryClient.invalidateQueries({ queryKey: ['bookings', { status: 'upcoming' }] })

// BAD: Invalidate everything
queryClient.invalidateQueries()

// BANNED: Force full page re-render
router.refresh()
```

#### When to Use Server Components vs Client Components

| Use Case | Component Type | Data Source |
|---|---|---|
| Practitioner profile page (public, SEO) | Server Component | Direct DB query (SSR) |
| Article page (public, SEO) | Server Component | Direct DB query (SSG/ISR) |
| Discovery page listing | Server Component for initial load, Client for filters/pagination | SSR initial → TanStack Query for interactions |
| My Bookings (authenticated) | Client Component | TanStack Query |
| Practitioner Dashboard (authenticated) | Client Component | TanStack Query |
| Admin Panel (authenticated) | Client Component | TanStack Query |
| Any form submission result | Client Component | TanStack Query mutation |

#### Supabase Client: Consistent Usage

- **Browser client** (`createBrowserClient`): Used in client components and TanStack Query `queryFn` functions.
- **Server client** (`createServerClient`): Used in Server Components, Server Actions, and API Routes.
- Never create a new Supabase client inside a loop or render cycle.
- Use `React.cache` for per-request deduplication of auth checks in Server Components.

### 12.3 Auth Performance Rules

- Cache `getUser()` per request using `React.cache` in Server Components.
- In middleware, skip `getUser()` if no auth cookie exists (fast-path for unauthenticated requests).
- Never call `supabase.auth.getUser()` redundantly in Server Actions — if the action is called from an authenticated page, pass the user ID from the cached context.
- Store user profile data in a `UserProvider` context that supports updates — so profile changes reflect in the nav/sidebar instantly without re-fetching.

### 12.4 Data Flow Summary

```
┌─────────────────────────────────────────────────────┐
│                    Client                           │
│                                                     │
│  ┌─────────────┐    ┌──────────────────────────┐   │
│  │   Server     │    │    Client Components     │   │
│  │  Components  │    │                          │   │
│  │  (SSR/SSG)   │    │  useQuery() ──→ Cache    │   │
│  │  Initial     │    │  useMutation() ──→ Cache │   │
│  │  Page Load   │    │  Optimistic UI updates   │   │
│  └──────┬───────┘    └────────┬─────────────────┘   │
│         │                     │                      │
│         │ hydrate             │ queryFn / mutationFn │
│         ▼                     ▼                      │
│  ┌─────────────────────────────────────────────┐    │
│  │         TanStack Query Cache                │    │
│  │  (single source of truth for server state)  │    │
│  └──────────────────┬──────────────────────────┘    │
└─────────────────────┼───────────────────────────────┘
                      │ API calls
┌─────────────────────▼───────────────────────────────┐
│              Server Actions / API Routes             │
│          (Drizzle ORM → Supabase PostgreSQL)         │
└─────────────────────────────────────────────────────┘
```

---

*Figma review complete (2026-03-05). Remaining open items: Review Moderation and Refund Management screens not yet provided in Figma. Pending decisions listed in Section 10.2 still apply.*
