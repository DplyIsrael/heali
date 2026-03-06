Hey team, here's a quick update on the Heali project:

**Phase 0 — Foundation: Done**
- Next.js 15 + TypeScript + Tailwind set up
- Design tokens, fonts (Discovery Fs, Poppins), RTL Hebrew layout configured
- Supabase client code ready (waiting on project credentials to run migrations)
- Full database schema defined with Drizzle ORM (users, bookings, reviews, articles, packages, etc.)
- shadcn/ui component library initialized
- next-intl i18n set up with Hebrew strings

**Phase 1 — Landing Page: ~75% done**
- Header: pixel-accurate to Figma (logo, nav, auth buttons, full RTL)
- Hero: background photo, girl cutout, glassmorphism search bar, category pills — matches Figma
- Domains Carousel: hover states, checkerboard pattern, RTL pill button — matches Figma
- Packages Teaser, Practitioners Grid, Testimonials, FAQ, Help Banner, Newsletter, Footer: all built
- Still to do: Articles Teaser section + How It Works section

**Repo is up:**
https://github.com/ToolsLowcodeFlow/heali.git

**Blockers (need from client):**
- Supabase project credentials (to run DB migrations)
- Grow Payment API docs
- Legal text (ToS, Privacy Policy, practitioner agreement)

Next up: finish the last two landing page sections, then moving into Phase 2 — Authentication.
