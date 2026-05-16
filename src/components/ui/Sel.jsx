import { G } from "../../data/theme";

export default function Sel({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  style,
  ...rest
}) {
  const id = rest.id || `sel-${label?.toLowerCase().replace(/\s+/g, "-")}`;

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
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: 14,
          fontFamily: "Manrope, sans-serif",
          color: value ? G.ink : G.muted,
          background: G.surface,
          border: `1.5px solid ${error ? "#DC2626" : G.border}`,
          borderRadius: 10,
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "border-color 0.15s ease",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9186' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = G.accent;
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = G.border;
        }}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <p
          role="alert"
          style={{ margin: "4px 0 0 0", fontSize: 12, color: "#DC2626" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
