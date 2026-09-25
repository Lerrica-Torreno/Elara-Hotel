import { MapPin } from "lucide-react";

export default function Footer({ onNavigate }) {
  const quickLinks = [
    "Home",
    "Rooms",
    "Offers",
    "My Booking"
  ];

  const services = [
    "Room Reservations",
    "Special Offers",
    "Guest Assistance",
    "Cancellation Requests"
  ];

  return (
    <footer className="bg-[#071f1a] text-white">
      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <section>
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white">
                <img
                  src="/elara-logo.png"
                  alt="Elara Hotel logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-lg font-bold tracking-[0.24em]">
                  ELARA
                </p>

                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Hotel Tagaytay
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Experience a calm and comfortable stay in Tagaytay,
              designed around modern convenience, warm hospitality,
              and effortless booking.
            </p>

          </section>

          {/* QUICK LINKS */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
              Explore
            </h2>

            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item)}
                    className="text-white/65 transition hover:text-white"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* GUEST SERVICES */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
              Guest Services
            </h2>

            <ul className="mt-5 space-y-3 text-sm text-white/65">
              {services.map((service) => (
                <li key={service}>
                  {service}
                </li>
              ))}
            </ul>
          </section>

          {/* CONTACT */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Location preview</h2>

            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex items-start gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-gold"
                  aria-hidden="true"
                />

                <span>
                  Tagaytay City,
                  <br />
                  Cavite, Philippines
                </span>
              </li>

              <li>Verified contact details and hotel policies will appear when this site is ready for real bookings.</li>
            </ul>
          </section>
        </div>

        {/* ROOM CTA */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:flex md:items-center md:justify-between md:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Explore Elara
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Find the room type for your trip.
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Browse sample rooms and rates while live booking is being connected.
            </p>
          </div>

          <button type="button" onClick={() => onNavigate("Rooms")} className="mt-5 rounded-xl bg-gold px-5 py-3 font-semibold text-forest-950 md:mt-0">Browse rooms</button>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © 2026 Elara Hotel. All rights reserved.
          </p>

          <p>Frontend demonstration · contact and policy details pending verification</p>
        </div>
      </div>
    </footer>
  );
}
