/**
 * ═══════════════════════════════════════════════════════════════
 * PITCH TEMPLATES — ReviewPing Sales Outreach
 *
 * Professional cold email templates organized by industry category.
 * Each template is 120-180 words, plain-text, personal & helpful.
 * Used by the Sales Outreach Agent for outbound prospecting.
 * ═══════════════════════════════════════════════════════════════
 */

export const INDUSTRY_CATEGORIES = {
  food_dining: {
    label: "Food & Dining",
    industries: [
      "Restaurants", "Cafes", "Bakeries", "Bars", "Food Trucks",
      "Pizzerias", "Sushi Bars", "Ice Cream Parlors", "Catering",
      "Grocery Stores",
    ],
    icon: "🍽️",
    bestChannel: "WhatsApp",
    avgReviewsPerMonth: 18,
    avgRating: 4.2,
  },
  personal_care: {
    label: "Personal Care",
    industries: [
      "Hair Salons", "Barbershops", "Nail Salons", "Spas",
      "Beauty Clinics", "Tattoo Studios", "Tanning Salons",
      "Makeup Artists",
    ],
    icon: "💇",
    bestChannel: "WhatsApp",
    avgReviewsPerMonth: 15,
    avgRating: 4.4,
  },
  medical_health: {
    label: "Medical & Health",
    industries: [
      "Dental Clinics", "GPs", "Chiropractors", "Optometrists",
      "Physiotherapists", "Dermatologists", "Vets", "Pharmacies",
      "Psychologists", "Urgent Care", "Orthodontists",
      "Plastic Surgeons", "Audiologists", "Podiatrists",
      "Fertility Clinics", "Massage Therapists",
    ],
    icon: "🏥",
    bestChannel: "Email",
    avgReviewsPerMonth: 12,
    avgRating: 4.6,
  },
  home_services: {
    label: "Home Services",
    industries: [
      "HVAC", "Plumbers", "Electricians", "Roofers", "Painters",
      "Landscapers", "Cleaners", "Pest Control", "Locksmiths",
      "Movers", "Home Inspectors", "Pool Cleaners", "Handymen",
      "Remodeling", "Solar Installers", "Water Damage",
      "Mold Remediation",
    ],
    icon: "🔧",
    bestChannel: "WhatsApp",
    avgReviewsPerMonth: 10,
    avgRating: 4.3,
  },
  automotive: {
    label: "Automotive",
    industries: [
      "Auto Repair", "Dealerships", "Body Shops", "Car Washes",
      "Tire Shops", "Oil Change", "Motorcycle Repair", "Towing",
    ],
    icon: "🚗",
    bestChannel: "WhatsApp",
    avgReviewsPerMonth: 8,
    avgRating: 4.3,
  },
  professional_services: {
    label: "Professional Services",
    industries: [
      "Lawyers", "Accountants", "Architects", "Financial Advisors",
      "Insurance Agents", "Real Estate Agents", "Property Managers",
      "Tax Preparers", "Marketing Agencies", "Web Designers",
    ],
    icon: "💼",
    bestChannel: "Email",
    avgReviewsPerMonth: 14,
    avgRating: 4.5,
  },
  health_fitness: {
    label: "Health & Fitness",
    industries: [
      "Gyms", "Yoga Studios", "Pilates", "Personal Trainers",
      "CrossFit", "Dance Studios", "Martial Arts",
    ],
    icon: "💪",
    bestChannel: "WhatsApp",
    avgReviewsPerMonth: 16,
    avgRating: 4.4,
  },
  retail: {
    label: "Retail",
    industries: [
      "Clothing", "Electronics", "Furniture", "Jewelry", "Shoes",
      "Bookstores", "Pet Stores", "Sporting Goods", "Hardware",
      "Home Decor", "Gift Shops", "Liquor Stores", "Flower Shops",
    ],
    icon: "🛍️",
    bestChannel: "Email",
    avgReviewsPerMonth: 22,
    avgRating: 4.1,
  },
  accommodation: {
    label: "Accommodation",
    industries: [
      "Hotels", "B&Bs", "Vacation Rentals", "Hostels",
      "Travel Agencies",
    ],
    icon: "🏨",
    bestChannel: "Email",
    avgReviewsPerMonth: 20,
    avgRating: 4.3,
  },
  entertainment: {
    label: "Entertainment",
    industries: [
      "Movie Theaters", "Bowling Alleys", "Arcades", "Escape Rooms",
      "Museums", "Nightclubs", "Golf Courses", "Trampoline Parks",
    ],
    icon: "🎮",
    bestChannel: "WhatsApp",
    avgReviewsPerMonth: 12,
    avgRating: 4.2,
  },
  education_pet: {
    label: "Education & Pet",
    industries: [
      "Tutoring", "Driving Schools", "Language Schools",
      "Music Lessons", "Pet Groomers", "Dog Walkers", "Pet Boarding",
    ],
    icon: "📚",
    bestChannel: "Email",
    avgReviewsPerMonth: 10,
    avgRating: 4.4,
  },
  events_other: {
    label: "Events & Other",
    industries: [
      "Wedding Venues", "Photographers", "DJs", "Caterers",
      "Florists", "Laundromats", "Dry Cleaners", "Tailors",
      "Phone Repair", "Computer Repair", "Junk Removal",
      "Storage Units",
    ],
    icon: "📸",
    bestChannel: "Email",
    avgReviewsPerMonth: 10,
    avgRating: 4.3,
  },
};

export const PITCH_TEMPLATES = {
  food_dining: {
    subject: "{{business_name}} – more Google reviews, less asking",
    preheader:
      "Restaurants that automate review requests get 3-5x more 5-star reviews. Here's how.",
    body: `Hi {{owner_name}},

I noticed {{business_name}} in {{location}} has {{review_count}} reviews with a {{rating}} star rating — that's solid. But here's the thing: most of your happy guests walk out without leaving a review simply because nobody asked at the right moment.

For restaurants and cafes, timing is everything. A WhatsApp message sent 30 minutes after a meal converts at 3x the rate of an email. Our data across 2,400+ businesses shows automated review requests for food businesses drive an average of 18 reviews per month — 5x more than manual asking.

ReviewPing automates this. You connect your Google Business Profile once, and every customer automatically gets a friendly WhatsApp message with a direct Google review link 30 minutes after their visit. No awkward counterside requests. No forgotten follow-ups. Just more 5-star reviews rolling in on autopilot.

It takes 2 minutes to set up. There's a free plan, and paid plans start at $29/mo.

Would 15 minutes this week work for a quick walkthrough?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  personal_care: {
    subject: "Helping {{business_name}} turn appointments into reviews",
    preheader:
      "Salons using automated review requests see 3x more Google reviews. Here's a simple way to do it.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} runs at {{rating}} stars with {{review_count}} reviews — that's a reputation worth shouting about. But here's what I hear from salon and barbershop owners all the time: "People say they love it, but they never actually leave a review."

The issue isn't your service — it's the ask. A customer leaves your chair feeling great, but by the time they're home, the moment has passed. The sweet spot is 30 minutes after service, when the experience is fresh.

That's exactly what ReviewPing does. When a client finishes their appointment, they get an automatic WhatsApp message with a direct Google review link. One tap, 30 seconds, done. Our data shows personal care businesses using automation average 15 reviews per month — up from 3-5 with manual asking.

2400+ businesses already use ReviewPing. The Starter plan is $29/mo with a free plan available. No contracts, cancel anytime.

Worth a 10-minute call to see it in action?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  medical_health: {
    subject: "Better review flow for {{business_name}}",
    preheader:
      "Dental and health practices see 35%+ response rates with automated email review requests.",
    body: `Hi {{owner_name}},

{{business_name}} has a {{rating}} star rating from {{review_count}} reviews — that tells me you run a quality practice in {{location}}. But in healthcare, your online reputation is often the first thing a new patient checks before booking.

Patients already expect email communication from their provider. A post-appointment email with a direct Google review link fits naturally into their inbox. No awkward paper cards, no QR codes at the front desk.

ReviewPing sends automated review requests via email (or WhatsApp) after every appointment. Your patients get a simple, professional message at the right time — and your profile gets the fresh reviews it needs to stay visible in local search.

We work with dental clinics, physiotherapists, dermatologists, chiropractors, and vets across 2,400+ businesses. Starting at $29/mo with a free plan.

Got 10 minutes this week to see how it works?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  home_services: {
    subject: "More 5-star reviews for {{business_name}} – automatically",
    preheader:
      "Home service providers using automated review requests generate 3x more leads from Google.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has {{review_count}} reviews at {{rating}} stars — that's a strong signal for homeowners choosing a service provider. But here's the problem I keep hearing from HVAC, plumbing, and electrical contractors:

You do great work, fix the problem, and the customer is thrilled. But once you're out the door and on to the next job, the review never happens. You can't stop and ask — you're already heading to the next call.

A simple WhatsApp message sent 30 minutes after the job is done changes everything. ReviewPing automates this: you finish a job, mark it complete in the app, and your customer gets a friendly message with a direct Google review link. No chasing, no awkwardness. Home services businesses using our platform average 10 reviews per month — up from 2-3.

2400+ businesses already use ReviewPing. Free plan available, paid from $29/mo.

Worth a quick call this week?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  automotive: {
    subject: "{{business_name}} – let your happy customers do the talking",
    preheader:
      "Auto shops using automated review requests get 8-10 new reviews per month. Here's how.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} runs at {{rating}} stars with {{review_count}} reviews. For auto repair, that reputation is gold — 93% of car owners read reviews before choosing a shop.

But the gap I see with most garages: customers love the work, pay the bill, drive off — and that 5-star review never gets written. Why? Because the moment to ask passes too quickly.

Sending a review request 30 minutes after pickup changes that. The customer is still driving home thinking, "Glad that's sorted." Your WhatsApp message arrives with a one-tap link to Google. They click, leave a review, done.

ReviewPing automates this entire flow. We handle email and WhatsApp requests. Auto shops on our platform average 8 reviews per month without lifting a finger. 2400+ businesses already trust us. Plans start at $29/mo with a free tier.

Want to see it in action? 10 minutes is all it takes.

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  professional_services: {
    subject: "Helping {{business_name}} build trust at scale",
    preheader:
      "Professional service firms with 25+ reviews get 108% more clicks. Here's how to get there faster.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has built a {{rating}} star reputation from {{review_count}} reviews — impressive. But in professional services, potential clients often compare 3-4 firms before making a call. Your review count and rating are often the deciding factor.

Most lawyers, accountants, and agents I speak to say the same thing: "We ask clients for reviews, but maybe one in ten follows through." The problem isn't your request — it's the timing and channel.

Email works best for professional services. A post-engagement email with a direct Google review link turns a satisfied client into a public advocate. ReviewPing automates this — send a professional, personalized email after closing a deal, completing a tax return, or finishing a consultation.

2400+ businesses use ReviewPing to grow their online reputation. Free plan available, paid plans from $29/mo. Set up in 2 minutes.

Would 15 minutes work for a quick demo?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  health_fitness: {
    subject: "Turning {{business_name}} members into reviewers",
    preheader:
      "Gyms and fitness studios using automated review requests see 3-4x more Google reviews.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has a {{rating}} star rating from {{review_count}} reviews. In the fitness world, those reviews are your best marketing asset — people choose a gym based on the experience of current members.

But here's the reality: your happiest members walk out feeling great after a class, and within an hour they're back to their day. That 5-star review? It never happens unless you ask at the perfect moment.

ReviewPing sends an automatic WhatsApp message 30 minutes after each class or session. Your member gets a personal message with a one-tap Google review link. It takes them 20 seconds. For you, it's fully automated.

Fitness businesses on ReviewPing average 16 reviews per month. Same great service, just a smarter ask. 2400+ businesses already doing it. Plans from $29/mo, free tier available.

Got 10 minutes this week to see it?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  retail: {
    subject: "More reviews, less effort for {{business_name}}",
    preheader:
      "Retail stores using automated email review requests see 22 reviews per month on average.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has {{review_count}} reviews at {{rating}} stars. For a retail business, that reputation drives foot traffic — 93% of shoppers read reviews before visiting a store.

The challenge? Your happy customers leave with a bag and a smile, but by the time they get home, the review moment has passed. Asking at the register is awkward. QR codes on receipts rarely get scanned.

Email after purchase is the sweet spot for retail. ReviewPing sends a follow-up email after every sale with a direct Google review link. Professional, timely, and effortless. Retailers on our platform average 22 reviews per month — work that used to take hours now happens automatically.

2400+ businesses trust ReviewPing. Free plan available, paid from $29/mo. Set up takes 2 minutes.

Worth a quick chat this week?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  accommodation: {
    subject: "{{business_name}} – let your best reviews do the booking",
    preheader:
      "Hotels with 25+ reviews get 108% more clicks on Google. See how to get there faster.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has a {{rating}} star rating from {{review_count}} reviews. In hospitality, your Google rating is often the first thing a traveler checks before booking. A strong review profile directly fills rooms.

Most hotel and B&B owners tell me: "Guests say they loved their stay, but only a fraction actually leave a review." The problem is timing. A week after checkout, the warm feeling has faded. The best time to ask is within 4 hours of checkout — when the experience is still fresh.

ReviewPing automates post-checkout review requests via email. Your guest gets a warm, professional message with a direct Google review link. They tap, leave a review, done. Accommodation businesses on our platform average 20 reviews per month.

2400+ businesses already use ReviewPing. Plans from $29/mo with a free tier. No contracts, cancel anytime.

Would 10 minutes work for a quick walkthrough?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  entertainment: {
    subject: "{{business_name}} – reviews that keep the doors open",
    preheader:
      "Entertainment venues using automated review requests see 3x more Google reviews. Here's how.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has {{review_count}} reviews at {{rating}} stars. For entertainment venues, your Google reputation is everything — it's the first thing people check before booking a birthday party, date night, or group outing.

The natural time to capture a review is right after the experience. Your guests just had fun at your escape room, finished a round of mini-golf, or left a movie on a high note. That's the moment — but without an automated ask, it's gone in minutes.

ReviewPing sends an automatic WhatsApp message 30 minutes after their visit. A warm, short message with a direct Google review link. They tap, review, done. Entertainment venues on our platform average 12 reviews per month without any manual effort.

2400+ businesses already trust ReviewPing. Free plan available, paid plans from $29/mo.

Want to see how it works? 10 minutes is all I need.

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  education_pet: {
    subject: "Growing {{business_name}}'s reputation with automated requests",
    preheader:
      "Tutoring centers, pet groomers, and service businesses see 35%+ response rates with timing. Here's the system.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has a {{rating}} star rating from {{review_count}} reviews. For education and pet service businesses, word-of-mouth has always driven growth — but today, word-of-mouth happens on Google.

Whether you run a tutoring center, pet grooming salon, or driving school, your happiest customers are your best marketers. The problem? They mean to leave a review but life gets in the way. A well-timed email or WhatsApp message changes that.

ReviewPing sends automated review requests after every session or service. Your customer gets a personal message with a direct Google review link at the perfect moment — not too early, not too late. Education and pet businesses using our platform average 10 reviews per month.

2400+ businesses already use ReviewPing. Set up takes 2 minutes. Free plan available, paid from $29/mo.

Got 10 minutes for a quick call this week?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },

  events_other: {
    subject: "Capturing reviews for {{business_name}} without the awkward ask",
    preheader:
      "Service businesses using automated review requests get 3-5x more Google reviews. See the simple setup.",
    body: `Hi {{owner_name}},

{{business_name}} in {{location}} has {{review_count}} reviews at {{rating}} stars. Whether you're a photographer, wedding venue, or dry cleaner, your online reputation drives new business more than any ad campaign.

But I hear it from every service business owner I talk to: "I know I should ask for reviews, but it always feels pushy, and honestly, I forget half the time." You're not alone — manual review requests fail because life gets busy.

ReviewPing automates the process. After every job, your customer receives a thoughtful email or WhatsApp message with a direct Google review link. Professional, timely, and hands-off. You focus on the work, and the reviews take care of themselves.

2400+ businesses already use ReviewPing. Free plan available, paid from $29/mo. No contracts, set up in 2 minutes.

Would a quick 10-minute call this week work?

Best,
Aarav
ReviewPing — reviewping.pro`,
  },
};

export const PITCH_SETTINGS = {
  defaultFrom: "Aarav from ReviewPing <hello@reviewping.pro>",
  replyTo: "hello@reviewping.pro",
  maxEmailsPerDay: 50,
  minDelayBetweenEmailsMs: 60000,
  trackingPixel: true,
  unsubscribeLink: true,
  bestTimeToSend: "10:00-12:00 local time",
};
