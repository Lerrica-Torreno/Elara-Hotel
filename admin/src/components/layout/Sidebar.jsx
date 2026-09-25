import {
  ArrowLeftRight,
  BedDouble,
  Brush,
  CalendarDays,
  CreditCard,
  Gauge,
  Home,
  Layers3,
  Percent,
  Tag,
  Users,
  Wrench,
  XCircle
} from "lucide-react";

import elaraLogo from "../../assets/elara-logo.png";

const items = [
  ["Dashboard", Home],
  ["Rooms", BedDouble],
  ["Reservations", CalendarDays],
  ["Check-in / Out", ArrowLeftRight],
  ["Housekeeping", Brush],
  ["Maintenance", Wrench],
  ["Customers", Users],
  ["Payments", CreditCard],
  ["Cancellations", XCircle],
  ["Discounts", Percent],
  ["Promotions", Tag],
  ["Dynamic Pricing", Gauge],
  ["Room Assignment", Layers3]
];

export default function Sidebar({
  activePage,
  onNavigate,
  open,
  onClose
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-forest-950/40 lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-forest-950 text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Primary navigation"
      >
        <header className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
            <img
              src={elaraLogo}
              alt="Elara Hotel logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="font-bold tracking-[0.2em]">
              ELARA
            </p>

            <p className="text-xs text-white/55">
              Hotel Operations
            </p>
          </div>
        </header>

        <nav className="h-[calc(100vh-5rem)] overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Management
          </p>

          <ul className="space-y-1">
            {items.map(([label, Icon]) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(label);
                    onClose();
                  }}
                  aria-current={
                    activePage === label
                      ? "page"
                      : undefined
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    activePage === label
                      ? "bg-white text-forest-950"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                  />

                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}