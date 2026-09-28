import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Sparkles,
  Plus,
  RefreshCw
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";

import {
  api
} from "../services/api";

const priorities = [
  {
    value: "LOW",
    label: "Low"
  },
  {
    value: "NORMAL",
    label: "Normal"
  },
  {
    value: "HIGH",
    label: "High"
  },
  {
    value: "URGENT",
    label: "Urgent"
  }
];

function normalizeTask(
  task
) {
  return {
    id:
      task.id,

    roomId:
      task.roomId,

    roomNumber:
      task.room?.roomNumber ??
      "—",

    roomType:
      task.room?.roomType?.name ??
      "Unknown",

    priority:
      task.priority,

    status:
      task.status,

    notes:
      task.notes ?? "",

    createdAt:
      task.createdAt,

    completedAt:
      task.completedAt,

    assignedTo:
      task.assignedTo
        ? `${task.assignedTo.firstName ?? ""} ${task.assignedTo.lastName ?? ""}`.trim()
        : null
  };
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
      room.status
  };
}

function priorityLabel(
  priority
) {
  return (
    priorities.find(
      (item) =>
        item.value ===
        priority
    )?.label ??
    priority
  );
}

function priorityTone(
  priority
) {
  switch (
    priority
  ) {
    case "URGENT":
      return "red";

    case "HIGH":
      return "amber";

    case "LOW":
      return "gray";

    default:
      return "blue";
  }
}

function statusTone(
  status
) {
  if (
    status ===
    "COMPLETED"
  ) {
    return "green";
  }

  if (
    status ===
    "IN_PROGRESS"
  ) {
    return "blue";
  }

  return "amber";
}

function statusLabel(
  status
) {
  switch (
    status
  ) {
    case "PENDING":
      return "Pending";

    case "IN_PROGRESS":
      return "In Progress";

    case "COMPLETED":
      return "Completed";

    default:
      return status;
  }
}

export default function HousekeepingPage({
  rooms = [],
  setRooms,
  tasks = [],
  setTasks
}) {
  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const [
    roomId,
    setRoomId
  ] = useState("");

  const [
    priority,
    setPriority
  ] = useState(
    "NORMAL"
  );

  const [
    notes,
    setNotes
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
    completingId,
    setCompletingId
  ] = useState(null);

  const [
    error,
    setError
  ] = useState("");

  const [
    taskFilter,
    setTaskFilter
  ] = useState(
    "ALL"
  );

  async function refreshHousekeeping() {
    try {
      setLoading(true);
      setError("");

      const [
        taskResponse,
        roomResponse
      ] =
        await Promise.all([
          api.housekeeping.list(),
          api.rooms.list()
        ]);

      const normalizedTasks =
        (
          taskResponse?.tasks ??
          []
        ).map(
          normalizeTask
        );

      const normalizedRooms =
        (
          roomResponse?.rooms ??
          []
        ).map(
          normalizeRoom
        );

      if (
        typeof setTasks ===
        "function"
      ) {
        setTasks(
          normalizedTasks
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
      setError(
        refreshProblem.message ||
          "Unable to load housekeeping data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshHousekeeping();
  }, []);

  function openModal() {
    setError("");
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

    setRoomId("");

    setPriority(
      "NORMAL"
    );

    setNotes("");

    setError("");
  }

  async function addTask(
    event
  ) {
    event.preventDefault();

    if (
      !roomId
    ) {
      setError(
        "Select a room."
      );

      return;
    }

    try {
      setSubmitting(
        true
      );

      setError("");

      await api.housekeeping.create({
        roomId,

        priority,

        notes:
          notes.trim() ||
          undefined
      });

      await refreshHousekeeping();

      setModalOpen(
        false
      );

      setRoomId("");

      setPriority(
        "NORMAL"
      );

      setNotes("");
    } catch (
      createProblem
    ) {
      setError(
        createProblem.message ||
          "Unable to create housekeeping task."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  async function completeTask(
    task
  ) {
    try {
      setCompletingId(
        task.id
      );

      setError("");

      await api.housekeeping.complete(
        task.id
      );

      await refreshHousekeeping();
    } catch (
      completeProblem
    ) {
      setError(
        completeProblem.message ||
          "Unable to complete housekeeping task."
      );
    } finally {
      setCompletingId(
        null
      );
    }
  }

  const cleaningRooms =
    rooms.filter(
      (room) =>
        room.status ===
        "CLEANING"
    );

  const pendingCount =
    tasks.filter(
      (
        task
      ) =>
        task.status !==
        "COMPLETED"
    ).length;

  const completedCount =
    tasks.filter(
      (
        task
      ) =>
        task.status ===
        "COMPLETED"
    ).length;

  const visibleTasks =
    useMemo(
      () => {
        if (
          taskFilter ===
          "PENDING"
        ) {
          return tasks.filter(
            (
              task
            ) =>
              task.status !==
              "COMPLETED"
          );
        }

        if (
          taskFilter ===
          "COMPLETED"
        ) {
          return tasks.filter(
            (
              task
            ) =>
              task.status ===
              "COMPLETED"
          );
        }

        return tasks;
      },
      [
        tasks,
        taskFilter
      ]
    );

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Housekeeping"
        description="Track rooms awaiting cleaning and restore them to available inventory once service is complete."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                refreshHousekeeping
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

              Refresh
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

              Add cleaning task
            </button>
          </div>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {
            error
          }
        </div>
      )}

      <section className="mb-7 rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-forest-900/40">
              Cleaning status
            </p>

            <p className="mt-1 text-sm text-forest-900/50">
              Filter current and completed housekeeping assignments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={
                taskFilter ===
                "ALL"
              }
              label="All"
              count={
                tasks.length
              }
              onClick={() =>
                setTaskFilter(
                  "ALL"
                )
              }
            />

            <FilterButton
              active={
                taskFilter ===
                "PENDING"
              }
              label="Pending"
              count={
                pendingCount
              }
              onClick={() =>
                setTaskFilter(
                  "PENDING"
                )
              }
            />

            <FilterButton
              active={
                taskFilter ===
                "COMPLETED"
              }
              label="Completed"
              count={
                completedCount
              }
              onClick={() =>
                setTaskFilter(
                  "COMPLETED"
                )
              }
            />
          </div>
        </div>
      </section>

      {loading ? (
        <Card>
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-forest-900/55">
              Loading housekeeping tasks...
            </p>
          </div>
        </Card>
      ) : !visibleTasks.length ? (
        <Card>
          <EmptyState
            icon={
              Sparkles
            }
            title={
              tasks.length
                ? "No matching cleaning tasks"
                : "No housekeeping tasks"
            }
            description={
              tasks.length
                ? "There are no housekeeping tasks matching the selected filter."
                : "Cleaning assignments will appear automatically after checkout or can be created manually."
            }
            actionLabel={
              tasks.length
                ? undefined
                : "Add cleaning task"
            }
            onAction={
              tasks.length
                ? undefined
                : openModal
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleTasks.map(
            (
              task
            ) => (
              <article
                key={
                  task.id
                }
                className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft md:p-6"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-forest-950">
                        Room{" "}
                        {
                          task.roomNumber
                        }
                      </p>

                      <Badge
                        tone={statusTone(
                          task.status
                        )}
                      >
                        {statusLabel(
                          task.status
                        )}
                      </Badge>

                      <Badge
                        tone={priorityTone(
                          task.priority
                        )}
                      >
                        {priorityLabel(
                          task.priority
                        )}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-forest-900/50">
                      {
                        task.roomType
                      }
                    </p>

                    {task.notes && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-900/60">
                        {
                          task.notes
                        }
                      </p>
                    )}

                    {task.assignedTo && (
                      <p className="mt-3 text-xs text-forest-900/40">
                        Assigned to{" "}
                        {
                          task.assignedTo
                        }
                      </p>
                    )}

                    {task.completedAt && (
                      <p className="mt-3 text-xs text-forest-900/40">
                        Completed{" "}
                        {new Date(
                          task.completedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {task.status !==
                    "COMPLETED" && (
                    <button
                      type="button"
                      disabled={
                        completingId ===
                        task.id
                      }
                      onClick={() =>
                        completeTask(
                          task
                        )
                      }
                      className="shrink-0 rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-wait disabled:opacity-50"
                    >
                      {completingId ===
                      task.id
                        ? "Updating..."
                        : "Mark clean"}
                    </button>
                  )}
                </div>
              </article>
            )
          )}
        </div>
      )}

      <Modal
        open={
          modalOpen
        }
        title="Create housekeeping task"
        onClose={
          closeModal
        }
      >
        <form
          onSubmit={
            addTask
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

          <FormField
            id="housekeeping-room"
            label="Room"
          >
            {() => (
              <select
                id="housekeeping-room"
                required
                value={
                  roomId
                }
                onChange={(
                  event
                ) =>
                  setRoomId(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              >
                <option value="">
                  Select room
                </option>

                {cleaningRooms.map(
                  (
                    room
                  ) => (
                    <option
                      key={
                        room.id
                      }
                      value={
                        room.id
                      }
                    >
                      Room{" "}
                      {
                        room.roomNumber
                      }{" "}
                      —{" "}
                      {
                        room.roomType
                      }
                    </option>
                  )
                )}
              </select>
            )}
          </FormField>

          {!cleaningRooms.length && (
            <p className="rounded-xl bg-mist px-4 py-3 text-sm text-forest-900/55">
              There are currently no rooms marked for cleaning.
            </p>
          )}

          <FormField
            id="housekeeping-priority"
            label="Priority"
          >
            {() => (
              <select
                id="housekeeping-priority"
                value={
                  priority
                }
                onChange={(
                  event
                ) =>
                  setPriority(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
              >
                {priorities.map(
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
            )}
          </FormField>

          <FormField
            id="housekeeping-notes"
            label="Notes"
          >
            {() => (
              <textarea
                id="housekeeping-notes"
                rows="4"
                value={
                  notes
                }
                onChange={(
                  event
                ) =>
                  setNotes(
                    event.target.value
                  )
                }
                placeholder="Optional cleaning instructions..."
                className="w-full resize-none rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
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
              className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !roomId
              }
              className="rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create task"}
            </button>
          </div>
        </form>
      </Modal>
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
      {
        label
      }

      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active
            ? "bg-white/15 text-white"
            : "bg-white text-forest-900/55"
        }`}
      >
        {
          count
        }
      </span>
    </button>
  );
}