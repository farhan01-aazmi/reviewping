// Browser PostHog initialization. Called once at app boot (see src/main.jsx).
import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-01-30',
    // Deliberate events only Ã¢â‚¬â€ see .telemetry/tracking-plan.yaml. Navigation
    // is intentionally sparse (feature.gated_view is the only nav event),
    // so autocapture/pageview capture stay off to avoid drowning real signal.
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.opt_out_capturing();
      }
    },
  });
}

export function isInitialized() {
  return initialized;
}

export { posthog };
