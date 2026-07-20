"use client";

import {
  Sparkles,
  PhoneCall,
  MessageCircle,
  PhoneOutgoing,
  BellRing,
  CalendarCheck,
  Wrench,
  Users,
  Euro,
  TrendingUp,
} from "lucide-react";
import type { Prospect } from "@/lib/types";
import { computeStats } from "@/lib/stats";

export default function Dashboard({ prospects }: { prospects: Prospect[] }) {
  const s = computeStats(prospects);

  const cards = [
    { label: "Nouveaux leads", value: s.nouveaux, icon: Sparkles, color: "text-blue-600 bg-blue-50" },
    { label: "Leads à contacter", value: s.aContacter, icon: PhoneCall, color: "text-amber-600 bg-amber-50" },
    { label: "WhatsApp envoyés", value: s.whatsappEnvoyes, icon: MessageCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "Appels à effectuer", value: s.appelsAEffectuer, icon: PhoneOutgoing, color: "text-orange-600 bg-orange-50" },
    { label: "Relances du jour", value: s.relancesDuJour, icon: BellRing, color: "text-red-600 bg-red-50" },
    { label: "RDV programmés", value: s.rdvProgrammes, icon: CalendarCheck, color: "text-purple-600 bg-purple-50" },
    { label: "Installations en attente", value: s.installationsEnAttente, icon: Wrench, color: "text-cyan-600 bg-cyan-50" },
    { label: "Clients actifs", value: s.clientsActifs, icon: Users, color: "text-green-600 bg-green-50" },
    {
      label: "Chiffre d'affaires",
      value: new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(s.chiffreAffaires),
      icon: Euro,
      color: "text-teal-600 bg-teal-50",
    },
    { label: "Taux de transformation", value: `${s.tauxTransformation}%`, icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl bg-white p-4 shadow-card border border-gray-100"
        >
          <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
            <c.icon size={18} />
          </div>
          <p className="mt-3 text-xl font-semibold tracking-tight">{c.value}</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-tight">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
