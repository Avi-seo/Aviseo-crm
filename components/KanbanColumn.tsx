"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { Prospect } from "@/lib/types";
import { statusColor, cx } from "@/lib/utils";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({
  status,
  prospects,
  onSelect,
}: {
  status: string;
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
}) {
  const c = statusColor(status);
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100/70">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={cx("h-2 w-2 rounded-full", c.dot)} />
          <h3 className="text-sm font-semibold text-gray-700">{status}</h3>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
          {prospects.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cx(
              "flex-1 overflow-y-auto px-2 pb-2 min-h-[120px] transition-colors",
              snapshot.isDraggingOver && "bg-brand-50/60"
            )}
          >
            {prospects.map((p, i) => (
              <KanbanCard key={p.id} prospect={p} index={i} onSelect={onSelect} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
