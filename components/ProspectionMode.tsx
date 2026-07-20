"use client";

import { useEffect, useState } from "react";
import { X, Phone, MessageCircle, CalendarPlus, Mail, ArrowRight, Loader2 } from "lucide-react";
import type { Prospect, Status } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { mailHref } from "@/lib/utils";
import { whatsappOpenLink } from "@/lib/whatsapp";
import { telOpenLink } from "@/lib/ringover";
import { calendlyBookingLink } from "@/lib/calendly";
import StatusBadge from "./StatusBadge";

function nextStatus(current: string): Status {
  const idx = STATUSES.indexOf(current as Status);
  if (idx === -1 || idx >= STATUSES.length - 2) return current as Status; // ne dépasse pas "Client actif"/"Perdu"
  return STATUSES[idx + 1];
}

export default function ProspectionMode({
  onClose,
  onAdvance,
}: {
  onClose: () => void;
  onAdvance: (id: string, statut: string) => Promise<void>;
}) {
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [advancing, setAdvancing] = useState(false);
  const [note, setNote] = useState("");

  async function loadNext(exclude: string[]) {
    setLoading(true);
    try {
      const res = await fetch(`/api/prospects/next?exclude=${exclude.join(",")}`);
      const data = await res.json();
      setProspect(data.prospect || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext([]);
  }, []);

  async function handleAdvance() {
    if (!prospect) return;
    setAdvancing(true);
    try {
      const newStatus = nextStatus(prospect.statut);
      await onAdvance(prospect.id, newStatus);
      const newExclude = [...excludeIds, prospect.id];
      setExcludeIds(newExclude);
      setNote("");
      await loadNext(newExclude);
    } finally {
      setAdvancing(false);
    }
  }

  async function handleSkip() {
    if (!prospect) return;
    const newExclude = [...excludeIds, prospect.id];
    setExcludeIds(newExclude);
    await loadNext(newExclude);
  }

  const calendlyLink = prospect ? calendlyBookingLink(prospect.nom, prospect.email) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Commencer la prospection
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Recherche du prochain prospect...</p>
          </div>
        ) : !prospect ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center px-6">
            <p className="text-lg font-medium text-gray-700">
              🎉 Aucun prospect à contacter pour le moment
            </p>
            <p className="text-sm text-gray-400">
              Tous les leads actifs ont été traités ou relancés.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {prospect.societe || prospect.nom}
                </p>
                <p className="text-sm text-gray-500">
                  {prospect.nom} {(prospect.specialite || prospect.profession) ? `· ${prospect.specialite || prospect.profession}` : ""}
                  {prospect.ville ? ` · ${prospect.ville}` : ""}
                </p>
              </div>
              <StatusBadge status={prospect.statut} />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <InfoRow label="Téléphone" value={prospect.telephone} />
              <InfoRow label="Email" value={prospect.email} />
              <InfoRow label="Avis Google" value={prospect.nombreAvisGoogle} />
              <InfoRow label="Source" value={prospect.source} />
            </div>

            {prospect.notes && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 max-h-24 overflow-y-auto">
                <p className="mb-1 text-xs font-medium text-gray-500">Dernière note</p>
                {prospect.notes.split("\n\n---\n\n").slice(-1)[0]}
              </div>
            )}

            <div className="mb-4 flex items-center gap-2">
              {prospect.telephone && (
                <a
                  href={telOpenLink(prospect.telephone)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
                >
                  <Phone size={15} /> Appeler
                </a>
              )}
              {prospect.telephone && (
                <a
                  href={whatsappOpenLink(prospect.telephone)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              {calendlyLink && (
                <a
                  href={calendlyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-50 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-100"
                >
                  <CalendarPlus size={15} />
                </a>
              )}
              {prospect.email && (
                <a
                  href={mailHref(prospect.email)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-50 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Mail size={15} />
                </a>
              )}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note rapide sur cet échange (optionnel)..."
              rows={2}
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Passer
              </button>
              <button
                onClick={handleAdvance}
                disabled={advancing}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {advancing ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    Étape suivante <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-800 truncate">{value || "—"}</p>
    </div>
  );
}
