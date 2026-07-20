import { NextRequest, NextResponse } from "next/server";
import { getProspectById, updateProspect } from "@/lib/googleSheets";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { WhatsAppMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { id, templateName, bodyParams, messagePreview } = await req.json();
    const prospect = await getProspectById(id);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
    }

    const result = await sendWhatsAppMessage({
      to: prospect.telephone,
      templateName,
      bodyParams,
    });

    // Historise l'envoi que le message soit passé par l'API réelle ou par le lien wa.me
    const history: WhatsAppMessage[] = prospect.whatsappHistorique
      ? JSON.parse(prospect.whatsappHistorique)
      : [];
    history.push({
      date: new Date().toLocaleString("fr-FR"),
      sens: "envoye",
      message: messagePreview || `[Template: ${templateName}]`,
    });

    const { id: _id, ...rest } = prospect;
    const updated = await updateProspect(id, {
      ...rest,
      whatsappHistorique: JSON.stringify(history),
      dateDernierWhatsapp: new Date().toLocaleDateString("fr-FR"),
      statut: prospect.statut === "Nouveau lead" ? "WhatsApp envoyé" : prospect.statut,
    });

    return NextResponse.json({ prospect: updated, apiResult: result });
  } catch (err: any) {
    console.error("Erreur envoi WhatsApp:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
