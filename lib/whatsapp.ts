// --- Mode simple (fonctionne immédiatement, sans compte développeur Meta) ---
// Ouvre une conversation WhatsApp pré-remplie dans l'app ou WhatsApp Web.
export function whatsappOpenLink(phone: string, message?: string) {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^0/, "33"); // France par défaut
  const base = `https://wa.me/${digits.replace("+", "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// --- Mode avancé (nécessite WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID) ---
// Envoie un message via l'API Cloud WhatsApp Business (template ou texte libre selon la fenêtre de 24h).
// Retourne { skipped: true } si les identifiants ne sont pas configurés, pour ne jamais faire planter l'app.
export async function sendWhatsAppMessage({
  to,
  templateName,
  languageCode = "fr",
  bodyParams = [],
}: {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParams?: string[];
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { skipped: true, reason: "WhatsApp Cloud API non configurée" };
  }

  const digits = to.replace(/[^\d+]/g, "").replace(/^0/, "33").replace("+", "");

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digits,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: bodyParams.length
            ? [
                {
                  type: "body",
                  parameters: bodyParams.map((text) => ({ type: "text", text })),
                },
              ]
            : undefined,
        },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Erreur envoi WhatsApp");
  }
  return data;
}
