import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, updateProspect } from "@/lib/googleSheets";
import { extractProspectPhoneFromWebhook, type RingoverCallEndedPayload } from "@/lib/ringover";
import { analyzeCallTranscript } from "@/lib/ai";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "").replace(/^33/, "0").slice(-9);
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as RingoverCallEndedPayload;
    const rawPhone = extractProspectPhoneFromWebhook(payload);
    if (!rawPhone) {
      return NextResponse.json({ ok: true, note: "Pas de numéro dans le payload" });
    }

    const all = await getAllProspects();
    const target = normalizePhone(rawPhone);
    const prospect = all.find((p) => normalizePhone(p.telephone) === target);

    if (!prospect) {
      return NextResponse.json({ ok: true, note: "Aucun prospect correspondant" });
    }

    const { id, ...rest } = prospect;
    let updates: Partial<typeof rest> = {
      ringoverDureeDernierAppel: payload.duration
        ? `${Math.round(payload.duration / 60)} min`
        : rest.ringoverDureeDernierAppel,
      ringoverEnregistrementUrl: payload.record_url || rest.ringoverEnregistrementUrl,
      ringoverTranscription: payload.transcription || rest.ringoverTranscription,
      dateDernierContact: new Date().toLocaleDateString("fr-FR"),
    };

    // Si une transcription est disponible et qu'une clé Anthropic est configurée,
    // on lance automatiquement l'analyse IA post-appel.
    if (payload.transcription && process.env.ANTHROPIC_API_KEY) {
      try {
        const analysis = await analyzeCallTranscript(payload.transcription, {
          nom: rest.nom,
          societe: rest.societe,
          profession: rest.specialite || rest.profession,
        });
        updates = {
          ...updates,
          iaResume: analysis.resume,
          iaObjections: analysis.objections,
          iaNiveauInteret: analysis.niveauInteret,
          iaProbabiliteSignature: analysis.probabiliteSignature,
          iaDateIdealeRelance: analysis.dateIdealeRelance,
          iaSuggestionWhatsapp: analysis.suggestionWhatsapp,
          iaSuggestionEmail: analysis.suggestionEmail,
          dateProchaineRelance: analysis.dateIdealeRelance || rest.dateProchaineRelance,
        };
      } catch (aiErr) {
        console.error("Analyse IA échouée:", aiErr);
      }
    }

    await updateProspect(id, { ...rest, ...updates });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Erreur webhook Ringover:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
