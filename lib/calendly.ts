// --- Mode simple (fonctionne immédiatement) ---
// Lien vers ta page de réservation Calendly, pré-rempli avec les infos du prospect.
export function calendlyBookingLink(prospectName: string, email: string) {
  const base = process.env.NEXT_PUBLIC_CALENDLY_URL || "";
  if (!base) return "";
  const params = new URLSearchParams({
    name: prospectName,
    email: email,
  });
  return `${base}?${params.toString()}`;
}

// --- Mode avancé (webhook Calendly) ---
// Format simplifié du payload envoyé par Calendly sur l'événement "invitee.created".
// Voir la doc officielle pour la structure complète.
export interface CalendlyInviteeCreatedPayload {
  event: "invitee.created";
  payload: {
    email: string;
    name: string;
    scheduled_event: {
      start_time: string;
      event_type: string;
    };
  };
}

export function extractEmailFromCalendlyPayload(
  body: CalendlyInviteeCreatedPayload
): string {
  return body?.payload?.email || "";
}
