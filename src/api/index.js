const API_BASE = import.meta.env.VITE_API_URL || "";

async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error: ${res.status}`);
  }
  return res.json();
}

export function aiWriteMessage({ name, service, business }) {
  return api("/api/ai-write", {
    method: "POST",
    body: JSON.stringify({ name, service, business }),
  });
}

export function sendSMS({ to, message }) {
  return api("/api/send-sms", {
    method: "POST",
    body: JSON.stringify({ to, message }),
  });
}

export function sendEmail({ to, subject, message }) {
  return api("/api/send-email", {
    method: "POST",
    body: JSON.stringify({ to, subject, message }),
  });
}

export function createSubscription(priceId) {
  return api("/api/create-subscription", {
    method: "POST",
    body: JSON.stringify({ price_id: priceId }),
  });
}
