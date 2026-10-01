import {
  useRef,
  useState
} from "react";

import {
  ArrowLeft,
  BadgePercent,
  BedDouble,
  CalendarDays,
  CreditCard,
  Smartphone,
  Tag,
  Users
} from "lucide-react";

import {
  useCustomerAuth
} from "../context/CustomerAuthContext";

import FormField from "../components/ui/FormField";

import {
  formatCurrency,
  nightsBetween,
  stayError,
  todayLocal
} from "../utils/format";

import {
  api
} from "../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8000/api";

async function publicRequest(
  path,
  options = {}
) {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers ??
            {})
        },

        ...options
      }
    );

  const contentType =
    response.headers.get(
      "content-type"
    ) ?? "";

  let data = null;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  } else {
    const text =
      await response.text();

    data =
      text
        ? {
            message:
              text
          }
        : null;
  }

  if (
    !response.ok
  ) {
    throw new Error(
      data?.message ??
        data?.error ??
        "Request failed."
    );
  }

  return data;
}

export default function BookingPage({
  room,
  search,
  setSearch,
  onBack,
  onConfirmed
}) {
  const {
    customer
  } =
    useCustomerAuth();

  const [
    step,
    setStep
  ] =
    useState(1);

  const bookingTopRef =
    useRef(null);

  const [
    error,
    setError
  ] =
    useState("");

  const [
    submitting,
    setSubmitting
  ] =
    useState(false);

  const [
    guest,
    setGuest
  ] =
    useState({
      firstName:
        customer?.firstName ??
        "",

      lastName:
        customer?.lastName ??
        "",

      email:
        customer?.email ??
        "",

      phone:
        customer?.phone ??
        "",

      requests:
        ""
    });

  const [
    paymentMethod,
    setPaymentMethod
  ] =
    useState(
      "Credit / Debit Card"
    );

  const [
    offerType,
    setOfferType
  ] =
    useState(
      "PROMOTION"
    );

  const [
    offerCode,
    setOfferCode
  ] =
    useState("");

  const [
    appliedOffer,
    setAppliedOffer
  ] =
    useState(null);

  const [
    validatingOffer,
    setValidatingOffer
  ] =
    useState(false);

  const nights =
    stayError(
      search,
      room.capacity
    )
      ? 0
      : nightsBetween(
          search.checkIn,
          search.checkOut
        );

  /*
    Frontend estimate only.

    Official pricing is always recalculated
    by the backend when the reservation is
    confirmed.
  */
  const estimatedSubtotal =
    room.displayRate *
    nights;

  const estimatedTaxes =
    Math.round(
      estimatedSubtotal *
        0.12 *
        100
    ) / 100;

  const estimatedTotal =
    estimatedSubtotal +
    estimatedTaxes;

  const displayedSubtotal =
    appliedOffer
      ? appliedOffer.subtotal
      : estimatedSubtotal;

  const displayedDiscount =
    appliedOffer
      ? appliedOffer.discountAmount
      : 0;

  const displayedTaxes =
    appliedOffer
      ? appliedOffer.taxAmount
      : estimatedTaxes;

  const displayedTotal =
    appliedOffer
      ? appliedOffer.totalAmount
      : estimatedTotal;

  function updateGuest(
    field,
    value
  ) {
    setGuest(
      (current) => ({
        ...current,
        [field]:
          value
      })
    );
  }

  function clearOffer() {
    setOfferCode("");
    setAppliedOffer(
      null
    );
    setError("");
  }

  function changeOfferType(
    type
  ) {
    setOfferType(
      type
    );

    setOfferCode("");
    setAppliedOffer(
      null
    );

    setError("");
  }

  function changeOfferCode(
    value
  ) {
    setOfferCode(
      value
    );

    /*
      A code must be validated again
      after the user edits it.
    */
    setAppliedOffer(
      null
    );
  }

  function validateGuest() {
    const datesError =
      stayError(
        search,
        room.capacity
      );

    if (
      datesError
    ) {
      setError(
        datesError
      );

      return false;
    }

    if (
      !guest.firstName.trim() ||
      !guest.lastName.trim() ||
      !guest.email.trim() ||
      !guest.phone.trim()
    ) {
      setError(
        "Please complete all required guest information."
      );

      return false;
    }

    if (
      !guest.email.includes(
        "@"
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return false;
    }

    setError("");

    return true;
  }

  function goToStep(
    nextStep
  ) {
    setStep(
      nextStep
    );

    requestAnimationFrame(
      () => {
        bookingTopRef.current?.scrollIntoView(
          {
            behavior:
              "smooth",

            block:
              "start"
          }
        );
      }
    );
  }

  function continueToReview(
    event
  ) {
    event.preventDefault();

    if (
      validateGuest()
    ) {
      goToStep(
        2
      );
    }
  }

  async function getDatabaseRoomType() {
  const response =
    await api.roomTypes.list();

  const roomTypeCodeMap = {
  "Deluxe King": "DELUXE",
  "Premier Twin": "TWIN",
  "Family Suite": "FAMILY",
  "Family Room": "FAMILY",
  "Elara Suite": "SUITE",
  "Executive Suite": "SUITE"
};

  const expectedCode =
    roomTypeCodeMap[
      room.name
    ];

  let databaseRoomType =
    null;

  if (
    expectedCode
  ) {
    databaseRoomType =
      response.roomTypes.find(
        (type) =>
          type.code ===
          expectedCode
      );
  }

  /*
   * Fallback for any room whose frontend
   * display name already matches the
   * database name.
   */
  if (
    !databaseRoomType
  ) {
    databaseRoomType =
      response.roomTypes.find(
        (type) =>
          type.name
            .trim()
            .toLowerCase() ===
          room.name
            .trim()
            .toLowerCase()
      );
  }

  if (
    !databaseRoomType
  ) {
    throw new Error(
      `${room.name} has not been configured in the hotel database.`
    );
  }

  return databaseRoomType;
}

  async function validateOffer() {
    if (
      !offerCode.trim()
    ) {
      setError(
        `Enter a ${
          offerType ===
          "PROMOTION"
            ? "promotion"
            : "discount"
        } code first.`
      );

      return;
    }

    const datesError =
      stayError(
        search,
        room.capacity
      );

    if (
      datesError
    ) {
      setError(
        datesError
      );

      return;
    }

    try {
      setValidatingOffer(
        true
      );

      setError("");
      setAppliedOffer(
        null
      );

      const databaseRoomType =
        await getDatabaseRoomType();

      /*
        Ask the backend pricing engine for
        the current official nightly rate.
      */
      const pricingQuote =
        await publicRequest(
          `/public/pricing/quote?roomTypeId=${encodeURIComponent(
            databaseRoomType.id
          )}&checkIn=${encodeURIComponent(
            search.checkIn
          )}&checkOut=${encodeURIComponent(
            search.checkOut
          )}`
        );

      const officialNightlyRate =
        Number(
          pricingQuote.nightlyRate ??
            databaseRoomType.baseRate ??
            room.displayRate
        );

      const officialSubtotal =
        Math.round(
          officialNightlyRate *
            nights *
            100
        ) / 100;

      if (
        officialSubtotal <=
        0
      ) {
        throw new Error(
          "Unable to calculate the reservation subtotal."
        );
      }

      const endpoint =
        offerType ===
        "PROMOTION"
          ? "/public/promotions/validate"
          : "/public/discounts/validate";

      const result =
        await publicRequest(
          endpoint,
          {
            method:
              "POST",

            body:
              JSON.stringify({
                code:
                  offerCode
                    .trim()
                    .toUpperCase(),

                subtotal:
                  officialSubtotal
              })
          }
        );

      const discountAmount =
        Number(
          result.discountAmount ??
            0
        );

      const discountedSubtotal =
        Math.max(
          officialSubtotal -
            discountAmount,
          0
        );

      const taxAmount =
        Math.round(
          discountedSubtotal *
            0.12 *
            100
        ) / 100;

      const totalAmount =
        Math.round(
          (
            discountedSubtotal +
            taxAmount
          ) *
            100
        ) / 100;

      const offer =
        offerType ===
        "PROMOTION"
          ? result.promotion
          : result.discount;

      setAppliedOffer({
        type:
          offerType,

        code:
          offer?.code ??
          offerCode
            .trim()
            .toUpperCase(),

        name:
          offer?.name ??
          "Applied offer",

        subtotal:
          officialSubtotal,

        discountAmount,

        taxAmount,

        totalAmount
      });
    } catch (
      offerError
    ) {
      setAppliedOffer(
        null
      );

      setError(
        offerError.message ||
          "Unable to validate this code."
      );
    } finally {
      setValidatingOffer(
        false
      );
    }
  }

  async function confirmBooking() {
    if (
      !validateGuest()
    ) {
      goToStep(
        1
      );

      return;
    }

    try {
      setSubmitting(
        true
      );

      setError("");

      const databaseRoomType =
        await getDatabaseRoomType();

      /*
        Create the REAL reservation.

        The backend remains responsible for:
        - availability
        - dynamic pricing
        - discount/promotion validation
        - taxes
        - final total
        - reservation reference
      */
      const payload = {
        roomTypeId:
          databaseRoomType.id,

        guestFirstName:
          guest.firstName.trim(),

        guestLastName:
          guest.lastName.trim(),

        guestEmail:
          guest.email
            .trim()
            .toLowerCase(),

        guestPhone:
          guest.phone.trim(),

        guestCount:
          Number(
            search.guests
          ),

        paymentMethod:
          paymentMethod ===
          "Credit / Debit Card"
            ? "CARD"
            : "EWALLET",

        specialRequests:
          guest.requests.trim(),

        checkInDate:
          search.checkIn,

        checkOutDate:
          search.checkOut
      };

      if (
        appliedOffer?.type ===
        "PROMOTION"
      ) {
        payload.promoCode =
          appliedOffer.code;
      }

      if (
        appliedOffer?.type ===
        "DISCOUNT"
      ) {
        payload.discountCode =
          appliedOffer.code;
      }

      const response =
        await api.reservations.create(
          payload
        );

      const saved =
        response.reservation;

      onConfirmed({
        id:
          saved.reference,

        backendId:
          saved.id,

        customerId:
          customer?.id ??
          null,

        guest:
          `${saved.guestFirstName} ${saved.guestLastName}`,

        firstName:
          saved.guestFirstName,

        lastName:
          saved.guestLastName,

        email:
          saved.guestEmail,

        phone:
          saved.guestPhone ??
          "",

        requests:
          saved.specialRequests ??
          "",

        roomType:
          saved.roomType?.name ??
          room.name,

        /*
          Physical room assignment belongs
          to Front Desk.
        */
        room:
          "Pending assignment",

        checkIn:
          String(
            saved.checkInDate
          ).slice(
            0,
            10
          ),

        checkOut:
          String(
            saved.checkOutDate
          ).slice(
            0,
            10
          ),

        guests:
          saved.guestCount,

        nights,

        subtotal:
          Number(
            saved.subtotal
          ),

        taxes:
          Number(
            saved.taxAmount
          ),

        discount:
          Number(
            saved.discountAmount ??
              0
          ),

        promotion:
          saved.promotion ??
          null,

        discountRule:
          saved.discount ??
          null,

        amount:
          Number(
            saved.totalAmount
          ),

        total:
          Number(
            saved.totalAmount
          ),

        paymentStatus:
          "Pending",

        paymentMethod,

        status:
          "Confirmed",

        source:
          "ELARA Website",

        bookedBy:
          customer
            ? "Registered customer"
            : "Guest"
      });
    } catch (
      bookingError
    ) {
      setError(
        bookingError.message ||
          "Unable to complete your reservation."
      );

      bookingTopRef.current?.scrollIntoView(
        {
          behavior:
            "smooth",

          block:
            "start"
        }
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <section
      ref={
        bookingTopRef
      }
      className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-14 pt-16 lg:px-8 lg:pb-20 lg:pt-20"
    >
      <button
        type="button"
        onClick={
          onBack
        }
        className="mb-7 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-mist"
      >
        <ArrowLeft
          size={16}
          aria-hidden="true"
        />

        Back to rooms
      </button>

      <header className="mb-9 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
          Reservation
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-forest-950 md:text-5xl">
          Complete your reservation.
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-forest-900/60">
          Reserve your stay in our{" "}
          <strong className="text-forest-950">
            {room.name}
          </strong>
          . Review your dates, provide your guest
          information, and choose your preferred
          payment method.
        </p>

        {customer && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 py-2 text-sm text-forest-900/60">
            Booking as{" "}
            <strong className="text-forest-950">
              {customer.firstName}{" "}
              {customer.lastName}
            </strong>
          </div>
        )}
      </header>

      <ol
        className="mb-8 grid gap-3 sm:grid-cols-3"
        aria-label="Reservation progress"
      >
        {[
          [
            1,
            "Guest details"
          ],

          [
            2,
            "Review & payment"
          ],

          [
            3,
            "Confirmation"
          ]
        ].map(
          ([
            number,
            label
          ]) => (
            <li
              key={
                number
              }
              className={`rounded-2xl border px-5 py-4 transition ${
                step >=
                number
                  ? "border-gold bg-sand/40"
                  : "border-forest-900/10 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                    step >=
                    number
                      ? "bg-forest-900 text-white"
                      : "bg-mist text-forest-900/50"
                  }`}
                >
                  {number}
                </span>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-900/40">
                    Step{" "}
                    {number}
                  </p>

                  <p className="font-semibold text-forest-950">
                    {label}
                  </p>
                </div>
              </div>
            </li>
          )
        )}
      </ol>

      <div className="grid gap-7 lg:grid-cols-[1fr_390px]">
        <div>
          {step === 1 && (
            <form
              onSubmit={
                continueToReview
              }
              className="rounded-[2rem] border border-forest-900/10 bg-white p-6 shadow-soft md:p-8"
              noValidate
            >
              <section>
                <h2 className="font-serif text-2xl font-semibold text-forest-950">
                  Stay details
                </h2>

                <p className="mt-2 text-sm text-forest-900/55">
                  Review your travel dates and number
                  of guests.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <FormField
                    id="stay-check-in"
                    label="Check-in"
                  >
                    {() => (
                      <input
                        id="stay-check-in"
                        type="date"
                        min={
                          todayLocal()
                        }
                        value={
                          search.checkIn
                        }
                        onChange={(
                          event
                        ) => {
                          setSearch(
                            (current) => ({
                              ...current,

                              checkIn:
                                event
                                  .target
                                  .value
                            })
                          );

                          setAppliedOffer(
                            null
                          );
                        }}
                        className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                        required
                      />
                    )}
                  </FormField>

                  <FormField
                    id="stay-check-out"
                    label="Check-out"
                  >
                    {() => (
                      <input
                        id="stay-check-out"
                        type="date"
                        min={
                          search.checkIn ||
                          todayLocal()
                        }
                        value={
                          search.checkOut
                        }
                        onChange={(
                          event
                        ) => {
                          setSearch(
                            (current) => ({
                              ...current,

                              checkOut:
                                event
                                  .target
                                  .value
                            })
                          );

                          setAppliedOffer(
                            null
                          );
                        }}
                        className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                        required
                      />
                    )}
                  </FormField>

                  <FormField
                    id="stay-guests"
                    label="Guests"
                  >
                    {() => (
                      <select
                        id="stay-guests"
                        value={
                          search.guests
                        }
                        onChange={(
                          event
                        ) =>
                          setSearch(
                            (current) => ({
                              ...current,

                              guests:
                                Number(
                                  event
                                    .target
                                    .value
                                )
                            })
                          )
                        }
                        className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                      >
                        {Array.from(
                          {
                            length:
                              room.capacity
                          },

                          (
                            _,
                            index
                          ) =>
                            index +
                            1
                        ).map(
                          (
                            count
                          ) => (
                            <option
                              key={
                                count
                              }
                              value={
                                count
                              }
                            >
                              {count}{" "}
                              {count ===
                              1
                                ? "guest"
                                : "guests"}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </FormField>
                </div>
              </section>

              <div className="my-8 border-t border-forest-900/10" />

              <section>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-forest-950">
                      Guest information
                    </h2>

                    <p className="mt-2 text-sm text-forest-900/55">
                      Enter the contact details of the
                      primary guest.
                    </p>
                  </div>

                  {customer && (
                    <span className="text-xs font-semibold text-forest-900/40">
                      Prefilled from your account
                    </span>
                  )}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <FormField
                    id="first-name"
                    label="First name"
                  >
                    {() => (
                      <input
                        id="first-name"
                        value={
                          guest.firstName
                        }
                        onChange={(
                          event
                        ) =>
                          updateGuest(
                            "firstName",
                            event
                              .target
                              .value
                          )
                        }
                        autoComplete="given-name"
                        className="w-full rounded-xl border border-forest-900/15 px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                        required
                      />
                    )}
                  </FormField>

                  <FormField
                    id="last-name"
                    label="Last name"
                  >
                    {() => (
                      <input
                        id="last-name"
                        value={
                          guest.lastName
                        }
                        onChange={(
                          event
                        ) =>
                          updateGuest(
                            "lastName",
                            event
                              .target
                              .value
                          )
                        }
                        autoComplete="family-name"
                        className="w-full rounded-xl border border-forest-900/15 px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                        required
                      />
                    )}
                  </FormField>

                  <FormField
                    id="email"
                    label="Email address"
                    hint="Your reservation confirmation will be associated with this email."
                  >
                    {({
                      describedBy
                    }) => (
                      <input
                        id="email"
                        type="email"
                        value={
                          guest.email
                        }
                        onChange={(
                          event
                        ) =>
                          updateGuest(
                            "email",
                            event
                              .target
                              .value
                          )
                        }
                        aria-describedby={
                          describedBy
                        }
                        autoComplete="email"
                        className="w-full rounded-xl border border-forest-900/15 px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                        required
                      />
                    )}
                  </FormField>

                  <FormField
                    id="phone"
                    label="Mobile number"
                  >
                    {() => (
                      <input
                        id="phone"
                        type="tel"
                        value={
                          guest.phone
                        }
                        onChange={(
                          event
                        ) =>
                          updateGuest(
                            "phone",
                            event
                              .target
                              .value
                          )
                        }
                        autoComplete="tel"
                        placeholder="+63"
                        className="w-full rounded-xl border border-forest-900/15 px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                        required
                      />
                    )}
                  </FormField>
                </div>

                <div className="mt-5">
                  <FormField
                    id="requests"
                    label="Special requests"
                    hint="Special requests are subject to availability."
                  >
                    {({
                      describedBy
                    }) => (
                      <textarea
                        id="requests"
                        rows="4"
                        value={
                          guest.requests
                        }
                        onChange={(
                          event
                        ) =>
                          updateGuest(
                            "requests",
                            event
                              .target
                              .value
                          )
                        }
                        aria-describedby={
                          describedBy
                        }
                        placeholder="Dietary requirements, accessibility needs, preferred room location..."
                        className="w-full resize-none rounded-xl border border-forest-900/15 px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                      />
                    )}
                  </FormField>
                </div>
              </section>

              <button
                type="submit"
                className="mt-7 w-full rounded-xl bg-forest-900 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-800"
              >
                Continue to review
              </button>
            </form>
          )}

          {step === 2 && (
            <section
              className="rounded-[2rem] border border-forest-900/10 bg-white p-6 shadow-soft md:p-8"
              aria-labelledby="review-title"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  Final review
                </p>

                <h2
                  id="review-title"
                  className="mt-2 font-serif text-2xl font-semibold text-forest-950"
                >
                  Review your reservation
                </h2>

                <p className="mt-2 text-sm leading-6 text-forest-900/55">
                  Please verify your stay and guest
                  information before confirming your
                  reservation.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {error}
                </div>
              )}

              <dl className="mt-6 grid gap-5 rounded-2xl bg-mist p-5 sm:grid-cols-2">
                <ReservationDetail
                  label="Primary guest"
                  value={`${guest.firstName} ${guest.lastName}`}
                />

                <ReservationDetail
                  label="Room type"
                  value={
                    room.name
                  }
                />

                <ReservationDetail
                  label="Room assignment"
                  value="Assigned by Front Desk"
                />

                <ReservationDetail
                  label="Guests"
                  value={`${search.guests} ${
                    Number(
                      search.guests
                    ) === 1
                      ? "guest"
                      : "guests"
                  }`}
                />

                <ReservationDetail
                  label="Check-in"
                  value={
                    search.checkIn
                  }
                />

                <ReservationDetail
                  label="Check-out"
                  value={
                    search.checkOut
                  }
                />

                <ReservationDetail
                  label="Email"
                  value={
                    guest.email
                  }
                />

                <ReservationDetail
                  label="Mobile"
                  value={
                    guest.phone
                  }
                />
              </dl>

              {/* PROMOTION / DISCOUNT */}
              <section className="mt-8 rounded-2xl border border-forest-900/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mist text-forest-900">
                    <BadgePercent
                      size={19}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-forest-950">
                      Promotion or discount
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-forest-900/55">
                      Only one promotion or discount
                      may be applied to a reservation.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      changeOfferType(
                        "PROMOTION"
                      )
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      offerType ===
                      "PROMOTION"
                        ? "bg-forest-900 text-white"
                        : "border border-forest-900/15 bg-white text-forest-900"
                    }`}
                  >
                    Promotion
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeOfferType(
                        "DISCOUNT"
                      )
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      offerType ===
                      "DISCOUNT"
                        ? "bg-forest-900 text-white"
                        : "border border-forest-900/15 bg-white text-forest-900"
                    }`}
                  >
                    Discount
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Tag
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-900/40"
                    />

                    <input
                      type="text"
                      value={
                        offerCode
                      }
                      onChange={(
                        event
                      ) =>
                        changeOfferCode(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={
                        offerType ===
                        "PROMOTION"
                          ? "Enter promotion code"
                          : "Enter discount code"
                      }
                      className="w-full rounded-xl border border-forest-900/15 py-3 pl-10 pr-4 uppercase outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      validateOffer
                    }
                    disabled={
                      validatingOffer
                    }
                    className="rounded-xl border border-forest-900 bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {validatingOffer
                      ? "Checking..."
                      : "Apply code"}
                  </button>
                </div>

                {appliedOffer && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">
                          {appliedOffer.name}
                        </p>

                        <p className="mt-1 text-xs text-emerald-800/75">
                          Code{" "}
                          <strong>
                            {appliedOffer.code}
                          </strong>{" "}
                          applied successfully.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          clearOffer
                        }
                        className="text-left text-xs font-bold text-emerald-900 underline sm:text-right"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <fieldset className="mt-8">
                <legend className="text-base font-bold text-forest-950">
                  Select payment method
                </legend>

                <p className="mt-1 text-sm text-forest-900/55">
                  Choose your preferred payment method.
                  Payment is not processed until the hotel
                  verifies the transaction.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <PaymentOption
                    selected={
                      paymentMethod ===
                      "Credit / Debit Card"
                    }
                    value="Credit / Debit Card"
                    title="Credit / Debit Card"
                    description="Visa, Mastercard and major cards"
                    icon={
                      CreditCard
                    }
                    onChange={
                      setPaymentMethod
                    }
                  />

                  <PaymentOption
                    selected={
                      paymentMethod ===
                      "GCash / E-Wallet"
                    }
                    value="GCash / E-Wallet"
                    title="GCash / E-Wallet"
                    description="GCash and supported digital wallets"
                    icon={
                      Smartphone
                    }
                    onChange={
                      setPaymentMethod
                    }
                  />
                </div>
              </fieldset>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    goToStep(
                      1
                    )
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-xl border border-forest-900/15 bg-white px-5 py-3 font-semibold transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={
                    confirmBooking
                  }
                  disabled={
                    submitting
                  }
                  className="flex-1 rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Confirming reservation..."
                    : "Confirm reservation"}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SUMMARY */}
        <aside
          className="h-fit overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-soft"
          aria-labelledby="booking-summary"
        >
          <img
            src={
              room.image
            }
            alt={`${room.name} room`}
            className="h-48 w-full object-cover"
          />

          <div className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Your stay
            </p>

            <h2
              id="booking-summary"
              className="mt-2 font-serif text-2xl font-semibold text-forest-950"
            >
              {room.name}
            </h2>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-forest-900/55">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble
                  size={15}
                />

                {room.beds}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Users
                  size={15}
                />

                Up to{" "}
                {room.capacity}
              </span>
            </div>

            <dl className="mt-6 space-y-4 border-t border-forest-900/10 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/60">
                  Room rate ×{" "}
                  {nights}{" "}
                  {nights ===
                  1
                    ? "night"
                    : "nights"}
                </dt>

                <dd className="font-semibold text-forest-950">
                  {nights
                    ? formatCurrency(
                        displayedSubtotal
                      )
                    : "Select dates"}
                </dd>
              </div>

              {appliedOffer &&
                displayedDiscount >
                  0 && (
                  <div className="flex justify-between gap-4 text-emerald-700">
                    <dt>
                      {appliedOffer.type ===
                      "PROMOTION"
                        ? "Promotion"
                        : "Discount"}{" "}
                      ({appliedOffer.code})
                    </dt>

                    <dd className="font-semibold">
                      -
                      {formatCurrency(
                        displayedDiscount
                      )}
                    </dd>
                  </div>
                )}

              <div className="flex justify-between gap-4">
                <dt className="text-forest-900/60">
                  Taxes & fees
                </dt>

                <dd className="font-semibold text-forest-950">
                  {formatCurrency(
                    displayedTaxes
                  )}
                </dd>
              </div>

              <div className="flex justify-between gap-4 border-t border-forest-900/10 pt-4">
                <dt className="font-bold text-forest-950">
                  {appliedOffer
                    ? "Updated total"
                    : "Estimated total"}
                </dt>

                <dd className="font-serif text-xl font-semibold text-forest-950">
                  {nights
                    ? formatCurrency(
                        displayedTotal
                      )
                    : "Select dates"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-forest-900/10 bg-mist px-4 py-3 text-xs leading-5 text-forest-900/55">
              {appliedOffer
                ? "The code has been validated using the hotel pricing engine. The backend will validate it again when the reservation is confirmed."
                : "Final pricing is calculated by the hotel pricing engine when the reservation is confirmed."}
            </div>

            <div className="mt-6 rounded-2xl bg-mist p-4">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={18}
                  className="mt-0.5 shrink-0 text-gold"
                />

                <div>
                  <p className="text-sm font-semibold text-forest-950">
                    Reservation details
                  </p>

                  <p className="mt-1 text-xs leading-5 text-forest-900/55">
                    Review your dates, guest
                    information, selected offer,
                    and payment method before
                    confirming your stay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ReservationDetail({
  label,
  value
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
        {label}
      </dt>

      <dd className="mt-1 break-words font-semibold text-forest-950">
        {value}
      </dd>
    </div>
  );
}

function PaymentOption({
  selected,
  value,
  title,
  description,
  icon: Icon,
  onChange
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
        selected
          ? "border-gold bg-sand/35 shadow-sm"
          : "border-forest-900/10 bg-white hover:border-forest-900/25"
      }`}
    >
      <input
        type="radio"
        name="payment-method"
        value={
          value
        }
        checked={
          selected
        }
        onChange={(
          event
        ) =>
          onChange(
            event
              .target
              .value
          )
        }
        className="accent-forest-900"
      />

      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mist text-forest-900">
        <Icon
          size={20}
          aria-hidden="true"
        />
      </div>

      <div>
        <span className="block font-semibold text-forest-950">
          {title}
        </span>

        <span className="text-xs leading-5 text-forest-900/50">
          {description}
        </span>
      </div>
    </label>
  );
}