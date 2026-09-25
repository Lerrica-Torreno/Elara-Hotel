import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import FormField from "../components/ui/FormField";

export default function CancellationPage({ booking, onBack, onDone }) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!reason) return;
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
        <div className="rounded-3xl border border-forest-900/10 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 aria-hidden="true" /></div>
          <h1 className="mt-5 text-3xl font-bold">Cancellation flow previewed.</h1>
          <p className="mt-3 leading-7 text-forest-900/60">No request was sent. Once connected, the backend will determine the cancellation result, refund, and released room inventory.</p>
          <button type="button" onClick={onDone} className="mt-6 rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white">Return to my booking</button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-5 py-12 lg:px-8">
      <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-3 py-2 text-sm font-semibold">
        <ArrowLeft size={16} aria-hidden="true" /> Back
      </button>

      <div className="rounded-3xl border border-forest-900/10 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Reservation {booking.id}</p>
        <h1 className="mt-2 text-3xl font-bold">Preview a cancellation request</h1>
        <p className="mt-3 text-sm leading-6 text-forest-900/60">
          This is a browser-only booking preview. Selecting a reason demonstrates the future cancellation form and does not contact the hotel.
        </p>

        <form onSubmit={submit} className="mt-6">
          <FormField id="cancellation-reason" label="Reason for cancellation">
            {() => (
              <select id="cancellation-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-3" required>
                <option value="">Select a reason</option>
                <option>Change of plans</option>
                <option>Travel disruption</option>
                <option>Booked another property</option>
                <option>Personal reason</option>
                <option>Other</option>
              </select>
            )}
          </FormField>

          <button type="submit" disabled={!reason} className="mt-6 w-full rounded-xl bg-red-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
            Finish cancellation preview
          </button>
        </form>
      </div>
    </section>
  );
}
