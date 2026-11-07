# Elev8U V2 Public Site: Build Spec

**For:** Claude Code / Cursor implementation
**Owner:** Nezokuhle Tshukulwana, Nexarc Technologies (parent company of Elev8U)
**Stack (from the repo):** Next.js 16.2.6 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (`@supabase/ssr`), Anthropic SDK, Vercel (fra1). Resend is not installed yet.
**Status:** All public-site pages are designed. The waitlist ships first, as a teaser, before the new public site.
**Supersedes:** the visual tokens in `Elev8U_V2_Waitlist_Build_Spec.md` (dark navy, Instrument Serif, Inter). The mechanics in that doc still apply (Supabase table, position counter, Resend email, admin toggle).

---

## 0. How to use this spec

The designs are the source of truth for how things look. This document is the source of truth for how things behave and how they connect to data.

- **Design canvas:** the Claude Design artifact "Elev8U Public Site" (boards listed in section 3). Open the board, read its HTML/CSS, rebuild it in React and Tailwind.
- **Design files in the repo:** `design/v2/` on branch `design/v2-public-site` (see `design/v2/README.md`). The `.dc.html` files need the canvas runtime to render, so use them as markup and CSS reference, not as pages to serve.
- **Read `AGENTS.md` first.** This repo is on Next.js 16, which has breaking changes from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Tailwind 4 means design tokens go in CSS (`@theme` in `globals.css`), not in a `tailwind.config` file.
- **Do not rebuild from zero.** The V1 Next.js app, Supabase project, Evolute (Claude API assistant), Resend and Cal.com setup all carry over. Read the repo first and reuse tables, auth and helpers.
- **Do not copy the sample data.** Names, prices and counts in the designs (Thandi Mokoena, Sipho Dlamini, "#48") are placeholders. Wire them to real data.
- **Build one page at a time**, in the order in section 9. After each page, compare it side by side with its board at 1440px and 390px.

---

### What already exists in the repo (V1, `src/app`)

`(auth)/login`, `(auth)/signup`, `about`, `contact`, `privacy`, `terms`, `reset-password`, `booking`, `client/{home,bookings,concierge,profile,search}`, `freelancer/{dashboard,calendar,earnings,leads,profile,[id]}`, `admin/vetting`, `api/concierge`, plus `components/{admin,booking,client,freelancer,landing,ui}` and `lib/{supabase,concierge,admin,freelancer}`. There is no waitlist code and no Resend dependency yet. The Privacy and Terms pages exist but are only about 55 lines each, so treat them as drafts to review, not finished legal text. Admin currently lives inside this same app (`/admin/vetting`).

Use the existing routes where a V2 page replaces a V1 one (login, signup, freelancer profile) instead of creating parallel routes.

---

## 1. Design rules (apply to every page)

1. **SF-startup polish.** Generous whitespace, one idea per section, restrained motion.
2. **White background** on all public pages. The only dark pages are the waitlist hero, agent showcase and dashboard preview (approved on purpose).
3. **Monochrome plus one accent:** `#305CDE`. No multi-coloured icon chips, no rainbow badges, no gradient icon tiles. Icons are single-colour line icons (1.8px stroke).
4. **Soft neutral shadows** only (black or ink at low opacity). No coloured drop shadows on light pages.
5. **Nav and footer have no surface** on light pages: no fill, no border, no shadow. Content just sits on the page background.
6. **Imagery:** the founder supplies liquid-glass or monochrome images. Until then use grey placeholder blocks (`#EDEDF0`). Never use stock photos of people.
7. **Dashboard previews and the real dashboard are light mode.** Dark mode was declined.
8. **Examples shared by the founder are inspiration only.** Never copy another brand's layout, colour or copy.
9. **No pay-to-rank labels.** Public profiles do not show a "Pro" badge or any plan label. Trust badges are Top Rated, ID Verified, Vetted by Elev8U.

---

## 2. Tokens

### Colour
| Token | Value | Use |
|---|---|---|
| `ink` | `#0A0A0A` | Primary text and primary buttons on light |
| `ink-2` | `#6B6B6B` | Secondary text on light |
| `ink-3` | `#9A9A9A` | Tertiary text, footer copy |
| `hairline` | `rgba(10,10,10,0.08)` | Borders and dividers on light |
| `surface` | `#FFFFFF` | Page background |
| `placeholder` | `#EDEDF0` | Grey image placeholders |
| `accent` | `#305CDE` | The single accent (links, active states, the "8" in the wordmark on light) |
| `accent-hover` | `#1A3FA0` | Hover state |
| `accent-soft` | `#9DB4FF` | Accent on dark surfaces |
| `accent-pale` | `#C7D6FF` | Strokes and checks on dark surfaces |
| `dark-0` | `#05070D` | Waitlist base |
| `dark-hero` | radial at 50% 30%: `#102B66` 0%, `#0A1628` 42%, `#05070D` 100% | Waitlist hero background |
| `glass` | `rgba(255,255,255,0.08)` fill, `rgba(255,255,255,0.22)` border | Glass pills and cards on dark |
| `error-dark` | `#FF9E94` | Error text and borders on dark |
| `wordmark-8-dark` | `#7C9BF0` | The "8" on dark surfaces |

Orb blob colours (waitlist only): `#305CDE`, `#6B8EE8`, `#4B3FD9`.

Error and success colours for **light** pages (forms in sign-in, join and apply) are not fixed yet. Use a single muted red for errors and the accent for success, then confirm with the founder.

### Type
- **Font:** Google Sans Flex, weights 400, 500, 600, 700. Fallback: `'Google Sans', system-ui, -apple-system, sans-serif`. Load it with `next/font/google` if the family is available there, otherwise with the Google Fonts stylesheet used in the designs. One family only.
- **Headlines use two weights in one line:** the first clause in a lighter, muted weight (500, 55% opacity or `ink-2`), the second in 600 and full colour. Example: "The work is already here." (muted) then "V2 makes it effortless." (white, 600).
- **Scale (desktop / mobile):**
  - h1: 72px, tracking -2.2px, line-height 0.95 / 40px, tracking -1.2px
  - h2: 52px, tracking -1.6px, line-height 1.05 / 30px, tracking -1px
  - h3: 32px, tracking -0.7px / 22px
  - body large: 18px / 15px, line-height 1.6
  - body: 14.5 to 16px, line-height 1.65
  - eyebrow: 12px, 600, uppercase, tracking 0.08em, accent colour
  - small and legal: 12 to 13px
- **Wordmark:** `Elev` + `8` + `U`. The 8 is bold 700 in `accent` (on dark: `#7C9BF0`). 24px desktop nav, 20px mobile.

### Shape, space, elevation
- Radii: pills 999px, buttons 26 to 30px, cards 16 to 28px, sheets 36px.
- Max content width 1280px (waitlist and sections), 900px for centred copy blocks. Side padding 40px desktop, 20 to 24px mobile.
- Nav height 80px desktop, 64px mobile.
- Light shadows: `0 10px 30px -12px rgba(10,10,10,0.18)` for raised elements.
- Glass (dark pages only): fill, 1px border, `backdrop-filter: blur(14px)`, plus `inset 0 1px 1px rgba(255,255,255,0.4)` highlight.

### Motion
- Entrance easing: `cubic-bezier(0.16, 1, 0.3, 1)`, 700 to 900ms. Overlay and menu easing: `cubic-bezier(0.76, 0, 0.24, 1)`, 600 to 700ms.
- **Every animation must respect `prefers-reduced-motion`:** blobs stop, the infinity trace shows fully drawn, entrances show instantly, the dashboard peek shows static.
- No parallax, no cursor-follow effects.

---

## 3. Page inventory

Routes are suggestions, except where an existing V1 route is named; reuse those.

| Page | Suggested route | Desktop board | Mobile board |
|---|---|---|---|
| Waitlist | `/` (or `/v2` while V1 root is live) | `Waitlist.dc.html` | `WaitlistMobile.dc.html` |
| Waitlist form states | (spec only) | `WaitlistStates.dc.html` | n/a |
| Waitlist confirmation email | (Resend template) | `WaitlistEmail.dc.html` | n/a |
| Waitlist share image (1200×630) | `/og/waitlist.png` | `WaitlistShare.dc.html` | n/a |
| Home | `/` after launch | `Home.dc.html` | not yet designed |
| Hero orb concept | n/a | `HeroOrb.dc.html` | n/a |
| Pricing | `/pricing` | `Pricing.dc.html` | not yet designed |
| For freelancers | `/for-freelancers` | `ForFreelancers.dc.html` | not yet designed |
| For clients | `/for-clients` | `ForClients.dc.html` | not yet designed |
| Freelancer profile | existing `/freelancer/[id]` | `Profile.dc.html` | `ProfileMobile.dc.html` |
| Sign in | existing `/login` | `SignIn.dc.html` | `SignInMobile.dc.html` |
| Join (role chooser) | new `/join` (V1 has `/signup`) | `Join.dc.html` | `JoinMobile.dc.html` |
| Client sign-up | `/signup` or `/join/client` | `ClientSignUp.dc.html` | `ClientSignUpMobile.dc.html` |
| Freelancer application, steps 1 to 7 | `/join/freelancer/[step]` | `Apply1Account` through `Apply7Submitted` | same names with `Mobile` |

Apply steps: 1 Account, 2 Work, 3 Skills and services, 4 About you, 5 Identity, 6 Review and submit, 7 Application received.

Home, Pricing, For freelancers and For clients are designed for desktop only. Mobile versions of those four are still to do before the public-site build reaches them.

---

## 4. Shared components

Build these once, reuse everywhere.

- `Wordmark`, `InfinityMark` (SVG path `M60 30 C48 12 14 12 14 30 C14 48 48 48 60 30 C72 12 106 12 106 30 C106 48 72 48 60 30 Z`, viewBox `0 0 120 60`)
- `SiteNav` (light) and `WaitlistNav` (dark, pill that opens a full-screen overlay menu)
- `SiteFooter`: "© 2026 Elev8U. A Nexarc Technologies company.", Privacy link, hello@elev8u.co.za
- `Button` (primary ink, secondary outline, on-dark white), `GlassPill`, `Eyebrow`, `TwoToneHeading`
- `FormField`, `PasswordField`, `Dropzone`, `RadioCard`, `Chip`, `Stepper` (6 segments), `SecurityPill`
- `RatingGauge` (half-circle SVG, `pathLength=100`)
- `ServiceCard` (one-time, monthly, custom quote variants)
- `Orb` (three blurred blobs, a glass disc, the infinity trace; waitlist only)
- `DashboardPreview` (static recreation of the real dashboard, with typed reply animation; waitlist only)

---

## 5. Page behaviour

### 5.1 Waitlist (ships first)

**Sections, top to bottom:** fixed nav, dark hero (orb, headline, glass email pill), `#preview` dashboard first look, `#coming` agent showcase, white sheet with `#trust` and footer.

**Nav.** Logo left, centred "Navigate" pill (label switches to "Close"), mark right on desktop; hamburger on mobile. Opens a full-screen overlay (`#05070D`) with five links: Home (`#top`), What's coming (`#coming`), First look (`#preview`), Why Elev8U (`#trust`), Current site (https://elev8u.co.za). Links animate in with an 80ms stagger. Lock body scroll while open. Nav gets `rgba(5,7,13,0.8)` plus blur after 40px of scroll.

**Hero.** Orb is positioned at a fixed pixel offset (top 300px desktop, 250px mobile; size 700px desktop, 430px mobile), not a percentage, so the headline never overlaps the infinity mark. Hero is `100vh` with a min-height of 900px desktop, 780px mobile. Entrance: nav items at 0, 200, 400ms; hero elements at 400, 600, 800ms. Orb animation: blobs 16s, 21s, 13s; glass disc drift 24s; sheen 9s; infinity trace 4.5s after a 0.6s delay.

**Form.** Eight states, all designed on the `WaitlistStates` board:

| State | Trigger | Behaviour |
|---|---|---|
| Default | Page load | Counter reads "You'll be #N on the list", N = current count + 1 |
| Focus and typing | Focus | White focus ring. Validate on submit only |
| Loading | Submit | Button disabled with spinner, input read-only, `aria-busy` |
| Invalid email | Client validation fails | Coral border, message under pill with `role="alert"`, focus returns to input |
| Already on the list | Unique violation | Show the existing position. Never create a second row. Offer "Resend my confirmation email" (rate-limit to once per 10 minutes) and "Use a different email" |
| Server error | Insert fails or times out | Keep the typed email, show "Try again". Log the raw error server-side only |
| Success | Insert succeeds | "You're #N on the list." plus "Use a different email" |
| Waitlist closed | `waitlist_open = false` | Form is replaced by "The waitlist is closed" and a "Go to Elev8U" button |

**Consent line** under the form: "By joining you agree to get launch emails from Elev8U. See our Privacy Policy." The Privacy Policy page must exist before launch (see section 8).

**Confirmation email.** Subject "You're #N on the Elev8U V2 waitlist", from `hello@elev8u.co.za` via Resend, sent when the row is created. Table layout, system fonts, dark header exported as a static image. Includes position, join date and an unsubscribe link. The unsubscribe link must actually work and stop all further waitlist emails.

**Share image.** 1200×630, referenced by `og:image` and `twitter:image` (summary_large_image). Also set `og:title`, `og:description`, canonical URL and a favicon from the infinity mark.

**Dashboard first look (`#preview`).** A tilted (`rotateX(8deg)`, 5deg on mobile) glass-bezelled recreation of the real dashboard with sample data (Thandi, web designer, Cape Town; lead Sipho Dlamini). Rises into view on scroll using `animation-timeline: view()` inside `@supports`, with an IntersectionObserver fallback. When it enters the viewport (85% line) a typed reply starts. Label it "A first look · sample data".

**Agent showcase (`#coming`).** Four agents: Response Agent, Profile Optimiser, Growth Agent, Financial Analysis Agent (tagged "Later in V2"). Auto-advances every 6 seconds (150 ticks at 40ms); clicking an agent selects it and restarts its timer. Each agent has a scene (reply typing, checklist ring, goal bars, income chart) and a "Without it / With it" contrast. Pause the auto-advance when the tab is hidden or reduced motion is on.

### 5.2 Pricing
- Monthly / Yearly toggle, **monthly is the default**.
- Pro: R249/month, or R2,490/year ("2 months free", saves R498). Show "Billed monthly. Cancel anytime." or "Billed once a year. You save R498."
- Free plan: 15% commission. Clients pay a 5% service fee capped at R150, shown at checkout.
- Free allows up to 3 services, Pro up to 5.
- FAQ: monthly Pro is month to month with no lock-in; yearly Pro is billed once and runs for 12 months.

### 5.3 Freelancer profile
- Header: name, trade, city, badges (Top Rated, ID Verified, Vetted by Elev8U), half-circle rating gauge, trust strip (jobs completed, typical response time, member since).
- Portfolio grid (6 tiles), services (one-time, monthly plan, custom quote), reviews (verified only), sticky booking card on desktop (Enquire, Book a call, fee note), sticky bottom bar on mobile.
- Layout collapses to one column under 1000px.
- Only completed-booking reviews can be shown. Badges come from real data (ID verified flag, vetting status, rating and job thresholds). Thresholds for Top Rated are not decided yet.

### 5.4 Sign in, join, client sign-up
- Sign in: Google, email and password, Forgot password link, "Back to site" aligned right of the logo row, grey image panel on desktop.
- Join: two cards. Client (grey) leads to client sign-up; freelancer (blue) leads to Apply step 1. Note beneath: "Freelancer applications are reviewed manually before you go live."
- Client sign-up: Google, name, email, password, location. **Email verification happens at the first enquiry or booking, not at sign-up.** Google sign-up counts as verified.

### 5.5 Freelancer application (6 steps plus confirmation)
1. **Account:** name, email, password, WhatsApp number (+27 prefix).
2. **Work:** category, location, years of experience, optional professional registration.
3. **Skills and services:** skill chips; a main one-time service and an ongoing monthly plan are always present as standard slots; extra services have a One-time / Monthly / Custom quote toggle. Counter "N of 3 services"; the add button disables at the cap.
4. **About you:** profile photo, bio, 1 to 3 portfolio pieces.
5. **Identity:** SA ID or passport (radio cards), ID number, document upload, selfie upload, and a security pill: "Encrypted and seen only by our review team. Deleted once you're verified."
6. **Review and submit:** summary rows with Edit links, consent to terms and code of conduct.
7. **Application received:** 48-hour message and a Submitted → In review → Approved tracker.

Save progress between steps (draft row) so a person can leave and return. Outcomes of review: Approved, Needs more info (with the reason), Declined.

---

## 6. Business rules

- **Vetting is manual.** SLA 48 hours. Reviewed in the admin app (section 8).
- **Services cap:** Free 3, Pro 5. Custom quotes are currently open to all plans (founder's call, revisit later). On downgrade, services beyond the cap are hidden, not deleted, and return on upgrade.
- **Commission:** Free 15%, Pro 8% (per the Pricing board; there is also a "custom commission at volume" line for large accounts, terms not defined yet). The Pricing board says Pro pays for itself at roughly R3,500/month in bookings.
- **Client fee:** 5%, capped at R150, shown at checkout.
- **Pro billing:** R249/month default, R2,490/year option. **Refund rule for yearly is undecided** (a 14-day full refund was suggested).
- **Pro upgrade prompts** (freelancer dashboard): on hitting a service limit, on a locked agent preview, after a completed booking (commission vs Pro comparison), and in a monthly break-even summary. Maximum one prompt per session, always dismissible.

---

## 7. Data mapping

Existing V1 tables (verify against the repo before changing anything): `waitlist_signups`, `freelancer_profiles`, `freelancer_skills`, `service_tiers` (name, description, price, type `one_time | subscription`), `leads`, `profiles`.

| Design element | Data source |
|---|---|
| Waitlist counter and position | `count(*)` on `waitlist_signups`; `position` set at insert |
| Waitlist open/closed | New `app_settings` row `waitlist_open` (boolean), written by the admin app |
| Profile header and bio | `freelancer_profiles`, `profiles` |
| Skills chips | `freelancer_skills` |
| Services and pricing cards | `service_tiers`. Add a `quote` value to the `type` enum for custom quotes |
| Reviews | New `reviews` table linked to a completed booking |
| Badges | Derived: ID verified flag, vetting status, rating and job thresholds |
| Application draft and outcome | New `freelancer_applications` (status: draft, submitted, in_review, needs_info, approved, declined; reviewer, notes, timestamps) |
| ID document and selfie | Private storage bucket only (see section 8). Store the path and verification status on the application, never a public URL |

All new tables need RLS. The waitlist table is insert-only for the public role; nobody can read other people's emails from the client.

---

## 8. Security, privacy and compliance

- **Admin becomes a separate app and deployment** (for example `admin.elev8u.co.za`), not linked from the public site. Today it is `/admin/vetting` inside this repo, so this is a migration: move the vetting screens and add the waitlist toggle. Role checks run on the server. Require 2FA for admin accounts. Not designed yet.
- **ID documents (POPIA):** private bucket, no public access, signed URLs that expire in minutes, readable only by reviewers, and a scheduled job that **deletes the document and selfie once the application is verified or declined** (set the retention window and write it in the privacy policy). The security pill on step 5 makes this promise, so the build must keep it.
- **Marketing consent:** the waitlist consent line is the opt-in record. Store consent timestamp and source with the signup.
- **Waitlist abuse:** rate-limit by IP, add a honeypot field, and treat the "already on the list" state as acceptable disclosure (it reveals only that an email is on the list).
- **Legal pages needed before launch:** Privacy Policy (waitlist needs it first), Terms, Code of Conduct. `/privacy` and `/terms` exist in V1 but are short; review them against the new ID-document and marketing-email practices. These are legal text. Have them drafted by a professional or a vetted template; do not ship placeholder text.
- **Email:** `hello@elev8u.co.za` with SPF, DKIM and DMARC set up in Resend before the first send.

---

## 9. Build order

1. **Repo audit:** read `AGENTS.md`, the Next 16 docs in `node_modules`, the V1 code, schema and routes. Decide `/` vs `/v2` for the waitlist.
2. **Foundations:** tokens in `@theme` (Tailwind 4), font, `Wordmark`, `InfinityMark`, `Button`, nav, footer, reduced-motion utilities.
3. **Waitlist page** (hero, form with all 8 states, Supabase insert, Resend email, `waitlist_open` toggle, OG tags), then the dashboard preview and agent showcase. Ship this.
4. **Privacy Policy page** (must be live before the waitlist goes public).
5. **Auth and join:** sign in, join, client sign-up.
6. **Freelancer application** with draft saving, then the private ID upload.
7. **Admin app** (vetting queue, waitlist toggle).
8. **Home, Pricing, For freelancers, For clients** (mobile boards first).
9. **Freelancer profile** and booking card.
10. **Dashboard V2** (light mode) rebuilt in Next.js. The V1 dashboard does not carry over.

---

## 10. Assets still needed from the founder

- Liquid-glass or monochrome images for Home, For freelancers, For clients, Sign in and Join image panels (grey placeholders until then).
- Phase 2 hero video for the waitlist (Higgsfield, MCP connected). Check credit balance before generating.
- Final copy review for legal pages.

---

## 11. Open decisions

- Refund rule for yearly Pro.
- Whether custom quotes become Pro-only.
- Waitlist route: `/` or `/v2`.
- Top Rated badge thresholds, and the terms for custom commission at volume.
- Light-mode error and success colours for forms.
- Align sample data: Home and the freelancer dashboard canvas still use a mechanic sample; the rest of the site uses web designers, IT and accounting.
- Whether a "Needs more info" application can be resubmitted in place or needs a new draft.

## 12. Not yet designed

Client dashboard (Evolute home), enquiry, booking and checkout flow, Code of Conduct page, V2 refresh of the existing About, Contact, Terms and reset-password pages, email-verification screen, 404, approval / needs-more-info / welcome emails, Pro upgrade prompts inside the dashboard, and the admin app.
