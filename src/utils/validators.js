export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PW_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(email) {
  if (!email) return "Email is required";
  if (!EMAIL_RE.test(email)) return "Invalid email format";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password needs 8+ characters";
  if (!/(?=.*[A-Z])/.test(password)) return "Password needs 1 uppercase letter";
  if (!/(?=.*\d)/.test(password)) return "Password needs 1 number";
  return "";
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return "";
}
