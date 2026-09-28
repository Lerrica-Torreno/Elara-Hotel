import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BedDouble,
  LogIn,
  LogOut,
  RefreshCw,
  Sparkles
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

import {
  formatDate
} from "../utils/format";

import {
  api
} from "../services/api";

function normalizeStatus(status) {
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

function normalizeReservation(item) {
  return {
    id: item.reference,

    backendId: item.id,

    guestName:
      `${item.guestFirstName ?? ""} ${item.guestLastName ?? ""}`.trim(),

    email:
      item.guestEmail ?? "",

    phone:
      item.guestPhone ?? "",

    roomType:
      item.roomType?.name ??
      "Unknown room",

    roomTypeId:
      item.roomTypeId,

    guestCount:
      item.guestCount,

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

    status:
      normalizeStatus(
        item.status
      ),

    assignedRoom:
      item.assignedRoom
        ?.roomNumber ??
      null,

    checkedInAt:
      item.checkedInAt,

    checkedOutAt:
      item.checkedOutAt,

    createdAt:
      item.createdAt
  };
}

function normalizeRoom(room) {
  return {
    id:
      room.id,

    roomNumber:
      room.roomNumber,

    roomTypeId:
      room.roomTypeId,

    roomType:
      room.roomType?.name ??
      "Unknown",

    floor:
      room.floor ?? "",

    capacity:
      Number(
        room.roomType?.capacity ??
          0
      ),

    baseRate:
      Number(
        room.roomType?.baseRate ??
          0
      ),

    status:
      room.status
  };
}

function statusTone(status) {
  if (
    status ===
    "Checked In"
  ) {
    return "blue";
  }

  if (
    status ===
    "Pending"
  ) {
    return "amber";
  }

  return "green";
}

function roomStatusTone(status) {
  switch (status) {
    case "AVAILABLE":
      return "green";

    case "RESERVED":
      return "amber";

    case "OCCUPIED":
      return "blue";

    case "CLEANING":
      return "gray";

    case "MAINTENANCE":
    case "OUT_OF_SERVICE":
      return "red";

    default:
      return "gray";
  }
}

function formatRoomStatus(status) {
  if (!status) {
    return "";
  }

  return status
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

export default function CheckInOutPage({
  reservations = [],
  setReservations,
  rooms = [],
  setRooms
}) {
  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    loadError,
    setLoadError
  ] = useState("");

  const [
    actionErrors,
    setActionErrors
  ] = useState({});

  const [
    busyReservationId,
    setBusyReservationId
  ] = useState(null);

  const [
    assignmentFilter,
    setAssignmentFilter
  ] = useState("ALL");

  function clearActionError(
    reservationId
  ) {
    setActionErrors(
      (current) => {
        const next = {
          ...current
        };

        delete next[
          reservationId
        ];

        return next;
      }
    );
  }

  function setReservationError(
    reservationId,
    message
  ) {
    setActionErrors(
      (current) => ({
        ...current,

        [reservationId]:
          message
      })
    );
  }

  async function refreshFrontDesk() {
    try {
      setLoading(true);
      setLoadError("");

      const [
        reservationResponse,
        roomResponse
      ] =
        await Promise.all([
          api.reservations.list(),
          api.rooms.list()
        ]);

      const normalizedReservations =
        (
          reservationResponse
            ?.reservations ??
          []
        ).map(
          normalizeReservation
        );

      const normalizedRooms =
        (
          roomResponse
            ?.rooms ??
          []
        ).map(
          normalizeRoom
        );

      if (
        typeof setReservations ===
        "function"
      ) {
        setReservations(
          normalizedReservations
        );
      }

      if (
        typeof setRooms ===
        "function"
      ) {
        setRooms(
          normalizedRooms
        );
      }
    } catch (
      refreshProblem
    ) {
      setLoadError(
        refreshProblem.message ||
          "Unable to load front-desk data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshFrontDesk();
  }, []);

  const activeReservations =
    useMemo(
      () =>
        reservations.filter(
          (
            reservation
          ) =>
            ![
              "Cancelled",
              "Checked Out"
            ].includes(
              reservation.status
            )
        ),
      [
        reservations
      ]
    );

  const assignedCount =
    useMemo(
      () =>
        activeReservations.filter(
          (
            reservation
          ) =>
            Boolean(
              reservation.assignedRoom
            )
        ).length,
      [
        activeReservations
      ]
    );

  const unassignedCount =
    activeReservations.length -
    assignedCount;

  const filteredReservations =
    useMemo(
      () => {
        if (
          assignmentFilter ===
          "ASSIGNED"
        ) {
          return activeReservations.filter(
            (
              reservation
            ) =>
              Boolean(
                reservation.assignedRoom
              )
          );
        }

        if (
          assignmentFilter ===
          "UNASSIGNED"
        ) {
          return activeReservations.filter(
            (
              reservation
            ) =>
              !reservation.assignedRoom
          );
        }

        return activeReservations;
      },
      [
        activeReservations,
        assignmentFilter
      ]
    );

  async function assignRoom(
    reservation
  ) {
    const id =
      reservation.backendId;

    if (!id) {
      return;
    }

    try {
      setBusyReservationId(
        id
      );

      clearActionError(
        id
      );

      await api.reservations.assignOptimal(
        id
      );

      await refreshFrontDesk();
    } catch (
      assignmentProblem
    ) {
      setReservationError(
        id,
        assignmentProblem.message ||
          "Unable to assign a suitable room."
      );
    } finally {
      setBusyReservationId(
        null
      );
    }
  }

  async function checkIn(
    reservation
  ) {
    const id =
      reservation.backendId;

    if (!id) {
      return;
    }

    if (
      !reservation.assignedRoom
    ) {
      setReservationError(
        id,
        "Assign a room before checking the guest in."
      );

      return;
    }

    try {
      setBusyReservationId(
        id
      );

      clearActionError(
        id
      );

      await api.reservations.checkIn(
        id
      );

      await refreshFrontDesk();
    } catch (
      checkInProblem
    ) {
      setReservationError(
        id,
        checkInProblem.message ||
          "Unable to check in this reservation."
      );
    } finally {
      setBusyReservationId(
        null
      );
    }
  }

  async function checkOut(
    reservation
  ) {
    const id =
      reservation.backendId;

    if (!id) {
      return;
    }

    try {
      setBusyReservationId(
        id
      );

      clearActionError(
        id
      );

      await api.reservations.checkOut(
        id
      );

      await refreshFrontDesk();
    } catch (
      checkOutProblem
    ) {
      setReservationError(
        id,
        checkOutProblem.message ||
          "Unable to check out this reservation."
      );
    } finally {
      setBusyReservationId(
        null
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Front desk"
        title="Arrivals & Departures"
        description="Manage room assignment, arrivals, check-in, and check-out using the live hotel inventory."
        action={
          <button
            type="button"
            onClick={
              refreshFrontDesk
            }
            disabled={
              loading
            }
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-mist disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        }
      />

      {loadError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      )}

      <section className="mb-8 rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-900/40">
              Room assignment
            </p>

            <h2 className="mt-1 text-lg font-semibold text-forest-950">
              Front-desk reservations
            </h2>

            <p className="mt-1 text-sm text-forest-900/50">
              Filter reservations by physical-room assignment.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={
                assignmentFilter ===
                "ALL"
              }
              label="All"
              count={
                activeReservations.length
              }
              onClick={() =>
                setAssignmentFilter(
                  "ALL"
                )
              }
            />

            <FilterButton
              active={
                assignmentFilter ===
                "ASSIGNED"
              }
              label="Assigned"
              count={
                assignedCount
              }
              onClick={() =>
                setAssignmentFilter(
                  "ASSIGNED"
                )
              }
            />

            <FilterButton
              active={
                assignmentFilter ===
                "UNASSIGNED"
              }
              label="Not assigned"
              count={
                unassignedCount
              }
              onClick={() =>
                setAssignmentFilter(
                  "UNASSIGNED"
                )
              }
            />
          </div>
        </div>
      </section>

      {loading ? (
        <Card>
          <div className="px-6 py-14 text-center text-sm font-semibold text-forest-900/50">
            Loading front-desk activity...
          </div>
        </Card>
      ) : !filteredReservations.length ? (
        <Card>
          <EmptyState
            icon={
              BedDouble
            }
            title="No matching reservations"
            description="No active front-desk reservations match the selected filter."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredReservations.map(
            (
              reservation
            ) => {
              const id =
                reservation.backendId;

              const busy =
                busyReservationId ===
                id;

              const ticketError =
                actionErrors[
                  id
                ];

              const assignedRoom =
                reservation.assignedRoom
                  ? rooms.find(
                      (
                        room
                      ) =>
                        String(
                          room.roomNumber
                        ) ===
                        String(
                          reservation.assignedRoom
                        )
                    )
                  : null;

              return (
                <article
                  key={
                    id ??
                    reservation.id
                  }
                  className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft md:p-6"
                >
                  <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-forest-950">
                          {
                            reservation.guestName
                          }
                        </h2>

                        <Badge
                          tone={statusTone(
                            reservation.status
                          )}
                        >
                          {
                            reservation.status
                          }
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm text-forest-900/55">
                        {
                          reservation.id
                        }

                        {" · "}

                        {
                          reservation.roomType
                        }
                      </p>

                      <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <InfoItem
                          label="Check-in"
                          value={formatDate(
                            reservation.checkIn
                          )}
                        />

                        <InfoItem
                          label="Check-out"
                          value={formatDate(
                            reservation.checkOut
                          )}
                        />

                        <InfoItem
                          label="Guests"
                          value={
                            reservation.guestCount ??
                            "—"
                          }
                        />
                      </div>

                      <div
                        className={`mt-6 rounded-2xl border p-4 ${
                          reservation.assignedRoom
                            ? "border-forest-900/10 bg-mist"
                            : "border-dashed border-gold/40 bg-gold/5"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-3">
                            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-900 text-gold">
                              <BedDouble
                                size={19}
                              />
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-forest-900/40">
                                Physical room
                              </p>

                              {reservation.assignedRoom ? (
                                <>
                                  <p className="mt-1 text-lg font-bold text-forest-950">
                                    Room{" "}
                                    {
                                      reservation.assignedRoom
                                    }
                                  </p>

                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {assignedRoom?.roomType && (
                                      <span className="text-xs text-forest-900/50">
                                        {
                                          assignedRoom.roomType
                                        }
                                      </span>
                                    )}

                                    {assignedRoom?.floor !==
                                      "" &&
                                      assignedRoom?.floor !=
                                        null && (
                                        <span className="text-xs text-forest-900/50">
                                          Floor{" "}
                                          {
                                            assignedRoom.floor
                                          }
                                        </span>
                                      )}

                                    {assignedRoom?.status && (
                                      <Badge
                                        tone={roomStatusTone(
                                          assignedRoom.status
                                        )}
                                      >
                                        {formatRoomStatus(
                                          assignedRoom.status
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="mt-1 font-semibold text-forest-950">
                                    Room not yet assigned
                                  </p>

                                  <p className="mt-1 text-xs text-forest-900/50">
                                    Assign an available physical room before check-in.
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          {!reservation.assignedRoom && (
                            <button
                              type="button"
                              onClick={() =>
                                assignRoom(
                                  reservation
                                )
                              }
                              disabled={
                                busy
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-gold/20 disabled:opacity-50"
                            >
                              <Sparkles
                                size={16}
                              />

                              {busy
                                ? "Assigning..."
                                : "Auto-assign room"}
                            </button>
                          )}
                        </div>
                      </div>

                      {ticketError && (
                        <div
                          role="alert"
                          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                        >
                          {
                            ticketError
                          }
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between rounded-2xl border border-forest-900/10 bg-mist/60 p-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-forest-900/40">
                          Front desk action
                        </p>

                        <p className="mt-2 text-sm leading-6 text-forest-900/55">
                          {reservation.status ===
                          "Checked In"
                            ? "The guest is currently checked in. Process departure once the stay is complete."
                            : reservation.assignedRoom
                              ? "The assigned room is ready for check-in."
                              : "Assign a physical room before processing check-in."}
                        </p>
                      </div>

                      <div className="mt-5">
                        {reservation.status !==
                          "Checked In" && (
                          <button
                            type="button"
                            onClick={() =>
                              checkIn(
                                reservation
                              )
                            }
                            disabled={
                              busy ||
                              !reservation.assignedRoom
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <LogIn
                              size={16}
                            />

                            {busy
                              ? "Processing..."
                              : "Check in"}
                          </button>
                        )}

                        {reservation.status ===
                          "Checked In" && (
                          <button
                            type="button"
                            onClick={() =>
                              checkOut(
                                reservation
                              )
                            }
                            disabled={
                              busy
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            <LogOut
                              size={16}
                            />

                            {busy
                              ? "Processing..."
                              : "Check out"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-forest-900 text-white"
          : "border border-forest-900/10 bg-mist text-forest-950 hover:bg-forest-900/5"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active
            ? "bg-white/15"
            : "bg-white text-forest-900/55"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function InfoItem({
  label,
  value
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest-900/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}