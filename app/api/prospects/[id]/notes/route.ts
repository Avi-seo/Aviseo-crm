import { NextRequest, NextResponse } from "next/server";
import { getProspectById, updateProspect } from "@/lib/googleSheets";
import { appendNote } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auteur, contenu } = (await req.json()) as {
      auteur: string;
      contenu: string;
    };
    const existing = await getProspectById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
    }
    const notes = appendNote(existing.notes, auteur || "Commercial", contenu);
    const today = new Date().toLocaleDateString("fr-FR");
    const { id, ...rest } = existing;
    const prospect = await updateProspect(params.id, {
      ...rest,
      notes,
      dateDernierContact: today,
    });
    return NextResponse.json({ prospect });
  } catch (err: any) {
    console.error("Erreur ajout note:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de l'ajout de la note" },
      { status: 500 }
    );
  }
}
