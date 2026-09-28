import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CalendarDays,
  CreditCard,
  Hotel,
  Mail,
  Search,
  Users,
  XCircle
} from "lucide-react";

import FormField from "../components/ui/FormField";
import Badge from "../components/ui/Badge";

import {
  formatCurrency,
  formatDate
} from "../utils/format";

import {
  api
} from "../services/api";

import {
  useCustomerAuth
} from "../context/CustomerAuthContext";

function getStatusTone(
  status
) {
  switch (
    status
  ) {
    case "CONFIRMED":
    case "CHECKED_IN":
    case "CHECKED_OUT":
      return "green";

    case "PENDING":
      return "amber";

    case "CANCELLED":
    case "NO_SHOW":
      return "gray";

    default:
      return "gray";
  }
}

function formatStatus(
  status
) {
  return String(
    status ?? ""
  )
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function paymentMethodLabel(
  method
) {
  switch (
    method
  ) {
    case "CARD":
      return "Credit / Debit Card";

    case "GCASH":
      return "GCash";

    case "EWALLET":
      return "E-Wallet";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "CASH":
      return "Cash";

    default:
      return method || "Not yet recorded";
  }
}

function paymentStatusLabel(
  payments = []
) {
  if (
    !payments.length
  ) {
    return "No payment recorded";
  }

  const paid =
    payments.filter(
      (payment) =>
        payment.status ===
          "PAID" ||
        payment.status ===
          "PARTIALLY_PAID"
    );

  const paidTotal =
    paid.reduce(
      (
        total,
        payment
      ) =>
        total +
        Number(
          payment.amount ??
            0
        ),
      0
    );

  const hasPaid =
    payments.some(
      (payment) =>
        payment.status ===
        "PAID"
    );

  const hasPartial =
    payments.some(
      (payment) =>
        payment.status ===
        "PARTIALLY_PAID"
    );

  const hasPending =
    payments.some(
      (payment) =>
        payment.status ===
        "PENDING"
    );

  if (
    hasPaid
  ) {
    return `Paid ${formatCurrency(
      paidTotal
    )}`;
  }

  if (
    hasPartial
  ) {
    return `Partially paid ${formatCurrency(
      paidTotal
    )}`;
  }

  if (
    hasPending
  ) {
    return "Payment pending";
  }

  return "Payment recorded";
}

export default function MyBookingPage({
  reservation,
  onCancel
}) {
  const {
    customer
  } =
    useCustomerAuth();

  const [
    reference,
    setReference
  ] =
    useState(
      reservation?.id ??
        ""
    );

  const [
    email,
    setEmail
  ] =
    useState(
      reservation?.email ??
        customer?.email ??
        ""
    );

  const [
    booking,
    setBooking
  ] =
    useState(
      null
    );

  const [
    myReservations,
    setMyReservations
  ] =
    useState([]);

  const [
    loadingMine,
    setLoadingMine
  ] =
    useState(false);

  const [
    searching,
    setSearching
  ] =
    useState(false);

  const [
    cancelling,
    setCancelling
  ] =
    useState(false);

  const [
    error,
    setError
  ] =
    useState("");

  const [
    cancelReason,
    setCancelReason
  ] =
    useState("");

  useEffect(() => {
    if (
      customer
    ) {
      loadMyReservations();
    }
  }, [
    customer
  ]);

  async function loadMyReservations() {
    try {
      setLoadingMine(
        true
      );

      setError("");

      const response =
        await api.reservations.mine();

      setMyReservations(
        response?.reservations ??
          []
      );
    } catch (
      loadError
    ) {
      setError(
        loadError.message ||
          "Unable to load your reservations."
      );
    } finally {
      setLoadingMine(
        false
      );
    }
  }

  async function searchBooking(
    event
  ) {
    event.preventDefault();

    if (
      !reference.trim() ||
      !email.trim()
    ) {
      setError(
        "Please enter your reservation number and email address."
      );

      setBooking(
        null
      );

      return;
    }

    try {
      setSearching(
        true
      );

      setError("");

      const response =
        await api.reservations.lookup({
          reference:
            reference
              .trim()
              .toUpperCase(),

          email:
            email
              .trim()
              .toLowerCase()
        });

      setBooking(
        response.reservation
      );
    } catch (
      searchError
    ) {
      setBooking(
        null
      );

      setError(
        searchError.message ||
          "We couldn't find a reservation matching those details."
      );
    } finally {
      setSearching(
        false
      );
    }
  }

  async function cancelBooking() {
    if (
      !booking
    ) {
      return;
    }

    try {
      setCancelling(
        true
      );

      setError("");

      const response =
        await api.reservations.cancel(
          booking.id,
          {
            email:
              customer
                ? undefined
                : email
                    .trim()
                    .toLowerCase(),

            reason:
              cancelReason
                .trim() ||
              undefined
          }
        );

      setBooking(
        (current) => ({
          ...current,
          ...response.reservation
        })
      );

      if (
        customer
      ) {
        await loadMyReservations();
      }

      if (
        onCancel
      ) {
        onCancel(
          response.reservation
        );
      }

      setCancelReason(
        ""
      );
    } catch (
      cancelError
    ) {
      setError(
        cancelError.message ||
          "Unable to cancel this reservation."
      );
    } finally {
      setCancelling(
        false
      );
    }
  }

  const selectedPayment =
    useMemo(
      () => {
        if (
          !booking?.payments
            ?.length
        ) {
          return null;
        }

        return (
          booking.payments.find(
            (payment) =>
              payment.status ===
              "PAID"
          ) ??
          booking.payments.find(
            (payment) =>
              payment.status ===
              "PARTIALLY_PAID"
          ) ??
          booking.payments.find(
            (payment) =>
              payment.status ===
              "PENDING"
          ) ??
          booking.payments[0]
        );
      },
      [
        booking
      ]
    );

  const assignedRoom =
    booking?.assignedRoom
      ?.roomNumber
      ? `Room ${booking.assignedRoom.roomNumber}`
      : "Pending assignment";

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 lg:px-8 lg:pb-20 lg:pt-24">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
          Manage your stay
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-forest-950 md:text-5xl">
          Find your reservation.
        </h1>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-forest-900/60">
          Enter your reservation number and the
          email address used when booking to view
          your reservation details.
        </p>
      </header>

      {customer && (
        <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-forest-900/10 bg-white p-6 shadow-soft md:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Your account
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-forest-950">
                Your reservations
              </h2>
            </div>

            <button
              type="button"
              onClick={
                loadMyReservations
              }
              disabled={
                loadingMine
              }
              className="rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-mist disabled:opacity-50"
            >
              {loadingMine
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {loadingMine ? (
            <p className="mt-5 text-sm text-forest-900/50">
              Loading your reservations...
            </p>
          ) : !myReservations.length ? (
            <p className="mt-5 text-sm text-forest-900/50">
              No reservations are linked to this account yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {myReservations.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() => {
                      setBooking(
                        item
                      );

                      setReference(
                        item.reference
                      );

                      setEmail(
                        item.guestEmail
                      );

                      setError(
                        ""
                      );
                    }}
                    className="flex w-full flex-col justify-between gap-3 rounded-2xl border border-forest-900/10 bg-mist/60 p-4 text-left transition hover:border-gold sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-forest-950">
                        {
                          item.reference
                        }
                      </p>

                      <p className="mt-1 text-sm text-forest-900/55">
                        {item.roomType
                          ?.name ??
                          "Room"}{" "}
                        ·{" "}
                        {formatDate(
                          item.checkInDate
                        )}{" "}
                        →{" "}
                        {formatDate(
                          item.checkOutDate
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-forest-950">
                        {formatCurrency(
                          Number(
                            item.totalAmount ??
                              0
                          )
                        )}
                      </span>

                      <Badge
                        tone={getStatusTone(
                          item.status
                        )}
                      >
                        {formatStatus(
                          item.status
                        )}
                      </Badge>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </section>
      )}

      <form
        onSubmit={
          searchBooking
        }
        className="mx-auto mt-10 grid max-w-4xl gap-4 rounded-[2rem] border border-forest-900/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_1fr_auto] md:items-end md:p-7"
        noValidate
      >
        <FormField
          id="reservation-reference"
          label="Reservation number"
        >
          {() => (
            <input
              id="reservation-reference"
              value={
                reference
              }
              onChange={(
                event
              ) =>
                setReference(
                  event.target.value
                )
              }
              placeholder="e.g. ELA-260927-48321"
              className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
            />
          )}
        </FormField>

        <FormField
          id="booking-email"
          label="Email address"
        >
          {() => (
            <input
              id="booking-email"
              type="email"
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
            />
          )}
        </FormField>

        <button
          type="submit"
          disabled={
            searching
          }
          className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-forest-900 px-6 font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search
            size={17}
            aria-hidden="true"
          />

          {searching
            ? "Searching..."
            : "Find reservation"}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-3"
          >
            {error}
          </p>
        )}
      </form>

      {booking && (
        <article className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-soft">
          <header className="flex flex-col justify-between gap-5 border-b border-forest-900/10 p-6 sm:flex-row sm:items-center md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                Reservation{" "}
                {
                  booking.reference
                }
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold text-forest-950">
                {booking.roomType
                  ?.name ??
                  "Reservation"}
              </h2>

              <p className="mt-1 text-sm text-forest-900/55">
                ELARA Hotel Tagaytay
              </p>
            </div>

            <Badge
              tone={getStatusTone(
                booking.status
              )}
            >
              {formatStatus(
                booking.status
              )}
            </Badge>
          </header>

          <div className="p-6 md:p-8">
            <dl className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              <BookingDetail
                icon={
                  Users
                }
                label="Primary guest"
                value={`${booking.guestFirstName ?? ""} ${booking.guestLastName ?? ""}`.trim()}
              />

              <BookingDetail
                icon={
                  CalendarDays
                }
                label="Check-in"
                value={formatDate(
                  booking.checkInDate
                )}
              />

              <BookingDetail
                icon={
                  CalendarDays
                }
                label="Check-out"
                value={formatDate(
                  booking.checkOutDate
                )}
              />

              <BookingDetail
                icon={
                  Hotel
                }
                label="Assigned room"
                value={
                  assignedRoom
                }
              />

              <BookingDetail
                icon={
                  CreditCard
                }
                label="Payment method"
                value={paymentMethodLabel(
                  selectedPayment
                    ?.method
                )}
              />

              <BookingDetail
                icon={
                  CreditCard
                }
                label="Payment status"
                value={paymentStatusLabel(
                  booking.payments ??
                    []
                )}
              />

              <BookingDetail
                icon={
                  Users
                }
                label="Guests"
                value={`${booking.guestCount ?? 0} ${
                  Number(
                    booking.guestCount ??
                      0
                  ) === 1
                    ? "Guest"
                    : "Guests"
                }`}
              />

              <BookingDetail
                icon={
                  Mail
                }
                label="Email"
                value={
                  booking.guestEmail
                }
              />
            </dl>

            <div className="mt-8 grid gap-4 rounded-2xl bg-mist p-5 sm:grid-cols-2 lg:grid-cols-4">
              <PriceDetail
                label="Subtotal"
                value={formatCurrency(
                  Number(
                    booking.subtotal ??
                      0
                  )
                )}
              />

              <PriceDetail
                label="Discount"
                value={
                  Number(
                    booking.discountAmount ??
                      0
                  ) >
                  0
                    ? `-${formatCurrency(
                        Number(
                          booking.discountAmount
                        )
                      )}`
                    : formatCurrency(
                        0
                      )
                }
              />

              <PriceDetail
                label="Taxes & fees"
                value={formatCurrency(
                  Number(
                    booking.taxAmount ??
                      0
                  )
                )}
              />

              <PriceDetail
                label="Reservation total"
                value={formatCurrency(
                  Number(
                    booking.totalAmount ??
                      0
                  )
                )}
                strong
              />
            </div>

            {booking.promotion && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Promotion{" "}
                <strong>
                  {
                    booking.promotion
                      .code
                  }
                </strong>{" "}
                applied:{" "}
                {
                  booking.promotion
                    .name
                }
              </div>
            )}

            {booking.discount && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Discount{" "}
                <strong>
                  {
                    booking.discount
                      .code
                  }
                </strong>{" "}
                applied:{" "}
                {
                  booking.discount
                    .name
                }
              </div>
            )}

            {booking.status !==
              "CANCELLED" &&
              booking.status !==
                "CHECKED_IN" &&
              booking.status !==
                "CHECKED_OUT" && (
                <div className="mt-8 rounded-2xl border border-red-100 bg-red-50/40 p-5">
                  <h3 className="font-semibold text-forest-950">
                    Cancel reservation
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-forest-900/55">
                    If you need to cancel your stay,
                    you may optionally provide a reason.
                  </p>

                  <textarea
                    rows="3"
                    value={
                      cancelReason
                    }
                    onChange={(
                      event
                    ) =>
                      setCancelReason(
                        event.target.value
                      )
                    }
                    placeholder="Reason for cancellation (optional)"
                    className="mt-4 w-full resize-none rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                  />

                  <button
                    type="button"
                    onClick={
                      cancelBooking
                    }
                    disabled={
                      cancelling
                    }
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle
                      size={17}
                      aria-hidden="true"
                    />

                    {cancelling
                      ? "Cancelling..."
                      : "Cancel reservation"}
                  </button>
                </div>
              )}

            {booking.status ===
              "CANCELLED" && (
              <div className="mt-5 rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-sm text-forest-900/60">
                <p className="font-semibold text-forest-950">
                  This reservation has been cancelled.
                </p>

                {booking.cancellationReason && (
                  <p className="mt-1">
                    Reason:{" "}
                    {
                      booking.cancellationReason
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </article>
      )}
    </section>
  );
}

function BookingDetail({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mist text-forest-900">
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
          {value ||
            "—"}
        </dd>
      </div>
    </div>
  );
}

function PriceDetail({
  label,
  value,
  strong = false
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
        {label}
      </dt>

      <dd
        className={`mt-1 ${
          strong
            ? "font-serif text-2xl font-semibold"
            : "font-semibold"
        } text-forest-950`}
      >
        {value}
      </dd>
    </div>
  );
}