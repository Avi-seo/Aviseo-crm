"use client";

import { useMemo, useState } from "react";
import { useProspects } from "@/lib/useProspects";
import type { Prospect } from "@/lib/types";
import Toolbar from "@/components/Toolbar";
import Dashboard from "@/components/Dashboard";
import NotificationsBanner from "@/components/NotificationsBanner";
import ProspectTable from "@/components/ProspectTable";
import KanbanBoard from "@/components/KanbanBoard";
import ProspectDrawer from "@/components/ProspectDrawer";
import NewProspectModal from "@/components/NewProspectModal";
import ProspectionMode from "@/components/ProspectionMode";
import CommercialStatsTable from "@/components/CommercialStatsTable";

export default function Home() {
  const {
    prospects,
    isLoading,
    error,
    refresh,
    updateProspect,
    createProspect,
    addNote,
  } = useProspects();

  const [view, setView] = useState<"table" | "kanban" | "stats">("kanban");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showProspection, setShowProspection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      const matchesQuery =
        !query ||
        [p.nom, p.societe, p.profession, p.ville, p.email, p.telephone, p.commercial]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesStatus = !statusFilter || p.statut === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [prospects, query, statusFilter]);

  async function handleRefresh() {
    setIsSyncing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  }

  async function handleStatusChange(id: string, statut: string) {
    await updateProspect(id, { statut } as any);
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            AVI SEO — CRM Prospection
          </h1>
          <p className="text-sm text-gray-500">
            Synchronisé avec votre Google Sheet · mise à jour automatique
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de synchronisation avec Google Sheets : {error.message}
        </div>
      )}

      <div className="mb-6">
        <Dashboard prospects={prospects} />
      </div>

      <div className="mb-6">
        <NotificationsBanner prospects={prospects} onSelect={setSelected} />
      </div>

      <div className="mb-5">
        <Toolbar
          view={view}
          onViewChange={setView}
          query={query}
          onQueryChange={setQuery}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          onNew={() => setShowNew(true)}
          onRefresh={handleRefresh}
          isSyncing={isSyncing || isLoading}
          onStartProspection={() => setShowProspection(true)}
        />
      </div>

      {view === "table" && (
        <ProspectTable prospects={filtered} onSelect={setSelected} />
      )}
      {view === "kanban" && (
        <KanbanBoard
          prospects={filtered}
          onSelect={setSelected}
          onStatusChange={handleStatusChange}
        />
      )}
      {view === "stats" && <CommercialStatsTable prospects={prospects} />}

      {selected && (
        <ProspectDrawer
          prospect={prospects.find((p) => p.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onSave={async (input) => { await updateProspect(input); }}
          onAddNote={async (id, auteur, contenu) => { await addNote(id, auteur, contenu); }}
        />
      )}

      {showNew && (
        <NewProspectModal
          onClose={() => setShowNew(false)}
          onCreate={async (input) => { await createProspect(input); }}
        />
      )}

      {showProspection && (
        <ProspectionMode
          onClose={() => {
            setShowProspection(false);
            refresh();
          }}
          onAdvance={handleStatusChange}
        />
      )}
    </main>
  );
}
