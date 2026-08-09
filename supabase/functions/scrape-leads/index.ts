// =============================================================================
// ReviewPing — Scrape Leads from Google Maps
// Edge Function: scrape-leads
// =============================================================================
// This function is the INGESTION LAYER for Google Maps scraped data.
//
// ARCHITECTURE NOTE:
//   Supabase Edge Functions run on Deno and CANNOT run Playwright/Puppeteer
//   (no browser binaries available in the managed runtime).
//
//   INSTEAD, the scraping happens in one of two ways:
//
//   Option A (Recommended — Scheduled): A GitHub Action workflow runs a
//     standalone Node.js Playwright script on schedule (cron). The script
//     scrapes Google Maps, formats the data, and POSTs to this edge function
//     for ingestion. This keeps the scraper portable and the edge function
//     as a clean ingestion API.
//
//   Option B (On-demand): The frontend triggers a scrape via `supabase.functions.invoke()`,
//     passing search parameters. This function creates a scrape_job record and
//     returns it immediately. A separate worker (polling or webhook) picks up
//     pending jobs and runs the Playwright scrape externally.
//
//   Both options POST scraped business data here for:
//     1. Validation (schema enforcement)
//     2. Deduplication (source_url / google_place_id matching)
//     3. Insertion into the leads table
//     4. Industry matching (auto-assign from category text)
//     5. Unsubscribe token generation
//     6. Job status tracking
// =============================================================================

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { CORS } from "../_shared/auth.ts";

// ── Type Definitions ─────────────────────────────────────────────────────────

interface ScrapedBusiness {
  /** Business name as shown on Google Maps */
  business_name: string;
  /** Full street address */
  address: string | null;
  /** Phone number */
  phone: string | null;
  /** Email address (may be null — hard to scrape) */
  email: string | null;
  /** Website URL */
  website: string | null;
  /** Google star rating (1.0–5.0) */
  rating: number | null;
  /** Total number of Google reviews */
  reviews_count: number | null;
  /** Business category from Google Maps (e.g. "Dentist", "Plumber") */
  category: string | null;
  /** City */
  city: string | null;
  /** State / Province */
  state: string | null;
  /** ZIP / Postal code */
  zip: string | null;
  /** Country (ISO 2-letter) */
  country: string | null;
  /** Latitude */
  latitude: number | null;
  /** Longitude */
  longitude: number | null;
  /** Full Google Maps place URL */
  source_url: string | null;
  /** Google Place ID (stable identifier) */
  google_place_id: string | null;
  /** Social media links found */
  social_links: Record<string, string> | null;
}

interface IngestLeadsRequest {
  /** Array of scraped business objects */
  leads: ScrapedBusiness[];
  /** ID of the scrape_job that produced these leads */
  scrape_job_id?: number;
  /** If true, skip duplicate check (force insert) */
  force?: boolean;
}

interface IngestLeadsResponse {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
  leads: Array<{
    id: number;
    business_name: string;
    status: "inserted" | "skipped" | "error";
    reason?: string;
  }>;
  scrape_job_id: number | null;
}

interface CreateScrapeJobRequest {
  search_query: string;
  location: string;
  industry_id?: number;
  category_filter?: string;
  location_lat?: number;
  location_lng?: number;
  radius_km?: number;
  max_results?: number;
}

interface CreateScrapeJobResponse {
  success: boolean;
  job: {
    id: number;
    search_query: string;
    location: string;
    status: string;
    started_at: string;
  } | null;
  error?: string;
}

interface UpdateScrapeJobRequest {
  status: "running" | "completed" | "partial" | "failed" | "cancelled";
  total_found?: number;
  total_inserted?: number;
  total_skipped?: number;
  error_message?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

/**
 * Normalize and deduplicate an email address.
 * Returns null for obviously invalid addresses.
 */
function normalizeEmail(email: string | null): string | null {
  if (!email) return null;
  const cleaned = email.trim().toLowerCase();
  // Basic validation — must contain @ and a domain with a dot
  if (!cleaned.includes("@") || !cleaned.includes(".")) return null;
  // Reject common scraped garbage
  if (cleaned.length > 254) return null;
  return cleaned;
}

/**
 * Map a Google Maps category string to an industry_id.
 * Uses fuzzy matching on the industries table.
 */
async function matchIndustry(
  supabase: ReturnType<typeof createClient>,
  category: string | null,
): Promise<number | null> {
  if (!category) return null;

  const { data: industries } = await supabase
    .from("industries")
    .select("id, name, slug, search_queries");

  if (!industries || industries.length === 0) return null;

  const cat = category.toLowerCase().trim();

  // Direct match on name or slug
  const direct = industries.find(
    (i) =>
      i.name.toLowerCase() === cat ||
      i.slug.toLowerCase() === cat ||
      cat.includes(i.slug.toLowerCase()),
  );
  if (direct) return direct.id;

  // Check if category contains any industry name
  for (const ind of industries) {
    const slug = ind.slug.toLowerCase();
    if (cat.includes(slug) || slug.includes(cat)) {
      return ind.id;
    }
  }

  return null;
}

/**
 * Rate-limit logger — logs to scrape_jobs and prints timing info.
 */
function logRateLimit(jobId: number | null, step: string): void {
  if (jobId) {
    console.log(`[scrape-leads][job:${jobId}] ${step}`);
  } else {
    console.log(`[scrape-leads] ${step}`);
  }
}

// ── Handlers ─────────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Only POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }

  try {
    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const supabase = createSupabaseClient();

    // ── Action dispatch ──────────────────────────────────────────────────
    // This function supports two sub-actions via the "action" field:
    //   action = "ingest"      — Insert scraped leads (default)
    //   action = "create-job"  — Create a scrape job record
    //   action = "update-job"  — Update a scrape job (status, counts)
    //   action = "start-job"   — Create + return a ready scrape job

    const action = (body.action as string) || "ingest";

    switch (action) {
      // ──────────────────────────────────────────────────────────────────
      // ACTION: ingest — Insert scraped business data
      // ──────────────────────────────────────────────────────────────────
      case "ingest": {
        const payload = body as unknown as IngestLeadsRequest;

        if (!payload.leads || !Array.isArray(payload.leads)) {
          return new Response(
            JSON.stringify({ error: "Missing required field: 'leads' (must be an array)" }),
            { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        if (payload.leads.length === 0) {
          return new Response(
            JSON.stringify({ success: true, inserted: 0, skipped: 0, errors: [], leads: [], scrape_job_id: payload.scrape_job_id ?? null }),
            { headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        // Limit batch size to prevent timeouts
        const BATCH_SIZE = 50;
        if (payload.leads.length > BATCH_SIZE) {
          return new Response(
            JSON.stringify({
              error: `Batch too large. Maximum ${BATCH_SIZE} leads per request. You sent ${payload.leads.length}.`,
            }),
            { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        logRateLimit(payload.scrape_job_id ?? null, `Ingesting ${payload.leads.length} leads`);
        const results: IngestLeadsResponse["leads"] = [];
        let inserted = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const biz of payload.leads) {
          try {
            // ── Validate required fields ───────────────────────────────
            if (!biz.business_name || typeof biz.business_name !== "string") {
              skipped++;
              results.push({
                id: 0,
                business_name: biz.business_name ?? "UNKNOWN",
                status: "error",
                reason: "Missing business_name",
              });
              continue;
            }

            // ── Deduplication ──────────────────────────────────────────
            if (!payload.force && biz.source_url) {
              const { data: existing } = await supabase
                .from("leads")
                .select("id, business_name, source_url")
                .or(
                  biz.google_place_id
                    ? `google_place_id.eq.${biz.google_place_id},source_url.eq.${biz.source_url}`
                    : `source_url.eq.${biz.source_url}`
                )
                .maybeSingle();

              if (existing) {
                skipped++;
                results.push({
                  id: existing.id,
                  business_name: existing.business_name,
                  status: "skipped",
                  reason: `Duplicate found: id=${existing.id}`,
                });
                continue;
              }
            }

            // ── Map category to industry_id ────────────────────────────
            const industryId = await matchIndustry(supabase, biz.category);

            // ── Cleanse email ──────────────────────────────────────────
            const cleanEmail = normalizeEmail(biz.email);

            // ── Insert ─────────────────────────────────────────────────
            const { data: newLead, error: insertError } = await supabase
              .from("leads")
              .insert({
                business_name: biz.business_name,
                category: biz.category ?? "Unknown",
                phone: biz.phone ?? null,
                email: cleanEmail,
                website: biz.website ?? null,
                address: biz.address ?? null,
                city: biz.city ?? null,
                state: biz.state ?? null,
                zip: biz.zip ?? null,
                country: biz.country ?? "US",
                google_rating: biz.rating ?? null,
                reviews_count: biz.reviews_count ?? null,
                google_place_id: biz.google_place_id ?? null,
                source: "google_places",
                status: "new",
                source_url: biz.source_url ?? null,
                scraped_at: new Date().toISOString(),
                scrape_job_id: payload.scrape_job_id ?? null,
                industry_id: industryId,
                latitude: biz.latitude ?? null,
                longitude: biz.longitude ?? null,
                social_links: biz.social_links ?? null,
              })
              .select("id, business_name")
              .single();

            if (insertError) {
              // Duplicate key on google_place_id — skip silently
              if (insertError.code === "23505") {
                skipped++;
                results.push({
                  id: 0,
                  business_name: biz.business_name,
                  status: "skipped",
                  reason: "Duplicate google_place_id",
                });
                continue;
              }
              throw insertError;
            }

            inserted++;
            results.push({
              id: newLead.id,
              business_name: newLead.business_name,
              status: "inserted",
            });
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            errors.push(`[${biz.business_name ?? "unknown"}]: ${msg}`);
            skipped++;
            results.push({
              id: 0,
              business_name: biz.business_name ?? "UNKNOWN",
              status: "error",
              reason: msg,
            });
          }

          // Small delay between inserts to avoid overwhelming the DB
          await new Promise((r) => setTimeout(r, 50));
        }

        // Update scrape job totals if job_id provided
        if (payload.scrape_job_id) {
          await supabase
            .from("scrape_jobs")
            .update({
              total_inserted: supabase.rpc("increment", { x: inserted }),
              total_skipped: supabase.rpc("increment", { x: skipped }),
            })
            .eq("id", payload.scrape_job_id);
        }

        logRateLimit(
          payload.scrape_job_id ?? null,
          `Done: ${inserted} inserted, ${skipped} skipped`,
        );

        const response: IngestLeadsResponse = {
          success: errors.length === 0,
          inserted,
          skipped,
          errors,
          leads: results,
          scrape_job_id: payload.scrape_job_id ?? null,
        };

        return new Response(JSON.stringify(response, null, 2), {
          status: errors.length > 0 && inserted === 0 ? 500 : 200,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // ACTION: create-job — Create a new scrape job record
      // ──────────────────────────────────────────────────────────────────
      case "create-job": {
        const payload = body as unknown as CreateScrapeJobRequest;

        if (!payload.search_query || !payload.location) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: 'search_query' and 'location'" }),
            { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        const { data: job, error: jobError } = await supabase
          .from("scrape_jobs")
          .insert({
            search_query: payload.search_query,
            location: payload.location,
            industry_id: payload.industry_id ?? null,
            category_filter: payload.category_filter ?? null,
            location_lat: payload.location_lat ?? null,
            location_lng: payload.location_lng ?? null,
            radius_km: payload.radius_km ?? 10,
            max_results: payload.max_results ?? 50,
            status: "queued",
          })
          .select("id, search_query, location, status, started_at")
          .single();

        if (jobError) {
          throw jobError;
        }

        const response: CreateScrapeJobResponse = {
          success: true,
          job,
        };

        return new Response(JSON.stringify(response, null, 2), {
          status: 201,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // ACTION: update-job — Update scrape job status and counts
      // ──────────────────────────────────────────────────────────────────
      case "update-job": {
        const jobId = body.job_id as number;
        const payload = body as unknown as UpdateScrapeJobRequest & { job_id: number };

        if (!jobId) {
          return new Response(
            JSON.stringify({ error: "Missing required field: 'job_id'" }),
            { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        const updateData: Record<string, unknown> = {
          status: payload.status,
        };

        if (payload.total_found !== undefined) updateData.total_found = payload.total_found;
        if (payload.total_inserted !== undefined) updateData.total_inserted = payload.total_inserted;
        if (payload.total_skipped !== undefined) updateData.total_skipped = payload.total_skipped;
        if (payload.error_message !== undefined) updateData.error_message = payload.error_message;

        if (payload.status === "completed" || payload.status === "failed" || payload.status === "cancelled") {
          updateData.completed_at = new Date().toISOString();
        }

        const { data: job, error: jobError } = await supabase
          .from("scrape_jobs")
          .update(updateData)
          .eq("id", jobId)
          .select("id, status, total_found, total_inserted, total_skipped, completed_at")
          .single();

        if (jobError) throw jobError;

        return new Response(JSON.stringify({ success: true, job }), {
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // ACTION: start-job — Create job + return it (one-shot for workers)
      // ──────────────────────────────────────────────────────────────────
      case "start-job": {
        // First check if there are already running jobs (rate limit)
        const { count: runningCount } = await supabase
          .from("scrape_jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "running");

        if (runningCount && runningCount >= 3) {
          return new Response(
            JSON.stringify({
              error: "Too many concurrent scrape jobs. Max 3 allowed. Wait for a running job to complete.",
              running_jobs: runningCount,
            }),
            { status: 429, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        // Create as "running" directly
        const payload = body as unknown as CreateScrapeJobRequest;

        if (!payload.search_query || !payload.location) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: 'search_query' and 'location'" }),
            { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
          );
        }

        const { data: job, error: jobError } = await supabase
          .from("scrape_jobs")
          .insert({
            search_query: payload.search_query,
            location: payload.location,
            industry_id: payload.industry_id ?? null,
            category_filter: payload.category_filter ?? null,
            location_lat: payload.location_lat ?? null,
            location_lng: payload.location_lng ?? null,
            radius_km: payload.radius_km ?? 10,
            max_results: payload.max_results ?? 50,
            status: "running",
            started_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (jobError) throw jobError;

        return new Response(JSON.stringify({ success: true, job }), {
          status: 201,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({
            error: `Unknown action: "${action}". Valid actions: ingest, create-job, update-job, start-job`,
          }),
          { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
        );
    }
  } catch (err) {
    console.error("[scrape-leads] Error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
