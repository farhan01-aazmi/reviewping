import { useState } from "react";
import { G } from "../../data/theme";
import { SERVICES } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import EditProfileModal from "../ui/EditProfileModal";

export default function Settings({ biz, setBiz, user, setUser, toast }) {
  const [bn, setBn] = useState(biz.bizName || "");
  const [gl, setGl] = useState(biz.googleLink || "");
  const [bt, setBt] = useState(biz.bizType || SERVICES[0]);
  const [notifs, setNotifs] = useState({
    newReview: true,
    daily: true,
    weekly: false,
    sms: false,
  });
  const [showEdit, setShowEdit] = useState(false);

  const save = () => {
    setBiz((b) => ({ ...b, bizName: bn, googleLink: gl, bizType: bt }));
    toast("Settings saved successfully");
  };

  return (
    <div>
      {showEdit && (
        <EditProfileModal
          user={user}
          onSave={(u) => {
            setUser((prev) => ({ ...prev, ...u }));
            setShowEdit(false);
            toast("Profile updated");
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "0 0 4px",
          letterSpacing: "-0.5px",
        }}
      >
        Settings
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Manage your account and preferences.
      </p>
      <Card sx={{ marginBottom: 12 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 14,
            color: G.inkSoft,
          }}
        >
          Account
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "12px 14px",
            background: G.bg,
            borderRadius: 8,
            border: `1.5px solid ${G.border}`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: G.accentBg,
              border: `1.5px solid ${G.accentBd}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: G.accent,
            }}
          >
            {user.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12.5, color: G.muted }}>
              {user.email}
              {user.phone && ` · ${user.phone}`}
            </div>
          </div>
          <Btn variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
            Edit
          </Btn>
        </div>
      </Card>
      <Card sx={{ marginBottom: 12 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 14,
            color: G.inkSoft,
          }}
        >
          Business profile
        </div>
        <Field
          label="Business name"
          value={bn}
          onChange={setBn}
          placeholder="Your Business"
        />
        <Sel
          label="Primary service"
          value={bt}
          onChange={setBt}
          options={SERVICES}
        />
        <Field
          label="Google review link"
          value={gl}
          onChange={setGl}
          placeholder="https://g.page/r/..."
          note="Google Maps → Your Business → Share → Copy review link"
        />
      </Card>
      <Card sx={{ marginBottom: 12 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 14,
            color: G.inkSoft,
          }}
        >
          Notifications
        </div>
        {[
          { k: "newReview", l: "Email on new review" },
          { k: "daily", l: "Daily summary" },
          { k: "weekly", l: "Weekly analytics" },
          { k: "sms", l: "SMS alerts" },
        ].map((n) => (
          <div
            key={n.k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 14, color: G.inkSoft }}>{n.l}</span>
            <div
              onClick={() =>
                setNotifs((p) => ({ ...p, [n.k]: !p[n.k] }))
              }
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: notifs[n.k] ? G.accent : G.border,
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: notifs[n.k] ? "unset" : "3px",
                  right: notifs[n.k] ? "3px" : "unset",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          </div>
        ))}
      </Card>
      <Card sx={{ marginBottom: 20 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 12,
            color: G.inkSoft,
          }}
        >
          API access
        </div>
        <div
          style={{
            padding: "10px 14px",
            background: G.bg,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 12,
            color: G.inkSoft,
            marginBottom: 12,
            wordBreak: "break-all",
          }}
        >
          sk_live_rp_••••••••••••••••••••••
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" size="sm">
            Reveal key
          </Btn>
          <Btn variant="secondary" size="sm">
            Regenerate
          </Btn>
          <Btn variant="secondary" size="sm">
            View docs →
          </Btn>
        </div>
      </Card>
      <Btn onClick={save} full size="lg">
        Save changes
      </Btn>
    </div>
  );
}
