import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import Stars from "../ui/Stars";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import { exportCSV, fmtDate, getRating } from "../../utils/formatters";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const BASE_FN = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1`
  : "https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1";
const AI_FN_URL = `${BASE_FN}/ai-reply-generator`;

function Skeleton({ h = 14, w = "100%" }) {
  return <div style={{ height: h, background: G.border, borderRadius: 6, width: w, animation: "pulse 1.5s ease-in-out infinite", marginBottom: 8 }} />;
}

export default function ReviewsPage({ userId, onSend }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [aiLoading, setAiLoading] = useState(null);
  const [aiTone, setAiTone] = useState("Professional");

  // Negative reviews state
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [negLoading, setNegLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  // Fetch main reviews
  useEffect(() => {
    let cancelled = false;
    supabase.from("reviews").select("*").order("sentAt", { ascending: false }).then(({ data, error: err }) => {
      if (!cancelled) {
        if (err) { setError(err.message); setLoading(false); return; }
        setReviews(data || []);
        setLoading(false);
      }
    }).catch((e) => {
      if (!cancelled) { setError(e.message); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch negative reviews (1-2 star, approved = unresolved)
  useEffect(() => {
    if (!userId) return;
    setNegLoading(true);
    supabase
      .from("review_submissions")
      .select("*")
      .eq("user_id", userId)
      .lte("rating", 2)
      .eq("moderation_status", "approved")
      .order("submitted_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          console.error("Failed to fetch negative reviews:", err.message);
          return;
        }
        setNegativeReviews(data || []);
      })
      .finally(() => setNegLoading(false));
  }, [userId]);

  // Filter/sort main list
  let list =
    filter === "All"
      ? reviews
      : reviews.filter((r) =>
          filter === "Reviewed"
            ? r.status === "reviewed"
            : r.status === "pending"
        );
  if (search)
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.service.toLowerCase().includes(search.toLowerCase())
    );
  if (sort === "Newest")
    list = [...list].sort((a, b) => b.sentAt - a.sentAt);
  else if (sort === "Oldest")
    list = [...list].sort((a, b) => a.sentAt - b.sentAt);
  else if (sort === "Rating ↓")
    list = [...list].sort((a, b) => getRating(b) - getRating(a));

  const saveReply = async (id) => {
    const { error } = await supabase.from("reviews").update({ reply: replyText }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setReviews((p) => p.map((r) => (r.id === id ? { ...r, reply: replyText } : r)));
    setReplyId(null);
    setReplyText("");
    toast.success("Reply saved");
  };

  const generateAiReply = async (r) => {
    setAiLoading(r.id);
    setReplyId(r.id);
    setReplyText("Generating...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(AI_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          review_text: r.text || "",
          rating: r.rating || 5,
          author_name: r.name,
          tone: aiTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");
      setReplyText(data.reply || data.message || "Thank you for your review!");
    } catch (e) {
      console.error("AI reply error:", e);
      setReplyText(`Dear ${r.name}, thank you for your feedback! We truly appreciate your review and are glad you had a great experience.`);
      toast("AI unavailable, using default reply", "info");
    }
    setAiLoading(null);
  };

  // Generate AI reply for a negative review (from review_submissions)
  const generateAiReplyForNeg = async (r) => {
    setAiLoading(r.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(AI_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          review_text: r.review_text || "",
          rating: r.rating || 1,
          author_name: r.author_name,
          tone: "Apologetic",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");
      const reply = data.reply || data.message || "Thank you for your feedback!";
      // Copy reply to clipboard since review_submissions has no reply field
      await navigator.clipboard.writeText(reply);
      toast.success("AI reply copied to clipboard!");
    } catch (e) {
      console.error("AI reply error:", e);
      toast.error("Failed to generate AI reply");
    }
    setAiLoading(null);
  };

  // Mark negative review as resolved
  const markResolved = async (id) => {
    setResolvingId(id);
    try {
      const { error } = await supabase
        .from("review_submissions")
        .update({ moderation_status: "rejected" })
        .eq("id", id);
      if (error) { throw error; }
      setNegativeReviews((p) => p.filter((r) => r.id !== id));
      toast.success("Marked as resolved");
    } catch (e) {
      toast.error(e.message || "Failed to resolve");
    }
    setResolvingId(null);
  };

  if (error) {
    return (
      <Card sx={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400, margin: "0 0 6px" }}>Failed to load reviews</h3>
        <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>{error}</p>
      </Card>
    );
  }

  return (
    <div>
      {/* ── Needs Attention Section ── */}
      {!negLoading && negativeReviews.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: G.muted,
            letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10,
          }}>
            ⚠️ Needs Your Attention
          </div>
          {negativeReviews.map((r) => (
            <Card key={r.id} sx={{ marginBottom: 10, padding: "13px 15px", borderLeft: "4px solid #ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "#fef2f2", border: "1.5px solid #fca5a5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13, color: "#dc2626", flexShrink: 0,
                  }}>
                    {r.author_name?.[0] || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.author_name}</div>
                    <div style={{ fontSize: 12, color: G.muted }}>
                      {r.source === "gbp_sync" ? "Google" : "ReviewPing"} · {fmtDate(r.submitted_at)}
                    </div>
                  </div>
                </div>
                <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 3 }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
              </div>
              {r.review_text && (
                <div style={{
                  padding: "9px 12px", background: "#fef2f2", borderRadius: 8,
                  fontSize: 13, color: "#991b1b", fontStyle: "italic",
                  fontFamily: "'Instrument Serif',serif", lineHeight: 1.6, marginBottom: 10,
                }}>
                  "{r.review_text}"
                </div>
              )}
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => generateAiReplyForNeg(r)}
                  disabled={aiLoading === r.id}
                  style={{
                    background: "#f3e8ff", border: "1.5px solid #d8b4fe", borderRadius: 8,
                    padding: "7px 14px", fontSize: 12, cursor: aiLoading === r.id ? "wait" : "pointer",
                    color: "#9333ea", fontFamily: "'Manrope',sans-serif", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 5, opacity: aiLoading === r.id ? 0.6 : 1,
                  }}
                >
                  {aiLoading === r.id ? <><Spinner size={12} /> Generating…</> : "✨ Generate AI Reply"}
                </button>
                <button
                  onClick={() => markResolved(r.id)}
                  disabled={resolvingId === r.id}
                  style={{
                    background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8,
                    padding: "7px 14px", fontSize: 12, cursor: resolvingId === r.id ? "wait" : "pointer",
                    color: "#16a34a", fontFamily: "'Manrope',sans-serif", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 5, opacity: resolvingId === r.id ? 0.6 : 1,
                  }}
                >
                  {resolvingId === r.id ? "Resolving…" : "✓ Mark as Resolved"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            All requests
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            {reviews.length} total · {reviews.filter((r) => r.status === "reviewed").length} reviewed
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn size="sm" variant="secondary" onClick={() => exportCSV(reviews)}>↓ CSV</Btn>
          <Btn size="sm" onClick={onSend}>+ New</Btn>
        </div>
      </div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: 14 }}>🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or service…" aria-label="Search reviews" style={{
          width: "100%", background: G.surface, border: `1.5px solid ${G.border}`, borderRadius: 8,
          padding: "10px 14px 10px 36px", fontSize: 13.5, color: G.ink, outline: "2px solid transparent",
          outlineOffset: "2px", boxSizing: "border-box", fontFamily: "'Manrope',sans-serif",
        }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["All", "Reviewed", "Pending"].map((f) => (
          <Btn key={f} variant={filter === f ? "primary" : "secondary"} size="sm" onClick={() => setFilter(f)}>{f}</Btn>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
          marginLeft: "auto", background: G.surface, border: `1.5px solid ${G.border}`, borderRadius: 7,
          padding: "7px 12px", fontSize: 12, color: G.inkSoft, outline: "2px solid transparent",
          outlineOffset: "2px", fontFamily: "'Manrope',sans-serif",
        }}>
          {["Newest", "Oldest", "Rating ↓"].map((o) => (<option key={o}>{o}</option>))}
        </select>
      </div>
      {loading ? (
        [1, 2, 3].map((i) => (
          <Card key={i} sx={{ marginBottom: 10, padding: "13px 15px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G.border, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><Skeleton /><Skeleton h={12} w="60%" /></div>
            </div>
          </Card>
        ))
      ) : reviews.length === 0 ? (
        <EmptyState icon="📬" title="No reviews yet" description="Send your first review request to start collecting feedback." action={<Btn size="sm" onClick={onSend}>+ Send Review Request</Btn>} />
      ) : list.length === 0 ? (
        <EmptyState icon="🔍" title="No results found" description="Try adjusting your filters or search terms." />
      ) : (
        list.map((r) => (
          <Card key={r.id} sx={{ marginBottom: 10, padding: "13px 15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: r.text || r.reply || replyId === r.id ? 10 : 0 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: r.status === "reviewed" ? G.accentBg : G.goldBg,
                  border: `1.5px solid ${r.status === "reviewed" ? G.accentBd : G.goldBd}`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13,
                  color: r.status === "reviewed" ? G.accent : G.gold, flexShrink: 0,
                }}>
                  {r.name?.[0] || "?"}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: G.muted }}>{r.service} · {r.channel} · {fmtDate(r.sentAt)}{r.source === "gbp" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 6, padding: "1px 6px", background: G.accentBg, borderRadius: 4, fontSize: 10, fontWeight: 700, color: G.accent }}>GBP</span> : ""}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {r.status === "reviewed" ? <Stars rating={r.rating} size={13} /> : <Pill color={G.gold}>Pending</Pill>}
              </div>
            </div>
            {r.text && (
              <div style={{ padding: "9px 12px", background: G.bg, borderRadius: 8, fontSize: 13, color: G.muted, fontStyle: "italic", fontFamily: "'Instrument Serif',serif", lineHeight: 1.6, marginBottom: r.reply ? 8 : 0 }}>
                "{r.text}"
              </div>
            )}
            {r.reply && (
              <div style={{ padding: "9px 12px", background: G.successBg, border: `1px solid ${G.successBd}`, borderRadius: 8, fontSize: 12.5, color: G.success, lineHeight: 1.6, marginBottom: 0 }}>
                <span style={{ fontWeight: 700 }}>Your reply: </span>{r.reply}
              </div>
            )}
            {r.status === "reviewed" && !r.reply && replyId !== r.id && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button onClick={() => { setReplyId(r.id); setReplyText(""); setAiTone("Professional"); }} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 12, color: G.accent,
                  padding: "4px 0", fontFamily: "'Manrope',sans-serif", fontWeight: 600,
                }}>
                  + Add reply
                </button>
                <button onClick={() => generateAiReply(r)} disabled={aiLoading === r.id} style={{
                  background: "none", border: "none", cursor: aiLoading === r.id ? "wait" : "pointer", fontSize: 12,
                  color: G.purple, padding: "4px 0", fontFamily: "'Manrope',sans-serif", fontWeight: 600, opacity: aiLoading === r.id ? 0.6 : 1,
                }}>
                  {aiLoading === r.id ? <><Spinner size={12} /> Generating…</> : "✨ AI Reply"}
                </button>
              </div>
            )}
            {replyId === r.id && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  {["Professional", "Friendly", "Apologetic"].map((t) => (
                    <button key={t} onClick={() => setAiTone(t)} style={{
                      background: aiTone === t ? G.accentBg : "none", border: `1.5px solid ${aiTone === t ? G.accentBd : G.border}`,
                      borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: aiTone === t ? G.accent : G.muted,
                      fontFamily: "'Manrope',sans-serif", fontWeight: aiTone === t ? 700 : 500,
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply…" style={{
                  width: "100%", background: G.surface, border: `1.5px solid ${G.border}`, borderRadius: 8,
                  padding: "10px 12px", fontSize: 13, color: G.ink, outline: "2px solid transparent",
                  outlineOffset: "2px", boxSizing: "border-box", fontFamily: "'Manrope',sans-serif",
                  minHeight: 70, resize: "none",
                }} />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Btn size="sm" variant="secondary" onClick={() => { setReplyId(null); setAiLoading(null); }}>Cancel</Btn>
                  <Btn size="sm" onClick={() => saveReply(r.id)}>Save reply</Btn>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
