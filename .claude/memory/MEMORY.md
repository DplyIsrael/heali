# Heali Project Memory

## Project Status
- **Phase 0 COMPLETE** — foundation, design tokens, RTL/i18n, Supabase client code, Drizzle schema all done
- **Phase 1 ~75% complete** — all landing page sections built, hero/header pixel-accurate to Figma
- Code pushed to: https://github.com/ToolsLowcodeFlow/heali.git (branch: main)
- Next: finish articles teaser (1.8), Figma-polish remaining sections, then Phase 2 (Authentication)
- CLAUDE.md and memory files included in repo for collaborator handoff

## Key Files
- `docs/SOW_TASK_BREAKDOWN.md` — 15-phase implementation roadmap
- `docs/TECHNICAL_ARCHITECTURE.md` — v2.2, stack decisions, data models, banned patterns
- `docs/UI_UX_FLOW.md` — 37 Figma sections, all screens documented
- `docs/Heali_DEV_PRD_EN.md` — business requirements
- `CLAUDE.md` — dev guidance for Claude Code

## Figma
- File key: `Lj4mGtS0F6HvhqU4qR6eZ5`
- Use `mcp__claude_ai_Figma__get_design_context` to fetch screen designs

## Stack
Next.js 15 / TypeScript / Tailwind + shadcn/ui / Supabase / Drizzle ORM / TanStack Query v5 / next-intl / Inngest / Upstash / Resend / Grow payments / Vercel

## Critical Rules
- RTL-first (`dir="rtl"` on `<html>`), Hebrew default via next-intl. Layout is ALWAYS RTL — never toggled. Future i18n = font change only, no layout changes.
- BANNED: `router.refresh()`, `revalidatePath()` as primary update mechanism
- All client data through TanStack Query; all mutations use optimistic updates
- Supabase browser client for client components; server client for Server Components/Actions

## RTL Layout Rules (memorize — do not repeat mistakes)
**Flex row:** first DOM child = RIGHT, last = LEFT (RTL flips flow)
- Want element on RIGHT → put it FIRST in DOM
- Want element on LEFT → put it LAST in DOM
- `justify-start` = right side | `justify-end` = left side

**Flex col cross-axis:**
- `items-start` / `self-start` = RIGHT side
- `items-end` / `self-end` = LEFT side

**Text:** right-aligned by default, never use `text-left` for Hebrew

**Physical CSS** (`left`, `right`, `margin-left`) = NOT affected by RTL, always physical

**Absolute positioning:** `right-[x]` = visual right, `left-[x]` = visual left — use these deliberately

**Quick rule:** "visual RIGHT → first in DOM" / "visual LEFT → last in DOM"

## Design Tokens
- Primary teal: `#21544E`, Accent green: `#7DE4A8`, Input border: `#CDDBDB`
- Background: `#FAFAFA`, Destructive: `#E70202`, Muted: `#9F9F9F`
- Fonts: Discovery Fs (body/headings), PloniMLv2AAA-Bold (logo), Poppins (buttons/placeholders)

## File Append Workaround (Windows, no Python)
For large Hebrew content blocks: write to `.py` file with triple-quoted string, then:
```
node -e "const fs=require('fs'); const raw=fs.readFileSync('file.py','utf8'); const match=raw.match(/content = \"\"\"([\s\S]*?)\"\"\"/); fs.appendFileSync('target.md', match[1])"
```
Then delete the `.py` file.

## Open Blockers (client-dependent)
- Grow Payment API credentials + docs
- Patient questionnaire content
- Practitioner agreement + ToS + Privacy Policy legal text
- Email notification copy templates
