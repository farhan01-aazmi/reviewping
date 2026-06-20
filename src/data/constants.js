export const FONTS =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap";

export const SERVICES = [
  "Dental Appointment",
  "Hair & Beauty",
  "Restaurant Dining",
  "Plumbing Repair",
  "Car Service",
  "Gym / Fitness",
  "Hotel Stay",
  "Retail Purchase",
  "Home Cleaning",
  "Physiotherapy",
  "Legal Consultation",
  "Other Service",
];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Home" },
  { id: "reviews", label: "Reviews" },
  { id: "analytics", label: "Analytics" },
  { id: "templates", label: "Templates" },
  { id: "more", label: "More" },
];

export const MAIN_SCREENS = [
  "dashboard",
  "reviews",
  "analytics",
  "templates",
  "more",
];

export const D = 86400000;

/**
 * ═══════════════════════════════════════════════════════════════
 * PLAN DEFINITIONS
 *
 * The frontend sends `plan` (starter/growth/agency) + `billing`
 * (monthly/annual) to the create-checkout edge function.
 * The edge function resolves actual Dodo Payments product IDs
 * from environment variables:
 *
 *   DODO_PRODUCT_STARTER_MONTHLY
 *   DODO_PRODUCT_STARTER_ANNUAL
 *   DODO_PRODUCT_GROWTH_MONTHLY
 *   DODO_PRODUCT_GROWTH_ANNUAL
 *   DODO_PRODUCT_AGENCY_MONTHLY
 *   DODO_PRODUCT_AGENCY_ANNUAL
 *
 * ⚠️ Setup: Create these 6 products in Dodo Payments Dashboard,
 *    then set the env vars in Supabase →
 *    Edge Functions → create-checkout → Environment Variables.
 * ═══════════════════════════════════════════════════════════════
 */
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    annual: 0,
    sub: "Get started",
    f: ["5 review requests/day", "Email requests only", "Dashboard & analytics", "Google review link"],
    features: {
      aiReplies: false,
      bulkSend: false,
      automations: false,
      competitorRadar: false,
      analytics: false,
      customTemplates: false,
      qrCode: false,
      widgetEmbed: false,
      teamMembers: false,
      gbpSync: false,
      reputationScore: false,
      whatsappChannel: false,
    },
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    annual: 278,
    sub: "Solo owners",
    f: ["100 review requests/mo", "Email only (SMS extra)", "Dashboard & analytics", "Google review link", "Email support"],
    features: {
      aiReplies: true,
      bulkSend: true,
      automations: false,
      competitorRadar: false,
      analytics: true,
      customTemplates: true,
      qrCode: true,
      widgetEmbed: true,
      teamMembers: false,
      gbpSync: true,
      reputationScore: false,
      whatsappChannel: false,
    },
  },
  {
    id: "growth",
    name: "Pro",
    price: 79,
    annual: 758,
    sub: "Most popular",
    f: [
      "Unlimited review requests",
      "AI-personalized messages (SMS + Email)",
      "AI reply generator",
      "Reputation Score & insights",
      "Full analytics & charts",
      "Competitor Radar",
      "Contacts management",
      "Custom templates",
      "Priority support",
    ],
    features: {
      aiReplies: true,
      bulkSend: true,
      automations: true,
      competitorRadar: true,
      analytics: true,
      customTemplates: true,
      qrCode: true,
      widgetEmbed: true,
      teamMembers: true,
      gbpSync: true,
      reputationScore: true,
      whatsappChannel: true,
    },
  },
  {
    id: "agency",
    name: "Agency",
    price: 149,
    annual: 1430,
    sub: "Multi-location",
    f: [
      "Everything in Pro",
      "Up to 10 locations",
      "White-label (no branding)",
      "API access",
      "Team members (up to 10)",
      "Dedicated onboarding",
    ],
    features: {
      aiReplies: true,
      bulkSend: true,
      automations: true,
      competitorRadar: true,
      analytics: true,
      customTemplates: true,
      qrCode: true,
      widgetEmbed: true,
      teamMembers: true,
      gbpSync: true,
      reputationScore: true,
      whatsappChannel: true,
    },
  },
];

/**
 * Check if a given plan has access to a specific feature.
 * Usage: hasFeature(userPlan, "competitorRadar") → true/false
 */
export function hasFeature(plan, feature) {
  const p = PLANS.find((x) => x.id === plan);
  if (!p) return false;
  return p.features?.[feature] === true;
}

/** Get the daily request limit for a plan. */
export function getDailyLimit(plan) {
  if (plan === "free") return 5;
  if (plan === "starter") return 100;
  return 99999; // effectively unlimited for growth/agency
}

/** Get the plan that unlocks a given feature (lowest plan with access). */
export function planForFeature(feature) {
  for (const p of PLANS) {
    if (p.features?.[feature]) return p;
  }
  return PLANS[1]; // fallback to starter
}
