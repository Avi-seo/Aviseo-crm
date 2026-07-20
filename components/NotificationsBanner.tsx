"use client";

import { useState } from "react";
import { BellRing, X } from "lucide-react";
import type { Prospect } from "@/lib/types";
import { isToday, isOverdue } from "@/lib/utils";

export default function NotificationsBanner({
  prospects,
  onSelect,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const aRelancer = prospects.filter(
    (p) => isToday(p.dateProchaineRelance) || isOverdue(p.dateProchaineRelance)
  );

  if (dismissed || aRelancer.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <BellRing className="mt-0.5 shrink-0 text-amber-600" size={20} />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          {aRelancer.length} prospect{aRelancer.length > 1 ? "s" : ""} à rappeler
          aujourd'hui
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {aRelancer.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition"
            >
              {p.societe || p.nom}
            </button>
          ))}
          {aRelancer.length > 6 && (
            <span className="px-2 py-1 text-xs text-amber-700">
              +{aRelancer.length - 6} autres
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-700"
      >
        <X size={18} />
      </button>
    </div>
  );
}
