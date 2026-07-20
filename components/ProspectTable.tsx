"use client";

import { Phone, Mail, MessageCircle } from "lucide-react";
import type { Prospect } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { mailHref } from "@/lib/utils";
import { whatsappOpenLink } from "@/lib/whatsapp";
import { telOpenLink } from "@/lib/ringover";
import { isOverdue } from "@/lib/utils";

export default function ProspectTable({
  prospects,
  onSelect,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
}) {
  if (prospects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
        Aucun prospect ne correspond à votre recherche.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Société</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Profession</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Prochaine relance</th>
              <th className="px-4 py-3">Avis Google</th>
              <th className="px-4 py-3">Commercial</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {p.societe || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.nom || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.specialite || p.profession || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.ville || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.statut} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isOverdue(p.dateProchaineRelance)
                        ? "font-medium text-red-600"
                        : "text-gray-600"
                    }
                  >
                    {p.dateProchaineRelance || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.nombreAvisGoogle || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.commercial || "—"}</td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.telephone && (
                      <a
                        href={telOpenLink(p.telephone)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                        title="Appeler"
                      >
                        <Phone size={15} />
                      </a>
                    )}
                    {p.email && (
                      <a
                        href={mailHref(p.email)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                        title="Email"
                      >
                        <Mail size={15} />
                      </a>
                    )}
                    {p.telephone && (
                      <a
                        href={whatsappOpenLink(p.telephone)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                        title="WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
