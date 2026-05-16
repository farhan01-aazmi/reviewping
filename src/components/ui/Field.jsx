import { G } from "../../data/theme";

export default function Field({
  label,
  error,
  hint,
  note,
  type = "text",
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  required = false,
  disabled = false,
  style,
  ...rest
}) {
  const hintText = hint || note;
  const sharedStyles = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "Manrope, sans-serif",
    color: G.ink,
    background: G.surface,
    border: `1.5px solid ${error ? "#DC2626" : G.border}`,
    borderRadius: 10,
    outline: "none",
    transition: "border-color 0.15s ease",
    boxSizing: "border-box",
    resize: multiline ? "vertical" : "none",
    disabled: disabled ? 0.6 : 1,
  };

  const handleFocus = (e) => {
    if (!error) {
      e.currentTarget.style.borderColor = G.accent;
    }
  };

  const handleBlur = (e) => {
    if (!error) {
      e.currentTarget.style.borderColor = G.border;
    }
  };

  const id = rest.id || `field-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: G.inkSoft,
            marginBottom: 6,
          }}
        >
          {label}
          {required && (
            <span style={{ color: G.accent, marginLeft: 2 }}>*</span>
          )}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : hintText ? `${id}-hint` : undefined}
      style={sharedStyles}
      {...rest}
    />
  ) : (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : hintText ? `${id}-hint` : undefined}
          style={sharedStyles}
          {...rest}
        />
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            margin: "4px 0 0 0",
            fontSize: 12,
            color: "#DC2626",
          }}
        >
          {error}
        </p>
      )}
      {hintText && !error && (
        <p
          id={`${id}-hint`}
          style={{
            margin: "4px 0 0 0",
            fontSize: 12,
            color: G.muted,
          }}
        >
          {hintText}
        </p>
      )}
    </div>
  );
}
