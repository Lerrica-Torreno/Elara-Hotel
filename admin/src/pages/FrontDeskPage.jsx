import {
  useMemo,
  useState
} from "react";

import {
  LogIn,
  LogOut,
  Sparkles
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";

import {
  findOptimalRoom
} from "../utils/roomAssignment";

import {
  formatDate
} from "../utils/format";

export default function FrontDeskPage({
  reservations,
  setReservations,
  rooms,
  setRooms
}) {
  const [
    message,
    setMessage
  ] = useState("");

  const active =
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

  function assignRoom(
    reservation
  ) {
    const room =
      findOptimalRoom({
        rooms,
        reservation
      });

    if (!room) {
      setMessage(
        "No suitable available room could be found."
      );

      return;
    }

    setReservations(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            reservation.id
              ? {
                  ...item,
                  assignedRoom:
                    room.roomNumber
                }
              : item
        )
    );

    setRooms(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            room.id
              ? {
                  ...item,
                  status:
                    "Reserved"
                }
              : item
        )
    );

    setMessage(
      `Room ${room.roomNumber} assigned successfully.`
    );
  }

  function checkIn(
    reservation
  ) {
    if (
      !reservation.assignedRoom
    ) {
      setMessage(
        "Assign a room before checking the guest in."
      );

      return;
    }

    setReservations(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            reservation.id
              ? {
                  ...item,
                  status:
                    "Checked In",

                  checkedInAt:
                    new Date().toISOString()
                }
              : item
        )
    );

    setRooms(
      (
        current
      ) =>
        current.map(
          (
            room
          ) =>
            String(
              room.roomNumber
            ) ===
            String(
              reservation.assignedRoom
            )
              ? {
                  ...room,
                  status:
                    "Occupied"
                }
              : room
        )
    );

    setMessage(
      `${reservation.guestName} checked in successfully.`
    );
  }

  function checkOut(
    reservation
  ) {
    setReservations(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            reservation.id
              ? {
                  ...item,
                  status:
                    "Checked Out",

                  checkedOutAt:
                    new Date().toISOString()
                }
              : item
        )
    );

    setRooms(
      (
        current
      ) =>
        current.map(
          (
            room
          ) =>
            String(
              room.roomNumber
            ) ===
            String(
              reservation.assignedRoom
            )
              ? {
                  ...room,
                  status:
                    "Cleaning"
                }
              : room
        )
    );

    setMessage(
      `${reservation.guestName} checked out. The room is now marked for cleaning.`
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Front desk"
        title="Arrivals & Departures"
        description="Assign the most suitable available room, check arriving guests in, and process departures."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-forest-900/10 bg-white px-4 py-3 text-sm font-semibold text-forest-900 shadow-soft">
          {message}
        </div>
      )}

      <Card className="!p-0">
        {!active.length ? (
          <EmptyState
            icon={LogIn}
            title="No active front-desk reservations"
            description="Confirmed and checked-in reservations will appear here for room assignment, arrival, and departure processing."
          />
        ) : (
          <div className="divide-y divide-forest-900/10">
            {active.map(
              (
                reservation
              ) => (
                <article
                  key={
                    reservation.id
                  }
                  className="p-5 md:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-forest-950">
                          {
                            reservation.guestName
                          }
                        </h2>

                        <Badge
                          tone={
                            reservation.status ===
                            "Checked In"
                              ? "blue"
                              : "green"
                          }
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

                      <p className="mt-1 text-sm text-forest-900/55">
                        {formatDate(
                          reservation.checkIn
                        )}

                        {" → "}

                        {formatDate(
                          reservation.checkOut
                        )}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-forest-950">
                        {reservation.assignedRoom
                          ? `Room ${reservation.assignedRoom}`
                          : "Room not yet assigned"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!reservation.assignedRoom && (
                        <button
                          type="button"
                          onClick={() =>
                            assignRoom(
                              reservation
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-forest-950"
                        >
                          <Sparkles
                            size={
                              16
                            }
                          />

                          Auto-assign
                        </button>
                      )}

                      {reservation.status !==
                        "Checked In" && (
                        <button
                          type="button"
                          onClick={() =>
                            checkIn(
                              reservation
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <LogIn
                            size={
                              16
                            }
                          />

                          Check in
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
                          className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <LogOut
                            size={
                              16
                            }
                          />

                          Check out
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </Card>
    </>
  );
}