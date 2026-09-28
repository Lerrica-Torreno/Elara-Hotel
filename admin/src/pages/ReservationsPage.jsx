import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CalendarDays,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";
import EmptyState from "../components/ui/EmptyState";
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

const initialForm = {
  guestName: "",
  email: "",
  phone: "",
  roomTypeId: "",
  guestCount: 1,
  checkIn: "",
  checkOut: ""
};

function normalizeStatus(
  status
) {
  switch (status) {
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
      return status ?? "Unknown";
  }
}

function normalizeReservation(
  item
) {
  return {
    id:
      item.reference,

    backendId:
      item.id,

    guestName:
      `${item.guestFirstName ?? ""} ${item.guestLastName ?? ""}`.trim(),

    firstName:
      item.guestFirstName ?? "",

    lastName:
      item.guestLastName ?? "",

    email:
      item.guestEmail ?? "",

    phone:
      item.guestPhone ?? "",

    guestCount:
      Number(
        item.guestCount ?? 1
      ),

    roomType:
      item.roomType?.name ??
      "Unknown room",

    roomTypeId:
      item.roomTypeId,

    assignedRoom:
      item.assignedRoom?.roomNumber ??
      null,

    checkIn:
      item.checkInDate
        ? String(
            item.checkInDate
          ).slice(0, 10)
        : "",

    checkOut:
      item.checkOutDate
        ? String(
            item.checkOutDate
          ).slice(0, 10)
        : "",

    nightlyRate:
      Number(
        item.nightlyRate ??
          0
      ),

    subtotal:
      Number(
        item.subtotal ??
          0
      ),

    discount:
      Number(
        item.discountAmount ??
          0
      ),

    taxes:
      Number(
        item.taxAmount ??
          0
      ),

    total:
      Number(
        item.totalAmount ??
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

    checkedInAt:
      item.checkedInAt,

    checkedOutAt:
      item.checkedOutAt,

    createdAt:
      item.createdAt,

    updatedAt:
      item.updatedAt
  };
}

function splitGuestName(
  name
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return {
      firstName: "",
      lastName: ""
    };
  }

  if (
    parts.length === 1
  ) {
    return {
      firstName:
        parts[0],

      lastName:
        "Guest"
    };
  }

  return {
    firstName:
      parts[0],

    lastName:
      parts
        .slice(1)
        .join(" ")
  };
}

function statusTone(
  status
) {
  switch (
    status
  ) {
    case "Cancelled":
      return "red";

    case "Checked In":
      return "blue";

    case "Checked Out":
      return "gray";

    case "Pending":
      return "amber";

    case "Confirmed":
      return "green";

    default:
      return "gray";
  }
}

export default function ReservationsPage({
  reservations = [],
  setReservations,
  guests = [],
  setGuests
}) {
  const [
    query,
    setQuery
  ] = useState("");

  const [
    status,
    setStatus
  ] = useState("All");

  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const [
    form,
    setForm
  ] = useState(
    initialForm
  );

  const [
    error,
    setError
  ] = useState("");

  const [
    loadError,
    setLoadError
  ] = useState("");

  const [
    loadingReservations,
    setLoadingReservations
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    roomTypes,
    setRoomTypes
  ] = useState([]);

  const [
    lastUpdated,
    setLastUpdated
  ] = useState(null);

  const loadReservations =
    useCallback(
      async (
        showRefreshing = false
      ) => {
        try {
          if (
            showRefreshing
          ) {
            setRefreshing(
              true
            );
          }

          setLoadError("");

          const response =
            await api.reservations.list();

          const normalized =
            (
              response?.reservations ??
              []
            ).map(
              normalizeReservation
            );

          setReservations(
            normalized
          );

          setLastUpdated(
            new Date()
          );
        } catch (
          loadProblem
        ) {
          setLoadError(
            loadProblem.message ||
              "Unable to load reservations."
          );
        } finally {
          setLoadingReservations(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        setReservations
      ]
    );

  const loadRoomTypes =
    useCallback(
      async () => {
        try {
          const response =
            await api.roomTypes.list();

          setRoomTypes(
            response?.roomTypes ??
              []
          );
        } catch (
          roomProblem
        ) {
          console.error(
            "Unable to load room types:",
            roomProblem
          );
        }
      },
      []
    );

  useEffect(() => {
    loadReservations();
    loadRoomTypes();

    const interval =
      window.setInterval(
        () => {
          loadReservations();
        },
        4000
      );

    function handleFocus() {
      loadReservations();
    }

    function handleVisibility() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadReservations();
      }
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    loadReservations,
    loadRoomTypes
  ]);

  const visible =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLowerCase();

      return reservations.filter(
        (
          reservation
        ) => {
          const statusMatch =
            status === "All" ||
            reservation.status ===
              status;

          const searchMatch =
            !search ||
            [
              reservation.id,
              reservation.guestName,
              reservation.email,
              reservation.roomType,
              reservation.assignedRoom
            ]
              .filter(Boolean)
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

          return (
            statusMatch &&
            searchMatch
          );
        }
      );
    }, [
      reservations,
      query,
      status
    ]);

  function openModal() {
    setError("");
    setForm(
      initialForm
    );
    setModalOpen(true);
  }

  function closeModal() {
    if (
      submitting
    ) {
      return;
    }

    setModalOpen(false);

    setForm(
      initialForm
    );

    setError("");
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    if (
      !form.guestName.trim() ||
      !form.email.trim() ||
      !form.roomTypeId ||
      !form.checkIn ||
      !form.checkOut
    ) {
      setError(
        "Complete the required reservation information."
      );

      return;
    }

    if (
      form.checkOut <=
      form.checkIn
    ) {
      setError(
        "Check-out must be after check-in."
      );

      return;
    }

    const selectedRoomType =
      roomTypes.find(
        (
          item
        ) =>
          item.id ===
          form.roomTypeId
      );

    if (
      selectedRoomType &&
      Number(
        form.guestCount
      ) >
        Number(
          selectedRoomType.capacity
        )
    ) {
      setError(
        `This room type allows a maximum of ${selectedRoomType.capacity} guests.`
      );

      return;
    }

    const {
      firstName,
      lastName
    } =
      splitGuestName(
        form.guestName
      );

    try {
      setSubmitting(
        true
      );

      setError("");

      const response =
        await api.reservations.create({
          roomTypeId:
            form.roomTypeId,

          guestFirstName:
            firstName,

          guestLastName:
            lastName,

          guestEmail:
            form.email
              .trim()
              .toLowerCase(),

          guestPhone:
            form.phone.trim(),

          guestCount:
            Number(
              form.guestCount
            ),

          checkInDate:
            form.checkIn,

          checkOutDate:
            form.checkOut
        });

      const created =
        response?.reservation
          ? normalizeReservation(
              response.reservation
            )
          : null;

      if (
        created &&
        Array.isArray(
          guests
        ) &&
        typeof setGuests ===
          "function"
      ) {
        const existingGuest =
          guests.find(
            (
              guest
            ) =>
              guest.email
                ?.toLowerCase() ===
              created.email
                ?.toLowerCase()
          );

        if (
          !existingGuest
        ) {
          setGuests(
            (
              current
            ) => [
              {
                id:
                  crypto
                    .randomUUID?.() ??
                  String(
                    Date.now()
                  ),

                name:
                  created.guestName,

                email:
                  created.email,

                phone:
                  created.phone,

                notes:
                  "",

                createdAt:
                  new Date()
                    .toISOString()
              },

              ...current
            ]
          );
        }
      }

      await loadReservations();

      setModalOpen(
        false
      );

      setForm(
        initialForm
      );

      setError("");
    } catch (
      submitProblem
    ) {
      setError(
        submitProblem.message ||
          "Unable to create reservation."
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
        eyebrow="Reservations"
        title="Reservation Management"
        description="Create and manage bookings throughout the complete reservation lifecycle."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                loadReservations(
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

            <button
              type="button"
              onClick={
                openModal
              }
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              <Plus
                size={17}
              />

              New reservation
            </button>
          </div>
        }
      />

      {loadError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      )}

      <Card className="overflow-hidden !p-0">
        <div className="flex flex-col gap-3 border-b border-forest-900/10 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
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
                  event
                    .target
                    .value
                )
              }
              placeholder="Search reservation or guest..."
              className="w-full rounded-xl border border-forest-900/15 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-forest-900/40">
                Updated{" "}
                {lastUpdated.toLocaleTimeString(
                  [],
                  {
                    hour:
                      "2-digit",
                    minute:
                      "2-digit",
                    second:
                      "2-digit"
                  }
                )}
              </span>
            )}

            <select
              value={
                status
              }
              onChange={(
                event
              ) =>
                setStatus(
                  event
                    .target
                    .value
                )
              }
              className="rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold"
            >
              {[
                "All",
                "Pending",
                "Confirmed",
                "Checked In",
                "Checked Out",
                "Cancelled"
              ].map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <DataTable
          caption="Reservations"
          columns={[
            "Reservation",
            "Guest",
            "Stay",
            "Room",
            "Total",
            "Status"
          ]}
          rows={
            visible
          }
          emptyState={
            <EmptyState
              icon={
                CalendarDays
              }
              title={
                loadingReservations
                  ? "Loading reservations..."
                  : reservations.length
                    ? "No matching reservations"
                    : "No reservations yet"
              }
              description={
                loadingReservations
                  ? "Retrieving reservation records from the hotel database."
                  : reservations.length
                    ? "Adjust your search or status filter."
                    : "Customer and front-desk reservations will appear here."
              }
              actionLabel={
                loadingReservations ||
                reservations.length
                  ? undefined
                  : "Create reservation"
              }
              onAction={
                loadingReservations ||
                reservations.length
                  ? undefined
                  : openModal
              }
            />
          }
          renderRow={(
            reservation
          ) => (
            <tr
              key={
                reservation.backendId ??
                reservation.id
              }
              className="hover:bg-mist/50"
            >
              <th className="whitespace-nowrap px-5 py-4 font-semibold text-forest-950">
                {
                  reservation.id
                }
              </th>

              <td className="px-5 py-4">
                <p className="font-medium text-forest-950">
                  {
                    reservation.guestName
                  }
                </p>

                <p className="mt-1 text-xs text-forest-900/40">
                  {
                    reservation.email
                  }
                </p>
              </td>

              <td className="whitespace-nowrap px-5 py-4 text-forest-900/65">
                {formatDate(
                  reservation.checkIn
                )}

                {" – "}

                {formatDate(
                  reservation.checkOut
                )}
              </td>

              <td className="px-5 py-4">
                <p className="font-medium text-forest-950">
                  {
                    reservation.roomType
                  }
                </p>

                <p className="mt-1 text-xs text-forest-900/40">
                  {reservation.assignedRoom
                    ? `Room ${reservation.assignedRoom}`
                    : "Not assigned"}
                </p>
              </td>

              <td className="px-5 py-4">
                {formatCurrency(
                  reservation.total
                )}
              </td>

              <td className="px-5 py-4">
                <Badge
                  tone={
                    statusTone(
                      reservation.status
                    )
                  }
                >
                  {
                    reservation.status
                  }
                </Badge>
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal
        open={
          modalOpen
        }
        title="Create reservation"
        onClose={
          closeModal
        }
      >
        <form
          onSubmit={
            submit
          }
          className="space-y-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <section>
            <h3 className="font-semibold text-forest-950">
              Guest
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                id="reservation-name"
                label="Guest name"
                value={
                  form.guestName
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      guestName:
                        value
                    })
                  )
                }
              />

              <Input
                id="reservation-email"
                label="Email"
                type="email"
                value={
                  form.email
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      email:
                        value
                    })
                  )
                }
              />

              <Input
                id="reservation-phone"
                label="Phone"
                value={
                  form.phone
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      phone:
                        value
                    })
                  )
                }
              />

              <Input
                id="guest-count"
                label="Guests"
                type="number"
                min="1"
                value={
                  form.guestCount
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      guestCount:
                        value
                    })
                  )
                }
              />
            </div>
          </section>

          <section className="border-t border-forest-900/10 pt-5">
            <h3 className="font-semibold text-forest-950">
              Stay
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField
                id="reservation-room-type"
                label="Room type"
              >
                {() => (
                  <select
                    id="reservation-room-type"
                    value={
                      form.roomTypeId
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          roomTypeId:
                            event
                              .target
                              .value
                        })
                      )
                    }
                    className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
                  >
                    <option value="">
                      Select room type
                    </option>

                    {roomTypes.map(
                      (
                        roomType
                      ) => (
                        <option
                          key={
                            roomType.id
                          }
                          value={
                            roomType.id
                          }
                        >
                          {
                            roomType.name
                          }

                          {" — "}

                          {formatCurrency(
                            Number(
                              roomType.baseRate
                            )
                          )}
                        </option>
                      )
                    )}
                  </select>
                )}
              </FormField>

              <Input
                id="reservation-check-in"
                label="Check-in"
                type="date"
                value={
                  form.checkIn
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      checkIn:
                        value
                    })
                  )
                }
              />

              <Input
                id="reservation-check-out"
                label="Check-out"
                type="date"
                value={
                  form.checkOut
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      checkOut:
                        value
                    })
                  )
                }
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-forest-900/50">
              Final pricing is calculated by the backend.
            </p>
          </section>

          <div className="flex justify-end gap-3 border-t border-forest-900/10 pt-5">
            <button
              type="button"
              onClick={
                closeModal
              }
              disabled={
                submitting
              }
              className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Creating..."
                : "Create reservation"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  ...props
}) {
  return (
    <FormField
      id={
        id
      }
      label={
        label
      }
    >
      {() => (
        <input
          id={
            id
          }
          value={
            value
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
          className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
          {...props}
        />
      )}
    </FormField>
  );
}