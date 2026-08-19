export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
      {status}
    </span>
  );
}
