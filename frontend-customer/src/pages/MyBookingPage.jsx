import { useState } from "react";
import { AlertTriangle, Search, XCircle } from "lucide-react";
import FormField from "../components/ui/FormField";
import Badge from "../components/ui/Badge";
import { formatCurrency, formatDate } from "../utils/format";

export default function MyBookingPage({ reservation, onCancel }) {
  const [reference, setReference] = useState(reservation?.id ?? "");
  const [email, setEmail] = useState(reservation?.email ?? "");
  const [found, setFound] = useState(false);
  const [error, setError] = useState("");
  const booking = reservation;

  function searchBooking(event) {
    event.preventDefault();
    if (!reference.trim() || !email.trim()) {
      setError("Enter both your reservation number and email address.");
      setFound(false);
      return;
    }
    const matches = booking && reference.trim() === booking.id && email.trim().toLowerCase() === booking.email.toLowerCase();
    setError(matches ? "" : "No preview matches those details in this browser session. Live booking lookup is not connected yet.");
    setFound(Boolean(matches));
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Manage your stay</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Find your booking preview.</h1>
        <p className="mt-4 leading-7 text-forest-900/60">Enter the preview reference and email from this browser session. Live reservation lookup is available after backend integration.</p>
      </header>

      <form onSubmit={searchBooking} className="mt-8 grid gap-4 rounded-3xl border border-forest-900/10 bg-white p-6 shadow-soft md:grid-cols-[1fr_1fr_auto] md:items-end" noValidate>
        <FormField id="reservation-reference" label="Preview reference">
          {() => <input id="reservation-reference" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" />}
        </FormField>
        <FormField id="booking-email" label="Email address">
          {() => <input id="booking-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" />}
        </FormField>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white">
          <Search size={17} aria-hidden="true" /> Find booking
        </button>
        {error && <p role="alert" className="text-sm font-semibold text-red-700 md:col-span-3">Error: {error}</p>}
      </form>

      {found && (
        <article className="mt-8 rounded-3xl border border-forest-900/10 bg-white p-6 shadow-soft" aria-labelledby="booking-found-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-forest-900/45">{booking.id}</p>
              <h2 id="booking-found-title" className="mt-1 text-2xl font-bold">{booking.roomType}</h2>
              <p className="mt-1 text-sm text-forest-900/55">Browser session preview · No room held</p>
            </div>
            <Badge tone="green">{booking.status}</Badge>
          </div>

          <dl className="mt-6 grid gap-5 rounded-2xl bg-mist p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-xs text-forest-900/50">Guest</dt><dd className="mt-1 font-semibold">{booking.guest}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Check-in</dt><dd className="mt-1 font-semibold">{formatDate(booking.checkIn)}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Check-out</dt><dd className="mt-1 font-semibold">{formatDate(booking.checkOut)}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Payment</dt><dd className="mt-1 font-semibold">{booking.payment}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Room number</dt><dd className="mt-1 font-semibold">{booking.room}</dd></div>
            <div><dt className="text-xs text-forest-900/50">Booking total</dt><dd className="mt-1 font-semibold">{formatCurrency(booking.amount)}</dd></div>
          </dl>

          <aside className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle size={18} className="shrink-0" aria-hidden="true" />
            This preview cannot be cancelled because it is not an actual reservation. The cancellation screen demonstrates the future request flow.
          </aside>

          <button type="button" onClick={() => onCancel(booking)} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-semibold text-red-700">
            <XCircle size={17} aria-hidden="true" /> Preview cancellation flow
          </button>
        </article>
      )}
    </section>
  );
}
