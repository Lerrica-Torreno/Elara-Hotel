import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BedDouble,
  Plus,
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

const initialForm = {
  roomNumber: "",
  roomTypeId: "",
  floor: ""
};

const statuses = [
  {
    value: "AVAILABLE",
    label: "Available"
  },
  {
    value: "RESERVED",
    label: "Reserved"
  },
  {
    value: "OCCUPIED",
    label: "Occupied"
  },
  {
    value: "CLEANING",
    label: "Cleaning"
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance"
  },
  {
    value: "OUT_OF_SERVICE",
    label: "Out of Service"
  }
];

function statusLabel(
  status
) {
  return (
    statuses.find(
      (item) =>
        item.value ===
        status
    )?.label ??
    status
  );
}

function statusTone(
  status
) {
  const tones = {
    AVAILABLE:
      "green",

    RESERVED:
      "amber",

    OCCUPIED:
      "blue",

    CLEANING:
      "gold",

    MAINTENANCE:
      "red",

    OUT_OF_SERVICE:
      "red"
  };

  return (
    tones[
      status
    ] ||
    "gray"
  );
}

function normalizeRoom(
  room
) {
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
      room.status,

    createdAt:
      room.createdAt,

    updatedAt:
      room.updatedAt
  };
}

export default function RoomsPage({
  rooms = [],
  setRooms
}) {
  const [
    query,
    setQuery
  ] = useState("");

  const [
    filter,
    setFilter
  ] = useState(
    "All"
  );

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
    loading,
    setLoading
  ] = useState(true);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    roomTypes,
    setRoomTypes
  ] = useState([]);

  async function loadRooms() {
    try {
      setLoadError("");

      const response =
        await api.rooms.list();

      const normalized =
        (
          response?.rooms ??
          []
        ).map(
          normalizeRoom
        );

      if (
        typeof setRooms ===
        "function"
      ) {
        setRooms(
          normalized
        );
      }
    } catch (
      loadProblem
    ) {
      setLoadError(
        loadProblem.message ||
          "Unable to load room inventory."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRoomTypes() {
    try {
      const response =
        await api.roomTypes.list();

      setRoomTypes(
        response?.roomTypes ??
          []
      );
    } catch (
      roomTypeProblem
    ) {
      console.error(
        "Unable to load room types:",
        roomTypeProblem
      );

      setLoadError(
        roomTypeProblem.message ||
          "Unable to load room types."
      );
    }
  }

  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, []);

  const visible =
    useMemo(
      () => {
        const search =
          query
            .trim()
            .toLowerCase();

        return rooms.filter(
          (
            room
          ) => {
            const statusMatch =
              filter ===
                "All" ||
              room.status ===
                filter;

            const searchMatch =
              !search ||
              [
                room.roomNumber,
                room.roomType,
                room.floor
              ].some(
                (
                  value
                ) =>
                  String(
                    value ??
                      ""
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
      },
      [
        rooms,
        query,
        filter
      ]
    );

  function openModal() {
    setError("");

    setForm(
      initialForm
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
      initialForm
    );

    setError("");
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    if (
      !form.roomNumber.trim() ||
      !form.roomTypeId
    ) {
      setError(
        "Room number and room type are required."
      );

      return;
    }

    if (
      rooms.some(
        (
          room
        ) =>
          String(
            room.roomNumber
          ) ===
          String(
            form.roomNumber
          ).trim()
      )
    ) {
      setError(
        "That room number already exists."
      );

      return;
    }

    try {
      setSubmitting(
        true
      );

      setError("");

      const response =
        await api.rooms.create({
          roomNumber:
            form.roomNumber.trim(),

          roomTypeId:
            form.roomTypeId,

          floor:
            form.floor
              ? Number(
                  form.floor
                )
              : null,

          status:
            "AVAILABLE"
        });

      const savedRoom =
        response?.room;

      if (
        savedRoom
      ) {
        if (
          typeof setRooms ===
          "function"
        ) {
          setRooms(
            (
              current
            ) => [
              normalizeRoom(
                savedRoom
              ),
              ...current
            ]
          );
        }
      } else {
        await loadRooms();
      }

      closeModal();
    } catch (
      submitProblem
    ) {
      setError(
        submitProblem.message ||
          "Unable to create room."
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
        eyebrow="Inventory"
        title="Rooms & Inventory"
        description="Track physical rooms, room types, capacity, nightly rates, and real-time operational status."
        action={
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

            Add room
          </button>
        }
      />

      {loadError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {
            loadError
          }
        </div>
      )}

      <Card className="overflow-hidden !p-0">
        <div className="flex flex-col gap-3 border-b border-forest-900/10 p-5 sm:flex-row">
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
              placeholder="Search room, type or floor..."
              className="w-full rounded-xl border border-forest-900/15 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
            />
          </div>

          <select
            value={
              filter
            }
            onChange={(
              event
            ) =>
              setFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <option value="All">
              All statuses
            </option>

            {statuses.map(
              (
                item
              ) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {
                    item.label
                  }
                </option>
              )
            )}
          </select>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-forest-900/50">
              Loading room inventory...
            </p>
          </div>
        ) : !visible.length ? (
          <EmptyState
            icon={
              BedDouble
            }
            title={
              rooms.length
                ? "No matching rooms"
                : "No rooms in inventory"
            }
            description={
              rooms.length
                ? "Adjust your search or status filter."
                : "Add rooms to begin managing the hotel's physical inventory."
            }
            actionLabel={
              rooms.length
                ? undefined
                : "Add room"
            }
            onAction={
              rooms.length
                ? undefined
                : openModal
            }
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] table-fixed border-collapse">
              <thead>
                <tr className="border-b border-forest-900/10 bg-mist/60 text-left">
                  <th className="w-[16%] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-forest-900/45">
                    Room
                  </th>

                  <th className="w-[25%] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-forest-900/45">
                    Type
                  </th>

                  <th className="w-[12%] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-forest-900/45">
                    Floor
                  </th>

                  <th className="w-[14%] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-forest-900/45">
                    Capacity
                  </th>

                  <th className="w-[17%] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-forest-900/45">
                    Rate
                  </th>

                  <th className="w-[16%] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-forest-900/45">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {visible.map(
                  (
                    room
                  ) => (
                    <tr
                      key={
                        room.id
                      }
                      className="border-b border-forest-900/10 transition last:border-b-0 hover:bg-mist/50"
                    >
                      <th className="px-5 py-5 text-left font-semibold text-forest-950">
                        Room{" "}
                        {
                          room.roomNumber
                        }
                      </th>

                      <td className="px-5 py-5">
                        <p className="font-medium text-forest-950">
                          {
                            room.roomType
                          }
                        </p>
                      </td>

                      <td className="px-5 py-5 text-forest-900/65">
                        {room.floor ??
                          "—"}
                      </td>

                      <td className="px-5 py-5 text-forest-950">
                        {
                          room.capacity
                        }
                      </td>

                      <td className="px-5 py-5 font-medium text-forest-950">
                        {formatCurrency(
                          room.baseRate
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <Badge
                          tone={statusTone(
                            room.status
                          )}
                        >
                          {statusLabel(
                            room.status
                          )}
                        </Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={
          modalOpen
        }
        title="Add room"
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
              {
                error
              }
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="room-number"
              label="Room number"
            >
              {() => (
                <input
                  id="room-number"
                  type="text"
                  value={
                    form.roomNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        roomNumber:
                          event.target.value
                      })
                    )
                  }
                  placeholder="e.g. 306"
                  className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
                  required
                />
              )}
            </FormField>

            <FormField
              id="room-type"
              label="Room type"
            >
              {() => (
                <select
                  id="room-type"
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
                          event.target.value
                      })
                    )
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
                  required
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

            <FormField
              id="room-floor"
              label="Floor"
            >
              {() => (
                <input
                  id="room-floor"
                  type="number"
                  min="0"
                  value={
                    form.floor
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        floor:
                          event.target.value
                      })
                    )
                  }
                  placeholder="e.g. 3"
                  className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
                />
              )}
            </FormField>

            <div className="rounded-2xl border border-forest-900/10 bg-mist p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-forest-900/40">
                Initial status
              </p>

              <div className="mt-2">
                <Badge
                  tone="green"
                >
                  Available
                </Badge>
              </div>

              <p className="mt-2 text-xs leading-5 text-forest-900/50">
                Newly created inventory starts as Available. Operational workflows will update the status automatically.
              </p>
            </div>
          </div>

          {form.roomTypeId && (
            <div className="rounded-2xl bg-mist p-4 text-sm">
              {(() => {
                const selected =
                  roomTypes.find(
                    (
                      item
                    ) =>
                      item.id ===
                      form.roomTypeId
                  );

                if (
                  !selected
                ) {
                  return null;
                }

                return (
                  <div className="space-y-2">
                    <p className="font-semibold text-forest-950">
                      {
                        selected.name
                      }
                    </p>

                    <p className="text-forest-900/55">
                      Capacity:{" "}
                      {
                        selected.capacity
                      }{" "}
                      guests
                    </p>

                    <p className="text-forest-900/55">
                      Base rate:{" "}
                      {formatCurrency(
                        Number(
                          selected.baseRate
                        )
                      )}
                    </p>

                    {selected.beds && (
                      <p className="text-forest-900/55">
                        Beds:{" "}
                        {
                          selected.beds
                        }
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

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
                ? "Saving..."
                : "Save room"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}