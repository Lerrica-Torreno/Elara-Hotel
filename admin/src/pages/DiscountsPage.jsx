import {
  useEffect,
  useState
} from "react";

import {
  Percent,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";

import {
  formatCurrency
} from "../utils/format";

import {
  api
} from "../services/api";

const initialForm = {
  name: "",
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minimumAmount: "",
  startDate: "",
  endDate: "",
  customerVisible: true,
  isActive: true
};

function normalizeDiscount(
  item
) {
  return {
    id:
      item.id,

    name:
      item.name,

    code:
      item.code,

    description:
      item.description ?? "",

    type:
      item.type,

    value:
      Number(
        item.value ?? 0
      ),

    minimumAmount:
      item.minimumAmount == null
        ? null
        : Number(
            item.minimumAmount
          ),

    startDate:
      item.startDate
        ? String(
            item.startDate
          ).slice(0, 10)
        : "",

    endDate:
      item.endDate
        ? String(
            item.endDate
          ).slice(0, 10)
        : "",

    isActive:
      Boolean(
        item.isActive
      ),

    customerVisible:
      Boolean(
        item.customerVisible
      ),

    createdAt:
      item.createdAt
  };
}

function formatDiscountValue(
  discount
) {
  if (
    discount.type ===
    "PERCENTAGE"
  ) {
    return `${discount.value}%`;
  }

  return formatCurrency(
    discount.value
  );
}

export default function DiscountsPage({
  discounts = [],
  setDiscounts
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
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    deletingId,
    setDeletingId
  ] = useState(null);

  const [
    error,
    setError
  ] = useState("");

  async function loadDiscounts(
    showRefresh = false
  ) {
    try {
      if (
        showRefresh
      ) {
        setRefreshing(
          true
        );
      }

      setError("");

      const response =
        await api.discounts.list();

      setDiscounts(
        (
          response?.discounts ??
          []
        ).map(
          normalizeDiscount
        )
      );
    } catch (
      loadProblem
    ) {
      setError(
        loadProblem.message ||
          "Unable to load discounts."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDiscounts();
  }, []);

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

  async function createDiscount(
    event
  ) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.value
    ) {
      setError(
        "Name, code and discount value are required."
      );

      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate <
        form.startDate
    ) {
      setError(
        "End date must be on or after the start date."
      );

      return;
    }

    try {
      setSubmitting(
        true
      );

      setError("");

      await api.discounts.create({
        name:
          form.name.trim(),

        code:
          form.code
            .trim()
            .toUpperCase(),

        description:
          form.description
            .trim() ||
          undefined,

        type:
          form.type,

        value:
          Number(
            form.value
          ),

        minimumAmount:
          form.minimumAmount
            ? Number(
                form.minimumAmount
              )
            : null,

        startDate:
          form.startDate ||
          null,

        endDate:
          form.endDate ||
          null,

        isActive:
          form.isActive,

        customerVisible:
          form.customerVisible
      });

      await loadDiscounts();

      setModalOpen(
        false
      );

      setForm(
        initialForm
      );
    } catch (
      createProblem
    ) {
      setError(
        createProblem.message ||
          "Unable to create discount."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  async function toggleDiscount(
    discount
  ) {
    try {
      setError("");

      await api.discounts.update(
        discount.id,
        {
          isActive:
            !discount.isActive
        }
      );

      await loadDiscounts();
    } catch (
      updateProblem
    ) {
      setError(
        updateProblem.message ||
          "Unable to update discount."
      );
    }
  }

  async function removeDiscount(
    discount
  ) {
    const confirmed =
      window.confirm(
        `Delete ${discount.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        discount.id
      );

      setError("");

      await api.discounts.remove(
        discount.id
      );

      await loadDiscounts();
    } catch (
      deleteProblem
    ) {
      setError(
        deleteProblem.message ||
          "Unable to delete discount."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title="Discounts"
        description="Create and manage discount rules for eligible hotel bookings."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                loadDiscounts(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus
                size={17}
              />

              New discount
            </button>
          </div>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {
            error
          }
        </div>
      )}

      {loading ? (
        <Card>
          <p className="py-10 text-center text-sm font-semibold text-forest-900/55">
            Loading discounts...
          </p>
        </Card>
      ) : !discounts.length ? (
        <Card>
          <EmptyState
            icon={
              Percent
            }
            title="No discounts yet"
            description="Create a discount rule to begin managing booking discounts."
            actionLabel="Create discount"
            onAction={
              openModal
            }
          />
        </Card>
      ) : (
        <section
          className="grid gap-4 lg:grid-cols-3"
          aria-label="Discount rules"
        >
          {discounts.map(
            (
              discount
            ) => (
              <article
                key={
                  discount.id
                }
                className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-forest-950">
                      {
                        discount.name
                      }
                    </h2>

                    <p className="mt-1 text-xs text-forest-900/55">
                      Code:{" "}
                      <strong>
                        {
                          discount.code
                        }
                      </strong>
                    </p>
                  </div>

                  <Badge
                    tone={
                      discount.isActive
                        ? "green"
                        : "gray"
                    }
                  >
                    {discount.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>

                <p className="mt-5 text-3xl font-bold text-forest-950">
                  {formatDiscountValue(
                    discount
                  )}
                </p>

                <p className="mt-2 text-sm text-forest-900/60">
                  {discount.type ===
                  "PERCENTAGE"
                    ? "Percentage discount"
                    : "Fixed-amount discount"}
                </p>

                {discount.minimumAmount != null && (
                  <p className="mt-2 text-xs text-forest-900/50">
                    Minimum booking:{" "}
                    {formatCurrency(
                      discount.minimumAmount
                    )}
                  </p>
                )}

                {(discount.startDate ||
                  discount.endDate) && (
                  <p className="mt-2 text-xs text-forest-900/50">
                    Valid:{" "}
                    {discount.startDate ||
                      "Any time"}

                    {" → "}

                    {discount.endDate ||
                      "No expiry"}
                  </p>
                )}

                {discount.description && (
                  <p className="mt-3 text-sm leading-6 text-forest-900/55">
                    {
                      discount.description
                    }
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {discount.customerVisible && (
                    <Badge
                      tone="blue"
                    >
                      Customer-visible
                    </Badge>
                  )}
                </div>

                <div className="mt-5 flex gap-2 border-t border-forest-900/10 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      toggleDiscount(
                        discount
                      )
                    }
                    className="flex-1 rounded-xl border border-forest-900/15 px-3 py-2 text-sm font-semibold"
                  >
                    {discount.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      deletingId ===
                      discount.id
                    }
                    onClick={() =>
                      removeDiscount(
                        discount
                      )
                    }
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 disabled:opacity-50"
                    aria-label={`Delete ${discount.name}`}
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      )}

      <Modal
        open={
          modalOpen
        }
        title="Create discount"
        onClose={
          closeModal
        }
      >
        <form
          onSubmit={
            createDiscount
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
            <Input
              id="discount-name"
              label="Discount name"
              value={
                form.name
              }
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    name:
                      value
                  })
                )
              }
            />

            <Input
              id="discount-code"
              label="Code"
              value={
                form.code
              }
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    code:
                      value.toUpperCase()
                  })
                )
              }
              placeholder="e.g. SENIOR10"
            />

            <FormField
              id="discount-type"
              label="Discount type"
            >
              {() => (
                <select
                  id="discount-type"
                  value={
                    form.type
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        type:
                          event.target.value
                      })
                    )
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
                >
                  <option value="PERCENTAGE">
                    Percentage
                  </option>

                  <option value="FIXED_AMOUNT">
                    Fixed amount
                  </option>
                </select>
              )}
            </FormField>

            <Input
              id="discount-value"
              label={
                form.type ===
                "PERCENTAGE"
                  ? "Percentage"
                  : "Amount"
              }
              type="number"
              min="0.01"
              step="0.01"
              value={
                form.value
              }
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    value
                  })
                )
              }
            />

            <Input
              id="discount-minimum"
              label="Minimum booking amount"
              type="number"
              min="0"
              step="0.01"
              value={
                form.minimumAmount
              }
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    minimumAmount:
                      value
                  })
                )
              }
            />

            <Input
              id="discount-start"
              label="Start date"
              type="date"
              value={
                form.startDate
              }
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    startDate:
                      value
                  })
                )
              }
            />

            <Input
              id="discount-end"
              label="End date"
              type="date"
              value={
                form.endDate
              }
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    endDate:
                      value
                  })
                )
              }
            />
          </div>

          <FormField
            id="discount-description"
            label="Description"
          >
            {() => (
              <textarea
                id="discount-description"
                rows="3"
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
                className="w-full resize-none rounded-xl border border-forest-900/15 px-3 py-2.5"
              />
            )}
          </FormField>

          <label className="flex items-center gap-3 rounded-xl bg-mist p-4 text-sm font-medium">
            <input
              type="checkbox"
              checked={
                form.customerVisible
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    customerVisible:
                      event.target.checked
                  })
                )
              }
            />

            Customer-visible
          </label>

          <label className="flex items-center gap-3 rounded-xl bg-mist p-4 text-sm font-medium">
            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(
                event
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    isActive:
                      event.target.checked
                  })
                )
              }
            />

            Active
          </label>

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
                ? "Creating..."
                : "Create discount"}
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
              event.target.value
            )
          }
          className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
          {...props}
        />
      )}
    </FormField>
  );
}