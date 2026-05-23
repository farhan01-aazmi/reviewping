import { useState } from "react";
import { G } from "../../data/theme";
import { SERVICES } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";

export default function Templates({ templates, setTemplates, toast }) {
  const [editing, setEditing] = useState(null);
  const [eName, setEName] = useState("");
  const [eText, setEText] = useState(
    "Hi {name}! Thanks for your {service} today. A quick review would mean a lot: {link}"
  );
  const [eSvc, setESvc] = useState("All");

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

  const save = () => {
    if (!eName || !eText) {
      toast("Fill in all fields", "error");
      return;
    }
    if (editing === "new") {
      setTemplates((p) => [
        ...p,
        { id: Date.now(), name: eName, text: eText, service: eSvc },
      ]);
    } else {
      setTemplates((p) =>
        p.map((t) =>
          t.id === editing
            ? { ...t, name: eName, text: eText, service: eSvc }
            : t
        )
      );
    }
    toast("Template saved");
    setEditing(null);
  };

  const del = (id) => {
    setTemplates((p) => p.filter((t) => t.id !== id));
    toast("Template deleted", "info");
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
            error={!eText && editing !== "new" ? "Message text is required" : ""}
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
      {templates.map((t) => (
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
      ))}
    </div>
  );
}
