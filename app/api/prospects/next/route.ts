import { NextRequest, NextResponse } from "next/server";
import { getNextProspectToContact } from "@/lib/googleSheets";

export async function GET(req: NextRequest) {
  try {
    const excludeParam = req.nextUrl.searchParams.get("exclude") || "";
    const excludeIds = excludeParam.split(",").filter(Boolean);
    const prospect = await getNextProspectToContact(excludeIds);
    return NextResponse.json({ prospect });
  } catch (err: any) {
    console.error("Erreur récupération prochain prospect:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
