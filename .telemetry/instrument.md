# Instrumentation Guide

## Target: PostHog

Generated from tracking-plan.yaml v1 on 2026-08-06.

Codebase: React 18 + Vite SPA (browser, custom view-based router Ã¢â‚¬â€ no react-router) with Supabase Postgres + Supabase Edge Functions (Deno runtime) for server-side logic (`send-review-request`, `dodo-webhook`, `gpb-sync`, `submit-gateway-feedback`, etc.). Two tracking surfaces are needed: **browser** (posthog-js) for UI-driven events, and **server** (posthog-node, works in Deno via `npm:` specifier) for events that originate in edge functions with no user present (webhooks, scheduled syncs).

## SDK Setup

### Dependencies

**Browser:**
```bash
npm install posthog-js
```

**Edge Functions (Deno):** No install needed Ã¢â‚¬â€ import directly via npm specifier in each function that needs it:
```typescript
import { PostHog } from "npm:posthog-node@4";
```

### Initialization

**Browser** Ã¢â‚¬â€ `src/lib/posthog.js` (new file):
```javascript
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-01-30',
    autocapture: false,       // we track deliberate events only Ã¢â‚¬â€ see tracking-plan.yaml
    capture_pageview: false,  // navigation is sparse by design (see feature.gated_view)
    capture_pageleave: false,
    disable_session_recording: false,
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.opt_out_capturing();
      }
    },
  });
}

export { posthog };
```

Call `initPostHog()` once at app boot (e.g. top of `src/main.jsx`, before `ReactDOM.createRoot`).

**Edge Functions** Ã¢â‚¬â€ instantiate a fresh client per invocation (Deno edge functions are stateless/short-lived, so there's no long-lived singleton the way there is in a Node server):
```typescript
import { PostHog } from "npm:posthog-node@4";

const posthog = new PostHog(Deno.env.get("POSTHOG_KEY")!, {
  host: Deno.env.get("POSTHOG_HOST") ?? "https://us.i.posthog.com",
  flushAt: 1,        // flush immediately Ã¢â‚¬â€ function may terminate right after
  flushInterval: 0,
});
```

### Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_POSTHOG_KEY` | Browser project API key (public) | Yes |
| `VITE_POSTHOG_HOST` | PostHog Cloud region (`https://us.i.posthog.com` or `https://eu.i.posthog.com`) | No Ã¢â‚¬â€ defaults to US |
| `POSTHOG_KEY` | Same project key, set as an edge function secret (`supabase secrets set`) | Yes, for server-side events |
| `POSTHOG_HOST` | Same host, edge function secret | No Ã¢â‚¬â€ defaults to US |

## Identity

### identify()

**Syntax (browser):** `posthog.identify(distinctId, properties)`
**Syntax (Deno/edge):** `posthog.identify({ distinctId, properties })`

**User Traits** (from tracking-plan.yaml `entities.user`):
| Trait | Type | PII | Notes |
|-------|------|-----|-------|
| `email` | string | Yes | Set once, on signup |
| `name` | string | Yes | On-change |
| `signup_method` | string (`email`/`google`) | No | Set once |
| `plan` | string | No | On-change (update on every plan change) |
| `role` | string (`owner`/`team_member`) | No | Set once |
| `created_at` | datetime | No | Set once |
| `is_internal` | boolean | No | On-change Ã¢â‚¬â€ the exclusion guard reads this |

**When to Call:** Immediately after a successful signup, and again on every login (to refresh traits like `plan` in case it changed elsewhere, e.g. via the Dodo webhook).

**Template Code:**
```javascript
// src/lib/analytics.js (browser) Ã¢â‚¬â€ called from your auth success handler
import { posthog } from './posthog';

export function identifyUser(user, profile) {
  if (profile.is_internal) {
    posthog.opt_out_capturing();
    return;
  }
  posthog.identify(user.id, {
    email: user.email,
    name: profile.full_name,
    signup_method: user.app_metadata?.provider === 'google' ? 'google' : 'email',
    plan: profile.plan,
    role: profile.role ?? 'owner',
    created_at: user.created_at,
    is_internal: profile.is_internal ?? false,
  });
}
```

### group()

**Syntax (browser):** `posthog.group(groupType, groupKey, properties)` Ã¢â‚¬â€ stateful, persists for subsequent `capture()` calls.
**Syntax (Deno/edge):** `posthog.groupIdentify({ groupType, groupKey, properties })` Ã¢â‚¬â€ stateless, must be paired with explicit `groups` on every `capture()`.

**Group Hierarchy:**
| Level | SDK Mapping | ID Source | Parent |
|-------|-------------|-----------|--------|
| business | `posthog.group('business', business_id, {...})` | `profiles.id` | Ã¢â‚¬â€ (top level) |
| location | `posthog.group('location', location_id, { parent_group_id: business_id, ... })` | location UUID | business |

**Group Traits** (from tracking-plan.yaml `groups`):
| Level | Trait | Type | Notes |
|-------|-------|------|-------|
| business | `name` | string | On-change |
| business | `plan` | string | On-change |
| business | `mrr` | number | On-change |
| business | `gbp_connected` | boolean | On-change |
| business | `team_size` | integer | Scheduled (daily) |
| business | `requests_sent_count` | integer | Scheduled (daily) |
| business | `created_at` | datetime | One-time |
| location | `name` | string | On-change |

**When to Call:** On business creation (signup), on every trait change (plan upgrade/downgrade, GBP connect/disconnect, rename), and daily via a scheduled sync for `team_size` / `requests_sent_count` (see Architecture Ã¢â€ â€™ Snapshot Sync below).

**Template Code:**
```javascript
// Browser Ã¢â‚¬â€ call right after identifyUser(), so all subsequent capture() calls
// in this session are attributed to the business automatically.
export function identifyBusiness(profile) {
  posthog.group('business', profile.id, {
    name: profile.business_name,
    plan: profile.plan,
    gbp_connected: !!profile.gbp_connected,
    created_at: profile.created_at,
  });
}
```

```typescript
// Edge function (e.g. dodo-webhook, on a confirmed plan change)
await posthog.groupIdentify({
  groupType: "business",
  groupKey: businessId,
  properties: { plan: newPlan, mrr: newMrr },
});
await posthog.flush();
```

## Events

### track()

**Syntax (browser):** `posthog.capture(eventName, properties)` Ã¢â‚¬â€ group context is automatic once `group()` has been called this session.
**Syntax (Deno/edge):** `posthog.capture({ distinctId, event, properties, groups })` Ã¢â‚¬â€ group context must be passed explicitly on every call, since edge functions are stateless.

**SDK Constraints:**
- PostHog group analytics is a paid add-on on Cloud Ã¢â‚¬â€ confirm this is enabled on the account before relying on group-level dashboards; events still send fine without it, but group breakdowns won't work.
- No native hierarchical rollup between `business` and `location` Ã¢â‚¬â€ `parent_group_id` is stored as a plain property on the `location` group for manual reconstruction in queries.
- Max 5 group types per PostHog project Ã¢â‚¬â€ we use 2 (`business`, `location`), comfortable headroom.

**Template Code:**
```javascript
// Browser Ã¢â‚¬â€ UI-driven event (user clicks "Send Request")
import { posthog } from './posthog';

posthog.capture('review_request.sent', {
  channel: 'sms',
  source: 'manual',
  ai_generated: true,
  template_used: false,
  contact_id: contact.id,
});
```

```typescript
// Edge function Ã¢â‚¬â€ server-driven event (e.g. inside send-review-request,
// after the SMS/email/WhatsApp provider confirms delivery)
await posthog.capture({
  distinctId: businessOwnerUserId,
  event: "review_request.sent",
  properties: {
    channel: "whatsapp",
    source: "automation",
    ai_generated: true,
    template_used: false,
    contact_id: contactId,
  },
  groups: { business: businessId },
});
await posthog.flush();
```

### Group-Level Attribution

Every event in tracking-plan.yaml is at `group_level: business` (the `location` group exists for future multi-location rollout Ã¢â‚¬â€ see note in tracking-plan.yaml). In the browser, this is automatic once `identifyBusiness()` has run this session. In edge functions, pass it explicitly every time:

```typescript
await posthog.capture({
  distinctId: userId,
  event: "plan.upgraded",
  properties: { from_plan: "free", to_plan: "growth", price: 999, currency: "INR", billing_cycle: "monthly" },
  groups: { business: businessId },
});
```

If a location-level event is added later (once the locations table exists):
```typescript
groups: { business: businessId, location: locationId }
```

## Complete Tracking Module

Drop this in as `src/lib/analytics.js` (browser side). It centralizes every call so no raw `posthog.capture()` string ever appears scattered across components Ã¢â‚¬â€ components import named functions from here instead.

```javascript
// src/lib/analytics.js
import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-01-30',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
}

// ---- Identity ----

export function identifyUser(user, profile) {
  if (!initialized) return;
  if (profile?.is_internal) {
    posthog.opt_out_capturing();
    return;
  }
  posthog.identify(user.id, {
    email: user.email,
    name: profile?.full_name,
    signup_method: user.app_metadata?.provider === 'google' ? 'google' : 'email',
    plan: profile?.plan,
    role: profile?.role ?? 'owner',
    created_at: user.created_at,
    is_internal: profile?.is_internal ?? false,
  });

  if (profile?.id) {
    posthog.group('business', profile.id, {
      name: profile.business_name,
      plan: profile.plan,
      gbp_connected: !!profile.gbp_connected,
      created_at: profile.created_at,
    });
  }
}

export function resetIdentity() {
  if (!initialized) return;
  posthog.reset();
}

// ---- Event constants (keeps event names as a single source of truth) ----

export const EVENTS = {
  // Lifecycle
  USER_SIGNED_UP: 'user.signed_up',
  USER_LOGGED_IN: 'user.logged_in',
  ONBOARDING_COMPLETED: 'onboarding.completed',
  MILESTONE_REACHED: 'milestone.reached',
  // Core value
  REVIEW_REQUEST_SENT: 'review_request.sent',
  REVIEW_REQUEST_FAILED: 'review_request.failed',
  REVIEW_RECEIVED: 'review.received',
  GATEWAY_LINK_GENERATED: 'review_gateway.link_generated',
  GATEWAY_RATING_SELECTED: 'review_gateway.rating_selected',
  GATEWAY_COMPLETED: 'review_gateway.completed',
  GBP_CONNECTED: 'gbp.connected',
  GBP_DISCONNECTED: 'gbp.disconnected',
  AI_REPLY_GENERATED: 'ai_reply.generated',
  // Collaboration
  TEAM_MEMBER_INVITED: 'team_member.invited',
  TEAM_MEMBER_JOINED: 'team_member.joined',
  LOCATION_ADDED: 'location.added',
  // Configuration
  TEMPLATE_CREATED: 'template.created',
  AUTOMATION_CREATED: 'automation.created',
  AUTOMATION_TOGGLED: 'automation.toggled',
  CONTACT_IMPORTED: 'contact.imported',
  WIDGET_EMBEDDED: 'widget.embedded',
  // Billing
  CHECKOUT_STARTED: 'checkout.started',
  PLAN_UPGRADED: 'plan.upgraded',
  PLAN_DOWNGRADED: 'plan.downgraded',
  PLAN_CANCELLED: 'plan.cancelled',
  LIMIT_REACHED: 'limit.reached',
  // Navigation (sparse)
  FEATURE_GATED_VIEW: 'feature.gated_view',
};

// ---- Track wrapper ----

export function track(eventName, properties = {}) {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}
```

Edge-function side, a shared helper avoids re-instantiating boilerplate in every function:

```typescript
// supabase/functions/_shared/posthog.ts
import { PostHog } from "npm:posthog-node@4";

export function getPostHogClient() {
  return new PostHog(Deno.env.get("POSTHOG_KEY")!, {
    host: Deno.env.get("POSTHOG_HOST") ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, unknown>,
  businessId: string,
) {
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId,
    event,
    properties,
    groups: { business: businessId },
  });
  await posthog.flush();
}
```

Usage inside e.g. `supabase/functions/dodo-webhook/index.ts`:
```typescript
import { captureServerEvent } from "../_shared/posthog.ts";

// ...after confirming the webhook payload and updating the subscription row:
await captureServerEvent(ownerId, "plan.upgraded", {
  from_plan: previousPlan,
  to_plan: newPlan,
  price: amount,
  currency: "INR",
  billing_cycle: cycle,
}, businessId);
```

## Architecture

### Client vs Server
- **Browser (posthog-js):** All UI-triggered events Ã¢â‚¬â€ signup form submit, login, manual send button clicks, template/automation creation in settings UI, `feature.gated_view` on premium-feature CTA views.
- **Server (posthog-node in edge functions):** Anything that happens without a user actively watching a screen Ã¢â‚¬â€ `send-review-request` (actual delivery confirmation from SMS/email/WhatsApp provider is server-side truth, more reliable than assuming the browser call succeeded), `dodo-webhook` (billing events Ã¢â‚¬â€ the webhook is the source of truth for `plan.upgraded`/`downgraded`/`cancelled`, not the checkout UI), `gpb-sync` (`review.received`), `resolve-gateway`/`submit-gateway-feedback` (QR gateway flow Ã¢â‚¬â€ the customer, not the business owner, is interacting, and there's no PostHog browser session tied to the business account there).
- **Rule of thumb:** if the source of truth is a database write inside an edge function, track it there. If it's purely a UI interaction with no corresponding server confirmation needed, track it in the browser.

### Snapshot Sync
`team_size` and `requests_sent_count` (business group traits) need a daily scheduled update, since they change without a specific user action triggering them. Implement as a Supabase scheduled Edge Function (`pg_cron` Ã¢â€ â€™ HTTP call, or Supabase's built-in cron triggers) that runs once daily:
```typescript
// supabase/functions/posthog-daily-sync/index.ts (new, cron-triggered)
// For each business: COUNT team_members, COUNT review_requests lifetime
// Ã¢â€ â€™ posthog.groupIdentify({ groupType: "business", groupKey: id, properties: { team_size, requests_sent_count } })
```

### Queues and Batching
- Browser: posthog-js batches automatically in the background; no action needed.
- Edge functions: set `flushAt: 1, flushInterval: 0` (as shown above) and always `await posthog.flush()` before the function returns Ã¢â‚¬â€ Deno edge functions terminate immediately after the response, so anything left in an internal buffer is lost otherwise.

### Shutdown / Flush
Edge functions: always `await posthog.flush()` at the end of the handler, inside a `finally` block if the function can throw, so events still send even on error paths where you still want to log e.g. `review_request.failed`.

### Error Handling
Wrap every `posthog.capture()` / `posthog.identify()` call in try/catch (or rely on the SDK's internal non-throwing behavior Ã¢â‚¬â€ posthog-js and posthog-node both swallow network errors internally by design, but don't let a tracking call ever block or fail the actual user-facing action, like sending the review request itself).

## Verification

### Confirming Delivery
PostHog dashboard Ã¢â€ â€™ **Activity Ã¢â€ â€™ Live Events** shows events in real time (browser events are near-instant; edge function events land as soon as `flush()` resolves, typically within a couple seconds).

### Expected Latency
Real-time Ã¢â‚¬â€ no batching delay once `flush()`/browser auto-flush completes. This is not a queue-based/batched destination in this setup (flushAt: 1 means immediate send from edge functions).

### Success vs Failure
`posthog-node`'s `capture()` doesn't throw on delivery failure by default (fire-and-forget); check the PostHog dashboard's Live Events feed during testing rather than relying on a promise rejection. For debugging during development, call `posthog.debug()` in the browser console to log every outgoing call.

### Development Testing
The `loaded` callback in `initPostHog()` already calls `posthog.opt_out_capturing()` when `import.meta.env.DEV` is true, so local dev traffic never pollutes production data. For edge functions, use a **separate PostHog project** for staging/testing (different `POSTHOG_KEY` secret) rather than an opt-out flag, since edge functions don't have a dev/prod distinction the way Vite does.

## Rollout Strategy

Phased, per the priority order in `delta.md`:

1. **Phase 1 Ã¢â‚¬â€ Identity + business group.** Wire `initPostHog()`, `identifyUser()`, `identifyBusiness()` into the auth success handler. Nothing else works without this. Verify in Live Events that `identify` and `$groupidentify` calls appear.
2. **Phase 2 Ã¢â‚¬â€ Billing.** `checkout.started` (browser, on checkout button click) + `plan.upgraded`/`downgraded`/`cancelled` (server, inside `dodo-webhook`). Revenue visibility from day one, since money is the first thing worth watching once tracking exists at all.
3. **Phase 3 Ã¢â‚¬â€ Core value loop.** `review_request.sent` / `review_request.failed` (server, inside `send-review-request`) + `review.received` (server, inside `gpb-sync`). This is the primary funnel.
4. **Phase 4 Ã¢â‚¬â€ Lifecycle.** `user.signed_up`, `user.logged_in`, `onboarding.completed`, `milestone.reached`.
5. **Phase 5 Ã¢â‚¬â€ Everything else.** QR gateway events, collaboration (team/location), configuration (templates/automations/contacts/widget), `feature.gated_view`.

At each phase: verify in PostHog Live Events before moving to the next phase. Watch for unexpected volume spikes or events missing `groups` context (a sign the `groups: { business: ... }` param was forgotten in an edge function call).

## SDK-Specific Constraints
- Group analytics (dashboards broken down by `business`) is a **paid PostHog Cloud add-on** Ã¢â‚¬â€ confirm it's enabled if group-level reporting is expected; raw event capture works regardless.
- Edge functions are **stateless** Ã¢â‚¬â€ every single `capture()` call there needs `groups` passed explicitly. The browser SDK is stateful and only needs `group()` called once per session.
- Deno edge functions terminate right after responding Ã¢â‚¬â€ always `flush()` before returning, or events silently never send.
- PostHog supports up to 5 group types per project; this plan uses 2 (`business`, `location`), well within limits.

## Coverage Gaps
- The `location` group level is defined in tracking-plan.yaml but the underlying multi-location DB schema wasn't found in this codebase scan (see the note on that group in tracking-plan.yaml). No events currently need it Ã¢â‚¬â€ implement it when the Agency multi-location feature actually ships.
- No existing background job system was found (e.g. no Sidekiq/Celery equivalent) Ã¢â‚¬â€ the daily snapshot sync will need a new Supabase scheduled function, not an addition to an existing job runner.
