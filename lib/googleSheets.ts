import { google } from "googleapis";
import type { Prospect, ProspectInput } from "./types";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Prospects";
const FIRST_DATA_ROW = 2; // ligne 1 = en-têtes
const MAX_COLUMN = "ZZ"; // large marge pour couvrir n'importe quel Sheet existant

// Pour chaque champ interne du CRM, la liste des noms d'en-têtes possibles dans
// le Sheet (le premier trouvé gagne). Insensible aux accents/majuscules/espaces.
// Les champs "CRM ajoutés" (statut, commercial, ville, etc.) doivent correspondre
// exactement au nom que l'utilisateur a collé en en-tête.
const FIELD_HEADER_CANDIDATES: Record<keyof Omit<Prospect, "id">, string[]> = {
  formName: ["form_name"],
  isOrganic: ["is_organic"],
  platform: ["platform"],
  specialite: ["quelle_est_votre_specialite", "specialite", "quelle_est_votre_spécialité"],
  nombreAvisGoogle: ["combien_d_avis_google", "nombreavisgoogle", "nombre_avis_google"],
  doctolib: ["utilisez_vous_doctolib", "doctolib"],
  societe: ["company_name", "societe"],
  nom: ["full_name", "nom"],
  email: ["email"],
  telephone: ["phone_number", "telephone"],
  source: ["source"],
  campagne: ["campagne"],
  formulaire: ["formulaire"],
  leadStatus: ["lead_status", "leadstatus"],
  notes: ["notes"],

  statut: ["statut"],
  commercial: ["commercial"],
  ville: ["ville"],
  profession: ["profession"],
  siteInternet: ["siteinternet", "site_internet"],
  googleBusinessUrl: ["googlebusinessurl", "google_business"],
  dateEntree: ["dateentree", "date_entree"],
  dateDernierContact: ["datederniercontact", "date_dernier_contact"],
  dateProchaineRelance: ["dateprochainerelance", "date_prochaine_relance"],
  whatsappHistorique: ["whatsapphistorique"],
  dateDernierWhatsapp: ["datedernierwhatsapp"],
  ringoverDureeDernierAppel: ["ringoverdureedernierappel"],
  ringoverEnregistrementUrl: ["ringoverenregistrementurl"],
  ringoverTranscription: ["ringovertranscription"],
  iaResume: ["iaresume"],
  iaObjections: ["iaobjections"],
  iaNiveauInteret: ["ianiveauinteret"],
  iaProbabiliteSignature: ["iaprobabilitesignature"],
  iaDateIdealeRelance: ["iadateidealerelance"],
  iaSuggestionWhatsapp: ["iasuggestionwhatsapp"],
  iaSuggestionEmail: ["iasuggestionemail"],
  installationQrCode: ["installationqrcode"],
  installationQuestionnaire: ["installationquestionnaire"],
  installationLogoUrl: ["installationlogourl"],
  installationDate: ["installationdate"],
  installationStatut: ["installationstatut"],
  chiffreAffaires: ["chiffreaffaires", "chiffre_affaires"],
};

function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function columnLetter(n: number): string {
  let s = "";
  let num = n + 1; // n est 0-based
  while (num > 0) {
    const rem = (num - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    num = Math.floor((num - 1) / 26);
  }
  return s;
}

function getAuth() {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

let cachedHeaderMap: Record<string, number> | null = null;
let cachedLastColumnIndex = 0;

async function getHeaderMap(): Promise<{ map: Record<string, number>; lastColumnIndex: number }> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!1:1`,
  });
  const headerRow = (res.data.values?.[0] || []) as string[];

  const map: Record<string, number> = {};
  headerRow.forEach((h, i) => {
    map[normalize(h)] = i;
  });

  // Résout chaque champ interne vers son index de colonne réel dans le Sheet
  const resolved: Record<string, number> = {};
  for (const [field, candidates] of Object.entries(FIELD_HEADER_CANDIDATES)) {
    for (const candidate of candidates) {
      const normCandidate = normalize(candidate);
      if (map[normCandidate] !== undefined) {
        resolved[field] = map[normCandidate];
        break;
      }
    }
  }

  const lastColumnIndex = Math.max(headerRow.length - 1, 0);
  cachedHeaderMap = resolved;
  cachedLastColumnIndex = lastColumnIndex;
  return { map: resolved, lastColumnIndex };
}

async function ensureHeaderMap() {
  if (cachedHeaderMap) return { map: cachedHeaderMap, lastColumnIndex: cachedLastColumnIndex };
  return getHeaderMap();
}

function rowIndexFromId(id: string): number {
  const match = id.match(/^row-(\d+)$/);
  if (!match) throw new Error(`ID de prospect invalide: ${id}`);
  return parseInt(match[1], 10);
}

function rowArrayToProspect(row: string[], rowIndex: number, headerMap: Record<string, number>): Prospect {
  const obj: any = { id: `row-${rowIndex}` };
  for (const field of Object.keys(FIELD_HEADER_CANDIDATES)) {
    const colIndex = headerMap[field];
    obj[field] = colIndex !== undefined ? row[colIndex] || "" : "";
  }
  return obj as Prospect;
}

// Construit une ligne complète (jusqu'à lastColumnIndex) en ne modifiant QUE les
// colonnes que le CRM connaît ; toutes les autres colonnes existantes sont
// préservées telles quelles (important : on ne veut jamais écraser une colonne
// qu'on ne gère pas).
function mergeProspectIntoRow(
  existingRow: string[],
  data: ProspectInput,
  headerMap: Record<string, number>,
  lastColumnIndex: number
): string[] {
  const row = [...existingRow];
  while (row.length <= lastColumnIndex) row.push("");
  for (const [field, colIndex] of Object.entries(headerMap)) {
    const value = (data as any)[field];
    if (value !== undefined) {
      row[colIndex] = value ?? "";
    }
  }
  return row;
}

export async function getAllProspects(): Promise<Prospect[]> {
  const { map, lastColumnIndex } = await ensureHeaderMap();
  const sheets = getSheetsClient();
  const lastCol = columnLetter(lastColumnIndex);
  const range = `${SHEET_NAME}!A${FIRST_DATA_ROW}:${lastCol}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const rows = res.data.values || [];
  return rows
    .map((row, i) => rowArrayToProspect(row as string[], i + FIRST_DATA_ROW, map))
    .filter((p) => p.nom || p.societe);
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const { map, lastColumnIndex } = await ensureHeaderMap();
  const rowIndex = rowIndexFromId(id);
  const sheets = getSheetsClient();
  const lastCol = columnLetter(lastColumnIndex);
  const range = `${SHEET_NAME}!A${rowIndex}:${lastCol}${rowIndex}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const row = res.data.values?.[0];
  if (!row) return null;
  return rowArrayToProspect(row as string[], rowIndex, map);
}

export async function updateProspect(id: string, data: ProspectInput): Promise<Prospect> {
  const { map, lastColumnIndex } = await ensureHeaderMap();
  const rowIndex = rowIndexFromId(id);
  const sheets = getSheetsClient();
  const lastCol = columnLetter(lastColumnIndex);
  const range = `${SHEET_NAME}!A${rowIndex}:${lastCol}${rowIndex}`;

  const existingRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  const existingRow = (existingRes.data.values?.[0] || []) as string[];

  const newRow = mergeProspectIntoRow(existingRow, data, map, lastColumnIndex);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [newRow] },
  });
  return { id, ...data };
}

export async function createProspect(data: ProspectInput): Promise<Prospect> {
  const { map, lastColumnIndex } = await ensureHeaderMap();
  const sheets = getSheetsClient();
  const lastCol = columnLetter(lastColumnIndex);

  const emptyRow: string[] = new Array(lastColumnIndex + 1).fill("");
  const newRow = mergeProspectIntoRow(emptyRow, data, map, lastColumnIndex);

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${FIRST_DATA_ROW}:${lastCol}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [newRow] },
  });
  const updatedRange = appendRes.data.updates?.updatedRange || "";
  const rowMatch = updatedRange.match(/![A-Z]+(\d+):/);
  const rowIndex = rowMatch ? parseInt(rowMatch[1], 10) : FIRST_DATA_ROW;
  return { id: `row-${rowIndex}`, ...data };
}

export async function deleteProspect(id: string): Promise<void> {
  const { lastColumnIndex } = await ensureHeaderMap();
  const rowIndex = rowIndexFromId(id);
  const sheets = getSheetsClient();
  const lastCol = columnLetter(lastColumnIndex);
  const range = `${SHEET_NAME}!A${rowIndex}:${lastCol}${rowIndex}`;
  await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range });
}

export async function getNextProspectToContact(excludeIds: string[] = []): Promise<Prospect | null> {
  const all = await getAllProspects();
  const active = all.filter(
    (p) => !excludeIds.includes(p.id) && p.statut !== "Perdu" && p.statut !== "Client actif"
  );
  if (active.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function relanceScore(p: Prospect): number {
    if (!p.dateProchaineRelance) return 2;
    const parsed = parseDate(p.dateProchaineRelance);
    if (!parsed) return 2;
    return parsed.getTime() <= today.getTime() ? 0 : 1;
  }
  function statusScore(p: Prospect): number {
    const idx = [
      "Nouveau lead", "WhatsApp envoyé", "1er appel", "2e appel", "RDV programmé",
      "Démonstration", "Contrat signé", "Installation",
    ].indexOf(p.statut);
    return idx === -1 ? 99 : idx;
  }

  active.sort((a, b) => {
    const r = relanceScore(a) - relanceScore(b);
    return r !== 0 ? r : statusScore(a) - statusScore(b);
  });

  return active[0];
}

function parseDate(s: string): Date | null {
  const fr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) return new Date(parseInt(fr[3]), parseInt(fr[2]) - 1, parseInt(fr[1]));
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]));
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
