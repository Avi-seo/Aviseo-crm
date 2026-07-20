import type { NoteEntry, Status } from "./types";

export function cx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

export function mailHref(email: string) {
  return `mailto:${email}`;
}

const NOTE_SEPARATOR = "\n\n---\n\n";

export function parseNotes(raw: string): NoteEntry[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(NOTE_SEPARATOR)
    .filter(Boolean)
    .map((block) => {
      const firstLineBreak = block.indexOf("\n");
      const header = firstLineBreak === -1 ? block : block.slice(0, firstLineBreak);
      const contenu = firstLineBreak === -1 ? "" : block.slice(firstLineBreak + 1);
      const headerMatch = header.match(/^\[(.+?)\]\s*(.*)$/);
      return {
        date: headerMatch ? headerMatch[1] : "",
        auteur: headerMatch ? headerMatch[2] : "",
        contenu: headerMatch ? contenu : block,
      };
    })
    .reverse(); // plus récent en premier
}

export function appendNote(raw: string, auteur: string, contenu: string): string {
  const date = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const entry = `[${date}] ${auteur}\n${contenu}`;
  if (!raw || !raw.trim()) return entry;
  return `${raw}${NOTE_SEPARATOR}${entry}`;
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = parseFlexibleDate(dateStr);
  if (!parsed) return false;
  const today = new Date();
  return (
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
  );
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = parseFlexibleDate(dateStr);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() < today.getTime();
}

// Accepte les formats JJ/MM/AAAA et AAAA-MM-JJ
export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const frMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Nouveau lead": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "WhatsApp envoyé": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "1er appel": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "2e appel": { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  "RDV programmé": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Démonstration": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  "Contrat signé": { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  "Installation": { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  "Client actif": { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Perdu: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export function statusColor(status: string) {
  return (
    STATUS_COLORS[status] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      dot: "bg-gray-400",
    }
  );
}

export function formatMontant(montant: string) {
  const num = parseFloat((montant || "0").replace(/[^\d.,-]/g, "").replace(",", "."));
  if (isNaN(num)) return montant;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function parseWhatsappHistory(raw: string) {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as { date: string; sens: string; message: string }[];
  } catch {
    return [];
  }
}
