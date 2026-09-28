import {
  BadgePercent,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  LogIn,
  ReceiptText,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wrench,
  X
} from "lucide-react";

import elaraLogo from "../../assets/elara-logo.png";

const groups = [
  {
    label: "Overview",

    items: [
      [
        "Dashboard",
        Gauge
      ]
    ]
  },

  {
    label: "Reservations",

    items: [
      [
        "Reservations",
        CalendarDays
      ],

      [
        "Front Desk",
        LogIn
      ]
    ]
  },

  {
    label: "Operations",

    items: [
      [
        "Rooms / Inventory",
        BedDouble
      ],

      [
        "Housekeeping",
        Sparkles
      ],

      [
        "Maintenance",
        Wrench
      ]
    ]
  },

  {
    label: "Revenue & Guests",

    items: [
      [
        "Guests",
        Users
      ],

      [
        "Payments",
        CircleDollarSign
      ],

      [
        "Cancellations",
        ReceiptText
      ],

      [
        "Discounts",
        BadgePercent
      ],

      [
        "Pricing & Promotions",
        SlidersHorizontal
      ]
    ]
  },

  {
    label: "System",

    items: [
      [
        "Settings",
        Settings
      ]
    ]
  }
];

export default function Sidebar({
  activePage,
  onNavigate,
  open,
  onClose,
  collapsed,
  onToggleCollapse
}) {
  function handleNavigation(
    page
  ) {
    onNavigate(page);

    onClose();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-forest-950/45 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation"
          onClick={
            onClose
          }
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex transform flex-col bg-forest-950 text-white shadow-2xl transition-all duration-200 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          collapsed
            ? "w-72 lg:w-24"
            : "w-72"
        }`}
        aria-label="Admin navigation"
      >
        {/* LOGO */}
        <header
          className={`flex h-20 shrink-0 items-center border-b border-white/10 ${
            collapsed
              ? "justify-between px-5 lg:justify-center lg:px-3"
              : "justify-between px-5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <img
                src={
                  elaraLogo
                }
                alt="ELARA Hotel"
                className="h-full w-full object-cover"
              />
            </div>

            <div
              className={
                collapsed
                  ? "lg:hidden"
                  : ""
              }
            >
              <p className="font-bold tracking-[0.2em] text-white">
                ELARA
              </p>

              <p className="text-xs text-white/45">
                Hotel Admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close navigation"
            className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X
              size={19}
            />
          </button>
        </header>

        {/* SCROLLABLE NAVIGATION */}
        <nav className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          {groups.map(
            (
              group,
              groupIndex
            ) => (
              <section
                key={
                  group.label
                }
                className={
                  groupIndex ===
                  groups.length -
                    1
                    ? ""
                    : "mb-6"
                }
              >
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                    {
                      group.label
                    }
                  </p>
                )}

                <ul className="space-y-1.5">
                  {group.items.map(
                    ([
                      label,
                      Icon
                    ]) => {
                      const active =
                        activePage ===
                        label;

                      return (
                        <li
                          key={
                            label
                          }
                        >
                          <button
                            type="button"
                            title={
                              collapsed
                                ? label
                                : undefined
                            }
                            aria-current={
                              active
                                ? "page"
                                : undefined
                            }
                            onClick={() =>
                              handleNavigation(
                                label
                              )
                            }
                            className={`group flex w-full items-center rounded-2xl text-left text-sm font-semibold transition-all duration-150 ${
                              collapsed
                                ? "gap-3 px-3 py-3 lg:justify-center"
                                : "gap-3 px-4 py-3"
                            } ${
                              active
                                ? "bg-white text-forest-950 shadow-sm"
                                : "text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon
                              size={
                                18
                              }
                              className="shrink-0"
                              aria-hidden="true"
                            />

                            <span
                              className={`whitespace-nowrap ${
                                collapsed
                                  ? "lg:hidden"
                                  : ""
                              }`}
                            >
                              {
                                label
                              }
                            </span>
                          </button>
                        </li>
                      );
                    }
                  )}
                </ul>
              </section>
            )
          )}
        </nav>

        {/* COLLAPSE */}
        <footer className="hidden shrink-0 border-t border-white/10 bg-forest-950 p-3 lg:block">
          <button
            type="button"
            onClick={
              onToggleCollapse
            }
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-white/50 transition hover:bg-white/10 hover:text-white ${
              collapsed
                ? "justify-center"
                : "gap-3"
            }`}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <ChevronRight
                size={18}
              />
            ) : (
              <ChevronLeft
                size={18}
              />
            )}

            {!collapsed && (
              <span>
                Collapse
              </span>
            )}
          </button>
        </footer>
      </aside>
    </>
  );
}