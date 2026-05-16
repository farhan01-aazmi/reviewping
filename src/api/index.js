import { supabase } from "../config/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function api(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const { headers: extraHeaders, ...restOptions } = options;

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    ...restOptions,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(errBody || `API error: ${res.status}`);
  }
  return res.json();
}

export function aiWriteMessage({ name, service, business }) {
  return api("/ai-write", {
    method: "POST",
    body: JSON.stringify({ name, service, business }),
  });
}

export function sendSMS({ to, message }) {
  return api("/send-sms", {
    method: "POST",
    body: JSON.stringify({ to, message }),
  });
}

export function sendEmail({ to, subject, message }) {
  return api("/send-email", {
    method: "POST",
    body: JSON.stringify({ to, subject, message }),
  });
}

export function createSubscription({ price_id, return_url }) {
  return api("/create-checkout", {
    method: "POST",
    body: JSON.stringify({ price_id, return_url }),
  });
}
