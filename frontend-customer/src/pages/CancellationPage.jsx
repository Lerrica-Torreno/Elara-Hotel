import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Hotel
} from "lucide-react";
import FormField from "../components/ui/FormField";
import {
  formatCurrency,
  formatDate
} from "../utils/format";

export default function CancellationPage({
  booking,
  onBack,
  onCancelled
}) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function submit(event) {
    event.preventDefault();

    if (!reason) {
      return;
    }

    setConfirmed(true);
  }

  function finishCancellation() {
    onCancelled(booking);
  }

  if (!booking) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-16 text-center lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-forest-950">
          Reservation unavailable
        </h1>

        <p className="mt-3 text-forest-900/60">
          No reservation was selected for cancellation.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-forest-900 px-6 py-3 font-semibold text-white"
        >
          Return to reservations
        </button>
      </section>
    );
  }

  if (confirmed) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-forest-900/10 bg-white p-8 text-center shadow-soft md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2
              size={30}
              aria-hidden="true"
            />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            Cancellation confirmed
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-forest-950">
            Your reservation has been cancelled.
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-forest-900/60">
            Reservation{" "}
            <strong>{booking.id}</strong>{" "}
            for the{" "}
            <strong>{booking.roomType}</strong>{" "}
            has been cancelled.
          </p>

          <div className="mt-7 rounded-2xl bg-mist p-5 text-left">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
                  Reservation number
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {booking.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
                  Guest
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {booking.guest}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
                  Original check-in
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {formatDate(
                    booking.checkIn
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
                  Reservation total
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {formatCurrency(
                    booking.amount
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-forest-900/55">
            Any applicable refund is subject to the
            reservation's cancellation and payment terms.
          </p>

          <button
            type="button"
            onClick={finishCancellation}
            className="mt-7 rounded-xl bg-forest-900 px-6 py-3 font-semibold text-white transition hover:bg-forest-800"
          >
            Return to my reservation
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
      <button
        type="button"
        onClick={onBack}
        className="mb-7 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-mist"
      >
        <ArrowLeft
          size={16}
          aria-hidden="true"
        />

        Back to reservation
      </button>

      <div className="overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-soft">
        <header className="border-b border-forest-900/10 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Reservation {booking.id}
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold text-forest-950 md:text-4xl">
            Cancel your reservation
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-forest-900/60">
            We're sorry your plans have changed.
            Please review your reservation and select
            your reason for cancelling.
          </p>
        </header>

        <div className="p-6 md:p-8">
          <div className="grid gap-4 rounded-2xl bg-mist p-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-forest-900">
                <Hotel size={17} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
                  Room
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {booking.roomType}
                </p>

                <p className="text-sm text-forest-900/50">
                  Room {booking.room}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-forest-900">
                <CalendarDays size={17} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
                  Stay
                </p>

                <p className="mt-1 font-semibold text-forest-950">
                  {formatDate(
                    booking.checkIn
                  )}
                </p>

                <p className="text-sm text-forest-900/50">
                  to{" "}
                  {formatDate(
                    booking.checkOut
                  )}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="mt-7"
          >
            <FormField
              id="cancellation-reason"
              label="Reason for cancellation"
              hint="Please select the option that best describes why your plans changed."
            >
              {({ describedBy }) => (
                <select
                  id="cancellation-reason"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                  aria-describedby={
                    describedBy
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                  required
                >
                  <option value="">
                    Select a reason
                  </option>

                  <option value="Change of plans">
                    Change of plans
                  </option>

                  <option value="Travel disruption">
                    Travel disruption
                  </option>

                  <option value="Booked another property">
                    Booked another property
                  </option>

                  <option value="Personal reason">
                    Personal reason
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              )}
            </FormField>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-forest-900/15 bg-white px-5 py-3 font-semibold transition hover:bg-mist"
              >
                Keep reservation
              </button>

              <button
                type="submit"
                disabled={!reason}
                className="flex-1 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm cancellation
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}