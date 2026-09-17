export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
    >
      <div className="h-full rounded-full bg-status-pago transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}
