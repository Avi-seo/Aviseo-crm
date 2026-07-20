export const STATUSES = [
  "Nouveau lead",
  "WhatsApp envoyé",
  "1er appel",
  "2e appel",
  "RDV programmé",
  "Démonstration",
  "Contrat signé",
  "Installation",
  "Client actif",
  "Perdu",
] as const;

export type Status = (typeof STATUSES)[number];

export interface WhatsAppMessage {
  date: string;
  sens: "envoye" | "recu";
  message: string;
}

export interface Prospect {
  id: string; // ex: "row-5" -> correspond à la ligne 5 du Google Sheet

  // Colonnes existantes de ton Sheet (export formulaire Meta Ads) — NE PAS RÉORDONNER
  formName: string;
  isOrganic: string;
  platform: string;
  specialite: string; // "quelle est votre spécialité ?"
  nombreAvisGoogle: string;
  doctolib: string; // "oui" / "non"
  societe: string; // company_name
  nom: string; // full_name
  email: string;
  telephone: string; // phone_number
  source: string;
  medium: string;
  campagne: string;
  formulaire: string;
  leadStatus: string; // statut Meta d'origine (ex: CREATED) — distinct de notre pipeline
  notes: string; // colonne notes déjà existante, on continue à l'utiliser

  // Colonnes ajoutées à droite pour le CRM (nouvelles, vides au départ)
  statut: Status | string;
  commercial: string;
  ville: string;
  profession: string; // libellé lisible, dérivé de "specialite" si besoin
  siteInternet: string;
  googleBusinessUrl: string;
  dateEntree: string;
  dateDernierContact: string;
  dateProchaineRelance: string;

  // WhatsApp Business
  whatsappHistorique: string; // JSON string : WhatsAppMessage[]
  dateDernierWhatsapp: string;

  // Ringover
  ringoverDureeDernierAppel: string;
  ringoverEnregistrementUrl: string;
  ringoverTranscription: string;

  // Analyse IA post-appel
  iaResume: string;
  iaObjections: string;
  iaNiveauInteret: string;
  iaProbabiliteSignature: string;
  iaDateIdealeRelance: string;
  iaSuggestionWhatsapp: string;
  iaSuggestionEmail: string;

  // Installation / client actif
  installationQrCode: string;
  installationQuestionnaire: string;
  installationLogoUrl: string;
  installationDate: string;
  installationStatut: string;
  chiffreAffaires: string;
}

export type ProspectInput = Omit<Prospect, "id">;

export interface NoteEntry {
  date: string;
  auteur: string;
  contenu: string;
}
