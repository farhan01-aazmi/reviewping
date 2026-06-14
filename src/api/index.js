import { supabase } from "../config/supabase";

const API_BASE = window.location.origin + "/api/edge";

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

export function createSubscription({ plan, billing, return_url }) {
  return api("/create-checkout", {
    method: "POST",
    body: JSON.stringify({ plan, billing, return_url }),
  });
}

export async function getGbpAuthUrl() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const url = `${API_BASE}/gpb-connect?step=init`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to get auth URL");
  return data;
}

export function disconnectGbp() {
  return api("/gpb-connect?action=disconnect", { method: "POST" });
}

export function syncGbpReviews() {
  return api("/gpb-sync", { method: "POST" });
}

export function sendNegativeReviewAlert({ review_id, rating, review_text, author_name, user_id }) {
  return api("/negative-review-alert", {
    method: "POST",
    body: JSON.stringify({ review_id, rating, review_text, author_name, user_id }),
  });
}

export function sendWhatsApp({ to, message, customer_name, review_link }) {
  return api("/send-whatsapp", {
    method: "POST",
    body: JSON.stringify({ to, message, customer_name, review_link }),
  });
}

export function generateGatewayLink({ request_id, customer_name, customer_email, customer_phone }) {
  return api("/generate-gateway-link", {
    method: "POST",
    body: JSON.stringify({ request_id, customer_name, customer_email, customer_phone }),
  });
}
