import type { Prospect } from "./types";
import { isToday, isOverdue } from "./utils";

export function computeStats(prospects: Prospect[]) {
  const nouveaux = prospects.filter((p) => p.statut === "Nouveau lead").length;
  const aContacter = prospects.filter((p) =>
    ["Nouveau lead", "WhatsApp envoyé"].includes(p.statut)
  ).length;
  const whatsappEnvoyes = prospects.filter((p) => p.dateDernierWhatsapp).length;
  const appelsAEffectuer = prospects.filter((p) =>
    ["1er appel", "2e appel"].includes(p.statut)
  ).length;
  const relancesDuJour = prospects.filter(
    (p) => isToday(p.dateProchaineRelance) || isOverdue(p.dateProchaineRelance)
  ).length;
  const rdvProgrammes = prospects.filter((p) => p.statut === "RDV programmé").length;
  const installationsEnAttente = prospects.filter(
    (p) => p.statut === "Installation"
  ).length;
  const clientsActifs = prospects.filter((p) => p.statut === "Client actif").length;

  const chiffreAffaires = prospects.reduce((sum, p) => {
    const val = parseFloat((p.chiffreAffaires || "0").replace(/[^\d.,-]/g, "").replace(",", "."));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const signes = prospects.filter((p) =>
    ["Contrat signé", "Installation", "Client actif"].includes(p.statut)
  ).length;
  const perdus = prospects.filter((p) => p.statut === "Perdu").length;
  const clos = signes + perdus;
  const tauxTransformation = clos > 0 ? Math.round((signes / clos) * 100) : 0;

  return {
    total: prospects.length,
    nouveaux,
    aContacter,
    whatsappEnvoyes,
    appelsAEffectuer,
    relancesDuJour,
    rdvProgrammes,
    installationsEnAttente,
    clientsActifs,
    chiffreAffaires,
    tauxTransformation,
  };
}

export interface CommercialStats {
  commercial: string;
  total: number;
  appels: number;
  whatsapp: number;
  rdv: number;
  signatures: number;
  chiffreAffaires: number;
  tauxTransformation: number;
}

export function computeStatsByCommercial(prospects: Prospect[]): CommercialStats[] {
  const groups = new Map<string, Prospect[]>();
  for (const p of prospects) {
    const key = p.commercial || "Non assigné";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return Array.from(groups.entries())
    .map(([commercial, list]) => {
      const appels = list.filter((p) =>
        ["1er appel", "2e appel"].includes(p.statut) || p.ringoverDureeDernierAppel
      ).length;
      const whatsapp = list.filter((p) => p.dateDernierWhatsapp).length;
      const rdv = list.filter((p) =>
        ["RDV programmé", "Démonstration"].includes(p.statut)
      ).length;
      const signatures = list.filter((p) =>
        ["Contrat signé", "Installation", "Client actif"].includes(p.statut)
      ).length;
      const perdus = list.filter((p) => p.statut === "Perdu").length;
      const clos = signatures + perdus;
      const chiffreAffaires = list.reduce((sum, p) => {
        const val = parseFloat(
          (p.chiffreAffaires || "0").replace(/[^\d.,-]/g, "").replace(",", ".")
        );
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      return {
        commercial,
        total: list.length,
        appels,
        whatsapp,
        rdv,
        signatures,
        chiffreAffaires,
        tauxTransformation: clos > 0 ? Math.round((signatures / clos) * 100) : 0,
      };
    })
    .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires);
}
