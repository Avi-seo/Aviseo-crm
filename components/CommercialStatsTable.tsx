"use client";

import type { Prospect } from "@/lib/types";
import { computeStatsByCommercial } from "@/lib/stats";

export default function CommercialStatsTable({ prospects }: { prospects: Prospect[] }) {
  const stats = computeStatsByCommercial(prospects);
  if (stats.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Commercial</th>
              <th className="px-4 py-3">Prospects</th>
              <th className="px-4 py-3">Appels</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">RDV</th>
              <th className="px-4 py-3">Signatures</th>
              <th className="px-4 py-3">CA</th>
              <th className="px-4 py-3">Taux transfo.</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.commercial} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{s.commercial}</td>
                <td className="px-4 py-3 text-gray-600">{s.total}</td>
                <td className="px-4 py-3 text-gray-600">{s.appels}</td>
                <td className="px-4 py-3 text-gray-600">{s.whatsapp}</td>
                <td className="px-4 py-3 text-gray-600">{s.rdv}</td>
                <td className="px-4 py-3 text-gray-600">{s.signatures}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(s.chiffreAffaires)}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.tauxTransformation}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
