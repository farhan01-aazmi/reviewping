import { useState, useEffect, useRef } from "react";
import { G } from "../../data/theme";
import Btn from "./Btn";
import Field from "./Field";

export default function EditProfileModal({
  open,
  profile = { name: "", email: "", phone: "" },
  onSave,
  onClose,
  loading = false,
  style,
  ...rest
}) {
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setTimeout(() => {
        const el = document.getElementById("edit-profile-name");
        el?.focus();
      }, 50);
    }
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ name, email, phone });
  };

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(2px)",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      {...rest}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        style={{
          background: G.surface,
          borderRadius: 20,
          padding: 28,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h3
          id="edit-profile-title"
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 20,
            fontWeight: 600,
            color: G.ink,
            margin: "0 0 20px 0",
          }}
        >
          Edit Profile
        </h3>

        <Field
          id="edit-profile-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Field
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 24,
          }}
        >
          <Btn variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} loading={loading}>
            Save
          </Btn>
        </div>
      </div>
    </div>
  );
}
