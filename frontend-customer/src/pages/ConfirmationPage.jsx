import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hotel,
  Mail,
  Users
} from "lucide-react";
import {
  formatCurrency,
  formatDate
} from "../utils/format";

export default function ConfirmationPage({
  reservation,
  onFindBooking,
  onHome
}) {
  if (!reservation) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-forest-950">
          Reservation unavailable
        </h1>

        <p className="mt-3 text-forest-900/60">
          We could not find reservation information for this session.
        </p>

        <button
          type="button"
          onClick={onHome}
          className="mt-6 rounded-xl bg-forest-900 px-6 py-3 font-semibold text-white"
        >
          Return home
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 md:py-16 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-lift">
        <header className="bg-forest-950 px-6 py-10 text-center text-white md:px-10 md:py-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-gold ring-1 ring-white/15">
            <CheckCircle2
              size={32}
              aria-hidden="true"
            />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Reservation confirmed
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-5xl">
            Your stay at ELARA is confirmed.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
            Thank you for choosing ELARA Hotel Tagaytay.
            Your reservation details are shown below.
            Please keep your reservation number for check-in
            and future booking inquiries.
          </p>
        </header>

        <div className="p-6 md:p-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-forest-900/10 bg-mist p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-forest-900/45">
                Reservation number
              </p>

              <p className="mt-1 text-2xl font-bold tracking-wide text-forest-950 md:text-3xl">
                {reservation.id}
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
              Confirmed
            </span>
          </div>

          <section className="mt-9">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  Your stay
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-forest-950">
                  Reservation details
                </h2>
              </div>

              <p className="text-sm text-forest-900/50">
                ELARA Hotel Tagaytay
              </p>
            </div>

            <dl className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              <ReservationItem
                icon={Users}
                label="Primary guest"
                value={reservation.guest}
              />

              <ReservationItem
                icon={Hotel}
                label="Room"
                value={`${reservation.roomType} · Room ${reservation.room}`}
              />

              <ReservationItem
                icon={Users}
                label="Guests"
                value={`${reservation.guests} ${
                  reservation.guests === 1
                    ? "Guest"
                    : "Guests"
                }`}
              />

              <ReservationItem
                icon={CalendarDays}
                label="Check-in"
                value={formatDate(reservation.checkIn)}
              />

              <ReservationItem
                icon={CalendarDays}
                label="Check-out"
                value={formatDate(reservation.checkOut)}
              />

              <ReservationItem
                icon={CreditCard}
                label="Payment method"
                value={reservation.paymentMethod}
              />

              <ReservationItem
                icon={Mail}
                label="Email"
                value={reservation.email}
              />
            </dl>
          </section>

          <div className="mt-9 rounded-2xl bg-sand/35 p-5">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-forest-900/55">
                  Reservation total
                </p>

                <p className="mt-1 font-serif text-3xl font-semibold text-forest-950">
                  {formatCurrency(reservation.amount)}
                </p>

                <p className="mt-1 text-xs text-forest-900/45">
                  Inclusive of applicable taxes and fees
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-forest-900/45">
                  Status
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  Reservation confirmed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col justify-between gap-5 border-t border-forest-900/10 pt-7 sm:flex-row sm:items-center">
            <p className="max-w-lg text-sm leading-6 text-forest-900/55">
              You can use your reservation number and email
              address to review or manage your stay.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onFindBooking}
                className="rounded-xl bg-forest-900 px-6 py-3 font-semibold text-white transition hover:bg-forest-800"
              >
                Manage reservation
              </button>

              <button
                type="button"
                onClick={onHome}
                className="rounded-xl border border-forest-900/15 bg-white px-6 py-3 font-semibold transition hover:bg-mist"
              >
                Return home
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReservationItem({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand/50 text-forest-900">
        <Icon
          size={17}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
          {label}
        </dt>

        <dd className="mt-1 break-words font-semibold text-forest-950">
          {value}
        </dd>
      </div>
    </div>
  );
}