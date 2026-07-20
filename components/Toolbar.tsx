"use client";

import { Search, LayoutGrid, Table2, Plus, RefreshCw, BarChart3, Play } from "lucide-react";
import { STATUSES } from "@/lib/types";
import { cx } from "@/lib/utils";

type View = "table" | "kanban" | "stats";

export default function Toolbar({
  view,
  onViewChange,
  query,
  onQueryChange,
  status,
  onStatusChange,
  onNew,
  onRefresh,
  isSyncing,
  onStartProspection,
}: {
  view: View;
  onViewChange: (v: View) => void;
  query: string;
  onQueryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onNew: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
  onStartProspection: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher un prospect, une entreprise, une ville..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          title="Synchroniser maintenant"
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} className={cx(isSyncing && "animate-spin")} />
        </button>

        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          <button
            onClick={() => onViewChange("table")}
            className={cx(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              view === "table" ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Table2 size={15} /> Tableau
          </button>
          <button
            onClick={() => onViewChange("kanban")}
            className={cx(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              view === "kanban" ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <LayoutGrid size={15} /> Pipeline
          </button>
          <button
            onClick={() => onViewChange("stats")}
            className={cx(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              view === "stats" ? "bg-brand-500 text-white" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <BarChart3 size={15} /> Stats
          </button>
        </div>

        <button
          onClick={onStartProspection}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Play size={15} /> Commencer la prospection
        </button>

        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition"
        >
          <Plus size={16} /> Nouveau prospect
        </button>
      </div>
    </div>
  );
}
