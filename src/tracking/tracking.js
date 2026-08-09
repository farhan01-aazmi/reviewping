// Auto-generated from .telemetry/tracking-plan.yaml v1 + .telemetry/instrument.md
// Ã¢â‚¬â€ regenerate with the product-tracking-implement-tracking skill if the plan
// changes. Browser (posthog-js) side. For server-side (edge function) tracking
// see supabase/functions/_shared/posthog.ts.

import { posthog, isInitialized } from './posthog';
import { EVENTS } from './events';

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/**
 * Identify the current user + their business (account group) in one call.
 * Call this after signup, after login, and on session restore.
 *
 * @param {{ id: string, email: string, created_at: string, app_metadata?: { provider?: string } }} authUser - Supabase auth user
 * @param {{ id?: string, name?: string, business_name?: string, plan?: string, role?: string, gbp_connected?: boolean, is_internal?: boolean, created_at?: string }} profile - profiles row
 */
export function identifyUser(authUser, profile = {}) {
  if (!isInitialized() || !authUser?.id) return;

  if (profile.is_internal) {
    posthog.opt_out_capturing();
    return;
  }

  posthog.identify(authUser.id, {
    email: authUser.email,
    name: profile.name,
    signup_method: authUser.app_metadata?.provider === 'google' ? 'google' : 'email',
    plan: profile.plan,
    role: profile.role ?? 'owner',
    created_at: authUser.created_at,
    is_internal: profile.is_internal ?? false,
  });

  if (profile.id) {
    identifyBusiness(profile);
  }
}

/**
 * Set/refresh the business (account-level) group. Automatic on the browser Ã¢â‚¬â€
 * every capture() call afterward in this session is attributed to it.
 *
 * @param {{ id: string, business_name?: string, plan?: string, gbp_connected?: boolean, created_at?: string }} profile
 */
export function identifyBusiness(profile) {
  if (!isInitialized() || !profile?.id) return;

  posthog.group('business', profile.id, {
    name: profile.business_name,
    plan: profile.plan,
    gbp_connected: !!profile.gbp_connected,
    created_at: profile.created_at,
  });
}

/** Call on logout Ã¢â‚¬â€ clears identity and group associations. */
export function resetIdentity() {
  if (!isInitialized()) return;
  posthog.reset();
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/** @param {{ signup_method: 'email'|'google' }} props */
export function trackUserSignedUp(props) {
  posthog.capture(EVENTS.USER_SIGNED_UP, props);
}

/** @param {{ method: 'email'|'google' }} props */
export function trackUserLoggedIn(props) {
  posthog.capture(EVENTS.USER_LOGGED_IN, props);
}

export function trackOnboardingCompleted() {
  posthog.capture(EVENTS.ONBOARDING_COMPLETED, {});
}

/** @param {{ milestone_name: string }} props */
export function trackMilestoneReached(props) {
  posthog.capture(EVENTS.MILESTONE_REACHED, props);
}

// ---------------------------------------------------------------------------
// Core value
// ---------------------------------------------------------------------------

/** @param {{ channel: 'sms'|'email'|'whatsapp', source: 'manual'|'bulk_send'|'automation'|'qr_gateway', ai_generated: boolean, template_used: boolean, contact_id: string }} props */
export function trackReviewRequestSent(props) {
  posthog.capture(EVENTS.REVIEW_REQUEST_SENT, props);
}

/** @param {{ channel: 'sms'|'email'|'whatsapp', reason?: string }} props */
export function trackReviewRequestFailed(props) {
  posthog.capture(EVENTS.REVIEW_REQUEST_FAILED, props);
}

/** @param {{ rating: number, source: 'gbp_sync'|'gateway' }} props */
export function trackReviewReceived(props) {
  posthog.capture(EVENTS.REVIEW_RECEIVED, props);
}

export function trackGatewayLinkGenerated() {
  posthog.capture(EVENTS.GATEWAY_LINK_GENERATED, {});
}

/** @param {{ rating: number }} props */
export function trackGatewayRatingSelected(props) {
  posthog.capture(EVENTS.GATEWAY_RATING_SELECTED, props);
}

/** @param {{ rating: number, used_suggested_template: boolean }} props */
export function trackGatewayCompleted(props) {
  posthog.capture(EVENTS.GATEWAY_COMPLETED, props);
}

export function trackGbpConnected() {
  posthog.capture(EVENTS.GBP_CONNECTED, {});
}

/** @param {{ reason?: string }} props */
export function trackGbpDisconnected(props = {}) {
  posthog.capture(EVENTS.GBP_DISCONNECTED, props);
}

/** @param {{ rating?: number, sent: boolean }} props */
export function trackAiReplyGenerated(props) {
  posthog.capture(EVENTS.AI_REPLY_GENERATED, props);
}

// ---------------------------------------------------------------------------
// Collaboration
// ---------------------------------------------------------------------------

/** @param {{ role?: string }} props */
export function trackTeamMemberInvited(props = {}) {
  posthog.capture(EVENTS.TEAM_MEMBER_INVITED, props);
}

export function trackTeamMemberJoined() {
  posthog.capture(EVENTS.TEAM_MEMBER_JOINED, {});
}

export function trackLocationAdded() {
  posthog.capture(EVENTS.LOCATION_ADDED, {});
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @param {{ channel: 'sms'|'email'|'whatsapp'|'all' }} props */
export function trackTemplateCreated(props) {
  posthog.capture(EVENTS.TEMPLATE_CREATED, props);
}

/** @param {{ delay_hours?: number }} props */
export function trackAutomationCreated(props = {}) {
  posthog.capture(EVENTS.AUTOMATION_CREATED, props);
}

/** @param {{ enabled: boolean }} props */
export function trackAutomationToggled(props) {
  posthog.capture(EVENTS.AUTOMATION_TOGGLED, props);
}

/** @param {{ method: 'manual'|'csv_bulk', contact_count: number }} props */
export function trackContactImported(props) {
  posthog.capture(EVENTS.CONTACT_IMPORTED, props);
}

export function trackWidgetEmbedded() {
  posthog.capture(EVENTS.WIDGET_EMBEDDED, {});
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

/** @param {{ target_plan: 'starter'|'growth'|'agency', billing_cycle: 'monthly'|'annual' }} props */
export function trackCheckoutStarted(props) {
  posthog.capture(EVENTS.CHECKOUT_STARTED, props);
}

// ---------------------------------------------------------------------------
// Navigation (sparse Ã¢â‚¬â€ see tracking-plan.yaml)
// ---------------------------------------------------------------------------

/** @param {{ feature_name: string }} props */
export function trackFeatureGatedView(props) {
  posthog.capture(EVENTS.FEATURE_GATED_VIEW, props);
}

// Note: plan.upgraded / plan.downgraded / plan.cancelled / limit.reached are
// billing-webhook-confirmed and daily-limit-check events respectively Ã¢â‚¬â€ they
// are tracked server-side (supabase/functions/dodo-webhook,
// supabase/functions/_shared/auth.ts) since the webhook/server is the source
// of truth, not the client UI. See supabase/functions/_shared/posthog.ts.
