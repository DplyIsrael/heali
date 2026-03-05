# Heali — Build Progress

**Last updated:** 2026-03-05
**Repo:** https://github.com/ToolsLowcodeFlow/heali.git

---

## Overall Status

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Foundation & Project Setup | **Complete** |
| Phase 1 | Landing Page | **~75% complete** |
| Phase 2 | Authentication | Not started |
| Phase 3–15 | All remaining features | Not started |

---

## Phase 0 — Foundation & Project Setup

**Status: Complete**

### What was done

- **Next.js 15** project with TypeScript, App Router, Tailwind CSS v4
- `dir="rtl"` set permanently on `<html>` — Hebrew RTL layout everywhere, never toggled
- **Design tokens** configured in `tailwind.config.ts`:
  - Primary teal: `#21544E`
  - Accent green: `#7DE4A8`
  - Input border: `#CDDBDB`
  - Background: `#FFFFFF`
  - Destructive: `#E70202`
  - Muted: `#9F9F9F`
- **Fonts** registered via `@font-face` in `globals.css`:
  - Discovery Fs (Light / Regular / Medium / Demi-bold / Bold) — body and headings
  - PloniMLv2AAA-Bold — logo only
  - Poppins — buttons and input placeholders
- **next-intl** installed and configured for Hebrew i18n (`messages/he.json`)
- **Supabase** client/server/middleware files created (`lib/supabase/`)
- **Drizzle ORM** schema defined across 13 files in `db/schema/`:
  - `users`, `practitioners`, `patients`, `bookings`, `reviews`, `articles`
  - `packages`, `taxonomy` (domains, specialties, categories)
  - `geography` (areas, cities), `notifications`, `social` (favorites, credits)
  - `availability` (weekly schedule + exception blocks)
  - All status enums: practitioner, booking, review, article
- **shadcn/ui** component library initialized (`components.json`)
  - Primitive components added: Button, Input, Avatar, Badge, Dialog, Select, Table, Skeleton, Accordion, Sonner, Separator, Pagination, Textarea, Dropdown Menu, Alert Dialog
- **TanStack Query v5** provider wired into root layout (`components/providers.tsx`)
- **Middleware** configured for Supabase session refresh + next-intl locale routing
- **Shared components** scaffolded:
  - `Logo`, `PublicHeader`, `PublicFooter`
  - `EmptyState`, `ConfirmDialog`, `StatusBadge`
  - `AdminHeader`, `PractitionerHeader` (shells)

---

## Phase 1 — Landing Page

**Status: ~75% complete**

All sections are built with static/mock data. The hero and header are pixel-accurate to Figma. Remaining sections need a Figma comparison pass before Phase 1 is declared done.

### Sections built

#### Header (`components/shared/public-header.tsx`) — Figma-accurate
- Sticky, white background, no border
- Logo + nav links on the RIGHT (RTL-first DOM order)
- Auth buttons on the LEFT: "התחברות" (teal green) + "הרשמה" (light gray), both `125×42px` rounded-full
- Nav: 18px font, 50px gap between links
- Figma node verified: `1:43`

#### Hero (`app/(public)/_sections/hero.tsx`) — Figma-accurate
- Rounded card (`rounded-[20px]`) with `px-[50px]` outer padding — matches Figma card layout
- Full background park photo (`hero-bg.jpg`) from Figma
- Girl cutout image (`hero-girl-hq.png`) — `811×811px`, positioned `left-[-41px] top-[131px]`
- Dark gradient overlay on right 702px (no blur bleed — `blur()` removed)
- Headline 64px, light/bold mix, right-aligned
- Glassmorphism search box: `rgba(255,255,255,0.31)` container, green-border inner input, gradient CTA button with magicpen SVG icon
- Popular category pills: פסיכולוגיה, יוגה, מדיטציה, דיקור סיני — link to `/discovery`

#### Domains Carousel (`app/(public)/_sections/domains-carousel.tsx`) — Figma-accurate
- 4-column grid of domain cards, paginated with ChevronLeft/Right
- Each card: 8 domains, 4 visible per page
- Default state: white card, `#cddbdb` border, gradient background area, checkerboard squares
- Hover state: teal gradient card (`linear-gradient(195deg,#21544e,#3a8a7a)`), adapted checkerboard, white text
- Checkerboard: two offset rows of 37.274px squares at exact Figma coordinates
- Bottom pill: "צפייה בכל המטפלים" + arrow SVG icon — RTL-correct (text right, icon left), `w-fit`
- Section header: centered title + subtitle + arrow nav buttons

#### Practitioners Grid (`app/(public)/_sections/practitioners-grid.tsx`)
- Section title (right) + filter link (left) — RTL-correct
- Static mock practitioner cards
- Needs Figma comparison pass

#### Testimonials (`app/(public)/_sections/testimonials.tsx`)
- Static quote cards with reviewer name + star rating
- Needs Figma comparison pass

#### Packages Teaser (`app/(public)/_sections/packages-teaser.tsx`)
- 3 gradient cards: teal, green, purple
- Each card: icon, name, description, price/treatment, treatment count, hover scale
- "לכל החבילות" CTA link — RTL-correct

#### FAQ (`app/(public)/_sections/faq.tsx`)
- Accordion-style Q&A using shadcn Accordion
- Needs Figma comparison pass

#### Help Banner (`app/(public)/_sections/help-banner.tsx`)
- Full-width teal background
- "צריכים עזרה? אנחנו כאן בשבילך תמיד." headline + "צור איתנו קשר" button
- RTL-correct (text right, button left)

#### Newsletter (`app/(public)/_sections/newsletter.tsx`)
- Email input + submit button, client component with state
- RTL-correct (input right, button left)
- Wired to Resend in Phase 12

#### Footer (`components/shared/public-footer.tsx`)
- Dark `#08190C` background
- 3 columns: categories list, links list, logo + tagline
- Social icons: YouTube, Instagram, TikTok, Facebook
- Bottom row: נגישות | פרטיות | תנאי שימוש | © 2025 Heali

### Sections not yet built

- **Articles Teaser** (1.8) — 3 article cards, thumbnail + title + category tag, "לכל המאמרים" CTA
- **How It Works** (1.4) — 3-step numbered flow with icons

---

## Assets in `public/images/`

| File | Source | Usage |
|---|---|---|
| `hero-bg.jpg` | Figma export | Hero background park photo |
| `hero-girl-hq.png` | Client-provided | Hero girl cutout (high quality) |
| `hero-magicpen.svg` | Figma export | Search CTA button icon |
| `domain-arrow.svg` | Figma export | Domain card pill button icon |

---

## Key Decisions Made

| Decision | Rationale |
|---|---|
| Background color `#ffffff` (not `#fafafa`) | Figma sections are white; `#fafafa` gave a grayish tint |
| Removed `blur()` from hero gradient overlay | CSS `filter: blur()` bleeds beyond div boundaries, making background photo blurry |
| `w-fit` on domain pill | Fixed width was too narrow for Hebrew text |
| Physical CSS (`right:`, `left:`) for Figma pixel values | Figma pixel coordinates are physical; logical CSS would flip them |
| No `router.refresh()` anywhere | Banned per architecture — all UI updates go through TanStack Query cache |

---

## Open Blockers (waiting on client)

| Blocker | Affects |
|---|---|
| Supabase project credentials | DB migrations, auth, storage |
| Grow Payment API credentials + docs | Phase 8 (payments) |
| Patient questionnaire content | Phase 3 (patient onboarding step 6) |
| Practitioner agreement legal text | Phase 4 (practitioner onboarding) |
| Terms of Service + Privacy Policy text | Footer links, registration |
| Email notification copy | Phase 12 (Resend templates) |

---

## Next Steps

1. **Finish Phase 1:** build Articles Teaser (1.8) + How It Works (1.4), Figma-compare remaining sections
2. **Start Phase 2:** Authentication — login, registration (patient + practitioner), role selection, forgot password
3. **Get Supabase credentials** from client to run DB migrations
