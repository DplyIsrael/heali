# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Development Rule — Always Follow the SOW

**Before writing any code or starting any feature, read `docs/SOW_TASK_BREAKDOWN.md` and follow it.**

- Work phases in order. Do not skip ahead.
- Within each phase, complete tasks in the order listed — dependencies come first.
- If a task is blocked (e.g., waiting on client content or credentials), note the blocker and move to the next unblocked task in the same phase.
- Do not start a new phase until all unblocked tasks in the current phase are done.
- The SOW is the single source of truth for what to build next.

---

## Project Status

This is a **pre-implementation** repository. All planning is complete; no application code exists yet.

Key reference documents (all in `docs/`):
- `SOW_TASK_BREAKDOWN.md` — 15-phase implementation roadmap (start here)
- `TECHNICAL_ARCHITECTURE.md` — Stack decisions, data models, banned patterns, data flow rules
- `UI_UX_FLOW.md` — All 37 Figma screens, component inventory, Hebrew/English string tables
- `Heali_DEV_PRD_EN.md` — Business requirements and feature definitions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, TypeScript, App Router |
| UI | Tailwind CSS + shadcn/ui, React Hook Form + Zod |
| State / Fetching | TanStack Query v5 |
| i18n | next-intl (Hebrew RTL default) |
| Database | Supabase (PostgreSQL) + Drizzle ORM |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Background jobs | Inngest |
| Rate limiting | Upstash Ratelimit |
| Email | Resend |
| Payments | Grow Payment App |
| Hosting | Vercel |

---

## Commands (once project is initialized)

```bash
# Development
npm run dev

# Type checking
npm run type-check   # or: tsc --noEmit

# Linting
npm run lint

# Database migrations
npx drizzle-kit push      # push schema to Supabase
npx drizzle-kit generate  # generate migration files

# Database studio
npx drizzle-kit studio
```

---

## RTL-First Rules

This is a **Hebrew-first app**. `dir="rtl"` is set permanently on `<html>`. RTL is never toggled — for future language support only the font changes, never the layout direction.

### Non-negotiable: always apply these before writing any layout code

**Flex row (the most common source of bugs):**
| What you want visually | DOM order | Tailwind |
|---|---|---|
| Element on the RIGHT | Put it **first** in DOM | natural |
| Element on the LEFT | Put it **last** in DOM | natural |
| Push content to RIGHT | `justify-start` | (start = right in RTL) |
| Push content to LEFT | `justify-end` | (end = left in RTL) |

**Flex column (cross-axis = inline axis, flipped in RTL):**
| What you want visually | Tailwind |
|---|---|
| Align children to RIGHT | `items-start` |
| Align children to LEFT | `items-end` |
| Self-align to RIGHT | `self-start` |
| Self-align to LEFT | `self-end` |

**Text:**
- Text is right-aligned by default (RTL inheritance) — `text-right` is fine to be explicit but not required
- NEVER use `text-left` for Hebrew content

**Absolute/physical positioning:**
- CSS `right`, `left`, `margin-left`, `margin-right` are **physical** — not affected by RTL
- Prefer logical Tailwind utilities: `ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `inset-inline-*`
- `right-[x]` always = visual right side regardless of `dir`

**Icons:**
- Directional icons (arrows, chevrons) must point the opposite direction in RTL
- Use `rotate-180` or `rtl:rotate-180` on arrow icons pointing right/left

**Quick mental model — always think in visual terms:**
> "I want this on the visual RIGHT → it goes FIRST in the DOM"
> "I want this on the visual LEFT → it goes LAST in the DOM"

- `<html dir="rtl" lang="he">` is set in root layout — never override it globally
- next-intl is the sole source of user-visible strings — no hardcoded Hebrew or English in JSX

---

## Design Tokens

Defined in `tailwind.config.ts`:

| Token | Value | Usage |
|---|---|---|
| `primary` | `#21544E` | Primary teal — CTAs, nav active states |
| `accent` | `#7DE4A8` | Accent green — highlights, success states |
| `border-input` | `#CDDBDB` | All form field borders |
| `background` | `#FAFAFA` | Page background |
| `destructive` | `#E70202` | Errors, delete actions |
| `muted-foreground` | `#9F9F9F` | Secondary text — use `text-muted-foreground` |
| `muted` | `#F5F5F5` | Light-gray **background** only (`bg-muted`); never `text-muted` |

Fonts:
- **Discovery Fs** (Light/Regular/Medium/Demi-bold/Bold) — body and headings, registered via `@font-face`
- **PloniMLv2AAA-Bold** — logo only
- **Poppins** — buttons and input placeholders

---

## Folder Structure

```
app/
  (public)/          ← unauthenticated pages (home, discovery, articles)
  (patient)/         ← patient-authenticated routes
  (practitioner)/    ← practitioner-authenticated routes
  (admin)/           ← admin-authenticated routes
  api/               ← API routes
components/
  ui/                ← shadcn primitives (do not edit)
  shared/            ← cross-role components
  patient/
  practitioner/
  admin/
lib/
  supabase/
    client.ts        ← browser client (createBrowserClient)
    server.ts        ← server client (createServerClient + cookies)
    middleware.ts    ← session refresh
  queries/           ← TanStack Query queryFn wrappers
  mutations/         ← TanStack Query mutation wrappers
db/
  schema/            ← one Drizzle schema file per entity
  index.ts           ← single exported `db` instance
messages/
  he.json            ← all Hebrew UI strings (next-intl)
```

---

## Mandatory Architecture Rules

These come from lessons learned on a prior Next.js + Supabase project. They are not suggestions.

### Banned Patterns

| Pattern | Why |
|---|---|
| `router.refresh()` after mutations | Triggers full server re-render — 500ms-2s delay on every action |
| `revalidatePath()` / `revalidateTag()` as primary update | Server round-trip for UI that could update locally |
| Double invalidation (server revalidate + client refresh) | Doing the same work twice |
| Full page re-fetch to update a single item | Never re-fetch all bookings because one was canceled |
| Server Actions as sole mutation path without cache update | Mutation is fine; UI update must go through TanStack Query |

### Required Patterns

**All client-side data flows through TanStack Query:**
```
useQuery({ queryKey: ['bookings', userId], queryFn: fetchBookings })
```

**All mutations use optimistic updates:**
```
onMutate  → update TanStack Query cache immediately (UI instant)
background → Server Action / API Route executes
onSuccess → confirm cache state
onError   → roll back optimistic update + toast
```

**Cache invalidation is surgical:**
```ts
// GOOD
queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })

// BAD
queryClient.invalidateQueries()

// BANNED
router.refresh()
```

**Supabase client usage:**
- `createBrowserClient` — client components and TanStack Query `queryFn`
- `createServerClient` — Server Components, Server Actions, API Routes
- Cache `getUser()` per request with `React.cache` in Server Components

**Server vs Client components:**
- SEO pages (practitioner profiles, articles) → Server Components with SSR/SSG
- Authenticated dashboards, forms, interactive lists → Client Components + TanStack Query

---

## Data Models Summary

See `TECHNICAL_ARCHITECTURE.md` Section 5 for full field lists.

**Core entities:** `users`, `practitioner_profiles`, `practitioner_documents`, `treatment_domains`, `specialties`, `categories`, `bookings`, `reviews`, `articles`, `treatment_packages`, `favorites`, `credits`, `areas`, `cities`, `notifications`, `practitioner_availability`, `availability_blocks`

**Key status enums:**
- Practitioner: `DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED | REJECTED`
- Booking: `REQUESTED → PENDING_PRACTITIONER_APPROVAL → CONFIRMED → COMPLETED | CANCELED | DECLINED`
- Review: `SUBMITTED → APPROVED | REJECTED | REMOVED`
- Article: `DRAFT → SUBMITTED → APPROVED | REJECTED`

---

## Roles

| Role | Route group | Access |
|---|---|---|
| Patient | `(patient)` | Discovery, booking, my treatments, wallet, profile |
| Practitioner | `(practitioner)` | Dashboard, bookings, profile, availability, articles |
| Admin | `(admin)` | All management panels — practitioners, patients, categories, packages, articles |

Admin nav (Figma-confirmed, RTL order): דשבורד, טיפולים, מטפלים, מטופלים, קטגוריות, חבילות טיפול, מאמרים

---

## Background Jobs (Inngest)

Two required jobs:
1. **Survey trigger** — fires ~2 hours after `qr_scanned_at` is set on a booking; sends review link to patient
2. Any future scheduled/delayed notifications

---

## Open Blockers (client-dependent)

These cannot be implemented without client input:
- Grow Payment API credentials + sandbox + docs
- Personalized questionnaire content (step 6 of patient onboarding)
- Practitioner agreement legal text
- Terms of Service and Privacy Policy text
- Email notification copy templates

Build with mocks/placeholders for all of these and swap in real content when delivered.
