import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Ban,
  CalendarX,
  RefreshCw,
  Search
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";

import {
  formatCurrency,
  formatDate
} from "../utils/format";

import {
  api
} from "../services/api";

function normalizeStatus(
  status
) {
  switch (
    status
  ) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Confirmed";

    case "CHECKED_IN":
      return "Checked In";

    case "CHECKED_OUT":
      return "Checked Out";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status ??
        "Unknown";
  }
}

function normalizeReservation(
  item
) {
  const paidAmount =
    (
      item.payments ??
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

  const total =
    Number(
      item.totalAmount ??
        0
    );

  return {
    id:
      item.reference,

    backendId:
      item.id,

    guestName:
      `${item.guestFirstName ?? ""} ${item.guestLastName ?? ""}`.trim(),

    email:
      item.guestEmail ??
      "",

    roomType:
      item.roomType?.name ??
      "Unknown room",

    assignedRoom:
      item.assignedRoom
        ?.roomNumber ??
      null,

    checkIn:
      item.checkInDate
        ? String(
            item.checkInDate
          ).slice(
            0,
            10
          )
        : "",

    checkOut:
      item.checkOutDate
        ? String(
            item.checkOutDate
          ).slice(
            0,
            10
          )
        : "",

    total,

    paidAmount,

    outstanding:
      Math.max(
        total -
          paidAmount,
        0
      ),

    status:
      normalizeStatus(
        item.status
      ),

    cancellationReason:
      item.cancellationReason ??
      item.cancelReason ??
      "",

    cancelledAt:
      item.cancelledAt ??
      item.canceledAt ??
      null,

    createdAt:
      item.createdAt
  };
}

export default function CancellationsPage({
  reservations = [],
  setReservations
}) {
  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const [
    selectedReservation,
    setSelectedReservation
  ] = useState(null);

  const [
    reason,
    setReason
  ] = useState("");

  const [
    cancelling,
    setCancelling
  ] = useState(false);

  const [
    eligibleFilter,
    setEligibleFilter
  ] = useState(
    "ALL"
  );

  const [
    cancellationFilter,
    setCancellationFilter
  ] = useState(
    "ALL"
  );

  const [
    eligibleSearch,
    setEligibleSearch
  ] = useState("");

  const [
    cancellationSearch,
    setCancellationSearch
  ] = useState("");

  async function refreshReservations(
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

      const response =
        await api.reservations.list();

      const normalized =
        (
          response?.reservations ??
          []
        ).map(
          normalizeReservation
        );

      if (
        typeof setReservations ===
        "function"
      ) {
        setReservations(
          normalized
        );
      }
    } catch (
      refreshProblem
    ) {
      setError(
        refreshProblem.message ||
          "Unable to load reservations."
      );
    } finally {
      setLoading(
        false
      );

      setRefreshing(
        false
      );
    }
  }

  useEffect(() => {
    refreshReservations();
  }, []);

  const cancellableReservations =
    useMemo(
      () =>
        reservations.filter(
          (
            reservation
          ) =>
            [
              "Pending",
              "Confirmed"
            ].includes(
              reservation.status
            )
        ),
      [
        reservations
      ]
    );

  const cancellations =
    useMemo(
      () =>
        reservations.filter(
          (
            reservation
          ) =>
            reservation.status ===
            "Cancelled"
        ),
      [
        reservations
      ]
    );

  const filteredEligible =
    useMemo(
      () => {
        const search =
          eligibleSearch
            .trim()
            .toLowerCase();

        return cancellableReservations.filter(
          (
            reservation
          ) => {
            const searchMatch =
              !search ||
              [
                reservation.id,
                reservation.guestName,
                reservation.email,
                reservation.roomType,
                reservation.assignedRoom
              ]
                .filter(
                  Boolean
                )
                .some(
                  (
                    value
                  ) =>
                    String(
                      value
                    )
                      .toLowerCase()
                      .includes(
                        search
                      )
                );

            if (
              !searchMatch
            ) {
              return false;
            }

            switch (
              eligibleFilter
            ) {
              case "ASSIGNED":
                return Boolean(
                  reservation.assignedRoom
                );

              case "UNASSIGNED":
                return !reservation.assignedRoom;

              case "PAID":
                return (
                  reservation.outstanding <=
                  0.009
                );

              case "UNPAID":
                return (
                  reservation.outstanding >
                  0.009
                );

              default:
                return true;
            }
          }
        );
      },
      [
        cancellableReservations,
        eligibleFilter,
        eligibleSearch
      ]
    );

  const filteredCancellations =
    useMemo(
      () => {
        const search =
          cancellationSearch
            .trim()
            .toLowerCase();

        return cancellations.filter(
          (
            reservation
          ) => {
            const searchMatch =
              !search ||
              [
                reservation.id,
                reservation.guestName,
                reservation.email,
                reservation.roomType,
                reservation.cancellationReason
              ]
                .filter(
                  Boolean
                )
                .some(
                  (
                    value
                  ) =>
                    String(
                      value
                    )
                      .toLowerCase()
                      .includes(
                        search
                      )
                );

            if (
              !searchMatch
            ) {
              return false;
            }

            if (
              cancellationFilter ===
              "PAID"
            ) {
              return (
                reservation.paidAmount >
                0
              );
            }

            if (
              cancellationFilter ===
              "UNPAID"
            ) {
              return (
                reservation.paidAmount <=
                0
              );
            }

            return true;
          }
        );
      },
      [
        cancellations,
        cancellationFilter,
        cancellationSearch
      ]
    );

  function openCancelModal(
    reservation
  ) {
    setSelectedReservation(
      reservation
    );

    setReason("");

    setError("");

    setModalOpen(
      true
    );
  }

  function closeModal() {
    if (
      cancelling
    ) {
      return;
    }

    setModalOpen(
      false
    );

    setSelectedReservation(
      null
    );

    setReason("");

    setError("");
  }

  async function cancelReservation(
    event
  ) {
    event.preventDefault();

    if (
      !selectedReservation?.backendId
    ) {
      setError(
        "The reservation does not have a backend identifier."
      );

      return;
    }

    try {
      setCancelling(
        true
      );

      setError("");

      await api.reservations.cancel(
        selectedReservation.backendId,
        {
          reason:
            reason.trim() ||
            undefined
        }
      );

      await refreshReservations();

      setModalOpen(
        false
      );

      setSelectedReservation(
        null
      );

      setReason("");
    } catch (
      cancelProblem
    ) {
      setError(
        cancelProblem.message ||
          "Unable to cancel this reservation."
      );
    } finally {
      setCancelling(
        false
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Cancellations"
        description="Cancel eligible reservations and review recently cancelled bookings."
        action={
          <button
            type="button"
            onClick={() =>
              refreshReservations(
                true
              )
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-mist disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        }
      />

      {error &&
        !modalOpen && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {
              error
            }
          </div>
        )}

      <section className="grid items-start gap-6 xl:grid-cols-2">
        {/* ELIGIBLE */}
        <Card className="!p-0">
          <div className="border-b border-forest-900/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-forest-950">
                  Eligible reservations
                </h2>

                <p className="mt-1 text-sm text-forest-900/50">
                  {
                    cancellableReservations.length
                  }{" "}
                  reservation
                  {cancellableReservations.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  can currently be cancelled.
                </p>
              </div>

              <Badge
                tone={
                  cancellableReservations.length
                    ? "amber"
                    : "gray"
                }
              >
                {
                  cancellableReservations.length
                }{" "}
                eligible
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <SearchInput
                value={
                  eligibleSearch
                }
                onChange={
                  setEligibleSearch
                }
                placeholder="Search eligible reservations..."
              />

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={
                    eligibleFilter ===
                    "ALL"
                  }
                  label="All"
                  onClick={() =>
                    setEligibleFilter(
                      "ALL"
                    )
                  }
                />

                <FilterButton
                  active={
                    eligibleFilter ===
                    "ASSIGNED"
                  }
                  label="Assigned"
                  onClick={() =>
                    setEligibleFilter(
                      "ASSIGNED"
                    )
                  }
                />

                <FilterButton
                  active={
                    eligibleFilter ===
                    "UNASSIGNED"
                  }
                  label="Not assigned"
                  onClick={() =>
                    setEligibleFilter(
                      "UNASSIGNED"
                    )
                  }
                />

                <FilterButton
                  active={
                    eligibleFilter ===
                    "PAID"
                  }
                  label="Fully paid"
                  onClick={() =>
                    setEligibleFilter(
                      "PAID"
                    )
                  }
                />

                <FilterButton
                  active={
                    eligibleFilter ===
                    "UNPAID"
                  }
                  label="Outstanding"
                  onClick={() =>
                    setEligibleFilter(
                      "UNPAID"
                    )
                  }
                />
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingBlock />
          ) : !filteredEligible.length ? (
            <EmptyBlock
              title="No matching reservations"
              description="No eligible reservations match the selected filter."
            />
          ) : (
            <div className="space-y-4 p-5">
              {filteredEligible.map(
                (
                  reservation
                ) => (
                  <article
                    key={
                      reservation.backendId
                    }
                    className="rounded-2xl border border-forest-900/10 bg-mist/40 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-forest-950">
                            {
                              reservation.id
                            }
                          </p>

                          <Badge
                            tone={
                              reservation.status ===
                              "Pending"
                                ? "amber"
                                : "green"
                            }
                          >
                            {
                              reservation.status
                            }
                          </Badge>
                        </div>

                        <p className="mt-2 text-sm font-medium text-forest-950">
                          {
                            reservation.guestName
                          }
                        </p>

                        <p className="mt-1 text-sm text-forest-900/55">
                          {
                            reservation.roomType
                          }

                          {" · "}

                          {formatDate(
                            reservation.checkIn
                          )}

                          {" → "}

                          {formatDate(
                            reservation.checkOut
                          )}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-forest-950">
                          {formatCurrency(
                            reservation.total
                          )}
                        </p>

                        <p className="mt-1 text-xs text-forest-900/45">
                          {reservation.assignedRoom
                            ? `Room ${reservation.assignedRoom}`
                            : "Room not assigned"}

                          {" · "}

                          {reservation.outstanding <=
                          0.009
                            ? "Fully paid"
                            : `${formatCurrency(
                                reservation.outstanding
                              )} outstanding`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openCancelModal(
                            reservation
                          )
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Ban
                          size={16}
                        />

                        Cancel
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </Card>

        {/* RECENT CANCELLATIONS */}
        <Card className="!p-0">
          <div className="border-b border-forest-900/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-forest-950">
                  Recent cancellations
                </h2>

                <p className="mt-1 text-sm text-forest-900/50">
                  Review bookings already cancelled in the hotel database.
                </p>
              </div>

              <Badge
                tone="gray"
              >
                {
                  cancellations.length
                }{" "}
                record
                {cancellations.length ===
                1
                  ? ""
                  : "s"}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <SearchInput
                value={
                  cancellationSearch
                }
                onChange={
                  setCancellationSearch
                }
                placeholder="Search cancellations..."
              />

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={
                    cancellationFilter ===
                    "ALL"
                  }
                  label="All"
                  onClick={() =>
                    setCancellationFilter(
                      "ALL"
                    )
                  }
                />

                <FilterButton
                  active={
                    cancellationFilter ===
                    "PAID"
                  }
                  label="With payment"
                  onClick={() =>
                    setCancellationFilter(
                      "PAID"
                    )
                  }
                />

                <FilterButton
                  active={
                    cancellationFilter ===
                    "UNPAID"
                  }
                  label="Without payment"
                  onClick={() =>
                    setCancellationFilter(
                      "UNPAID"
                    )
                  }
                />
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingBlock />
          ) : !filteredCancellations.length ? (
            <EmptyBlock
              title="No matching cancellations"
              description="Cancelled reservations matching this filter will appear here."
            />
          ) : (
            <div className="space-y-4 p-5">
              {filteredCancellations.map(
                (
                  reservation
                ) => (
                  <article
                    key={
                      reservation.backendId
                    }
                    className="rounded-2xl border border-forest-900/10 bg-mist/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-forest-950">
                        {
                          reservation.id
                        }
                      </p>

                      <Badge
                        tone="gray"
                      >
                        Cancelled
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm font-medium text-forest-950">
                      {
                        reservation.guestName
                      }
                    </p>

                    <p className="mt-1 text-sm text-forest-900/55">
                      {
                        reservation.roomType
                      }

                      {" · "}

                      {formatDate(
                        reservation.checkIn
                      )}

                      {" → "}

                      {formatDate(
                        reservation.checkOut
                      )}
                    </p>

                    {reservation.cancellationReason && (
                      <p className="mt-3 text-xs leading-5 text-forest-900/50">
                        Reason:{" "}
                        {
                          reservation.cancellationReason
                        }
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-forest-900/10 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest-900/35">
                          Reservation amount
                        </p>

                        <p className="mt-1 font-semibold text-forest-950">
                          {formatCurrency(
                            reservation.total
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-forest-900/45">
                          {reservation.paidAmount >
                          0
                            ? `${formatCurrency(
                                reservation.paidAmount
                              )} paid`
                            : "No payment recorded"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-emerald-700">
                          Inventory released
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </Card>
      </section>

      <Modal
        open={
          modalOpen
        }
        title="Cancel reservation"
        onClose={
          closeModal
        }
      >
        <form
          onSubmit={
            cancelReservation
          }
          className="space-y-5"
        >
          {selectedReservation && (
            <div className="rounded-2xl bg-mist p-4">
              <p className="font-semibold text-forest-950">
                {
                  selectedReservation.guestName
                }
              </p>

              <p className="mt-1 text-sm text-forest-900/55">
                {
                  selectedReservation.id
                }

                {" · "}

                {
                  selectedReservation.roomType
                }
              </p>

              <p className="mt-1 text-sm text-forest-900/55">
                {formatDate(
                  selectedReservation.checkIn
                )}

                {" → "}

                {formatDate(
                  selectedReservation.checkOut
                )}
              </p>

              <p className="mt-2 font-semibold text-forest-950">
                {formatCurrency(
                  selectedReservation.total
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {
                error
              }
            </div>
          )}

          <FormField
            id="cancellation-reason"
            label="Reason"
          >
            {() => (
              <textarea
                id="cancellation-reason"
                rows="4"
                value={
                  reason
                }
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="Optional cancellation reason..."
                className="w-full resize-none rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              />
            )}
          </FormField>

          <p className="text-xs leading-5 text-forest-900/50">
            Cancellation eligibility and inventory release are handled by the backend. Existing payment transactions remain available in Payments.
          </p>

          <div className="flex justify-end gap-3 border-t border-forest-900/10 pt-5">
            <button
              type="button"
              onClick={
                closeModal
              }
              disabled={
                cancelling
              }
              className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold"
            >
              Keep reservation
            </button>

            <button
              type="submit"
              disabled={
                cancelling
              }
              className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              {cancelling
                ? "Cancelling..."
                : "Confirm cancellation"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-900/35"
      />

      <input
        type="search"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-forest-900/15 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
      />
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-forest-900 text-white"
          : "border border-forest-900/10 bg-mist text-forest-950 hover:bg-forest-900/5"
      }`}
    >
      {
        label
      }
    </button>
  );
}

function LoadingBlock() {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-sm font-semibold text-forest-900/50">
        Loading reservations...
      </p>
    </div>
  );
}

function EmptyBlock({
  title,
  description
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <CalendarX
        size={26}
        className="text-forest-900/30"
      />

      <h3 className="mt-4 font-semibold text-forest-950">
        {
          title
        }
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-forest-900/50">
        {
          description
        }
      </p>
    </div>
  );
}