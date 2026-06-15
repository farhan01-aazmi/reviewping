import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Field, Spinner, Card, Pill } from "../ui";
import { listCompetitors, addCompetitor, syncCompetitors, deleteCompetitor } from "../../api";

export default function CompetitorRadar({ userRating, userReviewCount, businessName }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", google_maps_url: "" });
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);

  // Compute user's rank and leaderboard
  const allEntries = [
    {
      id: "user",
      name: businessName || "Your Business",
      city: "",
      rating: userRating || 0,
      review_count: userReviewCount || 0,
      isUser: true,
    },
    ...competitors.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city || "",
      rating: c.current_rating,
      review_count: c.current_review_count,
      isUser: false,
      previous_review_count: c.previous_review_count,
    })),
  ].filter(e => e.review_count > 0 || e.isUser)
    .sort((a, b) => b.review_count - a.review_count)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const userEntry = allEntries.find(e => e.isUser);
  const topCompetitor = allEntries.find(e => !e.isUser);
  const gap = userEntry && topCompetitor ? userEntry.review_count - topCompetitor.review_count : 0;

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    setLoading(true);
    try {
      const data = await listCompetitors();
      setCompetitors(data.competitors || []);
      const lastSync = competitors
        .filter(c => c.last_synced_at)
        .sort((a, b) => new Date(b.last_synced_at) - new Date(a.last_synced_at))[0];
      setLastSynced(lastSync?.last_synced_at || null);
    } catch (err) {
      console.error("Failed to load competitors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await addCompetitor({
        name: form.name.trim(),
        city: form.city.trim() || null,
        google_maps_url: form.google_maps_url.trim() || null,
      });
      if (res.success) {
        setShowAddForm(false);
        setForm({ name: "", city: "", google_maps_url: "" });
        loadCompetitors();
      } else {
        setError(res.error || "Failed to add competitor");
      }
    } catch (err) {
      setError(err.message || "Failed to add competitor");
    } finally {
      setAdding(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncCompetitors();
      loadCompetitors();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this competitor?")) return;
    try {
      await deleteCompetitor(id);
      loadCompetitors();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatGap = (userCount, compCount) => {
    const diff = userEntry?.review_count - compCount;
    if (diff > 0) return `+${diff} ahead`;
    if (diff < 0) return `${Math.abs(diff)} behind`;
    return "tied";
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return G.success;
    if (rating >= 4) return G.warning;
    if (rating >= 3) return G.accent;
    return G.danger;
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400, margin: 0, letterSpacing: "-0.3px" }}>
            Competitor Radar
          </h3>
          <p style={{ color: G.muted, fontSize: 13, margin: "4px 0 0" }}>
            Track local competitors' ratings & reviews
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="secondary" onClick={handleSync} loading={syncing} disabled={syncing}>
            {syncing ? <Spinner size="sm" /> : "↻ Sync Now"}
          </Btn>
          <Btn size="sm" onClick={() => setShowAddForm(true)} disabled={competitors.length >= 5}>
            + Add Competitor
          </Btn>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", color: "#991B1B", fontSize: 13, padding: "10px 14px", borderRadius: 8, marginBottom: 16, border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      {/* Leaderboard */}
      <div style={{ marginBottom: 16 }}>
        {allEntries.length === 1 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", background: G.bg, borderRadius: 10, border: `1px dashed ${G.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
            <p style={{ color: G.muted, margin: "0 0 16px", fontSize: 14, lineHeight: 1.6 }}>
              No competitors added yet. Add your first competitor to see how you compare.
            </p>
            <Btn size="sm" onClick={() => setShowAddForm(true)}>+ Add Your First Competitor</Btn>
          </div>
        ) : (
          <div style={{ border: `1px solid ${G.border}`, borderRadius: 10, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 100px 60px 60px", padding: "12px 16px", background: G.surface, borderBottom: `1px solid ${G.border}`, fontSize: 11, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <span>#</span>
              <span>Business</span>
              <span>City</span>
              <span>Rating</span>
              <span>Reviews</span>
              <span>Gap</span>
            </div>
            {/* Rows */}
            {allEntries.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 80px 100px 60px 60px",
                  padding: "12px 16px",
                  borderBottom: i < allEntries.length - 1 ? `1px solid ${G.border}` : "none",
                  background: entry.isUser ? G.successBg : "transparent",
                  borderLeft: entry.isUser ? `3px solid ${G.success}` : "none",
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontWeight: 700, color: entry.isUser ? G.success : G.muted, display: "flex", alignItems: "center" }}>
                  {entry.rank}{entry.isUser && <span style={{ marginLeft: 6, fontSize: 10, background: G.success, color: "white", padding: "1px 5px", borderRadius: 4 }}>YOU</span>}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: entry.isUser ? 700 : 500 }}>{entry.name}</span>
                  {entry.isUser && <Pill color={G.success} style={{ fontSize: 9 }}>YOU</Pill>}
                </div>
                <span style={{ color: G.muted, fontSize: 12 }}>{entry.city || "—"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: getRatingColor(entry.rating || 0), fontWeight: 600 }}>{entry.rating ? entry.rating.toFixed(1) : "—"}</span>
                  <span style={{ fontSize: 14 }}>⭐</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{entry.review_count?.toLocaleString() || 0}</span>
                <span style={{
                  fontWeight: 600,
                  fontSize: 12,
                  color: entry.isUser ? "transparent" : (userEntry && userEntry.review_count > entry.review_count ? G.success : G.danger),
                }}>
                  {entry.isUser ? "—" : formatGap(userEntry?.review_count || 0, entry.review_count)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Competitor Form */}
      {showAddForm && (
        <div style={{ marginTop: 16, padding: 16, background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10 }}>
          <h4 style={{ margin: "0 0 16", fontSize: 14, fontWeight: 600 }}>Add Competitor</h4>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field
              label="Business Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Competitor business name"
              error={error}
            />
            <Field
              label="City (optional)"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
            />
            <Field
              label="Google Maps URL (optional)"
              value={form.google_maps_url}
              onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn variant="secondary" type="button" onClick={() => { setShowAddForm(false); setForm({ name: "", city: "", google_maps_url: "" }); }}>
                Cancel
              </Btn>
              <Btn fullWidth type="submit" loading={adding} disabled={adding}>
                {adding ? "Adding..." : "Add Competitor"}
              </Btn>
            </div>
          </form>
        </div>
      )}

      {/* Last synced */}
      {lastSynced && (
        <p style={{ marginTop: 16, fontSize: 11.5, color: G.mutedLo, textAlign: "right" }}>
          Last synced: {new Date(lastSynced).toLocaleString()}
        </p>
      )}

      {/* Max limit notice */}
      {competitors.length >= 5 && (
        <p style={{ marginTop: 12, fontSize: 11, color: G.warning, textAlign: "center" }}>
          Maximum 5 competitors reached. Remove one to add more.
        </p>
      )}
    </Card>
  );
}