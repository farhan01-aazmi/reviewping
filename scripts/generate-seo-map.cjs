#!/usr/bin/env node
/**
 * Generates seo-map.json — per-route { title, desc, canonical, jsonLd, ogImage, noindex }
 * Consumed by build-vercel.cjs to prerender static SEO HTML for every crawlable route.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const SITE = 'https://www.reviewping.pro';
const SUFFIX = ' · ReviewPing';

const src = fs.readFileSync(path.join(root, 'src', 'data', 'seoPages.js'), 'utf8');
const data = {};
eval(src.replace(/export const (\w+) =/g, (_, n) => `data.${n} =`));

const map = {};

function add(route, meta) {
  const title =
    route === '/' || meta.title.includes('· ReviewPing')
      ? meta.title
      : `${meta.title}${SUFFIX}`;
  map[route] = {
    title,
    desc: meta.desc,
    canonical: `${SITE}${route}`,
    jsonLd: meta.jsonLd || null,
    ogImage: meta.ogImage || null,
    noindex: !!meta.noindex,
  };
}

// ── Home ───────────────────────────────────────────────────────────────
add('/', {
  title: 'ReviewPing — Automated Google Review Request Software | From ₹599/mo',
  desc: 'Get 30+ new Google reviews every month automatically with AI-personalised email and WhatsApp review requests. No contracts, no hidden fees. Set up in 2 minutes.',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ReviewPing',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Automated Google review requests via email and WhatsApp.',
      offers: { '@type': 'AggregateOffer', lowPrice: '599', highPrice: '1499', priceCurrency: 'INR' },
      url: SITE,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ReviewPing',
      url: SITE,
      description: 'Automated Google review request software for small businesses.',
    },
  ],
});

// ── Static pages (titles/descs mirrored from each page's <SEO> component) ──
add('/features', {
  title: 'Features — Everything you need to get more Google Reviews',
  desc: 'ReviewPing helps businesses automate Google review requests via email and WhatsApp. AI-powered replies, real-time analytics, multi-location support, and more.',
});
add('/pricing', {
  title: 'Pricing',
  desc: 'Simple, transparent pricing for review request automation. Starter at ₹599/mo. No contracts. No per-message fees. Cancel anytime.',
});
add('/faq', {
  title: 'Frequently Asked Questions',
  desc: 'Find answers to common questions about ReviewPing — review request automation, pricing, GDPR compliance, WhatsApp vs email, and more.',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.FAQ_DATA.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
});
add('/blog', {
  title: 'ReviewPing Blog',
  desc: 'Tips, guides, and strategies for getting more Google reviews, managing your online reputation, and growing your small business.',
});
add('/about', {
  title: 'About Us',
  desc: 'Learn about ReviewPing — the affordable Google review management platform built for small businesses. Our story, mission, team, and values.',
});
add('/contact', {
  title: 'Contact Us',
  desc: 'Get in touch with ReviewPing. Email hello@reviewping.io for support, sales, or general inquiries. We reply within 2 hours during business hours.',
});
add('/privacy', {
  title: 'Privacy Policy',
  desc: "ReviewPing Privacy Policy — how we collect, use, and protect your data and your customers' data.",
});
add('/terms', {
  title: 'Terms of Service',
  desc: 'ReviewPing Terms of Service — the legal agreement governing your use of the ReviewPing review request platform.',
});
add('/refund', {
  title: 'Refund Policy',
  desc: 'ReviewPing Refund Policy — details on our 14-day free trial, monthly and annual subscription refunds, and how to cancel.',
});

// ── Free tools ──────────────────────────────────────────────────────────
add('/tools/review-link-generator', {
  title: 'Free Review Link Generator',
  desc: 'Generate your Google Review link for free. No sign-up required.',
});
add('/tools/review-response-generator', {
  title: 'Free Review Response Generator',
  desc: 'Generate AI-powered responses to your Google reviews for free.',
});

// ── Podium alternative page ─────────────────────────────────────────────
add('/podium-alternative', {
  title: data.PODIUM_ALTERNATIVE_DATA.title,
  desc: data.PODIUM_ALTERNATIVE_DATA.desc,
});

// ── Industry pages ──────────────────────────────────────────────────────
for (const [slug, ind] of Object.entries(data.INDUSTRIES_DATA)) {
  add(`/industry/${slug}`, { title: ind.title, desc: ind.desc });
}

// ── Comparison (VS) pages ───────────────────────────────────────────────
const VS = {
  '/vs/birdeye': {
    title: 'ReviewPing vs Birdeye: The ₹599/mo Alternative',
    desc: 'Compare ReviewPing (₹599/mo) vs Birdeye ($299+/mo per location). Save 90% on review management with AI-powered features and no long-term contracts.',
  },
  '/vs/grade-us': {
    title: 'ReviewPing vs Grade.us: Which Review Platform Wins?',
    desc: 'Compare ReviewPing (₹599/mo) vs Grade.us ($40-$110/seat/mo). See why ReviewPing offers better value with AI features and unlimited users.',
  },
  '/vs/nicejob': {
    title: 'ReviewPing vs Nicejob: Honest Comparison (2026)',
    desc: "Compare ReviewPing (₹599/mo) vs Nicejob ($75-$125/mo). See how ReviewPing's AI features and affordable pricing stack up against Nicejob's review automation.",
  },
  '/vs/podium': {
    title: 'ReviewPing vs Podium: The ₹599/mo Alternative',
    desc: 'Compare ReviewPing (₹599/mo) vs Podium ($400+/mo). Same core review request functionality at 95% less cost. Built for small businesses.',
  },
  '/vs/truereview': {
    title: 'ReviewPing vs TrueReview: Best Budget Review Tool?',
    desc: 'Compare ReviewPing (₹599/mo) vs TrueReview ($49/mo). ReviewPing offers more features and a lower starting price than TrueReview.',
  },
};
for (const [route, meta] of Object.entries(VS)) add(route, meta);

// ── Blog posts ──────────────────────────────────────────────────────────
for (const post of data.BLOG_POSTS) {
  add(`/blog/${post.slug}`, {
    title: post.title,
    desc: post.desc,
    ogImage: post.image || null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.desc,
        datePublished: post.date,
        dateModified: post.date,
        author: { '@type': 'Organization', name: 'ReviewPing', url: SITE },
        publisher: { '@type': 'Organization', name: 'ReviewPing' },
        mainEntityOfPage: `${SITE}/blog/${post.slug}`,
        image: post.image || undefined,
      },
    ],
  });
}

// ── App/auth routes: noindex ────────────────────────────────────────────
const NOINDEX = [
  '/login',
  '/signup',
  '/forgot-password',
  '/auth/callback',
  '/onboarding',
  '/verify',
  '/settings',
  '/billing',
  '/invite',
  '/dashboard',
  '/404',
  '/changelog',
  '/help',
  '/referral',
];
for (const route of NOINDEX) {
  add(route, { title: route.replace(/^\//, ''), desc: 'ReviewPing', noindex: true });
}

fs.writeFileSync(path.join(root, 'seo-map.json'), JSON.stringify(map, null, 2));
console.log(`✓ seo-map.json written (${Object.keys(map).length} routes)`);
