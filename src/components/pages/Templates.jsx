import { useState, useEffect } from "react";
import { G } from "../../data/theme";
import { SERVICES } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";

const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: "Dental check-up follow-up",
    text: "Hi {name}! Thanks for visiting us today. We'd love your feedback: {link}",
    service: "Dental Appointment",
  },
  {
    id: 2,
    name: "Restaurant review request",
    text: "Thanks for dining with us, {name}! Your review helps others discover great food: {link}",
    service: "Restaurant Dining",
  },
  {
    id: 3,
    name: "Auto service follow-up",
    text: "Hi {name}, your {service} is complete. Mind leaving a quick review? {link}",
    service: "Car Service",
  },
  {
    id: 4,
    name: "Salon visit thank-you",
    text: "Thanks {name} for stopping by today! A quick review helps us a ton: {link}",
    service: "Hair & Beauty",
  },
  {
    id: 5,
    name: "General follow-up",
    text: "Hi {name}! Thanks for your {service} today. A quick review would mean a lot: {link}",
    service: "All",
  },
];

export default function Templates({ userId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [eName, setEName] = useState("");
  const [eText, setEText] = useState(
    "Hi {name}! Thanks for your {service} today. A quick review would mean a lot: {link}"
  );
  const [eSvc, setESvc] = useState("All");

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("templates")
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;
        setTemplates([...DEFAULT_TEMPLATES, ...(data || [])]);
      } catch (err) {
        toast.error(err.message || "Failed to load templates");
        setTemplates(DEFAULT_TEMPLATES);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const openNew = () => {
    setEName("");
    setEText(
      "Hi {name}! Thanks for your {service} today. A quick review would mean a lot: {link}"
    );
    setESvc("All");
    setEditing("new");
  };

  const openEdit = (t) => {
    setEName(t.name);
    setEText(t.text);
    setESvc(t.service);
    setEditing(t.id);
  };

  const save = async () => {
    if (!eName || !eText) {
      toast.error("Fill in all fields");
      return;
    }
    try {
      if (editing === "new") {
        const { data, error } = await supabase
          .from("templates")
          .insert({ user_id: userId, name: eName, text: eText, service: eSvc })
          .select();
        if (error) throw error;
        setTemplates((p) => [...p, data[0]]);
        toast.success("Template saved");
      } else if (editing <= 5) {
        // Editing a default template — create a custom copy
        const { data, error } = await supabase
          .from("templates")
          .insert({ user_id: userId, name: eName, text: eText, service: eSvc })
          .select();
        if (error) throw error;
        setTemplates((p) => [...p, data[0]]);
        toast.success("Template saved as custom");
      } else {
        // Editing a custom template — update in DB
        const { data, error } = await supabase
          .from("templates")
          .update({ name: eName, text: eText, service: eSvc })
          .eq("id", editing)
          .select();
        if (error) throw error;
        setTemplates((p) =>
          p.map((t) => (t.id === editing ? data[0] : t))
        );
        toast.success("Template updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error(err.message || "Failed to save template");
    }
  };

  const del = async (id) => {
    try {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
      setTemplates((p) => p.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete template");
    }
  };

  const handleTplKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA")
      save();
  };

  if (editing !== null)
    return (
      <div>
        <button
          onClick={() => setEditing(null)}
          style={{
            background: "none",
            border: "none",
            color: G.muted,
            cursor: "pointer",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            padding: 0,
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          ← Back to templates
        </button>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 24,
            fontWeight: 400,
            margin: "0 0 4px",
            letterSpacing: "-0.5px",
          }}
        >
          {editing === "new" ? "New template" : "Edit template"}
        </h2>
        <p style={{ color: G.muted, fontSize: 13, marginBottom: 22 }}>
          Use <strong>{"{name}"}</strong>, <strong>{"{link}"}</strong>,{" "}
          <strong>{"{service}"}</strong> as placeholders.
        </p>
        <Card onKeyDown={handleTplKeyDown}>
          <Field
            label="Template name"
            value={eName}
            onChange={(e) => setEName(e.target.value)}
            placeholder="e.g. Dental follow-up"
            error={!eName && editing !== "new" ? "Name is required" : ""}
          />
          <Sel
            label="Best for service"
            value={eSvc}
            onChange={(e) => setESvc(e.target.value)}
            options={["All", ...SERVICES]}
          />
          <Field
            label="Message text"
            value={eText}
            onChange={(e) => setEText(e.target.value)}
            placeholder="Hi {name}…"
            multiline
            error={
              !eText && editing !== "new" ? "Message text is required" : ""
            }
          />
          <div
            style={{
              padding: "12px 14px",
              background: G.bg,
              borderRadius: 8,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: G.muted,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              Preview
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: G.inkSoft,
                lineHeight: 1.65,
                fontStyle: "italic",
              }}
            >
              {eText
                .replace("{name}", "James")
                .replace("{link}", "g.page/r/mybiz")
                .replace("{service}", eSvc)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Btn>
            <Btn fullWidth onClick={save}>
              Save template
            </Btn>
          </div>
        </Card>
      </div>
    );

  if (loading)
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 26,
                fontWeight: 400,
                margin: "0 0 4px",
                letterSpacing: "-0.5px",
              }}
            >
              Templates
            </h2>
            <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
              Reusable message templates
            </p>
          </div>
        </div>
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: G.muted,
            fontSize: 13.5,
          }}
        >
          Loading…
        </div>
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 26,
              fontWeight: 400,
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            Templates
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            Reusable message templates
          </p>
        </div>
        <Btn size="sm" onClick={openNew}>
          + New
        </Btn>
      </div>
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          💡 Templates auto-apply when the service type matches. You can always
          use AI to write a fresh message instead.
        </p>
      </Card>
      {templates && templates.length > 0 ? templates.map((t) => (
        <Card key={t.id} sx={{ marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>
                {t.name}
              </div>
              <Pill color={G.purple}>{t.service}</Pill>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="secondary" size="sm" onClick={() => openEdit(t)}>
                Edit
              </Btn>
              {t.id > 5 && (
                <Btn variant="danger" size="sm" onClick={() => del(t.id)}>
                  Delete
                </Btn>
              )}
            </div>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: G.muted,
              lineHeight: 1.65,
              fontStyle: "italic",
              fontFamily: "'Instrument Serif',serif",
            }}
          >
            "{t.text}"
          </p>
        </Card>
        )) : (
        <div style={{ padding: 40, textAlign: "center", color: G.muted, fontSize: 13.5 }}>
          No templates yet. Click <strong>+ New</strong> to create one.
        </div>
      )}
    </div>
  );
}
