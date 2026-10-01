import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CircleDollarSign,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";

import {
  formatCurrency
} from "../utils/format";

import {
  api
} from "../services/api";

const emptyForm = {
  reservationId: "",
  amount: "",
  method: "CASH",
  status: "PAID",
  provider: "",
  providerRef: ""
};

function getStatusTone(
  status
) {
  switch (status) {
    case "PAID":
      return "green";

    case "PENDING":
      return "amber";

    case "REFUNDED":
      return "gray";

    case "FAILED":
      return "red";

    default:
      return "gray";
  }
}

function formatStatus(
  status
) {
  switch (status) {
    case "PAID":
      return "Paid";

    case "PENDING":
      return "Pending";

    case "REFUNDED":
      return "Refunded";

    case "FAILED":
      return "Failed";

    default:
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
}

function formatMethod(
  method
) {
  switch (method) {
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
      return method;
  }
}

function guestName(
  reservation
) {
  if (!reservation) {
    return "";
  }

  return `${reservation.guestFirstName ?? ""} ${
    reservation.guestLastName ?? ""
  }`.trim();
}

function paidAmountForReservation(
  reservation
) {
  return (
    reservation?.payments ??
    []
  )
    .filter(
      (
        payment
      ) =>
        payment.status ===
        "PAID" ||
        payment.status ===
        "PARTIALLY_PAID"
    )
    .reduce(
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
}

function outstandingBalance(
  reservation
) {
  const total =
    Number(
      reservation?.totalAmount ??
        0
    );

  const paid =
    paidAmountForReservation(
      reservation
    );

  return Math.max(
    total - paid,
    0
  );
}

export default function PaymentsPage() {
  const [
    payments,
    setPayments
  ] = useState([]);

  const [
    reservations,
    setReservations
  ] = useState([]);

  const [
    query,
    setQuery
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    form,
    setForm
  ] = useState(
    emptyForm
  );

  async function loadData(
    showRefreshing = false
  ) {
    try {
      if (
        showRefreshing
      ) {
        setRefreshing(
          true
        );
      }

      setError("");

      const [
        paymentResponse,
        reservationResponse
      ] =
        await Promise.all([
          api.payments.list(),
          api.reservations.list()
        ]);

      setPayments(
        paymentResponse?.payments ??
          []
      );

      setReservations(
        reservationResponse?.reservations ??
          []
      );
    } catch (
      loadError
    ) {
      setError(
        loadError.message ||
          "Unable to load payments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visiblePayments =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          if (
            statusFilter &&
            payment.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            !normalizedQuery
          ) {
            return true;
          }

          const reservation =
            payment.reservation;

          return [
            payment.reference,
            reservation?.reference,
            reservation?.guestFirstName,
            reservation?.guestLastName,
            reservation?.guestEmail,
            payment.providerRef
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(
                  value
                )
                  .toLowerCase()
                  .includes(
                    normalizedQuery
                  )
            );
        }
      );
    }, [
      payments,
      query,
      statusFilter
    ]);

  const totalPaid =
    useMemo(
      () =>
        payments
          .filter(
            (payment) =>
              payment.status ===
                "PAID" &&
              payment.reservation?.status !==
                "CANCELLED"
          )
          .reduce(
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
          ),
      [
        payments
      ]
    );

  const pendingAmount =
    useMemo(
      () =>
        payments
          .filter(
            (payment) =>
              payment.status ===
              "PENDING"
          )
          .reduce(
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
          ),
      [
        payments
      ]
    );

  const payableReservations =
    useMemo(
      () =>
        reservations.filter(
          (
            reservation
          ) => {
            if (
              reservation.status ===
                "CANCELLED" ||
              reservation.status ===
                "NO_SHOW"
            ) {
              return false;
            }

            return (
              outstandingBalance(
                reservation
              ) >
              0.009
            );
          }
        ),
      [
        reservations
      ]
    );

  function openModal() {
    setError("");

    setForm(
      emptyForm
    );

    setModalOpen(
      true
    );
  }

  function closeModal() {
    if (
      submitting
    ) {
      return;
    }

    setModalOpen(
      false
    );

    setForm(
      emptyForm
    );

    setError("");
  }

  function updateForm(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value
      })
    );
  }

  function selectReservation(
    reservationId
  ) {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          reservationId
      );

    const outstanding =
      reservation
        ? outstandingBalance(
            reservation
          )
        : 0;

    setForm(
      (current) => ({
        ...current,

        reservationId,

        amount:
          reservation
            ? String(
                outstanding
              )
            : ""
      })
    );
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    if (
      !form.reservationId
    ) {
      setError(
        "Select a reservation."
      );

      return;
    }

    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          form.reservationId
      );

    if (
      !reservation
    ) {
      setError(
        "The selected reservation could not be found."
      );

      return;
    }

    const outstanding =
      outstandingBalance(
        reservation
      );

    if (
      outstanding <=
      0.009
    ) {
      setError(
        "This reservation has already been fully paid."
      );

      return;
    }

    const amount =
      Number(
        form.amount
      );

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      setError(
        "Enter a valid payment amount."
      );

      return;
    }

    if (
      amount >
      outstanding +
        0.009
    ) {
      setError(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          outstanding
        )}.`
      );

      return;
    }

    try {
      setSubmitting(
        true
      );

      setError("");

      await api.payments.create({
        reservationId:
          form.reservationId,

        amount,

        method:
          form.method,

        status:
          form.status,

        provider:
          form.provider.trim() ||
          null,

        providerRef:
          form.providerRef.trim() ||
          null
      });

      await loadData();

      setForm(
        emptyForm
      );

      setModalOpen(
        false
      );
    } catch (
      submitError
    ) {
      setError(
        submitError.message ||
          "Unable to record payment."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title="Payments"
        description="Record verified guest payments and review reservation transaction history."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                loadData(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 hover:bg-mist disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                openModal
              }
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800"
            >
              <Plus
                size={17}
              />

              Record payment
            </button>
          </div>
        }
      />

      {error &&
        !modalOpen && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-900/45">
            Recorded transactions
          </p>

          <p className="mt-3 text-3xl font-bold text-forest-950">
            {
              payments.length
            }
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-900/45">
            Paid
          </p>

          <p className="mt-3 text-3xl font-bold text-forest-950">
            {formatCurrency(
              totalPaid
            )}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-900/45">
            Pending
          </p>

          <p className="mt-3 text-3xl font-bold text-forest-950">
            {formatCurrency(
              pendingAmount
            )}
          </p>
        </Card>
      </div>

      <Card className="!p-0">
        <div className="flex flex-col gap-3 border-b border-forest-900/10 p-5 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-900/35"
            />

            <input
              type="search"
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search payment, reservation or guest..."
              className="w-full rounded-xl border border-forest-900/15 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-forest-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="">
              All statuses
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="REFUNDED">
              Refunded
            </option>

            <option value="FAILED">
              Failed
            </option>
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-forest-900/45">
            Loading payments...
          </div>
        ) : !visiblePayments.length ? (
          <EmptyState
            icon={
              CircleDollarSign
            }
            title={
              payments.length
                ? "No matching payments"
                : "No transactions recorded"
            }
            description={
              payments.length
                ? "Try changing your search or payment-status filter."
                : "Payment records will appear here after hotel staff records a transaction."
            }
            actionLabel={
              payments.length
                ? undefined
                : "Record payment"
            }
            onAction={
              payments.length
                ? undefined
                : openModal
            }
          />
        ) : (
          <div className="divide-y divide-forest-900/10">
            {visiblePayments.map(
              (
                payment
              ) => {
                const reservation =
                  payment.reservation;

                return (
                  <article
                    key={
                      payment.id
                    }
                    className="flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-forest-950">
                          {
                            payment.reference
                          }
                        </p>

                        <Badge
                          tone={getStatusTone(
                            payment.status
                          )}
                        >
                          {formatStatus(
                            payment.status
                          )}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm font-medium text-forest-900/70">
                        Reservation{" "}
                        {reservation?.reference ??
                          "—"}
                      </p>

                      <p className="mt-1 text-sm text-forest-900/50">
                        {guestName(
                          reservation
                        ) ||
                          "Unknown guest"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-900/45">
                        <span>
                          {formatMethod(
                            payment.method
                          )}
                        </span>

                        {payment.provider && (
                          <span>
                            {
                              payment.provider
                            }
                          </span>
                        )}

                        {payment.providerRef && (
                          <span>
                            Ref:{" "}
                            {
                              payment.providerRef
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-xl font-bold text-forest-950">
                        {formatCurrency(
                          Number(
                            payment.amount ??
                              0
                          )
                        )}
                      </p>

                      {payment.paidAt && (
                        <p className="mt-1 text-xs text-forest-900/40">
                          Paid{" "}
                          {new Date(
                            payment.paidAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </Card>

      <Modal
        open={
          modalOpen
        }
        title="Record payment"
        onClose={
          closeModal
        }
      >
        <form
          onSubmit={
            submit
          }
          className="space-y-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <FormField
            id="payment-reservation"
            label="Reservation"
          >
            {() => (
              <select
                required
                id="payment-reservation"
                value={
                  form.reservationId
                }
                onChange={(
                  event
                ) =>
                  selectReservation(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              >
                <option value="">
                  Select reservation
                </option>

                {payableReservations.map(
                  (
                    reservation
                  ) => {
                    const outstanding =
                      outstandingBalance(
                        reservation
                      );

                    return (
                      <option
                        key={
                          reservation.id
                        }
                        value={
                          reservation.id
                        }
                      >
                        {
                          reservation.reference
                        }{" "}
                        —{" "}
                        {guestName(
                          reservation
                        )}{" "}
                        — Outstanding{" "}
                        {formatCurrency(
                          outstanding
                        )}
                      </option>
                    );
                  }
                )}
              </select>
            )}
          </FormField>

          {!payableReservations.length && (
            <div className="rounded-xl bg-mist px-4 py-3 text-sm text-forest-900/60">
              There are no reservations with an outstanding balance.
            </div>
          )}

          <FormField
            id="payment-amount"
            label="Amount"
          >
            {() => (
              <input
                required
                id="payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "amount",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              />
            )}
          </FormField>

          <FormField
            id="payment-method"
            label="Payment method"
          >
            {() => (
              <select
                id="payment-method"
                value={
                  form.method
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "method",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold"
              >
                <option value="CARD">
                  Credit / Debit Card
                </option>

                <option value="GCASH">
                  GCash
                </option>

                <option value="EWALLET">
                  E-Wallet
                </option>

                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>

                <option value="CASH">
                  Cash
                </option>
              </select>
            )}
          </FormField>

          <FormField
            id="payment-status"
            label="Transaction status"
          >
            {() => (
              <select
                id="payment-status"
                value={
                  form.status
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "status",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold"
              >
                <option value="PAID">
                  Paid / verified
                </option>

                <option value="PENDING">
                  Pending verification
                </option>
              </select>
            )}
          </FormField>

          <FormField
            id="payment-provider"
            label="Provider / bank (optional)"
          >
            {() => (
              <input
                id="payment-provider"
                type="text"
                value={
                  form.provider
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "provider",
                    event.target.value
                  )
                }
                placeholder="e.g. GCash, BDO, Visa"
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              />
            )}
          </FormField>

          <FormField
            id="payment-provider-reference"
            label="External reference (optional)"
          >
            {() => (
              <input
                id="payment-provider-reference"
                type="text"
                value={
                  form.providerRef
                }
                onChange={(
                  event
                ) =>
                  updateForm(
                    "providerRef",
                    event.target.value
                  )
                }
                placeholder="Bank or payment reference number"
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              />
            )}
          </FormField>

          <div className="flex justify-end gap-3 border-t border-forest-900/10 pt-5">
            <button
              type="button"
              onClick={
                closeModal
              }
              disabled={
                submitting
              }
              className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold text-forest-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !payableReservations.length
              }
              className="rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : "Save payment"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}