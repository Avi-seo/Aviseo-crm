import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, createProspect } from "@/lib/googleSheets";
import type { ProspectInput } from "@/lib/types";

export async function GET() {
  try {
    const prospects = await getAllProspects();
    return NextResponse.json({ prospects });
  } catch (err: any) {
    console.error("Erreur lecture Google Sheet:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de la lecture du Google Sheet" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProspectInput;
    const prospect = await createProspect(body);
    return NextResponse.json({ prospect }, { status: 201 });
  } catch (err: any) {
    console.error("Erreur création prospect:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de la création du prospect" },
      { status: 500 }
    );
  }
}
