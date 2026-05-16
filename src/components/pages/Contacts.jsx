import { useState } from "react";
import { G } from "../../data/theme";
import { SERVICES } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import { fmtDate } from "../../utils/formatters";

export default function Contacts({ contacts, setContacts, onSend, toast }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [nName, setNName] = useState("");
  const [nPhone, setNPhone] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nSvc, setNSvc] = useState(SERVICES[0]);
  const [contactErrors, setContactErrors] = useState({});

  const list = search
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : contacts;

  const add = () => {
    const e = {};
    if (!nName.trim()) e.name = "Name required";
    if (!nPhone.trim() && !nEmail.trim()) {
      e.phone = "Phone or email required";
      e.email = "Phone or email required";
    }
    if (Object.keys(e).length) {
      setContactErrors(e);
      return;
    }
    setContactErrors({});
    setContacts((p) => [
      {
        id: Date.now(),
        name: nName,
        phone: nPhone,
        email: nEmail,
        service: nSvc,
        visits: 1,
        lastSent: Date.now(),
        optedOut: false,
      },
      ...p,
    ]);
    setShowAdd(false);
    setNName("");
    setNPhone("");
    setNEmail("");
    toast(`${nName} added to contacts`);
  };

  const handleContactKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      nName.trim() &&
      (nPhone.trim() || nEmail.trim())
    )
      add();
  };

  const toggleOpt = (id) => {
    setContacts((p) =>
      p.map((c) =>
        c.id === id ? { ...c, optedOut: !c.optedOut } : c
      )
    );
    toast("Opt-out status updated", "info");
  };

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
            Contact book
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            {contacts.length} contacts ·{" "}
            {contacts.filter((c) => c.optedOut).length} opted out
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn
            size="sm"
            variant="secondary"
            onClick={() => toast("CSV import coming soon", "info")}
          >
            ↑ Import CSV
          </Btn>
          <Btn
            size="sm"
            onClick={() => {
              setShowAdd(true);
              setContactErrors({});
            }}
          >
            + Add
          </Btn>
        </div>
      </div>
      {showAdd && (
        <Card
          sx={{
            marginBottom: 14,
            border: `1.5px solid ${G.accentBd}`,
            background: G.accentBg,
          }}
          onKeyDown={handleContactKeyDown}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Add new contact
          </div>
          <Field
            label="Full name"
            value={nName}
            onChange={setNName}
            placeholder="James Patterson"
            error={contactErrors.name}
          />
          <Field
            label="Phone number"
            value={nPhone}
            onChange={setNPhone}
            placeholder="+1 (555) 000-0000"
            error={contactErrors.phone}
          />
          <Field
            label="Email address"
            value={nEmail}
            onChange={setNEmail}
            placeholder="james@gmail.com"
            type="email"
            error={contactErrors.email}
          />
          <Sel
            label="Primary service"
            value={nSvc}
            onChange={setNSvc}
            options={SERVICES}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Btn>
            <Btn onClick={add}>Save contact</Btn>
          </div>
        </Card>
      )}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: G.muted,
          }}
        >
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email…"
          aria-label="Search contacts"
          style={{
            width: "100%",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            padding: "10px 14px 10px 36px",
            fontSize: 13.5,
            color: G.ink,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "'Manrope',sans-serif",
          }}
        />
      </div>
      {list.map((c) => (
        <Card
          key={c.id}
          sx={{
            marginBottom: 10,
            padding: "13px 15px",
            opacity: c.optedOut ? 0.6 : 1,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: c.optedOut ? G.border : G.accentBg,
                border: `1.5px solid ${
                  c.optedOut ? G.borderHi : G.accentBd
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: c.optedOut ? G.muted : G.accent,
                flexShrink: 0,
              }}
            >
              {c.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {c.name}
                </span>
                {c.optedOut && (
                  <Pill color={G.muted}>Opted out</Pill>
                )}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                {c.phone || c.email} · {c.service} · {c.visits} visit
                {c.visits !== 1 ? "s" : ""}
              </div>
              {c.lastSent && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: G.mutedLo,
                    marginTop: 2,
                  }}
                >
                  Last contacted {fmtDate(c.lastSent)}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {!c.optedOut && (
                <Btn size="sm" onClick={() => onSend(c)}>
                  Send →
                </Btn>
              )}
              <Btn
                size="sm"
                variant={c.optedOut ? "success" : "ghost"}
                onClick={() => toggleOpt(c.id)}
                sx={{ fontSize: 10.5 }}
              >
                {c.optedOut ? "Restore" : "Opt out"}
              </Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
