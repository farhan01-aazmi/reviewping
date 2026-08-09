# Product: ReviewPing

**Last updated:** 2026-08-06
**Method:** codebase scan + conversation

## Product Identity
- **One-liner:** A business owner logs a customer and the service they received, and ReviewPing automatically writes and sends that customer a personalized review request (SMS/Email/WhatsApp) that links straight to leaving a Google review.
- **Category:** b2b-saas (SMB vertical Ã¢â‚¬â€ reputation/review management)
- **Product type:** Hybrid Ã¢â‚¬â€ primarily single-owner B2C-style usage (solo business owners), with a B2B tier (Agency) supporting multi-location businesses and teams.
- **Collaboration:** single-player by default (Free/Starter/Pro), multiplayer on Agency (team members collaborate on one or more locations).

## Business Model
- **Monetization:** Freemium
- **Pricing tiers:**
  - Free Ã¢â‚¬â€ $0/mo, 5 review requests/day, email only, no analytics/automation
  - Starter Ã¢â‚¬â€ Ã¢â€šÂ¹599/mo, 100 requests/mo, email (+SMS extra), AI replies, bulk send, QR code, GBP sync
  - Pro Ã¢â‚¬â€ Ã¢â€šÂ¹999/mo, unlimited requests, AI-personalized SMS+Email+WhatsApp, AI reply generator, Reputation Score, Competitor Radar, automations, team members
  - Agency Ã¢â‚¬â€ Ã¢â€šÂ¹1499/mo, everything in Pro + up to 10 locations, white-label, API access, up to 10 team members
- **Billing integration:** Dodo Payments (checkout via edge function `create-checkout`, webhook via `dodo-webhook`)

## Tech Stack
- **Primary language:** JavaScript (React, JSX Ã¢â‚¬â€ not TypeScript despite earlier assumption)
- **Framework:** React 18 + Vite (SPA with custom view-based router, no react-router)
- **Database:** Supabase PostgreSQL with Row-Level Security
- **Background jobs:** Supabase Edge Functions (Deno) Ã¢â‚¬â€ no traditional job queue
- **HTTP client patterns:** Direct Supabase JS SDK calls + fetch to `VITE_API_URL`
- **Module organization:** `src/components/pages/` (feature pages), `src/api/`, `src/config/supabase.js`

## Value Mapping

### Primary Value Action
**Review request sent** Ã¢â‚¬â€ an AI-personalized SMS, email, or WhatsApp message is successfully delivered to a customer, linking to the business's Google review page. If this drops to zero, the product delivers no value Ã¢â‚¬â€ this is the core loop the entire product exists to perform.

### Core Features (directly deliver value)
1. **AI-Powered Message Generation** Ã¢â‚¬â€ Gemini writes the personalized request; without this the product is just a contact list.
2. **Multi-channel Delivery (SMS/Email/WhatsApp)** Ã¢â‚¬â€ actually gets the request in front of the customer.
3. **Review Dashboard / Analytics** Ã¢â‚¬â€ closes the loop, shows the owner the review actually landed (ratings, response rates, trends).
4. **QR Review Gateway** Ã¢â‚¬â€ alternate entry point for businesses with no customer contact info; customer scans, picks stars, gets routed to leave a review.
5. **Google Business Profile (GBP) Sync** Ã¢â‚¬â€ pulls in actual reviews so the owner can see real outcomes, not just requests sent.

### Supporting Features (enable core actions)
1. **Contact Management** Ã¢â‚¬â€ the customer list that requests get sent to.
2. **Custom Templates** Ã¢â‚¬â€ speeds up composing/personalizing requests.
3. **Automations** Ã¢â‚¬â€ removes the "remember to ask" friction (auto-send after a delay from visit).
4. **Bulk Send** Ã¢â‚¬â€ sends to many contacts at once.
5. **Team Access** Ã¢â‚¬â€ lets Agency-tier owners delegate request-sending across locations.
6. **Competitor Radar / Reputation Score** Ã¢â‚¬â€ supporting insight, not the core loop itself.

## Entity Model

### Users
- **ID format:** UUID (Supabase Auth `auth.users.id`)
- **Roles:** Owner (default), Team member (Pro/Agency Ã¢â‚¬â€ via `team_members` table)
- **Multi-account:** Not currently Ã¢â‚¬â€ one `profiles` row per auth user; Agency supports multiple locations under one account (see Group Hierarchy), not multiple independent accounts per user.

### Accounts (Business)
- **ID format:** UUID (`profiles.id`, referenced as `business_id`/`profile_id` across tables)
- **Hierarchy:** Flat for Free/Starter/Pro (one business = one account). Agency allows a business to represent multiple physical locations (up to 10) Ã¢â‚¬â€ location-level structure exists in the product concept but is not yet visible as a separate DB table in this scan (locations likely modeled as multiple `profiles`/`business_settings` rows or a field within Agency accounts Ã¢â‚¬â€ confirm during design phase if precise tracking is needed).

## Group Hierarchy

```
Business (Account)
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Location (up to 10, Agency plan only)
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Team Member (up to 10, Pro/Agency)
```

| Group Type | Parent | Where Actions Happen |
|------------|--------|----------------------|
| Business | Ã¢â‚¬â€ | Billing, plan, GBP connection, top-level settings |
| Location | Business | Review requests sent, contacts, reviews received (Agency multi-location) |

**Default event level:** Business (all tiers below Agency operate at this level exclusively)
**Admin actions at:** Business level (billing, team invites, plan changes)

## Current State
- **Existing tracking:** None implemented. `react-ga4` is listed in `package.json` as a dependency but has zero usages anywhere in `src/` Ã¢â‚¬â€ it was added but never wired up.
- **Documentation:** None for analytics/tracking. (Note: `TRACKING.md` in repo root is a project/growth-ops tracker, not an analytics tracking plan Ã¢â‚¬â€ unrelated to this telemetry work.)
- **Known issues:** No visibility into signup Ã¢â€ â€™ activation funnel, no visibility into feature usage (QR Gateway, WhatsApp channel, automations), no visibility into upgrade funnel drop-off. Product is pre-launch with zero live users, so tracking needs to be correct from day one rather than retrofitted.

## Integration Targets
| Destination | Purpose | Priority |
|-------------|---------|----------|
| PostHog | Primary product analytics Ã¢â‚¬â€ funnels, session replay, feature flags, retention | High (chosen destination) |

## Codebase Observations
- **Feature areas inferred (from `src/components/pages/`):** Dashboard, Contacts, SendReq (send review request), SentLog, ReviewsPage, Analytics, Templates, Automations, BulkSend, QRCode, Team, Billing, Integrations, Notifications, Referral, Settings, WidgetEmbed, Changelog, Help.
- **Entity model inferred (from `supabase/migrations`):** `profiles` (business/user), `contacts` (customers), `review_requests`, `reviews`, `review_submissions`, `review_clicks`, `review_gateway_clicks` (QR flow), `team_members`, `gbp_connections`/`gbp_reviews`/`gbp_oauth_states`, `subscriptions`, `templates`, `ai_usage_log`, `notifications`, `milestones_reached`, `webhook_events`.
