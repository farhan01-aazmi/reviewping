// Auto-generated from .telemetry/tracking-plan.yaml v1 Ã¢â‚¬â€ regenerate with the
// product-tracking-implement-tracking skill if the plan changes.
//
// Central registry of event name strings. Nothing outside this file should
// ever write a raw event name string Ã¢â‚¬â€ always import from EVENTS.

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

  // Navigation (sparse Ã¢â‚¬â€ see tracking-plan.yaml for why this is the only one)
  FEATURE_GATED_VIEW: 'feature.gated_view',
};

/**
 * @typedef {Object} UserTraits
 * @property {string} [email] - PII, set once on signup
 * @property {string} [name] - PII, on-change
 * @property {'email'|'google'} signup_method
 * @property {'free'|'starter'|'growth'|'agency'} plan
 * @property {'owner'|'team_member'} role
 * @property {string} created_at - ISO datetime
 * @property {boolean} [is_internal]
 */

/**
 * @typedef {Object} BusinessTraits
 * @property {string} name
 * @property {'free'|'starter'|'growth'|'agency'} plan
 * @property {number} [mrr]
 * @property {boolean} gbp_connected
 * @property {number} [team_size]
 * @property {number} [requests_sent_count]
 * @property {string} [created_at] - ISO datetime
 */
