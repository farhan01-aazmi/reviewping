import { useState } from "react";
import { toast } from "sonner";
import { G } from "../../data/theme";
import { generateReviewReply } from "../../api";
import { supabase } from "../../config/supabase";
import Btn from "./Btn";
import Card from "./Card";
import Stars from "./Stars";
import Pill from "./Pill";
import Spinner from "./Spinner";

const TONES = ["Professional", "Friendly", "Apologetic"];

export default function ReviewCard({ review, userId, onUpdate }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(review.reply || "");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tone, setTone] = useState("Professional");

  const r = review;
  const hasReply = !!r.reply;
  const isReviewed = r.status === "reviewed";

  const handleGenerateAiReply = async () => {
    if (!r.name) return;
    setAiLoading(true);
    setReplyText("Generating...");
    try {
      const data = await generateReviewReply({
        review_text: r.text || "",
        rating: r.rating || 5,
        author_name: r.name,
        tone,
      });
      setReplyText(data.reply || data.message || "Thank you for your review!");
    } catch (e) {
      console.error("AI reply error:", e);
      setReplyText(`Dear ${r.name}, thank you for your feedback! We truly appreciate your review.`);
      toast("AI unavailable, using default reply", "info");
    }
    setAiLoading(false);
  };

  const handleSaveReply = async () => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ reply: replyText.trim() })
        .eq("id", r.id);
      if (error) throw error;
      toast.success("Reply saved");
      setShowReply(false);
      if (onUpdate) onUpdate(r.id, replyText.trim());
    } catch (err) {
      toast.error(err.message || "Failed to save reply");
    }
    setSaving(false);
  };

  return (
    <Card sx={{ marginBottom: 10, padding: "13px 15px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: r.text || showReply ? 10 : 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: isReviewed ? G.accentBg : G.goldBg,
            border: `1.5px solid ${isReviewed ? G.accentBd : G.goldBd}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: isReviewed ? G.accent : G.gold,
            flexShrink: 0,
          }}>
            {r.name?.[0] || "?"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: G.muted }}>
              {r.service}{r.service && r.channel ? " · " : ""}{r.channel}
              {r.sentAt ? ` · ${new Date(r.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
              {r.source === "gbp" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 6, padding: "1px 6px", background: G.accentBg, borderRadius: 4, fontSize: 10, fontWeight: 700, color: G.accent }}>
                  GBP
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {isReviewed ? <Stars rating={r.rating} size={13} /> : <Pill color={G.gold}>Pending</Pill>}
        </div>
      </div>

      {/* Review text */}
      {r.text && (
        <div style={{
          padding: "9px 12px", background: G.bg, borderRadius: 8,
          fontSize: 13, color: G.muted, fontStyle: "italic",
          fontFamily: "'Instrument Serif',serif", lineHeight: 1.6,
          marginBottom: hasReply ? 8 : 0,
        }}>
          "{r.text}"
        </div>
      )}

      {/* Existing reply */}
      {hasReply && !showReply && (
        <div style={{
          padding: "9px 12px", background: G.successBg, border: `1px solid ${G.successBd}`,
          borderRadius: 8, fontSize: 12.5, color: G.success, lineHeight: 1.6, marginBottom: 0,
        }}>
          <span style={{ fontWeight: 700 }}>Your reply: </span>{r.reply}
        </div>
      )}

      {/* Reply actions (only for reviewed, no reply yet) */}
      {isReviewed && !hasReply && !showReply && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button
            onClick={() => { setShowReply(true); setReplyText(""); setTone("Professional"); }}
            style={{
              background: "none", border: "none", cursor: "pointer", fontSize: 12, color: G.accent,
              padding: "4px 0", fontFamily: "'Manrope',sans-serif", fontWeight: 600,
            }}
          >
            + Add reply
          </button>
          <button
            onClick={handleGenerateAiReply}
            disabled={aiLoading}
            style={{
              background: "none", border: "none", cursor: aiLoading ? "wait" : "pointer", fontSize: 12,
              color: G.purple, padding: "4px 0", fontFamily: "'Manrope',sans-serif", fontWeight: 600,
              opacity: aiLoading ? 0.6 : 1,
            }}
          >
            {aiLoading ? <><Spinner size={12} /> Generating…</> : "✨ AI Reply"}
          </button>
        </div>
      )}

      {/* Reply editor */}
      {showReply && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {TONES.map((t) => (
              <button key={t} onClick={() => setTone(t)} style={{
                background: tone === t ? G.accentBg : "none",
                border: `1.5px solid ${tone === t ? G.accentBd : G.border}`,
                borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                color: tone === t ? G.accent : G.muted,
                fontFamily: "'Manrope',sans-serif", fontWeight: tone === t ? 700 : 500,
              }}>
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply…"
            style={{
              width: "100%", background: G.surface, border: `1.5px solid ${G.border}`, borderRadius: 8,
              padding: "10px 12px", fontSize: 13, color: G.ink, outline: "2px solid transparent",
              outlineOffset: "2px", boxSizing: "border-box", fontFamily: "'Manrope',sans-serif",
              minHeight: 70, resize: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <Btn size="sm" variant="secondary" onClick={() => { setShowReply(false); setAiLoading(false); }}>
              Cancel
            </Btn>
            <Btn size="sm" onClick={handleGenerateAiReply} loading={aiLoading} disabled={aiLoading}>
              {aiLoading ? "Generating..." : "✨ Regenerate"}
            </Btn>
            <Btn size="sm" onClick={handleSaveReply} loading={saving} disabled={saving || !replyText.trim()}>
              {saving ? "Saving..." : "Save reply"}
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
