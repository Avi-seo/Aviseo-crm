"use client";

import { useEffect, useState } from "react";
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Save,
  Pencil,
  CalendarPlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { Prospect, ProspectInput } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { mailHref, parseNotes, parseWhatsappHistory } from "@/lib/utils";
import { whatsappOpenLink } from "@/lib/whatsapp";
import { telOpenLink } from "@/lib/ringover";
import { calendlyBookingLink } from "@/lib/calendly";
import StatusBadge from "./StatusBadge";

const FIELD_LABELS: { key: keyof ProspectInput; label: string }[] = [
  { key: "nom", label: "Nom du contact" },
  { key: "societe", label: "Société" },
  { key: "specialite", label: "Spécialité" },
  { key: "telephone", label: "Téléphone" },
  { key: "email", label: "Email" },
  { key: "ville", label: "Ville" },
  { key: "nombreAvisGoogle", label: "Nombre d'avis Google" },
  { key: "doctolib", label: "Utilise Doctolib" },
  { key: "platform", label: "Plateforme (Meta Ads)" },
  { key: "source", label: "Source" },
  { key: "medium", label: "Medium" },
  { key: "campagne", label: "Campagne" },
  { key: "leadStatus", label: "Statut Meta (origine)" },
  { key: "commercial", label: "Commercial responsable" },
  { key: "dateDernierContact", label: "Date du dernier contact" },
  { key: "dateProchaineRelance", label: "Date de prochaine relance" },
];
function buildRelanceMessage(prospect: Prospect, calendlyLink: string){
  const nom = prospect.nom || "";
  const lien = calendlyLink || "https://calendly.com/pro-avi-seo/30min";

  if (prospect.statut === "2e appel") {
    return `Bonjour ${nom},

Je me permets de revenir vers vous à la suite de mon précédent message, car je n'ai pas encore réussi à vous joindre concernant votre demande.

Pour rappel, notre solution automatise la collecte des avis Google et le suivi de vos clients ou patients, avec une synchronisation directe à Doctolib pour ne rien ajouter à votre organisation actuelle. Résultat : une meilleure visibilité locale, sans y passer de temps.

La présentation dure environ 15 à 20 minutes et ne vous engage à rien. Elle me permettra surtout de vous montrer ce que nous pourrions mettre en place spécifiquement pour votre activité.

Vous pouvez réserver directement le créneau qui vous convient ici :
${lien}

Vous pouvez également me répondre directement sur WhatsApp, même simplement par :

« Je suis intéressé(e) »
« Rappelez-moi »
ou
« Ce n'est plus d'actualité »

Cela me permettra de mettre correctement à jour votre demande.

Bien cordialement,
Moïse
AVI SEO`;
  }

  return `Bonjour ${nom},

Je viens d'essayer de vous joindre à la suite de votre demande d'informations concernant notre solution AVI SEO.

J'ai pris le temps de regarder votre activité, et je pense que nous pourrions réellement vous accompagner pour développer plus régulièrement vos avis Google et améliorer votre visibilité locale. Notre solution se connecte directement à Doctolib pour automatiser le suivi de vos clients ou patients, sans vous ajouter de travail au quotidien.

Je souhaitais simplement échanger quelques minutes avec vous afin de mieux comprendre votre besoin et vous présenter concrètement le fonctionnement.

Vous pouvez choisir directement le créneau qui vous convient ici :
${lien}

Nous pouvons également échanger directement ici sur WhatsApp si cela est plus pratique pour vous. Vous pouvez simplement m'indiquer vos disponibilités ou me poser vos questions par message.

Bien cordialement,
Moïse
AVI SEO`;
}
export default function ProspectDrawer({
  prospect,
  onClose,
  onSave,
  onAddNote,
}: {
  prospect: Prospect;
  onClose: () => void;
  onSave: (id: string, patch: Partial<ProspectInput>) => Promise<void>;
  onAddNote: (id: string, auteur: string, contenu: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Prospect>(prospect);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  useEffect(() => {
    setForm(prospect);
    setEditing(false);
    setTranscription("");
    setAnalyzeError("");
  }, [prospect]);

  async function handleSave() {
    setSaving(true);
    try {
      const { id, ...patch } = form;
      await onSave(prospect.id, patch);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await onAddNote(prospect.id, form.commercial || "Commercial", newNote.trim());
      setNewNote("");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleAnalyze() {
    if (!transcription.trim()) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/ai/analyze-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prospect.id, transcription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await onSave(prospect.id, data.prospect);
    } catch (err: any) {
      setAnalyzeError(err.message || "Erreur lors de l'analyse IA");
    } finally {
      setAnalyzing(false);
    }
  }

  const notes = parseNotes(prospect.notes);
  const whatsappHistory = parseWhatsappHistory(prospect.whatsappHistorique);
  const calendlyLink = calendlyBookingLink(prospect.nom, prospect.email);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {prospect.societe || prospect.nom || "Sans nom"}
            </h2>
            <p className="text-sm text-gray-500">
              {prospect.nom} {(prospect.specialite || prospect.profession) ? `· ${prospect.specialite || prospect.profession}` : ""}
            </p>
            <div className="mt-2">
              <StatusBadge status={prospect.statut} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
          {prospect.telephone && (
            <a
              href={telOpenLink(prospect.telephone)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
            >
              <Phone size={15} /> Ringover
            </a>
          )}
          {prospect.telephone && (
            <a
              href={whatsappOpenLink(prospect.telephone, buildRelanceMessage(prospect, calendlyLink))}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          {calendlyLink && (
            <a
              href={calendlyLink}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-50 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
            >
              <CalendarPlus size={15} /> Calendly
            </a>
          )}
          {prospect.email && (
            <a
              href={mailHref(prospect.email)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Mail size={15} />
            </a>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Informations</h3>
            {editing ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                <Save size={13} /> {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <Pencil size={13} /> Modifier
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Statut</label>
              {editing ? (
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-800">{prospect.statut || "—"}</p>
              )}
            </div>

            {FIELD_LABELS.map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-500">{label}</label>
                {editing ? (
                  <input
                    value={(form[key] as string) || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-800 break-words">
                    {(prospect[key] as string) || "—"}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Analyse IA post-appel */}
          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-900">
              <Sparkles size={15} /> Analyse IA post-appel
            </h3>
            {prospect.iaResume ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-600">Résumé : </span>{prospect.iaResume}</p>
                <p><span className="font-medium text-gray-600">Objections : </span>{prospect.iaObjections}</p>
                <p><span className="font-medium text-gray-600">Intérêt : </span>{prospect.iaNiveauInteret} · <span className="font-medium text-gray-600">Probabilité : </span>{prospect.iaProbabiliteSignature}</p>
                {prospect.iaSuggestionWhatsapp && (
                  <p><span className="font-medium text-gray-600">Suggestion WhatsApp : </span>{prospect.iaSuggestionWhatsapp}</p>
                )}
              </div>
            ) : (
              <p className="mb-2 text-xs text-gray-500">
                Colle la transcription d'un appel pour générer automatiquement un résumé,
                les objections et une suggestion de relance.
              </p>
            )}
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Coller la transcription de l'appel ici..."
              rows={3}
              className="mt-2 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !transcription.trim()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {analyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
            </button>
            {analyzeError && (
              <p className="mt-2 text-xs text-red-600">{analyzeError}</p>
            )}
          </div>

          {/* Historique WhatsApp */}
          {whatsappHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Historique WhatsApp
              </h3>
              <div className="space-y-2">
                {whatsappHistory.slice().reverse().map((m, i) => (
                  <div key={i} className="rounded-lg bg-emerald-50 p-2.5 text-sm">
                    <div className="mb-0.5 flex justify-between text-xs text-emerald-700">
                      <span>{m.sens === "envoye" ? "Envoyé" : "Reçu"}</span>
                      <span>{m.date}</span>
                    </div>
                    <p className="text-gray-700">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Historique des notes
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Ajouter une note (appel, échange, remarque...)"
              rows={2}
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
              className="mb-4 w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {addingNote ? "Ajout..." : "Ajouter la note"}
            </button>

            <div className="space-y-3">
              {notes.length === 0 && (
                <p className="text-sm text-gray-400">Aucune note pour le moment.</p>
              )}
              {notes.map((n, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {n.auteur}
                    </span>
                    <span className="text-xs text-gray-400">{n.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {n.contenu}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
