import {
  useEffect,
  useState
} from "react";

import {
  CalendarDays,
  Menu,
  UserRound,
  X
} from "lucide-react";

import {
  useCustomerAuth
} from "../../context/CustomerAuthContext";

import elaraLogo from "../../assets/elara-logo.png";

export default function Header({
  currentPage,
  onNavigate,
  mobileOpen,
  setMobileOpen
}) {
  const {
    customer
  } = useCustomerAuth();

  const [
    scrolled,
    setScrolled
  ] = useState(false);

  const isHome =
    currentPage ===
    "Home";

  useEffect(() => {
    function handleScroll() {
      setScrolled(
        window.scrollY > 48
      );
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const transparent =
    isHome &&
    !scrolled &&
    !mobileOpen;

  function navigateToSection(
    sectionId
  ) {
    setMobileOpen(false);

    if (
      currentPage !==
      "Home"
    ) {
      onNavigate("Home");

      window.setTimeout(
        () => {
          document
            .getElementById(
              sectionId
            )
            ?.scrollIntoView({
              behavior:
                "smooth"
            });
        },
        120
      );

      return;
    }

    document
      .getElementById(
        sectionId
      )
      ?.scrollIntoView({
        behavior:
          "smooth"
      });
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        transparent
          ? "border-transparent bg-transparent text-white"
          : "border-b border-forest-900/10 bg-cream/95 text-forest-950 shadow-sm backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">

        {/* BRAND */}
        <button
          type="button"
          onClick={() =>
            onNavigate(
              "Home"
            )
          }
          className="flex items-center gap-3"
          aria-label="Go to ELARA homepage"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
              transparent
                ? "border-white/30 bg-white"
                : "border-forest-900/10 bg-white"
            }`}
          >
            <img
              src={
                elaraLogo
              }
              alt="ELARA Hotel"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="text-left">
            <p className="text-sm font-bold tracking-[0.22em]">
              ELARA
            </p>

            <p
              className={`text-[9px] uppercase tracking-[0.28em] ${
                transparent
                  ? "text-white/60"
                  : "text-forest-900/40"
              }`}
            >
              Hotel Tagaytay
            </p>
          </div>
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-7 lg:flex">
          <HeaderLink
            transparent={
              transparent
            }
            onClick={() =>
              navigateToSection(
                "rooms"
              )
            }
          >
            Rooms
          </HeaderLink>

          <HeaderLink
            transparent={
              transparent
            }
            onClick={() =>
              navigateToSection(
                "amenities"
              )
            }
          >
            Amenities
          </HeaderLink>

          <HeaderLink
            transparent={
              transparent
            }
            onClick={() =>
              navigateToSection(
                "dining"
              )
            }
          >
            Dining
          </HeaderLink>

          <HeaderLink
            transparent={
              transparent
            }
            onClick={() =>
              navigateToSection(
                "location"
              )
            }
          >
            Location
          </HeaderLink>

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "My Booking"
              )
            }
            className="text-sm font-semibold transition hover:opacity-70"
          >
            My Booking
          </button>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-2 lg:flex">
          {customer ? (
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  "Account"
                )
              }
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                transparent
                  ? "border-white/30 bg-white/10 text-white hover:bg-white/15"
                  : "border-forest-900/10 bg-white text-forest-950 hover:bg-mist"
              }`}
            >
              <UserRound
                size={16}
                aria-hidden="true"
              />

              {customer.firstName}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "Login"
                  )
                }
                className={`h-11 rounded-full px-4 text-sm font-semibold transition ${
                  transparent
                    ? "text-white hover:bg-white/10"
                    : "text-forest-950 hover:bg-mist"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "Register"
                  )
                }
                className={`h-11 rounded-full border px-4 text-sm font-semibold transition ${
                  transparent
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/15"
                    : "border-forest-900/15 bg-white text-forest-950 hover:bg-mist"
                }`}
              >
                Create account
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "Rooms"
              )
            }
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-forest-950 transition hover:brightness-105"
          >
            <CalendarDays
              size={16}
              aria-hidden="true"
            />

            Book now
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              !mobileOpen
            )
          }
          aria-label={
            mobileOpen
              ? "Close menu"
              : "Open menu"
          }
          className={`grid h-10 w-10 place-items-center rounded-full lg:hidden ${
            transparent
              ? "bg-white/10 text-white"
              : "bg-white text-forest-950"
          }`}
        >
          {mobileOpen ? (
            <X
              size={19}
              aria-hidden="true"
            />
          ) : (
            <Menu
              size={19}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* MOBILE NAV */}
      {mobileOpen && (
        <div className="border-t border-forest-900/10 bg-cream px-5 py-5 text-forest-950 shadow-lg lg:hidden">
          <nav className="space-y-1">
            <MobileLink
              onClick={() =>
                navigateToSection(
                  "rooms"
                )
              }
            >
              Rooms
            </MobileLink>

            <MobileLink
              onClick={() =>
                navigateToSection(
                  "amenities"
                )
              }
            >
              Amenities
            </MobileLink>

            <MobileLink
              onClick={() =>
                navigateToSection(
                  "dining"
                )
              }
            >
              Dining
            </MobileLink>

            <MobileLink
              onClick={() =>
                navigateToSection(
                  "location"
                )
              }
            >
              Location
            </MobileLink>

            <MobileLink
              onClick={() => {
                setMobileOpen(
                  false
                );

                onNavigate(
                  "My Booking"
                );
              }}
            >
              My Booking
            </MobileLink>

            {customer ? (
              <MobileLink
                onClick={() => {
                  setMobileOpen(
                    false
                  );

                  onNavigate(
                    "Account"
                  );
                }}
              >
                My Account
              </MobileLink>
            ) : (
              <>
                <MobileLink
                  onClick={() => {
                    setMobileOpen(
                      false
                    );

                    onNavigate(
                      "Login"
                    );
                  }}
                >
                  Sign in
                </MobileLink>

                <MobileLink
                  onClick={() => {
                    setMobileOpen(
                      false
                    );

                    onNavigate(
                      "Register"
                    );
                  }}
                >
                  Create account
                </MobileLink>
              </>
            )}
          </nav>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(
                false
              );

              onNavigate(
                "Rooms"
              );
            }}
            className="mt-4 w-full rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white transition hover:bg-forest-800"
          >
            Book now
          </button>
        </div>
      )}
    </header>
  );
}

function HeaderLink({
  children,
  transparent,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`text-sm font-semibold transition hover:opacity-70 ${
        transparent
          ? "text-white/85"
          : "text-forest-900/70"
      }`}
    >
      {children}
    </button>
  );
}

function MobileLink({
  children,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:bg-mist"
    >
      {children}
    </button>
  );
}