import { CheckCircle2, CalendarDays, UserRound, BedDouble } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format";

export default function ConfirmationPage({ reservation, onFindBooking, onHome }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="rounded-[2rem] border border-forest-900/10 bg-white p-6 text-center shadow-soft md:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={32} aria-hidden="true" />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold">Reservation confirmed</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Your Elara stay is reserved.</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-forest-900/60">
          Keep your reservation number for booking lookup. Your specific room number will be assigned by hotel staff before arrival.
        </p>

        <div className="mt-8 rounded-2xl bg-mist p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-900/45">Reservation number</p>
          <p className="mt-1 text-2xl font-bold">{reservation.id}</p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-forest-900/50">Guest</dt><dd className="mt-1 font-semibold">{reservation.guest}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Room type</dt><dd className="mt-1 font-semibold">{reservation.roomType}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Stay</dt><dd className="mt-1 font-semibold">{formatDate(reservation.checkIn)} – {formatDate(reservation.checkOut)}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Total</dt><dd className="mt-1 font-semibold">{formatCurrency(reservation.amount)}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Payment</dt><dd className="mt-1 font-semibold">{reservation.payment}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Assigned room</dt><dd className="mt-1 font-semibold">{reservation.room}</dd></div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onFindBooking} className="rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white">View my booking</button>
          <button type="button" onClick={onHome} className="rounded-xl border border-forest-900/15 px-5 py-3 font-semibold">Return home</button>
        </div>
      </div>
    </section>
  );
}
