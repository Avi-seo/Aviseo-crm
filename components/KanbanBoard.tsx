"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { STATUSES } from "@/lib/types";
import type { Prospect } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({
  prospects,
  onSelect,
  onStatusChange,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    onStatusChange(draggableId, destination.droppableId);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            prospects={prospects.filter((p) => p.statut === status)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
