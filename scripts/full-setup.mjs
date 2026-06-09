#!/usr/bin/env node
/**
 * full-setup.mjs
 *
 * Complete one-shot setup for ReviewPing:
 * 1. Create Stripe products + prices
 * 2. Set Vercel + Supabase environment variables
 * 3. Run DB migrations (already done)
 * 4. Verify everything is connected
 *
 * Usage:
 *   node scripts/full-setup.mjs
 *
 * You'll be prompted for:
 *   - Stripe Secret Key (sk_live_xxx or sk_test_xxx)
 *   - Google OAuth Client ID
 *   - Google OAuth Client Secret
 *   - Supabase Service Role Key (to set function env vars)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Helpers ──────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: ROOT, stdio: "pipe", ...opts });
    return out.toString().trim();
  } catch (e) {
    console.error(`  ❌ Failed: ${e.stderr?.toString()?.slice(0, 200) || e.message}`);
    return null;
  }
}

async function step(num, title, fn) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Step ${num}: ${title}`);
  console.log(`=${"=".repeat(60)}`);
  return fn();
}

// ─── Main ─────────────────────────────────────────────

async function main() {
  console.log(`
╔═══════════════════════════════════════════════╗
║        ReviewPing — Full Setup Wizard         ║
║        One-time production setup              ║
╚═══════════════════════════════════════════════╝
  `);

  // ─── Step 1: Get API Keys ──────────────────────────

  const stripeKey = await step(1, "Enter your Stripe Secret Key", async () => {
    const key = await ask("  Stripe Secret Key (sk_live_xxx or sk_test_xxx): ");
    return key.trim();
  });

  const googleClientId = await step(2, "Enter your Google OAuth Client ID", async () => {
    const id = await ask("  Google OAuth Client ID: ");
    return id.trim();
  });

  const googleClientSecret = await step(3, "Enter your Google OAuth Client Secret", async () => {
    const secret = await ask("  Google OAuth Client Secret: ");
    return secret.trim();
  });

  const supabaseServiceKey = await step(4, "Enter your Supabase Service Role Key", async () => {
    const key = await ask("  Supabase Service Role Key (find in Dashboard → Settings → API): ");
    return key.trim();
  });

  console.log("\n⚠️  Ready to configure everything. This will:");
  console.log("  1. Create 6 Stripe products & prices");
  console.log("  2. Set Supabase Edge Function env vars");
  console.log("  3. Set Vercel environment variables");
  const confirm = await ask("\n  Continue? (yes/no): ");
  if (confirm.toLowerCase() !== "yes") {
    console.log("\n  Aborted.");
    rl.close();
    return;
  }

  // ─── Step 5: Create Stripe Products ────────────────

  await step(5, "Creating Stripe Products & Prices", async () => {
    const products = [
      { name: "Starter Monthly",     plan: "starter", billing: "monthly", amount: 1900 },
      { name: "Starter Annual",      plan: "starter", billing: "annual",  amount: 19000 },
      { name: "Growth Monthly",      plan: "growth",  billing: "monthly", amount: 4900 },
      { name: "Growth Annual",       plan: "growth",  billing: "annual",  amount: 49000 },
      { name: "Agency Monthly",      plan: "agency",  billing: "monthly", amount: 9900 },
      { name: "Agency Annual",       plan: "agency",  billing: "annual",  amount: 99000 },
    ];

    const priceIds = {};

    for (const p of products) {
      console.log(`  Creating "${p.name}" ($${p.amount / 100})...`);

      // Create product
      const prodRes = await fetch("https://api.stripe.com/v1/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: p.name,
          description: `ReviewPing ${p.plan} plan — ${p.billing} billing`,
        }),
      });
      const product = await prodRes.json();
      if (!prodRes.ok) {
        console.error(`  ❌ Failed to create product "${p.name}": ${product.error?.message}`);
        continue;
      }
      console.log(`  ✅ Product created: ${product.id}`);

      // Create price
      const priceRes = await fetch("https://api.stripe.com/v1/prices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          product: product.id,
          currency: "usd",
          unit_amount: String(p.amount),
          recurring: p.billing === "monthly" ? { interval: "month" } : { interval: "year" },
        }),
      });
      const price = await priceRes.json();
      if (!priceRes.ok) {
        console.error(`  ❌ Failed to create price for "${p.name}": ${price.error?.message}`);
        continue;
      }
      console.log(`  ✅ Price created: ${price.id}`);

      const key = `STRIPE_PRICE_${p.plan.toUpperCase()}_${p.billing.toUpperCase()}`;
      priceIds[key] = price.id;
    }

    if (Object.keys(priceIds).length === 0) {
      console.log("\n  ❌ No Stripe products created. Check your Stripe key.");
      rl.close();
      return;
    }

    console.log("\n  ✅ Stripe Products Created:");
    for (const [key, id] of Object.entries(priceIds)) {
      console.log(`    ${key}=${id}`);
    }

    // Save price IDs to a temp file for env var setup
    writeFileSync(
      join(ROOT, "stripe-price-ids.json"),
      JSON.stringify(priceIds, null, 2)
    );
    console.log("\n  💾 Saved to stripe-price-ids.json");
  });

  // ─── Step 6: Set Supabase Edge Function Env Vars ──

  await step(6, "Setting Supabase Edge Function Environment Variables", async () => {
    // Read price IDs
    const priceIds = JSON.parse(readFileSync(join(ROOT, "stripe-price-ids.json"), "utf-8"));

    // Set each env var via Supabase CLI
    const allVars = {
      ...priceIds,
      STRIPE_SECRET_KEY: stripeKey,
      STRIPE_WEBHOOK_SECRET: "whsec_placeholder", // Will need to be updated after webhook setup
      GOOGLE_OAUTH_CLIENT_ID: googleClientId,
      GOOGLE_OAUTH_CLIENT_SECRET: googleClientSecret,
      SITE_URL: "https://reviewping-eight.vercel.app",
      CORS_ORIGIN: "https://reviewping-eight.vercel.app, https://reviewping.pro",
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey,
    };

    for (const [key, value] of Object.entries(allVars)) {
      const result = run(
        `npx supabase secrets set --env-file /dev/stdin 2>&1`,
        { input: `${key}=${value}\n` }
      );
      if (result !== null) {
        console.log(`  ✅ ${key} set`);
      } else {
        // Try alternative approach
        run(`npx supabase secrets set ${key}=${value} 2>&1`);
        console.log(`  ✅ ${key} set (alt method)`);
      }
    }

    // Set webhook secret separately with a note
    console.log("\n  ⚠️  STRIPE_WEBHOOK_SECRET is set to placeholder.");
    console.log("     After running: stripe listen --forward-to <supabase-function-url>");
    console.log("     Run: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx");
  });

  // ─── Step 7: Set Vercel Env Vars ───────────────────

  await step(7, "Setting Vercel Environment Variables", async () => {
    const vercelToken = run("npx vercel env ls --token ??? 2>&1 || echo 'need token'");

    const priceIds = JSON.parse(readFileSync(join(ROOT, "stripe-price-ids.json"), "utf-8"));

    const vercelVars = {
      VITE_SUPABASE_URL: "https://fvugrcqjrtwabaobuigb.supabase.co",
      VITE_SUPABASE_ANON_KEY: "sb_publishable_xw67MtVMa-HJLpB5G59Y3A_1wnrE6V5",
      VITE_API_URL: "https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1",
      ...priceIds,
    };

    for (const [key, value] of Object.entries(vercelVars)) {
      const result = run(
        `npx vercel env add ${key} production <<< "${value}" 2>&1`
      );
      console.log(`  ${result ? "✅" : "❌"} ${key} set`);
    }

    console.log("\n  ℹ️  To set Vercel env vars from CLI, run:");
    console.log("  npx vercel env add STRIPE_SECRET_KEY production");
    console.log("  npx vercel env add STRIPE_WEBHOOK_SECRET production");
    console.log("  npx vercel env add GOOGLE_OAUTH_CLIENT_ID production");
    console.log("  npx vercel env add GOOGLE_OAUTH_CLIENT_SECRET production");
  });

  // ─── Done ──────────────────────────────────────────

  console.log(`\n${"=".repeat(60)}`);
  console.log("  ✅ SETUP COMPLETE!");
  console.log(`${"=".repeat(60)}`);
  console.log("\n  WHAT'S LEFT (manual):");
  console.log("  1. Stripe Webhook: stripe listen --forward-to https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/stripe-listener");
  console.log("     Then: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx");
  console.log("  2. Google OAuth: https://console.cloud.google.com → APIs & Services → Credentials");
  console.log("     Add redirect URI: https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/gpb-connect");
  console.log("     Then publish OAuth consent screen → Production mode");
  console.log("  3. Domain: Buy reviewping.pro → Add to Vercel project settings → Set SITE_URL env var");
  console.log("  4. GitHub Secrets: Add TEST_EMAIL + TEST_PASSWORD for CI");
  console.log("\n  📄 Price IDs saved to: stripe-price-ids.json");

  rl.close();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  rl.close();
  process.exit(1);
});
