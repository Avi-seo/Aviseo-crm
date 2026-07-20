export interface CallAnalysis {
  resume: string;
  objections: string;
  niveauInteret: string; // "Faible" | "Moyen" | "Élevé"
  probabiliteSignature: string; // ex: "65%"
  dateIdealeRelance: string; // JJ/MM/AAAA
  suggestionWhatsapp: string;
  suggestionEmail: string;
}

const SYSTEM_PROMPT = `Tu es un assistant commercial pour AVI SEO, une entreprise qui vend des solutions
de gestion des avis Google et de visibilité en ligne à des professionnels (médecins, artisans, commerces).
Tu analyses la transcription d'un appel de prospection et tu réponds UNIQUEMENT en JSON valide,
sans aucun texte avant ou après, avec exactement ces champs :
{
  "resume": "résumé factuel de l'appel en 2-3 phrases",
  "objections": "objections ou freins exprimés par le prospect, ou 'Aucune objection notable'",
  "niveauInteret": "Faible, Moyen ou Élevé",
  "probabiliteSignature": "estimation en pourcentage, ex: 65%",
  "dateIdealeRelance": "date au format JJ/MM/AAAA la plus pertinente pour relancer",
  "suggestionWhatsapp": "message WhatsApp court et personnalisé à envoyer en relance",
  "suggestionEmail": "email court et personnalisé à envoyer en relance (avec objet suggéré)"
}`;

export async function analyzeCallTranscript(
  transcription: string,
  contextProspect: { nom: string; societe: string; profession: string }
): Promise<CallAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY non configurée — ajoute ta clé API Anthropic dans les variables d'environnement."
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Prospect : ${contextProspect.nom} — ${contextProspect.societe} (${contextProspect.profession}).

Transcription de l'appel :
"""
${transcription}
"""

Réponds uniquement avec le JSON demandé.`,
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Erreur lors de l'analyse IA");
  }

  const text = (data.content || [])
    .map((block: any) => (block.type === "text" ? block.text : ""))
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean) as CallAnalysis;
  } catch {
    throw new Error("Réponse IA invalide (JSON non parsable)");
  }
}
