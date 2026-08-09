import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { getDefaultReviewTemplates } from "../../data/reviewTemplates";
import { getLimit, hasFeature } from "../../data/constants";
import { Btn, Card, Pill } from "../ui";

const STARS = [1, 2, 3, 4, 5];
const STAR_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];
const API_BASE = import.meta.env.VITE_SUPABASE_URL || "";

export default function TemplatesPage({ userId, biz, plan }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStar, setEditStar] = useState(0);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiStar, setAiStar] = useState(null);
  const [aiDesc, setAiDesc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiDrafts, setAiDrafts] = useState({});
  const [savingDrafts, setSavingDrafts] = useState({});
  const [usage, setUsage] = useState({ aiGenerations: 0, qrScans: 0 });

  const bizType = biz?.bizType || "";

  useEffect(() => {
    if (!userId) return;
    loadTemplates();
    loadUsage();
  }, [userId]);

  async function loadUsage() {
    try {
      const { data } = await supabase
        .from("business_settings")
        .select("ai_generations_this_month")
        .eq("user_id", userId)
        .single();
      if (data) {
        setUsage((p) => ({ ...p, aiGenerations: data.ai_generations_this_month ?? 0 }));
      }
    } catch (_) {}
  }

  async function loadTemplates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("review_templates")
        .select("*")
        .eq("user_id", userId)
        .order("star_rating", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load templates");
    }
    setLoading(false);
  }

  function openNew(star) {
    setEditStar(star);
    setEditText("");
    setEditId("new");
  }

  function openEdit(t) {
    setEditStar(t.star_rating);
    setEditText(t.template_text);
    setEditId(t.id);
  }

  function cancelEdit() {
    setEditStar(0);
    setEditText("");
    setEditId(null);
  }

  async function save() {
    if (!editText.trim()) {
      toast.error("Template text is required");
      return;
    }
    if (!editStar) {
      toast.error("Select a star rating");
      return;
    }
    setSaving(true);
    try {
      if (editId === "new") {
        const { data, error } = await supabase
          .from("review_templates")
          .insert({
            user_id: userId,
            biz_type: bizType,
            star_rating: editStar,
            template_text: editText.trim(),
            source: "manual",
          })
          .select();
        if (error) throw error;
        if (data) setTemplates((p) => [...p, data[0]]);
        toast.success("Template saved");
      } else {
        const { error } = await supabase
          .from("review_templates")
          .update({ template_text: editText.trim(), updated_at: new Date().toISOString() })
          .eq("id", editId);
        if (error) throw error;
        setTemplates((p) =>
          p.map((t) => (t.id === editId ? { ...t, template_text: editText.trim() } : t))
        );
        toast.success("Template updated");
      }
      cancelEdit();
    } catch (err) {
      toast.error(err.message || "Failed to save template");
    }
    setSaving(false);
  }

  async function remove(id) {
    try {
      const { error } = await supabase.from("review_templates").delete().eq("id", id);
      if (error) throw error;
      setTemplates((p) => p.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete template");
    }
  }

  async function generateWithAI(star) {
    const desc = aiDesc[star] || "";
    if (!desc.trim()) {
      toast.error("Describe your business services first");
      return;
    }
    const limit = getLimit(plan, "aiGenerations");
    if (usage.aiGenerations >= limit) {
      toast.error(`AI generation limit reached (${limit}/mo). Upgrade your plan for more.`);
      return;
    }
    setGenerating(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE}/functions/v1/generate-review-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          business_type: bizType,
          business_name: biz?.bizName || "",
          service_description: desc.trim(),
          star_rating: star,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      setAiDrafts((p) => ({ ...p, [star]: json.templates || [] }));
      const count = json.templates?.length || 0;
      toast.success(`Generated ${count} templates`);
      await supabase.rpc("increment_ai_generations", { count, user_uuid: userId }).catch(() => {});
      setUsage((p) => ({ ...p, aiGenerations: p.aiGenerations + count }));
    } catch (err) {
      toast.error(err.message || "Failed to generate templates");
    }
    setGenerating(false);
  }

  async function saveAiDraft(star, text) {
    const hash = `${star}:${text.slice(0, 20)}`;
    setSavingDrafts((p) => ({ ...p, [hash]: true }));
    try {
      const { error } = await supabase.from("review_templates").insert({
        user_id: userId,
        biz_type: bizType,
        star_rating: star,
        template_text: text,
        source: "ai_generated",
      }).select();
      if (error) throw error;
      toast.success("Template saved");
      setAiDrafts((p) => ({ ...p, [star]: (p[star] || []).filter((t) => t !== text) }));
      loadTemplates();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    }
    setSavingDrafts((p) => ({ ...p, [hash]: false }));
  }

  const byStar = {};
  STARS.forEach((s) => {
    byStar[s] = templates.filter((t) => t.star_rating === s);
  });

  if (editId !== null) {
    return (
      <div>
        <button
          onClick={cancelEdit}
          style={{
            background: "none", border: "none", color: G.muted, cursor: "pointer",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, padding: 0, fontFamily: "'Manrope',sans-serif",
          }}
        >
          ← Back to templates
        </button>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          {editId === "new" ? "New template" : "Edit template"}
        </h2>
        <p style={{ color: G.muted, fontSize: 13, marginBottom: 22 }}>
          {STAR_LABELS[editStar - 1]} ({editStar}★) — generic only, no specific names or items.
        </p>
        <Card>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {STARS.map((star) => (
              <button
                key={star}
                onClick={() => setEditStar(star)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${editStar === star ? G.gold : G.border}`,
                  background: editStar === star ? G.goldBg : G.surface, cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: editStar === star ? G.gold : G.muted, fontFamily: "'Manrope',sans-serif",
                  transition: "all 0.12s",
                }}
              >
                {star}★
              </button>
            ))}
          </div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Write a review template… Use {business} as a placeholder for the business name."
            rows={5}
            style={{
              width: "100%", padding: 12, borderRadius: 8, border: `1.5px solid ${G.border}`,
              fontSize: 13.5, fontFamily: "'Manrope',sans-serif", color: G.ink, resize: "vertical",
              lineHeight: 1.7, outline: "none", boxSizing: "border-box",
            }}
          />
          {editText && (
            <div style={{ padding: "10px 12px", background: G.bg, borderRadius: 8, marginTop: 12, fontSize: 13, color: G.muted, lineHeight: 1.6, fontStyle: "italic" }}>
              Preview: "{editText.replace(/\{business\}/g, biz?.bizName || "My Business")}"
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn variant="secondary" onClick={cancelEdit}>Cancel</Btn>
            <Btn fullWidth onClick={save} disabled={saving}>
              {saving ? "Saving…" : editId === "new" ? "Save template" : "Update template"}
            </Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Review Templates
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            Custom review prompts shown to customers after they tap a star
          </p>
        </div>
      </div>

      {!bizType && (
        <Card sx={{ background: G.infoBg, border: `1.5px solid ${G.infoBd}`, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: G.muted, lineHeight: 1.6 }}>
            Set your business category in Settings to enable category-specific default templates.
          </p>
        </Card>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: G.muted, fontSize: 13.5 }}>Loading…</div>
      ) : (
        STARS.map((star) => {
          const custom = byStar[star] || [];
          const defaults = bizType ? getDefaultReviewTemplates(bizType, star) : [];
          const drafts = aiDrafts[star] || [];
          return (
            <div key={star} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{STAR_LABELS[star - 1]}</span>
                  <span style={{ color: G.gold, fontSize: 14 }}>{star}★</span>
                  <Pill label={`${custom.length} custom`} variant="info" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setAiStar(aiStar === star ? null : star)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", color: G.accent,
                      fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif",
                      display: "flex", alignItems: "center", gap: 4, padding: 0,
                    }}
                  >
                    <Sparkles size={14} /> AI
                  </button>
                  {custom.length >= getLimit(plan, "templatesPerRating") ? (
                    <span style={{ fontSize: 11, color: G.mutedLo, fontStyle: "italic" }}>
                      {plan === "starter" ? "Upgrade to add more" : "Limit reached"}
                    </span>
                  ) : (
                    <button
                      onClick={() => openNew(star)}
                      style={{
                        background: "none", border: "none", cursor: "pointer", color: G.accent,
                        fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif",
                        display: "flex", alignItems: "center", gap: 4, padding: 0,
                      }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              </div>

              {/* ── AI generation panel (inline per star) ── */}
              {aiStar === star && (
                <Card sx={{ marginBottom: 10, padding: "14px 16px", background: G.bg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Sparkles size={14} color={G.accent} />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Generate with AI — {STAR_LABELS[star - 1]} ({star}★)</span>
                    <span style={{ fontSize: 11, color: G.mutedLo, marginLeft: "auto" }}>
                      {usage.aiGenerations}/{getLimit(plan, "aiGenerations")} used
                    </span>
                  </div>
                  <textarea
                    value={aiDesc[star] || ""}
                    onChange={(e) => setAiDesc((p) => ({ ...p, [star]: e.target.value }))}
                    placeholder="Describe your services… e.g. Family-owned Italian restaurant serving fresh pasta, wood-fired pizza, and seasonal specials."
                    rows={2}
                    style={{
                      width: "100%", padding: 10, borderRadius: 8, border: `1.5px solid ${G.border}`,
                      fontSize: 12.5, fontFamily: "'Manrope',sans-serif", color: G.ink, resize: "vertical",
                      lineHeight: 1.6, outline: "none", boxSizing: "border-box", marginBottom: 8,
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={() => setAiStar(null)}>Cancel</Btn>
                    <Btn size="sm" fullWidth onClick={() => generateWithAI(star)} disabled={generating}>
                      {generating ? "Generating…" : "Generate"}
                    </Btn>
                  </div>

                  {/* ── AI Drafts ── */}
                  {drafts.length > 0 && (
                    <div style={{ marginTop: 12, borderTop: `1px solid ${G.border}`, paddingTop: 12 }}>
                      {drafts.map((text, i) => {
                        const hash = `${star}:${text.slice(0, 20)}`;
                        return (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                            <div style={{ flex: 1, background: G.surface, borderRadius: 8, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.6, color: G.ink, fontStyle: "italic" }}>
                              "{text}"
                            </div>
                            <button
                              onClick={() => saveAiDraft(star, text)}
                              disabled={savingDrafts[hash]}
                              style={{
                                flexShrink: 0, padding: "8px 12px", borderRadius: 6, border: "none",
                                background: G.accent, color: "white", cursor: "pointer", fontSize: 12,
                                fontWeight: 700, fontFamily: "'Manrope',sans-serif", whiteSpace: "nowrap",
                                opacity: savingDrafts[hash] ? 0.6 : 1,
                              }}
                            >
                              {savingDrafts[hash] ? "Saving…" : "Save"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              )}

              {/* ── Custom templates ── */}
              {custom.length === 0 && defaults.length === 0 && aiStar !== star && (
                <p style={{ fontSize: 12.5, color: G.mutedLo, margin: "0 0 8px" }}>No templates yet.</p>
              )}

              {custom.map((t) => (
                <Card key={t.id} sx={{ marginBottom: 6, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: G.ink, fontStyle: "italic" }}>
                        "{t.template_text}"
                      </div>
                      <div style={{ fontSize: 11, color: G.mutedLo, marginTop: 4 }}>
                        {t.source === "ai_generated" ? "AI generated" : "Manual"} · {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(t)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, padding: 4 }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => remove(t.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* ── Default fallback ── */}
              {custom.length === 0 && defaults.length > 0 && aiStar !== star && (
                <Card sx={{ marginBottom: 6, padding: "12px 14px", background: G.bg, border: `1px dashed ${G.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: G.mutedLo, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Default templates (auto-used)
                  </div>
                  {defaults.map((text, i) => (
                    <p key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: G.muted, margin: "0 0 4px", fontStyle: "italic" }}>
                      "{text.replace(/\{business\}/g, biz?.bizName || "{business}")}"
                    </p>
                  ))}
                </Card>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
