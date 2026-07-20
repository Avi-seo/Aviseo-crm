"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ProspectInput } from "@/lib/types";
import { STATUSES } from "@/lib/types";

const EMPTY: ProspectInput = {
  formName: "",
  isOrganic: "false",
  platform: "",
  specialite: "",
  nombreAvisGoogle: "",
  doctolib: "",
  societe: "",
  nom: "",
  email: "",
  telephone: "",
  source: "",
  medium: "",
  campagne: "",
  formulaire: "",
  leadStatus: "",
  notes: "",
  statut: "Nouveau lead",
  commercial: "",
  ville: "",
  profession: "",
  siteInternet: "",
  googleBusinessUrl: "",
  dateEntree: new Date().toLocaleDateString("fr-FR"),
  dateDernierContact: "",
  dateProchaineRelance: "",
  whatsappHistorique: "",
  dateDernierWhatsapp: "",
  ringoverDureeDernierAppel: "",
  ringoverEnregistrementUrl: "",
  ringoverTranscription: "",
  iaResume: "",
  iaObjections: "",
  iaNiveauInteret: "",
  iaProbabiliteSignature: "",
  iaDateIdealeRelance: "",
  iaSuggestionWhatsapp: "",
  iaSuggestionEmail: "",
  installationQrCode: "",
  installationQuestionnaire: "",
  installationLogoUrl: "",
  installationDate: "",
  installationStatut: "",
  chiffreAffaires: "",
};

export default function NewProspectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: ProspectInput) => Promise<void>;
}) {
  const [form, setForm] = useState<ProspectInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim() && !form.societe.trim()) return;
    setSaving(true);
    try {
      await onCreate(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nouveau prospect</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom du contact" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
          <Field label="Société" value={form.societe} onChange={(v) => setForm({ ...form, societe: v })} />
          <Field label="Profession" value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} />
          <Field label="Téléphone" value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Ville" value={form.ville} onChange={(v) => setForm({ ...form, ville: v })} />
          <Field label="Site internet" value={form.siteInternet} onChange={(v) => setForm({ ...form, siteInternet: v })} />
          <Field label="Fiche Google Business" value={form.googleBusinessUrl} onChange={(v) => setForm({ ...form, googleBusinessUrl: v })} />
          <Field label="Nombre d'avis Google" value={form.nombreAvisGoogle} onChange={(v) => setForm({ ...form, nombreAvisGoogle: v })} />
          <Field label="Doctolib (oui/non)" value={form.doctolib} onChange={(v) => setForm({ ...form, doctolib: v })} />
          <Field label="Source" value={form.source} onChange={(v) => setForm({ ...form, source: v })} placeholder="Meta Ads..." />
          <Field label="Campagne" value={form.campagne} onChange={(v) => setForm({ ...form, campagne: v })} />
          <Field label="Commercial responsable" value={form.commercial} onChange={(v) => setForm({ ...form, commercial: v })} />
          <Field label="Prochaine relance" value={form.dateProchaineRelance} onChange={(v) => setForm({ ...form, dateProchaineRelance: v })} placeholder="JJ/MM/AAAA" />

          <div>
            <label className="text-xs font-medium text-gray-500">Statut</label>
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
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium text-gray-500">Note initiale</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Création..." : "Créer le prospect"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
