import { useState } from "react";
import { G } from "../../data/theme";
import { SERVICES } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";

export default function BulkSend({ biz, templates, toast, onSent }) {
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [done2, setDone2] = useState(false);
  const [service, setService] = useState(SERVICES[0]);
  const [method, setMethod] = useState("SMS");
  const [rowErrors, setRowErrors] = useState({});

  const parseCsv = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast(
          "CSV must have a header row and at least one data row",
          "error"
        );
        return;
      }
      const header = lines[0].toLowerCase();
      const hasHeader =
        header.includes("name") ||
        header.includes("email") ||
        header.includes("phone");
      const start = hasHeader ? 1 : 0;
      const parsed = lines
        .slice(start)
        .map((l, i) => {
          const parts = l.split(",");
          if (parts.length < 2) {
            toast(`Row ${i + 1}: invalid format, skipping`, "info");
            return null;
          }
          const [name, contact] = parts;
          const trimmedName = (name || "").trim().replace(/^"|"$/g, "");
          const trimmedContact = (contact || "")
            .trim()
            .replace(/^"|"$/g, "");
          if (!trimmedName || !trimmedContact) {
            toast(
              `Row ${i + 1}: missing name or contact, skipping`,
              "info"
            );
            return null;
          }
          return { name: trimmedName, contact: trimmedContact };
        })
        .filter(Boolean);
      setRows(parsed);
      toast(`${parsed.length} contacts loaded from CSV`);
    };
    reader.readAsText(f);
  };

  const validate = () => {
    const errs = {};
    let valid = true;
    rows.forEach((r, i) => {
      const e = [];
      if (!r.name.trim()) e.push("Name required");
      if (!r.contact.trim()) e.push("Phone/Email required");
      if (e.length) {
        errs[i] = e.join(" · ");
        valid = false;
      }
    });
    setRowErrors(errs);
    return valid;
  };

  const send = () => {
    if (!rows.length) {
      toast("Add at least one recipient", "error");
      return;
    }
    if (!validate()) {
      toast("Fix invalid rows before sending", "error");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setDone2(true);
      rows.forEach((r) =>
        onSent({
          name: r.name,
          service,
          channel: method,
          sentAt: Date.now(),
        })
      );
      toast(`${rows.length} requests sent!`);
    }, 2000);
  };

  const handleRowKeyDown = (e, i) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (i === rows.length - 1) {
        setRows((p) => [...p, { name: "", contact: "" }]);
      }
    }
  };

  if (done2)
    return (
      <div style={{ textAlign: "center", padding: "52px 0" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: G.successBg,
            border: `2px solid ${G.successBd}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            margin: "0 auto 20px",
          }}
        >
          ✓
        </div>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 26,
            fontWeight: 400,
            margin: "0 0 8px",
          }}
        >
          Bulk send complete!
        </h2>
        <p
          style={{
            color: G.muted,
            marginBottom: 24,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {rows.length} review requests delivered via {method}.
        </p>
        <Btn
          onClick={() => {
            setDone2(false);
            setRows([]);
            setFile(null);
          }}
        >
          Send another batch
        </Btn>
      </div>
    );

  return (
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
        Bulk Send
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Send review requests to multiple customers at once via CSV upload.
      </p>
      <Card sx={{ marginBottom: 14 }}>
        <Sel
          label="Service provided"
          value={service}
          onChange={setService}
          options={SERVICES}
        />
        <Sel
          label="Send via"
          value={method}
          onChange={setMethod}
          options={["SMS", "Email", "Both"]}
        />
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>
          Upload customer list
        </div>
        <div
          style={{
            padding: 24,
            border: `2px dashed ${G.border}`,
            borderRadius: 10,
            textAlign: "center",
            marginBottom: 14,
            background: G.bg,
            opacity: sending ? 0.5 : 1,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div
            style={{
              fontSize: 13.5,
              color: G.muted,
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            CSV format: <strong>Name, Phone or Email</strong>
            <br />
            First row should be the header row
          </div>
          <label
            style={{ cursor: sending ? "not-allowed" : "pointer" }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={parseCsv}
              style={{ display: "none" }}
              disabled={sending}
            />
            <Btn variant="secondary" size="sm" disabled={sending}>
              Choose CSV file
            </Btn>
          </label>
          {file && (
            <div
              style={{
                fontSize: 12.5,
                color: G.success,
                marginTop: 10,
                fontWeight: 700,
              }}
            >
              ✓ {file} — {rows.length} contacts loaded
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: G.muted,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Or add manually
        </div>
        {rows.map((r, i) => (
          <div key={i}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: 8,
                marginBottom: 4,
                alignItems: "center",
              }}
            >
              <input
                value={r.name}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, idx) =>
                      idx === i ? { ...x, name: e.target.value } : x
                    )
                  )
                }
                placeholder="Customer name"
                onKeyDown={(e) => handleRowKeyDown(e, i)}
                aria-label={`Row ${i + 1} name`}
                disabled={sending}
                style={{
                  background: G.bg,
                  border: `1.5px solid ${
                    rowErrors[i] && !r.name.trim()
                      ? "#DC2626"
                      : G.border
                  }`,
                  borderRadius: 7,
                  padding: "9px 11px",
                  fontSize: 13,
                  color: sending ? G.muted : G.ink,
                  outline: "none",
                  fontFamily: "'Manrope',sans-serif",
                  opacity: sending ? 0.6 : 1,
                  cursor: sending ? "not-allowed" : "text",
                }}
              />
              <input
                value={r.contact}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, idx) =>
                      idx === i
                        ? { ...x, contact: e.target.value }
                        : x
                    )
                  )
                }
                placeholder="Phone / Email"
                onKeyDown={(e) => handleRowKeyDown(e, i)}
                aria-label={`Row ${i + 1} contact`}
                disabled={sending}
                style={{
                  background: G.bg,
                  border: `1.5px solid ${
                    rowErrors[i] && !r.contact.trim()
                      ? "#DC2626"
                      : G.border
                  }`,
                  borderRadius: 7,
                  padding: "9px 11px",
                  fontSize: 13,
                  color: sending ? G.muted : G.ink,
                  outline: "none",
                  fontFamily: "'Manrope',sans-serif",
                  opacity: sending ? 0.6 : 1,
                  cursor: sending ? "not-allowed" : "text",
                }}
              />
              <button
                onClick={() =>
                  setRows((p) => p.filter((_, idx) => idx !== i))
                }
                disabled={sending}
                style={{
                  background: "none",
                  border: "none",
                  cursor: sending ? "not-allowed" : "pointer",
                  color: G.muted,
                  fontSize: 20,
                  lineHeight: 1,
                  opacity: sending ? 0.4 : 1,
                }}
                aria-label={`Remove row ${i + 1}`}
              >
                ×
              </button>
            </div>
            {rowErrors[i] && (
              <p
                role="alert"
                style={{
                  margin: "2px 0 6px 2px",
                  fontSize: 11,
                  color: "#DC2626",
                  fontWeight: 600,
                }}
              >
                {rowErrors[i]}
              </p>
            )}
          </div>
        ))}
        <Btn
          variant="secondary"
          size="sm"
          onClick={() =>
            setRows((p) => [...p, { name: "", contact: "" }])
          }
          disabled={sending}
        >
          + Add row
        </Btn>
      </Card>
      {sending && (
        <div
          style={{
            padding: "12px 16px",
            background: G.accentBg,
            border: `1.5px solid ${G.accentBd}`,
            borderRadius: 10,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: G.accent,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: "spin 0.7s linear infinite" }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={G.accent}
              strokeWidth="3"
              strokeDasharray="31.4 31.4"
              strokeLinecap="round"
              opacity={0.3}
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={G.accent}
              strokeWidth="3"
              strokeDasharray="31.4 31.4"
              strokeLinecap="round"
              strokeDashoffset="10"
            />
          </svg>
          Sending personalised requests…
        </div>
      )}
      {rows.length > 0 && !sending && (
        <div
          style={{
            padding: "12px 16px",
            background: G.accentBg,
            border: `1.5px solid ${G.accentBd}`,
            borderRadius: 10,
            marginBottom: 14,
            fontSize: 13.5,
            color: G.inkSoft,
          }}
        >
          <strong>
            {rows.length} recipient{rows.length !== 1 ? "s" : ""}
          </strong>{" "}
          · {method} · {service}
        </div>
      )}
      <Btn
        full
        size="lg"
        onClick={send}
        loading={sending}
        disabled={sending || !rows.length}
        ariaLabel="Send bulk"
      >
        {sending
          ? `Sending to ${rows.length} contacts…`
          : `Send to ${rows.length} contact${
              rows.length !== 1 ? "s" : ""
            } →`}
      </Btn>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: G.muted,
          marginTop: 8,
        }}
      >
        AI personalises every message · GDPR compliant · Opt-out included
      </p>
    </div>
  );
}
