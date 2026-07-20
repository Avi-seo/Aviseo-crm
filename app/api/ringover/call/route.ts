import { NextRequest, NextResponse } from "next/server";
import { getProspectById } from "@/lib/googleSheets";
import { startRingoverCall } from "@/lib/ringover";

export async function POST(req: NextRequest) {
  try {
    const { id, fromUserId } = await req.json();
    const prospect = await getProspectById(id);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect introuvable" }, { status: 404 });
    }
    const result = await startRingoverCall(fromUserId, prospect.telephone);
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("Erreur appel Ringover:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
