import { useEffect, useRef } from "react";
import { G } from "../../data/theme";
import Btn from "./Btn";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
  loading = false,
  style,
  ...rest
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Focus trap: focus the confirm button
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

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
        if (e.target === e.currentTarget && onCancel) onCancel();
      }}
      {...rest}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        style={{
          background: G.surface,
          borderRadius: 20,
          padding: 28,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h3
          id="confirm-modal-title"
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 20,
            fontWeight: 600,
            color: G.ink,
            margin: "0 0 8px 0",
          }}
        >
          {title}
        </h3>
        {message && (
          <p
            style={{
              fontSize: 14,
              color: G.inkSoft,
              margin: "0 0 24px 0",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Btn>
          <Btn
            ref={confirmRef}
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}
