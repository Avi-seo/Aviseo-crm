"use client";

import useSWR from "swr";
import type { Prospect, ProspectInput } from "./types";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error((await res.json()).error || "Erreur réseau");
    return res.json();
  });

const SYNC_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_SYNC_INTERVAL_MS || "20000",
  10
);

export function useProspects() {
  const { data, error, isLoading, mutate } = useSWR<{ prospects: Prospect[] }>(
    "/api/prospects",
    fetcher,
    {
      refreshInterval: SYNC_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const prospects = data?.prospects || [];

  async function updateProspect(id: string, patch: Partial<ProspectInput>) {
    // Mise à jour optimiste locale pour une UI instantanée
    await mutate(
      async (current) => {
        const res = await fetch(`/api/prospects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const { prospect } = await res.json();
        const list = current?.prospects || [];
        return {
          prospects: list.map((p) => (p.id === id ? prospect : p)),
        };
      },
      {
        optimisticData: (current) => {
          const list = current?.prospects || [];
          return {
            prospects: list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          };
        },
        rollbackOnError: true,
        revalidate: false,
      }
    );
  }

  async function createProspect(input: ProspectInput) {
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { prospect } = await res.json();
    await mutate(
      (current) => ({ prospects: [...(current?.prospects || []), prospect] }),
      { revalidate: false }
    );
    return prospect as Prospect;
  }

  async function addNote(id: string, auteur: string, contenu: string) {
    const res = await fetch(`/api/prospects/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auteur, contenu }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { prospect } = await res.json();
    await mutate(
      (current) => ({
        prospects: (current?.prospects || []).map((p) =>
          p.id === id ? prospect : p
        ),
      }),
      { revalidate: false }
    );
    return prospect as Prospect;
  }

  return {
    prospects,
    isLoading,
    error,
    refresh: () => mutate(),
    updateProspect,
    createProspect,
    addNote,
  };
}
