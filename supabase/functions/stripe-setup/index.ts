import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || ""

interface Product {
  name: string
  plan: string
  billing: string
  amount: number
}

const PRODUCTS: Product[] = [
  { name: "Starter Monthly",     plan: "starter", billing: "monthly", amount: 1900 },
  { name: "Starter Annual",      plan: "starter", billing: "annual",  amount: 19000 },
  { name: "Growth Monthly",      plan: "growth",  billing: "monthly", amount: 4900 },
  { name: "Growth Annual",       plan: "growth",  billing: "annual",  amount: 49000 },
  { name: "Agency Monthly",      plan: "agency",  billing: "monthly", amount: 9900 },
  { name: "Agency Annual",       plan: "agency",  billing: "annual",  amount: 99000 },
]

serve(async (_req) => {
  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const results: Record<string, string> = {}

  for (const p of PRODUCTS) {
    // Create product
    const prodRes = await fetch("https://api.stripe.com/v1/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: p.name,
        description: `ReviewPing ${p.plan} plan — ${p.billing} billing`,
      }),
    })
    const product = await prodRes.json()
    if (!prodRes.ok) {
      results[`${p.plan}_${p.billing}_error`] = product.error?.message || "Unknown error"
      continue
    }

    // Create price
    const recurring = p.billing === "monthly" ? { interval: "month" } : { interval: "year" }
    const priceParams = new URLSearchParams()
    priceParams.set("product", product.id)
    priceParams.set("currency", "usd")
    priceParams.set("unit_amount", String(p.amount))
    priceParams.set("recurring[interval]", recurring.interval)

    const priceRes = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: priceParams,
    })
    const price = await priceRes.json()
    if (!priceRes.ok) {
      results[`${p.plan}_${p.billing}_error`] = price.error?.message || "Unknown error"
      continue
    }

    const key = `STRIPE_PRICE_${p.plan.toUpperCase()}_${p.billing.toUpperCase()}`
    results[key] = price.id
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  })
})
