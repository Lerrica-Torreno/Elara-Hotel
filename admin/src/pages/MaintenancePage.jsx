import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Plus,
  RefreshCw,
  Wrench
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

const initialForm = {
  roomId: "",
  title: "",
  description: "",
  priority: "NORMAL"
};

function normalizeTicket(ticket) {
  return {
    id:
      ticket.id,

    roomId:
      ticket.roomId,

    roomNumber:
      ticket.room?.roomNumber ??
      "—",

    roomType:
      ticket.room?.roomType?.name ??
      "Unknown",

    title:
      ticket.title,

    description:
      ticket.description ??
      "",

    priority:
      ticket.priority,

    status:
      ticket.status,

    openedAt:
      ticket.openedAt,

    createdAt:
      ticket.createdAt,

    resolvedAt:
      ticket.resolvedAt,

    assignedTo:
      ticket.assignedTo
        ? `${ticket.assignedTo.firstName ?? ""} ${ticket.assignedTo.lastName ?? ""}`.trim()
        : null
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

function statusLabel(status) {
  switch (status) {
    case "PENDING":
      return "Open";

    case "IN_PROGRESS":
      return "In Progress";

    case "COMPLETED":
      return "Resolved";

    default:
      return status;
  }
}

function statusTone(status) {
  switch (status) {
    case "COMPLETED":
      return "green";

    case "IN_PROGRESS":
      return "blue";

    default:
      return "red";
  }
}

function priorityLabel(priority) {
  return (
    priorities.find(
      (item) =>
        item.value ===
        priority
    )?.label ??
    priority
  );
}

function priorityTone(priority) {
  switch (priority) {
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

export default function MaintenancePage({
  rooms = [],
  setRooms,
  tickets = [],
  setTickets
}) {
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
    loading,
    setLoading
  ] = useState(true);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    resolvingId,
    setResolvingId
  ] = useState(null);

  const [
    error,
    setError
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("ALL");

  async function refreshMaintenance() {
    try {
      setLoading(true);
      setError("");

      const [
        ticketResponse,
        roomResponse
      ] =
        await Promise.all([
          api.maintenance.list(),
          api.rooms.list()
        ]);

      if (
        typeof setTickets ===
        "function"
      ) {
        setTickets(
          (
            ticketResponse?.tickets ??
            []
          ).map(
            normalizeTicket
          )
        );
      }

      if (
        typeof setRooms ===
        "function"
      ) {
        setRooms(
          (
            roomResponse?.rooms ??
            []
          ).map(
            normalizeRoom
          )
        );
      }
    } catch (
      refreshProblem
    ) {
      setError(
        refreshProblem.message ||
          "Unable to load maintenance data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMaintenance();
  }, []);

  const visibleTickets =
    useMemo(
      () => {
        if (
          statusFilter ===
          "ALL"
        ) {
          return tickets;
        }

        if (
          statusFilter ===
          "ACTIVE"
        ) {
          return tickets.filter(
            (
              ticket
            ) =>
              ticket.status !==
              "COMPLETED"
          );
        }

        return tickets.filter(
          (
            ticket
          ) =>
            ticket.status ===
            "COMPLETED"
        );
      },
      [
        tickets,
        statusFilter
      ]
    );

  const activeCount =
    tickets.filter(
      (
        ticket
      ) =>
        ticket.status !==
        "COMPLETED"
    ).length;

  const resolvedCount =
    tickets.filter(
      (
        ticket
      ) =>
        ticket.status ===
        "COMPLETED"
    ).length;

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

  async function submit(event) {
    event.preventDefault();

    if (
      !form.roomId ||
      !form.title.trim()
    ) {
      setError(
        "Room and issue title are required."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.maintenance.create({
        roomId:
          form.roomId,

        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          undefined,

        priority:
          form.priority
      });

      await refreshMaintenance();

      setModalOpen(false);
      setForm(
        initialForm
      );
    } catch (
      createProblem
    ) {
      setError(
        createProblem.message ||
          "Unable to create maintenance ticket."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resolve(ticket) {
    try {
      setResolvingId(
        ticket.id
      );

      setError("");

      await api.maintenance.resolve(
        ticket.id
      );

      await refreshMaintenance();
    } catch (
      resolveProblem
    ) {
      setError(
        resolveProblem.message ||
          "Unable to resolve maintenance ticket."
      );
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Maintenance"
        description="Log room maintenance issues, track active tickets, and return repaired rooms to housekeeping."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                refreshMaintenance
              }
              disabled={
                loading
              }
              className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus
                size={17}
              />

              New ticket
            </button>
          </div>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mb-7 flex flex-wrap gap-2">
        <FilterButton
          active={
            statusFilter ===
            "ALL"
          }
          label="All tickets"
          count={
            tickets.length
          }
          onClick={() =>
            setStatusFilter(
              "ALL"
            )
          }
        />

        <FilterButton
          active={
            statusFilter ===
            "ACTIVE"
          }
          label="Open"
          count={
            activeCount
          }
          onClick={() =>
            setStatusFilter(
              "ACTIVE"
            )
          }
        />

        <FilterButton
          active={
            statusFilter ===
            "RESOLVED"
          }
          label="Resolved"
          count={
            resolvedCount
          }
          onClick={() =>
            setStatusFilter(
              "RESOLVED"
            )
          }
        />
      </div>

      {loading ? (
        <Card>
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-forest-900/55">
              Loading maintenance tickets...
            </p>
          </div>
        </Card>
      ) : !visibleTickets.length ? (
        <Card>
          <EmptyState
            icon={
              Wrench
            }
            title="No maintenance tickets"
            description="No maintenance tickets match the selected filter."
            actionLabel={
              tickets.length
                ? undefined
                : "Create ticket"
            }
            onAction={
              tickets.length
                ? undefined
                : openModal
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleTickets.map(
            (
              ticket
            ) => (
              <article
                key={
                  ticket.id
                }
                className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft md:p-6"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-forest-950">
                        {
                          ticket.title
                        }
                      </h2>

                      <Badge
                        tone={statusTone(
                          ticket.status
                        )}
                      >
                        {statusLabel(
                          ticket.status
                        )}
                      </Badge>

                      <Badge
                        tone={priorityTone(
                          ticket.priority
                        )}
                      >
                        {priorityLabel(
                          ticket.priority
                        )}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-forest-900/55">
                      Room{" "}
                      {
                        ticket.roomNumber
                      }

                      {" · "}

                      {
                        ticket.roomType
                      }
                    </p>

                    {ticket.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-900/50">
                        {
                          ticket.description
                        }
                      </p>
                    )}

                    {ticket.resolvedAt && (
                      <p className="mt-3 text-xs text-forest-900/40">
                        Resolved{" "}
                        {new Date(
                          ticket.resolvedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {ticket.status !==
                    "COMPLETED" && (
                    <button
                      type="button"
                      disabled={
                        resolvingId ===
                        ticket.id
                      }
                      onClick={() =>
                        resolve(
                          ticket
                        )
                      }
                      className="shrink-0 rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {resolvingId ===
                      ticket.id
                        ? "Resolving..."
                        : "Resolve"}
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
        title="New maintenance ticket"
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
            id="maintenance-room"
            label="Room"
          >
            {() => (
              <select
                required
                id="maintenance-room"
                value={
                  form.roomId
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      roomId:
                        event.target.value
                    })
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
              >
                <option value="">
                  Select room
                </option>

                {rooms.map(
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
                      }{" "}
                      —{" "}
                      {
                        room.status
                      }
                    </option>
                  )
                )}
              </select>
            )}
          </FormField>

          <FormField
            id="maintenance-title"
            label="Issue"
          >
            {() => (
              <input
                id="maintenance-title"
                value={
                  form.title
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      title:
                        event.target.value
                    })
                  )
                }
                placeholder="e.g. Air-conditioning not cooling"
                className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5"
              />
            )}
          </FormField>

          <FormField
            id="maintenance-description"
            label="Description"
          >
            {() => (
              <textarea
                id="maintenance-description"
                rows="4"
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      description:
                        event.target.value
                    })
                  )
                }
                placeholder="Describe the issue..."
                className="w-full resize-none rounded-xl border border-forest-900/15 px-3 py-2.5"
              />
            )}
          </FormField>

          <FormField
            id="maintenance-priority"
            label="Priority"
          >
            {() => (
              <select
                id="maintenance-priority"
                value={
                  form.priority
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      priority:
                        event.target.value
                    })
                  )
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
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

          <div className="flex justify-end gap-3 border-t border-forest-900/10 pt-5">
            <button
              type="button"
              onClick={
                closeModal
              }
              disabled={
                submitting
              }
              className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !form.roomId ||
                !form.title.trim()
              }
              className="rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create ticket"}
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
          : "border border-forest-900/10 bg-white text-forest-950 hover:bg-mist"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active
            ? "bg-white/15"
            : "bg-mist text-forest-900/55"
        }`}
      >
        {count}
      </span>
    </button>
  );
}