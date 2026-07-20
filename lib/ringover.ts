// --- Mode simple (fonctionne immédiatement) ---
// Ouvre l'app téléphone standard. Fonctionne sans aucun compte Ringover.
export function telOpenLink(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

// --- Mode avancé (nécessite RINGOVER_API_KEY) ---
// Déclenche un appel "click-to-call" via l'API Ringover : le softphone Ringover du
// commercial sonne d'abord, puis compose automatiquement le numéro du prospect.
export async function startRingoverCall(fromUserId: string, toNumber: string) {
  const apiKey = process.env.RINGOVER_API_KEY;
  if (!apiKey) {
    return { skipped: true, reason: "Ringover API non configurée" };
  }

  const res = await fetch("https://public-api.ringover.com/v2/calls", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: fromUserId,
      to_number: toNumber,
      device: "current",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Erreur lors du déclenchement de l'appel Ringover");
  }
  return data;
}

// Format attendu du payload envoyé par le webhook Ringover à la fin d'un appel
// (à adapter si Ringover fait évoluer son format — voir leur doc Webhooks).
export interface RingoverCallEndedPayload {
  from_number?: string;
  to_number?: string;
  duration?: number; // secondes
  record_url?: string;
  transcription?: string;
}

export function extractProspectPhoneFromWebhook(payload: RingoverCallEndedPayload) {
  // Le numéro du prospect est celui qui n'est pas la ligne du commercial ;
  // en pratique, c'est souvent to_number pour un appel sortant.
  return payload.to_number || payload.from_number || "";
}
