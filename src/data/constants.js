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
    id: "starter",
    name: "Starter",
    price: 19,
    annual: 190,
    sub: "Solo owners",
    f: ["50 review requests/mo", "Email only (SMS extra)", "Dashboard & analytics", "Google review link", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 49,
    annual: 490,
    sub: "Most popular",
    f: [
      "Unlimited review requests",
      "AI-personalized messages (SMS + Email)",
      "AI reply generator",
      "Full analytics & charts",
      "Contacts management",
      "Custom templates",
      "Priority support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 99,
    annual: 990,
    sub: "Multi-location",
    f: [
      "Everything in Growth",
      "Up to 5 locations",
      "White-label (no branding)",
      "API access",
      "Team members (up to 5)",
      "Dedicated onboarding",
    ],
  },
];
