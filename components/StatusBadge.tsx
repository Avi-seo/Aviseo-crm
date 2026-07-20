import { statusColor, cx } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const c = statusColor(status);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        c.bg,
        c.text
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", c.dot)} />
      {status || "—"}
    </span>
  );
}
