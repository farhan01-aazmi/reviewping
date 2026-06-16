import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Field, Spinner, Card, Pill } from "../ui";
import { syncCompetitors, deleteCompetitor } from "../../api";
import { toast } from "sonner";

// ── Extract Place ID from Google Maps link ──
function extractPlaceId(gbpLink) {
  try {
    const url = new URL(gbpLink);

    // Format: ?cid=123456
    const cid = url.searchParams.get("cid");
    if (cid) return cid;

    // Format: /place/.../data=!3m1!4b1!4m8... (extract place_id from path)
    const pathParts = url.pathname.split("/");
    const placeIdx = pathParts.indexOf("place");
    if (placeIdx !== -1 && pathParts[placeIdx + 2]) {
      return pathParts[placeIdx + 2];
    }

    // Format: g.page/r/XXXXX
    if (url.hostname === "g.page") {
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || null;
    }

    // Try to find place_id in search params (encoded)
    const pb = url.searchParams.get("pb");
    if (pb) {
      const m = pb.match(/!1s([^!]+)/);
      if (m) return m[1];
    }

    return null;
  } catch {
    return null;
  }
}

// ── Category dropdown options ──
const CATEGORIES = [
  "",
  "Restaurant",
  "Salon",
  "Clinic",
  "Hotel",
  "E-commerce",
  "Agency",
  "Other",
];

// ── Validate GBP link format ──
const VALID_GBP_DOMAINS = [
  "maps.google.com",
  "google.com/maps",
  "g.page",
  "goo.gl/maps",
];

function isValidGbpLink(link) {
  return VALID_GBP_DOMAINS.some((d) => link.includes(d));
}

export default function CompetitorRadar({ userRating, userReviewCount, businessName, userId }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    gbp_link: "",
    website_url: "",
    category: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${window.location.origin}/api/edge/competitor-sync?action=list`,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      const data = await res.json();
      setCompetitors(data.competitors || []);
    } catch (err) {
      console.error("Failed to load competitors:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Validate form ──
  const validateForm = () => {
    const errors = {};
    if (!form.business_name.trim() || form.business_name.trim().length < 2) {
      errors.business_name = "Business name is required (min 2 characters)";
    }
    if (!form.gbp_link.trim()) {
      errors.gbp_link = "Google Maps link is required";
    } else if (!isValidGbpLink(form.gbp_link)) {
      errors.gbp_link =
        "Please paste a valid Google Maps link (maps.google.com, g.page, or goo.gl/maps)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Add competitor ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setAdding(true);
    try {
      const placeId = extractPlaceId(form.gbp_link.trim());

      // Call edge function to add
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${window.location.origin}/api/edge/competitor-sync?action=add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            business_name: form.business_name.trim(),
            google_place_id: placeId,
            website_url: form.website_url.trim() || null,
            category: form.category || null,
          }),
        }
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to add competitor");
        return;
      }

      toast.success(`${form.business_name.trim()} added to tracking!`);
      setShowAddForm(false);
      setForm({ business_name: "", gbp_link: "", website_url: "", category: "" });
      setFormErrors({});
      loadCompetitors();
    } catch (err) {
      toast.error(err.message || "Failed to add competitor");
    } finally {
      setAdding(false);
    }
  };

  // ── Sync all ──
  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${window.location.origin}/api/edge/competitor-sync?action=sync-all`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      const data = await res.json();
      toast.success(`Synced ${data.synced || 0} competitors!`);
      loadCompetitors();
    } catch (err) {
      toast.error("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // ── Sync one ──
  const handleSyncOne = async (id) => {
    setSyncingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${window.location.origin}/api/edge/competitor-sync?action=sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ competitor_id: id }),
        }
      );
      const data = await res.json();
      if (data.synced > 0) toast.success("Competitor synced!");
      loadCompetitors();
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  // ── Remove ──
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from tracking?`)) return;
    try {
      await deleteCompetitor(id);
      loadCompetitors();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ── Determine status between user and competitor ──
  const getStatus = (comp) => {
    const userCount = userReviewCount || 0;
    const compCount = comp.google_review_count || 0;
    const userRate = userRating || 0;
    const compRate = comp.google_rating || 0;

    const reviewDiff = userCount - compCount;
    const ratingDiff = userRate - compRate;

    if (reviewDiff > 0 && ratingDiff >= 0) return "ahead";
    if (reviewDiff < 0 && ratingDiff <= 0) return "behind";
    if (reviewDiff === 0 && ratingDiff === 0) return "tied";
    // Mixed signals — check which metric is more important
    return reviewDiff > 0 ? "ahead" : "behind";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ahead": return G.success;
      case "behind": return "#F59E0B"; // orange
      default: return G.border;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ahead": return "YOU'RE AHEAD 🏆";
      case "behind": return "BEHIND ⚡";
      default: return "TIED";
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <Card>
        <div style={{ padding: 24, textAlign: "center" }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 12, color: G.muted }}>Loading competitor radar...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card sx={{ marginBottom: 14 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 20,
              fontWeight: 400,
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Competitor Radar
          </h3>
          <p style={{ color: G.muted, fontSize: 13, margin: "4px 0 0" }}>
            Track local competitors' ratings & reviews
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {competitors.length > 0 && (
            <Btn
              size="sm"
              variant="secondary"
              onClick={handleSyncAll}
              loading={syncing}
              disabled={syncing}
            >
              {syncing ? "Syncing..." : "↻ Sync All"}
            </Btn>
          )}
          <Btn
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={competitors.length >= 5}
          >
            + Add Competitor
          </Btn>
        </div>
      </div>

      {/* Empty state */}
      {competitors.length === 0 && !showAddForm && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            background: G.bg,
            borderRadius: 10,
            border: `1px dashed ${G.border}`,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
          <p
            style={{
              color: G.muted,
              margin: "0 0 16px",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            No competitors added yet. Add your first competitor to see how you
            compare.
          </p>
          <Btn size="sm" onClick={() => setShowAddForm(true)}>
            + Add Your First Competitor
          </Btn>
        </div>
      )}

      {/* Competitor Cards */}
      {competitors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {competitors.map((comp) => {
            const status = getStatus(comp);
            const borderColor = getStatusColor(status);
            const userCount = userReviewCount || 0;
            const compCount = comp.google_review_count || 0;
            const userRate = userRating || 0;
            const compRate = comp.google_rating || 0;
            const reviewDiff = userCount - compCount;
            const ratingDiff = (userRate - compRate).toFixed(1);

            return (
              <div
                key={comp.id}
                style={{
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: 12,
                  padding: 16,
                  background: status === "ahead" ? G.successBg : G.surface,
                  transition: "border-color 0.2s",
                }}
              >
                {/* Top row: name + status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 15 }}>
                      🏪 {comp.business_name}
                    </strong>
                    {comp.category && (
                      <Pill
                        color={G.purple}
                        style={{ marginLeft: 8, fontSize: 10 }}
                      >
                        {comp.category}
                      </Pill>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: borderColor,
                      background: `${borderColor}15`,
                      padding: "3px 10px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getStatusLabel(status)}
                  </div>
                </div>

                {/* Ratings comparison */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  {/* Your stats */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: G.muted, marginBottom: 4 }}>
                      You
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      ⭐ {userRate.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 12, color: G.muted }}>
                      {userCount.toLocaleString()} reviews
                    </div>
                  </div>

                  {/* VS */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: G.mutedLo,
                      textAlign: "center",
                    }}
                  >
                    VS
                  </div>

                  {/* Their stats */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: G.muted, marginBottom: 4 }}>
                      {comp.business_name}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      ⭐ {compRate ? compRate.toFixed(1) : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: G.muted }}>
                      {compCount.toLocaleString()} reviews
                    </div>
                  </div>
                </div>

                {/* Difference row */}
                <div
                  style={{
                    background: G.bg,
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    fontSize: 13,
                  }}
                >
                  <span>
                    Rating:{" "}
                    <strong
                      style={{
                        color:
                          parseFloat(ratingDiff) >= 0 ? G.success : "#F59E0B",
                      }}
                    >
                      {parseFloat(ratingDiff) >= 0 ? "+" : ""}
                      {ratingDiff} ★
                    </strong>
                  </span>
                  <span>
                    Reviews:{" "}
                    <strong
                      style={{
                        color: reviewDiff >= 0 ? G.success : "#F59E0B",
                      }}
                    >
                      {reviewDiff >= 0 ? "+" : ""}
                      {reviewDiff}
                    </strong>
                  </span>
                </div>

                {/* Last synced + actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 11.5, color: G.mutedLo }}>
                    Last synced:{" "}
                    {comp.last_synced_at
                      ? new Date(comp.last_synced_at).toLocaleString()
                      : "never"}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSyncOne(comp.id)}
                      loading={syncingId === comp.id}
                      disabled={syncingId === comp.id}
                    >
                      {syncingId === comp.id ? "..." : "↻"}
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(comp.id, comp.business_name)}
                    >
                      ✕
                    </Btn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Competitor Form */}
      {showAddForm && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: G.bg,
            border: `1px solid ${G.border}`,
            borderRadius: 10,
          }}
        >
          <h4 style={{ margin: "0 0 16", fontSize: 14, fontWeight: 600 }}>
            Add Competitor
          </h4>
          <form
            onSubmit={handleAdd}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Field
              label="Business Name *"
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
              placeholder="e.g. Pizza Palace"
              error={formErrors.business_name}
            />

            <Field
              label="Google Business Profile Link *"
              value={form.gbp_link}
              onChange={(e) => setForm({ ...form, gbp_link: e.target.value })}
              placeholder="https://maps.google.com/?cid=xxx"
              error={formErrors.gbp_link}
              hint="Go to Google Maps → Search competitor → Click Share → Copy link"
            />

            <Field
              label="Website URL (optional)"
              value={form.website_url}
              onChange={(e) =>
                setForm({ ...form, website_url: e.target.value })
              }
              placeholder="https://competitor.com"
            />

            {/* Category dropdown */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: G.inkSoft,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Category (optional)
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${G.border}`,
                  background: G.surface,
                  color: G.ink,
                  fontSize: 13.5,
                  fontFamily: "'Manrope',sans-serif",
                  outline: "none",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c || "Select category..."}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setForm({
                    business_name: "",
                    gbp_link: "",
                    website_url: "",
                    category: "",
                  });
                  setFormErrors({});
                }}
              >
                Cancel
              </Btn>
              <Btn
                fullWidth
                type="submit"
                loading={adding}
                disabled={adding}
              >
                {adding ? "Adding..." : "Add Competitor"}
              </Btn>
            </div>
          </form>
        </div>
      )}

      {/* Max limit notice */}
      {competitors.length >= 5 && (
        <p
          style={{
            marginTop: 12,
            fontSize: 11,
            color: G.warning,
            textAlign: "center",
          }}
        >
          Maximum 5 competitors reached. Remove one to add more.
        </p>
      )}
    </Card>
  );
}
