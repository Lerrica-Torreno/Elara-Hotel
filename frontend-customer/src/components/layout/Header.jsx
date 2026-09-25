import { Menu, UserRound, X } from "lucide-react";

export default function Header({ currentPage, onNavigate, mobileOpen, setMobileOpen }) {
  const navItems = ["Home", "Rooms", "Offers", "My Booking"];

  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate("Home")}
          className="flex items-center gap-3 text-left"
          aria-label="Go to Elara Hotel home"
        >
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm">
            <img src="/elara-logo.png" alt="Elara Hotel Logo" className="h-full w-full object-contain p-1" />
          </span>
          <span>
            <span className="block font-bold tracking-[0.24em] text-forest-950">ELARA</span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-forest-900/50">Hotel Tagaytay</span>
          </span>
        </button>

        <nav aria-label="Customer navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => onNavigate(item)}
                  aria-current={currentPage === item ? "page" : undefined}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    currentPage === item
                      ? "bg-forest-900 text-white"
                      : "text-forest-900/70 hover:bg-forest-900/5 hover:text-forest-950"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <button
            type="button"
            onClick={() => onNavigate("My Booking")}
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <UserRound size={17} aria-hidden="true" />
            Find booking
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-xl border border-forest-900/10 bg-white p-2.5 md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen && (
        <nav aria-label="Mobile customer navigation" className="border-t border-forest-900/10 bg-cream px-5 py-4 md:hidden">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(item);
                    setMobileOpen(false);
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                    currentPage === item ? "bg-forest-900 text-white" : "bg-white text-forest-950"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
