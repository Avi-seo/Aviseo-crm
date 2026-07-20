import { NextRequest, NextResponse } from "next/server";
import { getProspectById, updateProspect } from "@/lib/googleSheets";
import { analyzeCallTranscript } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { id, transcription } = await req.json();
    const prospect = await getProspectById(id);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
    }

    const analysis = await analyzeCallTranscript(transcription, {
      nom: prospect.nom,
      societe: prospect.societe,
      profession: prospect.specialite || prospect.profession,
    });

    const { id: _id, ...rest } = prospect;
    const updated = await updateProspect(id, {
      ...rest,
      ringoverTranscription: transcription,
      iaResume: analysis.resume,
      iaObjections: analysis.objections,
      iaNiveauInteret: analysis.niveauInteret,
      iaProbabiliteSignature: analysis.probabiliteSignature,
      iaDateIdealeRelance: analysis.dateIdealeRelance,
      iaSuggestionWhatsapp: analysis.suggestionWhatsapp,
      iaSuggestionEmail: analysis.suggestionEmail,
      dateProchaineRelance: analysis.dateIdealeRelance || rest.dateProchaineRelance,
    });

    return NextResponse.json({ prospect: updated, analysis });
  } catch (err: any) {
    console.error("Erreur analyse IA:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
