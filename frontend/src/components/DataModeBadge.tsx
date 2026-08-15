import { dataMode } from '../services/api';

export default function DataModeBadge() {
  const live = dataMode === 'live';
  return (
    <span
      data-cmp="DataModeBadge"
      title={live ? `Connected to the live backend` : `Running on bundled demo data`}
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
        live
          ? `bg-emerald-muted text-emerald border-emerald/20`
          : `bg-amber-muted text-amber border-amber/20`
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${live ? `bg-emerald` : `bg-amber`}`} />
      {live ? `Live AI` : `Demo data`}
    </span>
  );
}
