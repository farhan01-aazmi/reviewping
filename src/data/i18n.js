/**
 * Simple i18n — Translations for review request templates.
 *
 * Usage:
 *   import { t } from "../data/i18n";
 *   t("We value your feedback", "es"); // → "Valoramos tu opinión"
 */

const translations = {
  es: {
    // Greetings
    "Hi": "Hola",
    "Dear": "Estimado",
    "Hello": "Hola",

    // Email Subject Lines
    "How was your experience?": "¿Cómo fue tu experiencia?",
    "We'd love your feedback": "Nos encantaría tu opinión",
    "Share your experience": "Comparte tu experiencia",
    "Your opinion matters to us": "Tu opinión es importante para nosotros",

    // Email Body
    "Thank you for choosing": "Gracias por elegir",
    "We hope you enjoyed your experience.": "Esperamos que hayas disfrutado tu experiencia.",
    "Your feedback helps us improve and serve you better.": "Tus comentarios nos ayudan a mejorar y atenderte mejor.",
    "It would mean a lot to us if you could take a moment to share your experience.": "Significaría mucho para nosotros si pudieras tomarte un momento para compartir tu experiencia.",
    "Leave a review": "Dejar una reseña",
    "Share your feedback": "Comparte tu opinión",

    // SMS
    "Hi {name}, thanks for visiting {business}! We'd love your feedback:": "Hola {name}, ¡gracias por visitar {business}! Nos encantaría tu opinión:",
    "Tap here to leave a review": "Toca aquí para dejar una reseña",
    "Or copy this link": "O copia este enlace",
    "Thank you!": "¡Gracias!",
    "The {business} Team": "El equipo de {business}",

    // Review landing page
    "Loading review…": "Cargando reseña…",
    "Link not found": "Enlace no encontrado",
    "This review link is invalid or has expired.": "Este enlace de reseña no es válido o ha caducado.",
    "Thank you!": "¡Gracias!",
    "We'd love to hear about your experience.": "Nos encantaría saber sobre tu experiencia.",

    // Generic
    "Powered by": "Desarrollado por",
    "Unsubscribe": "Cancelar suscripción",
    "ReviewPing": "ReviewPing",
  },
};

/**
 * Translate a string to the given locale.
 * Falls back to English if no translation is found.
 */
export function t(str, locale = "en") {
  if (locale === "en") return str;
  const lang = translations[locale];
  if (!lang) return str;
  return lang[str] || str;
}

/**
 * Get available languages.
 */
export function getLanguages() {
  return [
    { code: "en", name: "English", native: "English" },
    { code: "es", name: "Spanish", native: "Español" },
  ];
}

/**
 * Get the default templates for a given locale.
 */
export function getDefaultTemplates(locale = "en") {
  const templates = {
    email: {
      subject: t("How was your experience?", locale),
      body: `${t("Hi", locale)} {{customer_name}},\n\n${t("Thank you for choosing", locale)} {{business_name}}. ${t("We hope you enjoyed your experience.", locale)}\n\n${t("Your feedback helps us improve and serve you better.", locale)}\n\n{{review_link}}\n\n${t("Thank you!", locale)}\n${t("The", locale)} {{business_name}} ${t("Team", locale)}`,
    },
    sms: {
      body: `${t("Hi", locale)} {{customer_name}}, thanks for visiting {{business_name}}! ${t("We'd love your feedback", locale)}: {{review_link}}`,
    },
  };
  return templates;
}
