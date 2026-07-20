"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Phone, MessageCircle } from "lucide-react";
import type { Prospect } from "@/lib/types";
import { isOverdue } from "@/lib/utils";

export default function KanbanCard({
  prospect,
  index,
  onSelect,
}: {
  prospect: Prospect;
  index: number;
  onSelect: (p: Prospect) => void;
}) {
  return (
    <Draggable draggableId={prospect.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelect(prospect)}
          className={`mb-2 cursor-pointer rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md ${
            snapshot.isDragging ? "rotate-1 shadow-lg ring-2 ring-brand-200" : ""
          }`}
        >
          <p className="text-sm font-semibold text-gray-900 truncate">
            {prospect.societe || prospect.nom || "Sans nom"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {prospect.nom} {(prospect.specialite || prospect.profession) ? `· ${prospect.specialite || prospect.profession}` : ""}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs ${
                isOverdue(prospect.dateProchaineRelance)
                  ? "font-medium text-red-600"
                  : "text-gray-400"
              }`}
            >
              {prospect.dateProchaineRelance || ""}
            </span>
            {prospect.nombreAvisGoogle && (
              <span className="text-xs font-medium text-amber-600">
                ★ {prospect.nombreAvisGoogle}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-gray-300">
            {prospect.telephone && <Phone size={12} />}
            {prospect.dateDernierWhatsapp && <MessageCircle size={12} />}
          </div>
        </div>
      )}
    </Draggable>
  );
}
