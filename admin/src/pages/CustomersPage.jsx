import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  History,
  Plus,
  RefreshCw,
  Search,
  Users
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";
import EmptyState from "../components/ui/EmptyState";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";

import {
  api
} from "../services/api";

import {
  formatCurrency,
  formatDate
} from "../utils/format";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  notes: ""
};

function normalizeCustomer(item) {
  return {
    id: item.id,

    firstName:
      item.user?.firstName ??
      "",

    lastName:
      item.user?.lastName ??
      "",

    name:
      `${item.user?.firstName ?? ""} ${
        item.user?.lastName ?? ""
      }`.trim(),

    email:
      item.user?.email ??
      "",

    phone:
      item.phone ??
      "",

    address:
      item.address ??
      "",

    notes:
      item.notes ??
      "",

    isActive:
      item.user?.isActive ??
      true,

    createdAt:
      item.createdAt,

    reservations:
      item.reservations ??
      []
  };
}

export default function CustomersPage() {
  const [
    guests,
    setGuests
  ] = useState([]);

  const [
    query,
    setQuery
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
    error,
    setError
  ] = useState("");

  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const [
    historyOpen,
    setHistoryOpen
  ] = useState(false);

  const [
    selectedGuest,
    setSelectedGuest
  ] = useState(null);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    form,
    setForm
  ] = useState(
    emptyForm
  );

  async function loadGuests(
    showRefreshing = false
  ) {
    try {
      if (
        showRefreshing
      ) {
        setRefreshing(true);
      }

      setError("");

      const response =
        await api.customers.list();

      setGuests(
        (
          response?.customers ??
          []
        ).map(
          normalizeCustomer
        )
      );
    } catch (
      loadProblem
    ) {
      setError(
        loadProblem.message ||
          "Unable to load guests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

  const visibleGuests =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLowerCase();

      if (!search) {
        return guests;
      }

      return guests.filter(
        (guest) =>
          [
            guest.name,
            guest.email,
            guest.phone,
            guest.address
          ]
            .filter(Boolean)
            .some((value) =>
              value
                .toLowerCase()
                .includes(
                  search
                )
            )
      );
    }, [
      guests,
      query
    ]);

  function changeForm(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value
      })
    );
  }

  function openAddGuest() {
    setError("");
    setForm(
      emptyForm
    );
    setModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
    setForm(
      emptyForm
    );
    setError("");
  }

  async function submitGuest(
    event
  ) {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    ) {
      setError(
        "First name, last name and email are required."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.customers.create({
        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),

        phone:
          form.phone.trim(),

        address:
          form.address.trim(),

        notes:
          form.notes.trim()
      });

      await loadGuests();

      setModalOpen(false);
      setForm(
        emptyForm
      );
    } catch (
      createProblem
    ) {
      setError(
        createProblem.message ||
          "Unable to create guest."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function showHistory(
    guest
  ) {
    setSelectedGuest(
      guest
    );

    setHistoryOpen(
      true
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Guest Management"
        title="Guests"
        description="Manage guest profiles, contact information, and reservation history."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                loadGuests(
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
                openAddGuest
              }
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800"
            >
              <Plus
                size={17}
              />

              Add guest
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

      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-900/10 p-5">
          <div className="relative w-full max-w-md">
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
              placeholder="Search name, email, phone or address..."
              className="w-full rounded-xl border border-forest-900/15 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
            />
          </div>

          <p className="text-sm font-semibold text-forest-900/45">
            {guests.length} guest
            {guests.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-forest-900/45">
            Loading guests...
          </div>
        ) : (
          <DataTable
            caption="Guests"
            columns={[
              "Guest",
              "Contact",
              "Address",
              "Stay history",
              "Notes",
              ""
            ]}
            rows={
              visibleGuests
            }
            emptyState={
              <EmptyState
                icon={
                  Users
                }
                title="No guest profiles"
                description="Guest profiles will appear here after they are created or linked to reservations."
                actionLabel="Add guest"
                onAction={
                  openAddGuest
                }
              />
            }
            renderRow={(
              guest
            ) => (
              <tr
                key={
                  guest.id
                }
                className="hover:bg-mist/40"
              >
                <th className="px-5 py-4 text-left">
                  <p className="font-semibold text-forest-950">
                    {
                      guest.name
                    }
                  </p>

                  <p className="mt-1 text-xs text-forest-900/40">
                    Guest profile
                  </p>
                </th>

                <td className="px-5 py-4">
                  <p className="text-sm text-forest-900/70">
                    {
                      guest.email
                    }
                  </p>

                  <p className="mt-1 text-xs text-forest-900/45">
                    {guest.phone ||
                      "No phone"}
                  </p>
                </td>

                <td className="max-w-[220px] px-5 py-4 text-sm text-forest-900/60">
                  {guest.address ||
                    "—"}
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      showHistory(
                        guest
                      )
                    }
                    className="inline-flex items-center gap-2 text-sm font-semibold text-forest-900 hover:text-gold"
                  >
                    <History
                      size={15}
                    />

                    {
                      guest
                        .reservations
                        .length
                    }{" "}
                    stay
                    {guest
                      .reservations
                      .length === 1
                      ? ""
                      : "s"}
                  </button>
                </td>

                <td className="max-w-xs px-5 py-4 text-sm text-forest-900/55">
                  {guest.notes ||
                    "—"}
                </td>

                <td className="px-5 py-4 text-right">
                  <Badge
                    tone={
                      guest.isActive
                        ? "green"
                        : "gray"
                    }
                  >
                    {guest.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </td>
              </tr>
            )}
          />
        )}
      </Card>

      <Modal
        open={
          modalOpen
        }
        title="Add guest profile"
        onClose={
          closeModal
        }
      >
        <form
          onSubmit={
            submitGuest
          }
          className="space-y-5"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <GuestInput
              id="guest-first-name"
              label="First name"
              value={
                form.firstName
              }
              onChange={(
                value
              ) =>
                changeForm(
                  "firstName",
                  value
                )
              }
            />

            <GuestInput
              id="guest-last-name"
              label="Last name"
              value={
                form.lastName
              }
              onChange={(
                value
              ) =>
                changeForm(
                  "lastName",
                  value
                )
              }
            />
          </div>

          <GuestInput
            id="guest-email"
            label="Email address"
            type="email"
            value={
              form.email
            }
            onChange={(
              value
            ) =>
              changeForm(
                "email",
                value
              )
            }
          />

          <GuestInput
            id="guest-phone"
            label="Phone number"
            value={
              form.phone
            }
            onChange={(
              value
            ) =>
              changeForm(
                "phone",
                value
              )
            }
          />

          <GuestInput
            id="guest-address"
            label="Address"
            value={
              form.address
            }
            onChange={(
              value
            ) =>
              changeForm(
                "address",
                value
              )
            }
          />

          <FormField
            id="guest-notes"
            label="Notes"
          >
            {() => (
              <textarea
                id="guest-notes"
                rows="4"
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  changeForm(
                    "notes",
                    event.target.value
                  )
                }
                className="w-full resize-none rounded-xl border border-forest-900/15 px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
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
              className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : "Save guest"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={
          historyOpen
        }
        title={
          selectedGuest
            ? `${selectedGuest.name} — Stay history`
            : "Stay history"
        }
        onClose={() =>
          setHistoryOpen(
            false
          )
        }
      >
        {!selectedGuest
          ?.reservations
          ?.length ? (
          <div className="py-10 text-center text-sm text-forest-900/50">
            No reservations linked to this guest.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedGuest.reservations.map(
              (
                reservation
              ) => (
                <article
                  key={
                    reservation.id
                  }
                  className="rounded-2xl bg-mist p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-forest-950">
                        {
                          reservation.reference
                        }
                      </p>

                      <p className="mt-1 text-sm text-forest-900/55">
                        {reservation
                          .roomType
                          ?.name ??
                          "Room"}

                        {" · "}

                        {formatDate(
                          reservation.checkInDate
                        )}

                        {" → "}

                        {formatDate(
                          reservation.checkOutDate
                        )}
                      </p>
                    </div>

                    <Badge
                      tone={
                        reservation.status ===
                        "CANCELLED"
                          ? "gray"
                          : "green"
                      }
                    >
                      {
                        reservation.status
                      }
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-forest-950">
                    {formatCurrency(
                      Number(
                        reservation.totalAmount ??
                          0
                      )
                    )}
                  </p>
                </article>
              )
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function GuestInput({
  id,
  label,
  value,
  onChange,
  type = "text"
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
          type={
            type
          }
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
          className="w-full rounded-xl border border-forest-900/15 px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
        />
      )}
    </FormField>
  );
}