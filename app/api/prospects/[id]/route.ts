import { NextRequest, NextResponse } from "next/server";
import { getProspectById, updateProspect, deleteProspect } from "@/lib/googleSheets";
import type { ProspectInput } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospect = await getProspectById(params.id);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
    }
    return NextResponse.json({ prospect });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getProspectById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
    }
    const patch = (await req.json()) as Partial<ProspectInput>;
    const merged: ProspectInput = { ...existing, ...patch };
    const prospect = await updateProspect(params.id, merged);
    return NextResponse.json({ prospect });
  } catch (err: any) {
    console.error("Erreur mise à jour prospect:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteProspect(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
