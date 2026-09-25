import { Menu } from "lucide-react";

export default function Topbar({ page, onOpenMenu, onNewReservation }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-forest-900/10 bg-mist/95 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-forest-900/10 bg-white p-2.5 lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={19} aria-hidden="true" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-900/45">Elara Hotel</p>
          <p className="text-sm font-semibold text-forest-950">{page}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 sm:inline">Sample data · frontend preview</span>
        <button
          type="button"
          onClick={onNewReservation}
          className="hidden rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800 sm:block"
        >
          New reservation
        </button>
      </div>
    </header>
  );
}
