import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/googleSheets";
import {
  extractEmailFromCalendlyPayload,
  type CalendlyInviteeCreatedPayload,
} from "@/lib/calendly";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CalendlyInviteeCreatedPayload;
    if (body.event !== "invitee.created") {
      return NextResponse.json({ ok: true, note: "Événement ignoré" });
    }

    const email = extractEmailFromCalendlyPayload(body);
    if (!email) {
      return NextResponse.json({ ok: true, note: "Pas d'email dans le payload" });
    }

    const all = await getAllProspects();
    const prospect = all.find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );
    if (!prospect) {
      return NextResponse.json({ ok: true, note: "Aucun prospect correspondant" });
    }

    const { id, ...rest } = prospect;
    await updateProspect(id, {
      ...rest,
      statut: "RDV programmé",
      dateProchaineRelance: body.payload.scheduled_event?.start_time
        ? new Date(body.payload.scheduled_event.start_time).toLocaleDateString("fr-FR")
        : rest.dateProchaineRelance,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Erreur webhook Calendly:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
