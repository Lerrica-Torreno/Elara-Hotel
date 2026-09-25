import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Clock3
} from "lucide-react";

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

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Elara Hotel on Facebook"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:bg-gold hover:text-forest-950"
              >
                <Facebook size={17} aria-hidden="true" />
              </a>

              <a
                href="#"
                aria-label="Elara Hotel on Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:bg-gold hover:text-forest-950"
              >
                <Instagram size={17} aria-hidden="true" />
              </a>
            </div>
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
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold">
              Contact Us
            </h2>

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

              <li className="flex items-center gap-3">
                <Phone
                  size={17}
                  className="shrink-0 text-gold"
                  aria-hidden="true"
                />

                <span>
                  +63 900 000 0000
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail
                  size={17}
                  className="shrink-0 text-gold"
                  aria-hidden="true"
                />

                <span>
                  stay@elarahotel.ph
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Clock3
                  size={17}
                  className="mt-0.5 shrink-0 text-gold"
                  aria-hidden="true"
                />

                <span>
                  Front Desk
                  <br />
                  24 hours daily
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* NEWSLETTER / CTA */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:flex md:items-center md:justify-between md:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Stay connected
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Get updates and special hotel offers.
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Receive occasional updates about Elara promotions and stays.
            </p>
          </div>

          <form
            className="mt-5 flex max-w-md flex-1 gap-2 md:mt-0"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>

            <input
              id="footer-email"
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-forest-950 placeholder:text-forest-900/40"
            />

            <button
              type="submit"
              aria-label="Subscribe to Elara updates"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-forest-950 transition hover:brightness-105"
            >
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © 2026 Elara Hotel. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            <button
              type="button"
              className="transition hover:text-white"
            >
              Privacy Policy
            </button>

            <button
              type="button"
              className="transition hover:text-white"
            >
              Terms & Conditions
            </button>

            <button
              type="button"
              className="transition hover:text-white"
            >
              Booking Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}