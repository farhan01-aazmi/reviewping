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

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    annual: 190,
    price_id: "price_starter_monthly",
    annual_price_id: "price_starter_annual",
    sub: "Solo owners",
    f: ["50 review requests/mo", "Email only (SMS extra)", "Dashboard & analytics", "Google review link", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 49,
    annual: 490,
    price_id: "price_growth_monthly",
    annual_price_id: "price_growth_annual",
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
    price_id: "price_agency_monthly",
    annual_price_id: "price_agency_annual",
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
