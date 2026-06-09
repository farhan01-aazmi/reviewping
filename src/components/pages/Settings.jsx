import { useState, useEffect } from "react";
import { G } from "../../data/theme";
import { useTheme } from "../../data/ThemeProvider";
import { SERVICES } from "../../data/constants";
import { supabase } from "../../config/supabase";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import EditProfileModal from "../ui/EditProfileModal";
import { toast } from "sonner";

export default function Settings({ biz, setBiz, user, setUser }) {
  const { isDark, toggleDark } = useTheme();
  const [bn, setBn] = useState(biz.bizName || "");
  const [gl, setGl] = useState(biz.googleLink || "");
  const [bt, setBt] = useState(biz.bizType || SERVICES[0]);
  const [avgVal, setAvgVal] = useState(biz.avg_order_value ?? 500);
  const [notifs, setNotifs] = useState({
    newReview: true,
    daily: true,
    weekly: false,
    sms: false,
  });
  const [showEdit, setShowEdit] = useState(false);


  // Load notification preferences from DB
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("notif_prefs")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) return;
        if (data?.notif_prefs) {
          setNotifs((prev) => ({ ...prev, ...data.notif_prefs }));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const save = () => {
    setBiz((b) => ({ ...b, bizName: bn, googleLink: gl, bizType: bt, avg_order_value: Number(avgVal) || 500 }));

    // Persist notification preferences
    if (user?.id) {
      supabase
        .from("profiles")
        .update({ notif_prefs: notifs })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to save notif prefs:", error);
        })
        .catch(console.error);
    }

    toast.success("Settings saved successfully");
  };

  const handleEditProfileSave = (updatedUser) => {
    // Update local state
    setUser((prev) => ({ ...prev, ...updatedUser }));

    // Persist to Supabase profiles table
    if (user?.id) {
      supabase
        .from("profiles")
        .update({
          full_name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) {
            toast.error("Failed to save profile");
            return;
          }
          setShowEdit(false);
          toast.success("Profile updated");
        })
        .catch(() => toast.error("Failed to save profile"));
    } else {
      setShowEdit(false);
      toast.success("Profile updated");
    }
  };

  return (
    <div>
      {showEdit && (
        <EditProfileModal
          open={showEdit}
          profile={user}
          onSave={handleEditProfileSave}
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
            {user.name?.[0] || "?"}
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
          onChange={(e) => setBn(e.target.value)}
          placeholder="Your Business"
        />
        <Sel
          label="Primary service"
          value={bt}
          onChange={(e) => setBt(e.target.value)}
          options={SERVICES}
        />
        <Field
          label="Google review link"
          value={gl}
          onChange={(e) => setGl(e.target.value)}
          placeholder="https://g.page/r/..."
          note="Google Maps → Your Business → Share → Copy review link"
        />
        <Field
          label="Average order / service value ($)"
          value={avgVal}
          onChange={(e) => setAvgVal(e.target.value)}
          placeholder="500"
          note="Used to estimate your ROI from new reviews"
          type="number"
          min="1"
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
      <Card sx={{ marginBottom: 12 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 14,
            color: G.inkSoft,
          }}
        >
          Appearance
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, color: G.inkSoft }}>Dark Mode</span>
          <div
            onClick={toggleDark}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: isDark ? G.accent : G.border,
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
                left: isDark ? "unset" : "3px",
                right: isDark ? "3px" : "unset",
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
      </Card>

      <Btn onClick={save} fullWidth size="lg">
        Save changes
      </Btn>
    </div>
  );
}
