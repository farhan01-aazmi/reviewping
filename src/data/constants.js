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

export const CATEGORY_GROUPS = [
  {
    label: "Food & Dining",
    items: ["Restaurant", "Cafe", "Bar & Lounge", "Bakery", "Food Truck", "Catering", "Other Food & Dining"],
  },
  {
    label: "Health & Medical",
    items: ["Dentist", "Doctor / Clinic", "Physiotherapy", "Chiropractor", "Optometrist", "Pharmacy", "Mental Health", "Other Health & Medical"],
  },
  {
    label: "Beauty & Personal Care",
    items: ["Salon", "Barbershop", "Spa", "Nail Salon", "Tattoo Studio", "Med Spa", "Other Beauty & Personal Care"],
  },
  {
    label: "Automotive",
    items: ["Auto Repair", "Car Wash", "Auto Body Shop", "Tire Shop", "Car Dealership", "Oil Change", "Other Automotive"],
  },
  {
    label: "Home Services",
    items: ["Plumber", "Electrician", "HVAC", "House Cleaning", "Landscaping", "Painter", "Roofer", "Pest Control", "Other Home Services"],
  },
  {
    label: "Professional Services",
    items: ["Legal Consultation", "Accounting", "Real Estate", "Insurance Agent", "Financial Advisor", "Marketing Agency", "Other Professional Services"],
  },
  {
    label: "Fitness & Recreation",
    items: ["Gym / Fitness Center", "Yoga Studio", "Personal Trainer", "Sports Club", "Dance Studio", "Martial Arts", "Other Fitness & Recreation"],
  },
  {
    label: "Retail & Shopping",
    items: ["Retail Store", "Boutique", "Supermarket", "Convenience Store", "Electronics", "Furniture Store", "Other Retail & Shopping"],
  },
  {
    label: "Hospitality & Travel",
    items: ["Hotel", "Bed & Breakfast", "Vacation Rental", "Travel Agency", "Airport Service", "Other Hospitality & Travel"],
  },
  {
    label: "Other",
    items: ["Other"],
  },
];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "reviews", label: "Reviews", icon: "⭐" },
  { id: "requests", label: "Requests", icon: "📨" },
  { id: "qr-gateway", label: "QR Gateway", icon: "📱" },
  { id: "settings", label: "Settings", icon: "⚙️" },
  { id: "billing", label: "Billing", icon: "💳" },
];

export const MAIN_SCREENS = [
  "dashboard",
  "reviews",
  "requests",
  "qr-gateway",
  "templates",
  "settings",
  "billing",
  "send",
  "more",
  "analytics",
  "templates",
  "automations",
  "contacts",
  "qrcode",
  "widget",
  "integrations",
  "notifications",
  "pricing",
  "team",
  "help",
  "privacy",
  "terms",
  "sentlog",
  "referral",
  "changelog",
  "bulk",
];

export const D = 86400000;

/**
 * ═══════════════════════════════════════════════════════════════
 * PLAN DEFINITIONS
 *
 * The frontend sends `plan` (starter/premium/agency) + `billing`
 * (monthly/annual) to the create-checkout edge function.
 * The edge function resolves actual Dodo Payments product IDs
 * from environment variables:
 *
 *   DODO_PRODUCT_STARTER_MONTHLY
 *   DODO_PRODUCT_STARTER_ANNUAL
 *   DODO_PRODUCT_PREMIUM_MONTHLY
 *   DODO_PRODUCT_PREMIUM_ANNUAL
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
    price: 599,
    annual: 5990,
    sub: "Solo owners",
    f: [
      "100 review requests/mo",
      "Email review requests",
      "Dashboard & analytics",
      "Custom review templates",
      "QR Code gateway",
      "Widget embed",
    ],
    features: {
      aiReplies: true,
      bulkSend: false,
      automations: false,
      analytics: true,
      customTemplates: true,
      qrCode: true,
      widgetEmbed: true,
      teamMembers: false,
      gbpSync: true,
      reputationScore: false,
      whatsappChannel: false,
    },
    limits: {
      templatesPerRating: 1,
      aiGenerations: 25,
      locations: 1,
      teamMembers: 1,
      reviewRequests: 100,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    annual: 9990,
    sub: "Most popular",
    f: [
      "Unlimited review requests",
      "AI-personalized messages (Email + WhatsApp)",
      "AI reply generator",
      "Reputation Score & insights",
      "Full analytics & charts",
      "Custom templates",
      "Priority support",
    ],
    features: {
      aiReplies: true,
      bulkSend: true,
      automations: true,
      analytics: true,
      customTemplates: true,
      qrCode: true,
      widgetEmbed: true,
      teamMembers: true,
      gbpSync: true,
      reputationScore: true,
      whatsappChannel: true,
    },
    limits: {
      templatesPerRating: 999,
      aiGenerations: 100,
      locations: 1,
      teamMembers: 3,
      reviewRequests: 99999,
    },
  },
  {
    id: "agency",
    name: "Agency",
    price: 1499,
    annual: 14990,
    sub: "Multi-location",
    f: [
      "Everything in Premium",
      "Up to 5 locations",
      "White-label (no branding)",
      "API access",
      "Team members (up to 5)",
      "Dedicated onboarding",
    ],
    features: {
      aiReplies: true,
      bulkSend: true,
      automations: true,
      analytics: true,
      customTemplates: true,
      qrCode: true,
      widgetEmbed: true,
      teamMembers: true,
      gbpSync: true,
      reputationScore: true,
      whatsappChannel: true,
    },
    limits: {
      templatesPerRating: 999,
      aiGenerations: 500,
      locations: 5,
      teamMembers: 10,
      reviewRequests: 99999,
    },
  },
];

/**
 * Check if a given plan has access to a specific feature.
 * Usage: hasFeature(userPlan, "reputationScore") → true/false
 */
export function hasFeature(plan, feature) {
  const p = PLANS.find((x) => x.id === plan);
  if (!p) return false;
  return p.features?.[feature] === true;
}

/** Get the daily request limit for a plan. */
export function getDailyLimit(plan) {
  if (plan === "starter") return 100;
  return 99999; // effectively unlimited for premium/agency
}

/** Get a numeric limit for a plan by key (e.g. "aiGenerations"). */
export function getLimit(plan, key) {
  const p = PLANS.find((x) => x.id === plan);
  if (!p) return 0;
  return p.limits?.[key] ?? 99999;
}

/** Get the plan that unlocks a given feature (lowest plan with access). */
export function planForFeature(feature) {
  for (const p of PLANS) {
    if (p.features?.[feature]) return p;
  }
  return PLANS[0]; // fallback to starter
}
