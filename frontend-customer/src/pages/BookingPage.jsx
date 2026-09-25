import { useState } from "react";
import { ArrowLeft, CreditCard, Info, ShieldCheck } from "lucide-react";
import FormField from "../components/ui/FormField";
import { formatCurrency, nightsBetween, stayError, todayLocal } from "../utils/format";

export default function BookingPage({ room, search, setSearch, onBack, onConfirmed }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    requests: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Pay at hotel");

  const nights = stayError(search, room.capacity) ? 0 : nightsBetween(search.checkIn, search.checkOut);
  const subtotal = room.displayRate * nights;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  function validateGuest() {
    const datesError = stayError(search, room.capacity);
    if (datesError) {
      setError(datesError);
      return false;
    }
    if (!guest.firstName.trim() || !guest.lastName.trim() || !guest.email.trim() || !guest.phone.trim()) {
      setError("Please complete all required guest details.");
      return false;
    }
    if (!guest.email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  }

  function continueToReview(event) {
    event.preventDefault();
    if (validateGuest()) setStep(2);
  }

  function confirmBooking() {
    if (!validateGuest()) {
      setStep(1);
      return;
    }
    onConfirmed({
      id: `PREVIEW-${Date.now().toString(36).toUpperCase()}`,
      guest: `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      phone: guest.phone,
      roomType: room.name,
      room: "To be assigned",
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: Number(search.guests),
      amount: total,
      payment: paymentMethod === "Pay at hotel" ? "Unpaid" : "Payment Pending",
      status: "Preview only",
      source: "Frontend preview"
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-3 py-2 text-sm font-semibold">
        <ArrowLeft size={16} aria-hidden="true" /> Back
      </button>

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Booking preview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Plan your stay</h1>
        <p className="mt-2 text-sm text-forest-900/60">You are booking the <strong>{room.name}</strong> room type. Your specific room number will be assigned by the hotel.</p>
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This preview does not hold a room or send a reservation. Final rates and availability require the hotel backend.</p>
      </div>

      <ol className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="Booking progress">
        {[
          [1, "Guest details"],
          [2, "Review & payment"],
          [3, "Preview"]
        ].map(([number, label]) => (
          <li key={number} className={`rounded-2xl border p-4 ${step >= number ? "border-gold bg-amber-50" : "border-forest-900/10 bg-white"}`}>
            <p className="text-xs font-bold text-gold">STEP {number}</p>
            <p className="mt-1 font-semibold">{label}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {step === 1 && (
            <form onSubmit={continueToReview} className="rounded-3xl border border-forest-900/10 bg-white p-6 shadow-soft" noValidate>
              <h2 className="text-xl font-bold">Stay details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <FormField id="stay-check-in" label="Check-in">
                  {() => <input id="stay-check-in" type="date" min={todayLocal()} value={search.checkIn} onChange={(e) => setSearch({ ...search, checkIn: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required />}
                </FormField>
                <FormField id="stay-check-out" label="Check-out">
                  {() => <input id="stay-check-out" type="date" min={search.checkIn || todayLocal()} value={search.checkOut} onChange={(e) => setSearch({ ...search, checkOut: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required />}
                </FormField>
                <FormField id="stay-guests" label="Guests">
                  {() => <select id="stay-guests" value={search.guests} onChange={(e) => setSearch({ ...search, guests: Number(e.target.value) })} className="w-full rounded-xl border border-forest-900/15 px-3 py-3">{Array.from({ length: room.capacity }, (_, i) => i + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select>}
                </FormField>
              </div>
              <div className="mt-7 border-t border-forest-900/10 pt-6" />
              <h2 className="text-xl font-bold">Guest information</h2>
              <p className="mt-1 text-sm text-forest-900/55">Fields marked as required must be completed before continuing.</p>

              {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">Error: {error}</div>}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField id="first-name" label="First name">
                  {() => <input id="first-name" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required />}
                </FormField>
                <FormField id="last-name" label="Last name">
                  {() => <input id="last-name" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required />}
                </FormField>
                <FormField id="email" label="Email address" hint="Used only in this browser session for the preview.">
                  {({ describedBy }) => <input id="email" type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} aria-describedby={describedBy} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required />}
                </FormField>
                <FormField id="phone" label="Mobile number">
                  {() => <input id="phone" type="tel" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required />}
                </FormField>
              </div>

              <div className="mt-5">
                <FormField id="requests" label="Special requests" hint="Requests are noted but not guaranteed.">
                  {({ describedBy }) => <textarea id="requests" rows="4" value={guest.requests} onChange={(e) => setGuest({ ...guest, requests: e.target.value })} aria-describedby={describedBy} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" />}
                </FormField>
              </div>

              <button type="submit" className="mt-6 w-full rounded-xl bg-forest-900 px-4 py-3 font-semibold text-white">
                Continue to review
              </button>
            </form>
          )}

          {step === 2 && (
            <section className="rounded-3xl border border-forest-900/10 bg-white p-6 shadow-soft" aria-labelledby="review-title">
              <h2 id="review-title" className="text-xl font-bold">Review your booking</h2>

              <dl className="mt-6 space-y-3 rounded-2xl bg-mist p-4 text-sm">
                <div className="flex justify-between gap-4"><dt>Guest</dt><dd className="font-semibold">{guest.firstName} {guest.lastName}</dd></div>
                <div className="flex justify-between gap-4"><dt>Room type</dt><dd className="font-semibold">{room.name}</dd></div>
                <div className="flex justify-between gap-4"><dt>Room number</dt><dd className="font-semibold">Assigned later</dd></div>
                <div className="flex justify-between gap-4"><dt>Guests</dt><dd className="font-semibold">{search.guests}</dd></div>
                <div className="flex justify-between gap-4"><dt>Nights</dt><dd className="font-semibold">{nights}</dd></div>
              </dl>

              <fieldset className="mt-6">
                <legend className="font-bold">Payment option</legend>
                <div className="mt-3 space-y-3">
                  {["Pay at hotel", "Card payment (demo)"].map((method) => (
                    <label key={method} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${paymentMethod === method ? "border-gold bg-amber-50" : "border-forest-900/10"}`}>
                      <input type="radio" name="payment-method" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <CreditCard size={18} aria-hidden="true" />
                      <span className="font-semibold">{method}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <aside className="mt-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <Info size={18} className="shrink-0" aria-hidden="true" />
                This is a frontend prototype. No room is reserved and no payment is processed.
              </aside>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-forest-900/15 px-4 py-3 font-semibold">Back</button>
                <button type="button" onClick={confirmBooking} className="flex-1 rounded-xl bg-forest-900 px-4 py-3 font-semibold text-white">Finish booking preview</button>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft" aria-labelledby="booking-summary">
          <img src={room.image} alt="" className="h-44 w-full rounded-2xl object-cover" />
          <h2 id="booking-summary" className="mt-5 text-lg font-bold">Booking summary</h2>
          <p className="mt-2 font-semibold">{room.name}</p>
          <p className="text-sm text-forest-900/55">{room.beds}</p>

          <dl className="mt-5 space-y-3 border-t border-forest-900/10 pt-4 text-sm">
            <div className="flex justify-between gap-4"><dt>Sample room rate × {nights} nights</dt><dd>{nights ? formatCurrency(subtotal) : "Select dates"}</dd></div>
            <div className="flex justify-between gap-4"><dt>Taxes / fees</dt><dd>{formatCurrency(taxes)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-forest-900/10 pt-3 text-base font-bold"><dt>Estimated total</dt><dd>{nights ? formatCurrency(total) : "Select dates"}</dd></div>
          </dl>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-forest-900/55"><ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> Final pricing and payment validation belong to the backend after integration.</p>
        </aside>
      </div>
    </section>
  );
}
