import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BadgePercent,
  CalendarDays,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
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

const pricingTypes = [
  {
    value: "WEEKEND",
    label: "Weekend"
  },
  {
    value: "OCCUPANCY",
    label: "Occupancy"
  },
  {
    value: "SEASON",
    label: "Season"
  },
  {
    value: "HOLIDAY",
    label: "Holiday"
  },
  {
    value: "HISTORICAL_DEMAND",
    label: "Historical Demand"
  },
  {
    value: "ROOM_TYPE",
    label: "Room Type"
  },
  {
    value: "LEAD_TIME",
    label: "Lead Time"
  }
];

const initialPricingForm = {
  name: "",
  type: "WEEKEND",
  roomTypeId: "",
  priority: 100,
  adjustmentType: "PERCENT",
  adjustmentValue: "",
  startDate: "",
  endDate: "",
  minOccupancy: "",
  maxOccupancy: "",
  minLeadDays: "",
  maxLeadDays: "",
  demandLevel: "",
  isActive: true
};

const initialPromotionForm = {
  name: "",
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minSpend: "",
  maxDiscount: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  isActive: true
};

function pricingTypeLabel(type) {
  return (
    pricingTypes.find(
      (item) =>
        item.value ===
        type
    )?.label ??
    type
  );
}

function normalizePricingRule(rule) {
  return {
    id:
      rule.id,

    name:
      rule.name,

    type:
      rule.type,

    roomTypeId:
      rule.roomTypeId,

    roomType:
      rule.roomType?.name ??
      null,

    priority:
      Number(
        rule.priority ??
          100
      ),

    isActive:
      Boolean(
        rule.isActive
      ),

    startDate:
      rule.startDate
        ? String(
            rule.startDate
          ).slice(0, 10)
        : "",

    endDate:
      rule.endDate
        ? String(
            rule.endDate
          ).slice(0, 10)
        : "",

    dayOfWeek:
      rule.dayOfWeek,

    minOccupancy:
      rule.minOccupancy == null
        ? null
        : Number(
            rule.minOccupancy
          ),

    maxOccupancy:
      rule.maxOccupancy == null
        ? null
        : Number(
            rule.maxOccupancy
          ),

    minLeadDays:
      rule.minLeadDays,

    maxLeadDays:
      rule.maxLeadDays,

    demandLevel:
      rule.demandLevel,

    fixedRate:
      rule.fixedRate == null
        ? null
        : Number(
            rule.fixedRate
          ),

    adjustmentPct:
      rule.adjustmentPct == null
        ? null
        : Number(
            rule.adjustmentPct
          ),

    adjustmentAmt:
      rule.adjustmentAmt == null
        ? null
        : Number(
            rule.adjustmentAmt
          )
  };
}

function normalizePromotion(item) {
  return {
    id:
      item.id,

    code:
      item.code,

    name:
      item.name,

    description:
      item.description ?? "",

    type:
      item.type,

    value:
      Number(
        item.value ??
          0
      ),

    minSpend:
      item.minSpend == null
        ? null
        : Number(
            item.minSpend
          ),

    maxDiscount:
      item.maxDiscount == null
        ? null
        : Number(
            item.maxDiscount
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

    usageLimit:
      item.usageLimit,

    usageCount:
      Number(
        item.usageCount ??
          0
      ),

    isActive:
      Boolean(
        item.isActive
      )
  };
}

function ruleValue(rule) {
  if (
    rule.fixedRate != null
  ) {
    return formatCurrency(
      rule.fixedRate
    );
  }

  if (
    rule.adjustmentPct != null
  ) {
    const prefix =
      rule.adjustmentPct >
      0
        ? "+"
        : "";

    return `${prefix}${rule.adjustmentPct}%`;
  }

  if (
    rule.adjustmentAmt != null
  ) {
    const prefix =
      rule.adjustmentAmt >
      0
        ? "+"
        : "";

    return `${prefix}${formatCurrency(
      rule.adjustmentAmt
    )}`;
  }

  return "No adjustment";
}

function promotionValue(
  promotion
) {
  if (
    promotion.type ===
    "PERCENTAGE"
  ) {
    return `${promotion.value}%`;
  }

  return formatCurrency(
    promotion.value
  );
}

export default function DynamicPricingPage() {
  const [
    activeTab,
    setActiveTab
  ] = useState(
    "pricing"
  );

  const [
    pricingRules,
    setPricingRules
  ] = useState([]);

  const [
    promotions,
    setPromotions
  ] = useState([]);

  const [
    roomTypes,
    setRoomTypes
  ] = useState([]);

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
    pricingModalOpen,
    setPricingModalOpen
  ] = useState(false);

  const [
    promotionModalOpen,
    setPromotionModalOpen
  ] = useState(false);

  const [
    pricingForm,
    setPricingForm
  ] = useState(
    initialPricingForm
  );

  const [
    promotionForm,
    setPromotionForm
  ] = useState(
    initialPromotionForm
  );

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    deletingRuleId,
    setDeletingRuleId
  ] = useState(null);

  async function loadData(
    showRefreshing = false
  ) {
    try {
      if (
        showRefreshing
      ) {
        setRefreshing(true);
      }

      setError("");

      const [
        pricingResponse,
        promotionResponse,
        roomTypeResponse
      ] =
        await Promise.all([
          api.pricingRules.list(),
          api.promotions.list(),
          api.roomTypes.list()
        ]);

      setPricingRules(
        (
          pricingResponse?.pricingRules ??
          []
        ).map(
          normalizePricingRule
        )
      );

      setPromotions(
        (
          promotionResponse?.promotions ??
          []
        ).map(
          normalizePromotion
        )
      );

      setRoomTypes(
        roomTypeResponse?.roomTypes ??
          []
      );
    } catch (
      loadProblem
    ) {
      setError(
        loadProblem.message ||
          "Unable to load pricing and promotion data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activePricingRules =
    useMemo(
      () =>
        pricingRules.filter(
          (rule) =>
            rule.isActive
        ),
      [
        pricingRules
      ]
    );

  const activePromotions =
    useMemo(
      () =>
        promotions.filter(
          (
            promotion
          ) =>
            promotion.isActive
        ),
      [
        promotions
      ]
    );

  function openPricingModal() {
    setPricingForm(
      initialPricingForm
    );

    setError("");

    setPricingModalOpen(
      true
    );
  }

  function closePricingModal() {
    if (
      submitting
    ) {
      return;
    }

    setPricingModalOpen(
      false
    );

    setPricingForm(
      initialPricingForm
    );

    setError("");
  }

  function openPromotionModal() {
    setPromotionForm(
      initialPromotionForm
    );

    setError("");

    setPromotionModalOpen(
      true
    );
  }

  function closePromotionModal() {
    if (
      submitting
    ) {
      return;
    }

    setPromotionModalOpen(
      false
    );

    setPromotionForm(
      initialPromotionForm
    );

    setError("");
  }

  async function createPricingRule(
    event
  ) {
    event.preventDefault();

    if (
      !pricingForm.name.trim() ||
      !pricingForm.adjustmentValue
    ) {
      setError(
        "Rule name and adjustment value are required."
      );

      return;
    }

    if (
      pricingForm.startDate &&
      pricingForm.endDate &&
      pricingForm.endDate <
        pricingForm.startDate
    ) {
      setError(
        "End date must be on or after the start date."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name:
          pricingForm.name.trim(),

        type:
          pricingForm.type,

        roomTypeId:
          pricingForm.roomTypeId ||
          null,

        priority:
          Number(
            pricingForm.priority
          ),

        isActive:
          pricingForm.isActive,

        startDate:
          pricingForm.startDate ||
          undefined,

        endDate:
          pricingForm.endDate ||
          undefined
      };

      if (
        pricingForm.adjustmentType ===
        "PERCENT"
      ) {
        payload.adjustmentPct =
          Number(
            pricingForm.adjustmentValue
          );
      }

      if (
        pricingForm.adjustmentType ===
        "AMOUNT"
      ) {
        payload.adjustmentAmt =
          Number(
            pricingForm.adjustmentValue
          );
      }

      if (
        pricingForm.adjustmentType ===
        "FIXED"
      ) {
        payload.fixedRate =
          Number(
            pricingForm.adjustmentValue
          );
      }

      if (
        pricingForm.type ===
        "OCCUPANCY"
      ) {
        payload.minOccupancy =
          pricingForm.minOccupancy
            ? Number(
                pricingForm.minOccupancy
              )
            : null;

        payload.maxOccupancy =
          pricingForm.maxOccupancy
            ? Number(
                pricingForm.maxOccupancy
              )
            : null;
      }

      if (
        pricingForm.type ===
        "LEAD_TIME"
      ) {
        payload.minLeadDays =
          pricingForm.minLeadDays
            ? Number(
                pricingForm.minLeadDays
              )
            : null;

        payload.maxLeadDays =
          pricingForm.maxLeadDays
            ? Number(
                pricingForm.maxLeadDays
              )
            : null;
      }

      if (
        pricingForm.type ===
        "HISTORICAL_DEMAND"
      ) {
        payload.demandLevel =
          pricingForm.demandLevel ||
          null;
      }

      await api.pricingRules.create(
        payload
      );

      await loadData();

      setPricingModalOpen(
        false
      );

      setPricingForm(
        initialPricingForm
      );
    } catch (
      createProblem
    ) {
      setError(
        createProblem.message ||
          "Unable to create pricing rule."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePricingRule(
    rule
  ) {
    try {
      setError("");

      await api.pricingRules.update(
        rule.id,
        {
          isActive:
            !rule.isActive
        }
      );

      await loadData();
    } catch (
      updateProblem
    ) {
      setError(
        updateProblem.message ||
          "Unable to update pricing rule."
      );
    }
  }

  async function deletePricingRule(
    rule
  ) {
    if (
      !window.confirm(
        `Delete ${rule.name}?`
      )
    ) {
      return;
    }

    try {
      setDeletingRuleId(
        rule.id
      );

      setError("");

      await api.pricingRules.remove(
        rule.id
      );

      await loadData();
    } catch (
      deleteProblem
    ) {
      setError(
        deleteProblem.message ||
          "Unable to delete pricing rule."
      );
    } finally {
      setDeletingRuleId(
        null
      );
    }
  }

  async function createPromotion(
    event
  ) {
    event.preventDefault();

    if (
      !promotionForm.name.trim() ||
      !promotionForm.code.trim() ||
      !promotionForm.value ||
      !promotionForm.startDate ||
      !promotionForm.endDate
    ) {
      setError(
        "Name, code, value, start date and end date are required."
      );

      return;
    }

    if (
      promotionForm.endDate <
      promotionForm.startDate
    ) {
      setError(
        "Promotion end date must be on or after the start date."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.promotions.create({
        name:
          promotionForm.name.trim(),

        code:
          promotionForm.code
            .trim()
            .toUpperCase(),

        description:
          promotionForm.description
            .trim() ||
          undefined,

        type:
          promotionForm.type,

        value:
          Number(
            promotionForm.value
          ),

        minSpend:
          promotionForm.minSpend
            ? Number(
                promotionForm.minSpend
              )
            : null,

        maxDiscount:
          promotionForm.maxDiscount
            ? Number(
                promotionForm.maxDiscount
              )
            : null,

        startDate:
          promotionForm.startDate,

        endDate:
          promotionForm.endDate,

        usageLimit:
          promotionForm.usageLimit
            ? Number(
                promotionForm.usageLimit
              )
            : null,

        isActive:
          promotionForm.isActive
      });

      await loadData();

      setPromotionModalOpen(
        false
      );

      setPromotionForm(
        initialPromotionForm
      );
    } catch (
      createProblem
    ) {
      setError(
        createProblem.message ||
          "Unable to create promotion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePromotion(
    promotion
  ) {
    try {
      setError("");

      await api.promotions.update(
        promotion.id,
        {
          isActive:
            !promotion.isActive
        }
      );

      await loadData();
    } catch (
      updateProblem
    ) {
      setError(
        updateProblem.message ||
          "Unable to update promotion."
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Revenue Management"
        title="Pricing & Promotions"
        description="Manage hotel pricing rules and promotional offers from one revenue-management workspace."
        action={
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

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pricing rules"
          value={
            pricingRules.length
          }
          caption={`${activePricingRules.length} active`}
          icon={
            SlidersHorizontal
          }
        />

        <SummaryCard
          label="Promotions"
          value={
            promotions.length
          }
          caption={`${activePromotions.length} active`}
          icon={
            Sparkles
          }
        />

        <SummaryCard
          label="Room types"
          value={
            roomTypes.length
          }
          caption="Available for rule targeting"
          icon={
            CalendarDays
          }
        />

        <SummaryCard
          label="Revenue controls"
          value={
            activePricingRules.length +
            activePromotions.length
          }
          caption="Currently enabled"
          icon={
            BadgePercent
          }
        />
      </section>

      {/* TABS */}
      <div className="mb-6 inline-flex rounded-2xl border border-forest-900/10 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "pricing"
            )
          }
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            activeTab ===
            "pricing"
              ? "bg-forest-900 text-white"
              : "text-forest-900/55 hover:bg-mist"
          }`}
        >
          Pricing rules
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "promotions"
            )
          }
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            activeTab ===
            "promotions"
              ? "bg-forest-900 text-white"
              : "text-forest-900/55 hover:bg-mist"
          }`}
        >
          Promotions
        </button>
      </div>

      {loading ? (
        <Card>
          <p className="py-12 text-center text-sm font-semibold text-forest-900/50">
            Loading revenue rules...
          </p>
        </Card>
      ) : activeTab ===
        "pricing" ? (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={
                openPricingModal
              }
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus
                size={17}
              />

              New pricing rule
            </button>
          </div>

          {!pricingRules.length ? (
            <Card>
              <EmptyState
                icon={
                  SlidersHorizontal
                }
                title="No pricing rules"
                description="Create backend pricing rules for weekends, occupancy, holidays, room types, lead time, and other rate factors."
                actionLabel="Create pricing rule"
                onAction={
                  openPricingModal
                }
              />
            </Card>
          ) : (
            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {pricingRules.map(
                (
                  rule
                ) => (
                  <article
                    key={
                      rule.id
                    }
                    className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                          {pricingTypeLabel(
                            rule.type
                          )}
                        </p>

                        <h2 className="mt-2 font-semibold text-forest-950">
                          {
                            rule.name
                          }
                        </h2>
                      </div>

                      <Badge
                        tone={
                          rule.isActive
                            ? "green"
                            : "gray"
                        }
                      >
                        {rule.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>

                    <p className="mt-5 text-3xl font-bold text-forest-950">
                      {ruleValue(
                        rule
                      )}
                    </p>

                    {rule.roomType && (
                      <p className="mt-2 text-sm text-forest-900/55">
                        {
                          rule.roomType
                        }
                      </p>
                    )}

                    {(rule.startDate ||
                      rule.endDate) && (
                      <p className="mt-3 text-xs text-forest-900/45">
                        Valid:{" "}
                        {rule.startDate ||
                          "Any"}

                        {" → "}

                        {rule.endDate ||
                          "No expiry"}
                      </p>
                    )}

                    {rule.minOccupancy !=
                      null && (
                      <p className="mt-2 text-xs text-forest-900/45">
                        Occupancy:{" "}
                        {
                          rule.minOccupancy
                        }
                        %
                        {rule.maxOccupancy !=
                        null
                          ? ` – ${rule.maxOccupancy}%`
                          : "+"}
                      </p>
                    )}

                    {rule.minLeadDays !=
                      null && (
                      <p className="mt-2 text-xs text-forest-900/45">
                        Lead time:{" "}
                        {
                          rule.minLeadDays
                        }
                        {rule.maxLeadDays !=
                        null
                          ? ` – ${rule.maxLeadDays} days`
                          : "+ days"}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-forest-900/45">
                      Priority:{" "}
                      {
                        rule.priority
                      }
                    </p>

                    <div className="mt-5 flex gap-2 border-t border-forest-900/10 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          togglePricingRule(
                            rule
                          )
                        }
                        className="flex-1 rounded-xl border border-forest-900/15 px-3 py-2 text-sm font-semibold"
                      >
                        {rule.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingRuleId ===
                          rule.id
                        }
                        onClick={() =>
                          deletePricingRule(
                            rule
                          )
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 disabled:opacity-50"
                        aria-label={`Delete ${rule.name}`}
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
        </>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={
                openPromotionModal
              }
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus
                size={17}
              />

              New promotion
            </button>
          </div>

          {!promotions.length ? (
            <Card>
              <EmptyState
                icon={
                  Sparkles
                }
                title="No promotions"
                description="Create promotional offers that can later be validated and applied during booking."
                actionLabel="Create promotion"
                onAction={
                  openPromotionModal
                }
              />
            </Card>
          ) : (
            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {promotions.map(
                (
                  promotion
                ) => (
                  <article
                    key={
                      promotion.id
                    }
                    className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-forest-950">
                          {
                            promotion.name
                          }
                        </h2>

                        <p className="mt-1 text-xs font-semibold text-gold">
                          {
                            promotion.code
                          }
                        </p>
                      </div>

                      <Badge
                        tone={
                          promotion.isActive
                            ? "green"
                            : "gray"
                        }
                      >
                        {promotion.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>

                    <p className="mt-5 text-3xl font-bold text-forest-950">
                      {promotionValue(
                        promotion
                      )}
                    </p>

                    <p className="mt-2 text-sm text-forest-900/55">
                      {promotion.type ===
                      "PERCENTAGE"
                        ? "Percentage promotion"
                        : "Fixed-amount promotion"}
                    </p>

                    {promotion.description && (
                      <p className="mt-3 text-sm leading-6 text-forest-900/50">
                        {
                          promotion.description
                        }
                      </p>
                    )}

                    <div className="mt-4 space-y-1 text-xs text-forest-900/45">
                      <p>
                        Valid:{" "}
                        {
                          promotion.startDate
                        }

                        {" → "}

                        {
                          promotion.endDate
                        }
                      </p>

                      {promotion.minSpend !=
                        null && (
                        <p>
                          Minimum spend:{" "}
                          {formatCurrency(
                            promotion.minSpend
                          )}
                        </p>
                      )}

                      {promotion.maxDiscount !=
                        null && (
                        <p>
                          Maximum discount:{" "}
                          {formatCurrency(
                            promotion.maxDiscount
                          )}
                        </p>
                      )}

                      {promotion.usageLimit !=
                        null && (
                        <p>
                          Usage:{" "}
                          {
                            promotion.usageCount
                          }

                          {" / "}

                          {
                            promotion.usageLimit
                          }
                        </p>
                      )}
                    </div>

                    <div className="mt-5 border-t border-forest-900/10 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          togglePromotion(
                            promotion
                          )
                        }
                        className="w-full rounded-xl border border-forest-900/15 px-3 py-2 text-sm font-semibold"
                      >
                        {promotion.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </article>
                )
              )}
            </section>
          )}
        </>
      )}

      {/* PRICING RULE MODAL */}
      <Modal
        open={
          pricingModalOpen
        }
        title="Create pricing rule"
        onClose={
          closePricingModal
        }
      >
        <form
          onSubmit={
            createPricingRule
          }
          className="space-y-5"
        >
          {error && (
            <ErrorBox>
              {
                error
              }
            </ErrorBox>
          )}

          <Input
            id="pricing-rule-name"
            label="Rule name"
            value={
              pricingForm.name
            }
            onChange={(
              value
            ) =>
              setPricingForm(
                (
                  current
                ) => ({
                  ...current,
                  name:
                    value
                })
              )
            }
            placeholder="e.g. Weekend Premium"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="pricing-rule-type"
              label="Rule type"
            >
              {() => (
                <select
                  id="pricing-rule-type"
                  value={
                    pricingForm.type
                  }
                  onChange={(
                    event
                  ) =>
                    setPricingForm(
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
                  {pricingTypes.map(
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
              id="pricing-room-type"
              label="Room type"
            >
              {() => (
                <select
                  id="pricing-room-type"
                  value={
                    pricingForm.roomTypeId
                  }
                  onChange={(
                    event
                  ) =>
                    setPricingForm(
                      (
                        current
                      ) => ({
                        ...current,
                        roomTypeId:
                          event.target.value
                      })
                    )
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
                >
                  <option value="">
                    All room types
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
                      </option>
                    )
                  )}
                </select>
              )}
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="adjustment-type"
              label="Adjustment type"
            >
              {() => (
                <select
                  id="adjustment-type"
                  value={
                    pricingForm.adjustmentType
                  }
                  onChange={(
                    event
                  ) =>
                    setPricingForm(
                      (
                        current
                      ) => ({
                        ...current,
                        adjustmentType:
                          event.target.value
                      })
                    )
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
                >
                  <option value="PERCENT">
                    Percentage
                  </option>

                  <option value="AMOUNT">
                    Amount adjustment
                  </option>

                  <option value="FIXED">
                    Fixed nightly rate
                  </option>
                </select>
              )}
            </FormField>

            <Input
              id="adjustment-value"
              label={
                pricingForm.adjustmentType ===
                "PERCENT"
                  ? "Percentage adjustment"
                  : pricingForm.adjustmentType ===
                      "FIXED"
                    ? "Fixed nightly rate"
                    : "Amount adjustment"
              }
              type="number"
              step="0.01"
              value={
                pricingForm.adjustmentValue
              }
              onChange={(
                value
              ) =>
                setPricingForm(
                  (
                    current
                  ) => ({
                    ...current,
                    adjustmentValue:
                      value
                  })
                )
              }
              placeholder={
                pricingForm.adjustmentType ===
                "PERCENT"
                  ? "e.g. 15 or -10"
                  : "e.g. 500"
              }
            />
          </div>

          {pricingForm.type ===
            "OCCUPANCY" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="minimum-occupancy"
                label="Minimum occupancy %"
                type="number"
                min="0"
                max="100"
                value={
                  pricingForm.minOccupancy
                }
                onChange={(
                  value
                ) =>
                  setPricingForm(
                    (
                      current
                    ) => ({
                      ...current,
                      minOccupancy:
                        value
                    })
                  )
                }
              />

              <Input
                id="maximum-occupancy"
                label="Maximum occupancy %"
                type="number"
                min="0"
                max="100"
                value={
                  pricingForm.maxOccupancy
                }
                onChange={(
                  value
                ) =>
                  setPricingForm(
                    (
                      current
                    ) => ({
                      ...current,
                      maxOccupancy:
                        value
                    })
                  )
                }
              />
            </div>
          )}

          {pricingForm.type ===
            "LEAD_TIME" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="minimum-lead"
                label="Minimum lead days"
                type="number"
                min="0"
                value={
                  pricingForm.minLeadDays
                }
                onChange={(
                  value
                ) =>
                  setPricingForm(
                    (
                      current
                    ) => ({
                      ...current,
                      minLeadDays:
                        value
                    })
                  )
                }
              />

              <Input
                id="maximum-lead"
                label="Maximum lead days"
                type="number"
                min="0"
                value={
                  pricingForm.maxLeadDays
                }
                onChange={(
                  value
                ) =>
                  setPricingForm(
                    (
                      current
                    ) => ({
                      ...current,
                      maxLeadDays:
                        value
                    })
                  )
                }
              />
            </div>
          )}

          {pricingForm.type ===
            "HISTORICAL_DEMAND" && (
            <FormField
              id="demand-level"
              label="Demand level"
            >
              {() => (
                <select
                  id="demand-level"
                  value={
                    pricingForm.demandLevel
                  }
                  onChange={(
                    event
                  ) =>
                    setPricingForm(
                      (
                        current
                      ) => ({
                        ...current,
                        demandLevel:
                          event.target.value
                      })
                    )
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5"
                >
                  <option value="">
                    Select demand
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                  <option value="NORMAL">
                    Normal
                  </option>

                  <option value="HIGH">
                    High
                  </option>
                </select>
              )}
            </FormField>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="pricing-start-date"
              label="Start date"
              type="date"
              value={
                pricingForm.startDate
              }
              onChange={(
                value
              ) =>
                setPricingForm(
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
              id="pricing-end-date"
              label="End date"
              type="date"
              value={
                pricingForm.endDate
              }
              onChange={(
                value
              ) =>
                setPricingForm(
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

            <Input
              id="pricing-priority"
              label="Priority"
              type="number"
              min="1"
              value={
                pricingForm.priority
              }
              onChange={(
                value
              ) =>
                setPricingForm(
                  (
                    current
                  ) => ({
                    ...current,
                    priority:
                      value
                  })
                )
              }
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-mist p-4 text-sm font-medium">
            <input
              type="checkbox"
              checked={
                pricingForm.isActive
              }
              onChange={(
                event
              ) =>
                setPricingForm(
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

          <ModalActions
            submitting={
              submitting
            }
            onCancel={
              closePricingModal
            }
            submitLabel="Create pricing rule"
          />
        </form>
      </Modal>

      {/* PROMOTION MODAL */}
      <Modal
        open={
          promotionModalOpen
        }
        title="Create promotion"
        onClose={
          closePromotionModal
        }
      >
        <form
          onSubmit={
            createPromotion
          }
          className="space-y-5"
        >
          {error && (
            <ErrorBox>
              {
                error
              }
            </ErrorBox>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="promotion-name"
              label="Promotion name"
              value={
                promotionForm.name
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
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
              id="promotion-code"
              label="Promotion code"
              value={
                promotionForm.code
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
                  (
                    current
                  ) => ({
                    ...current,
                    code:
                      value.toUpperCase()
                  })
                )
              }
              placeholder="e.g. WEEKEND20"
            />

            <FormField
              id="promotion-type"
              label="Promotion type"
            >
              {() => (
                <select
                  id="promotion-type"
                  value={
                    promotionForm.type
                  }
                  onChange={(
                    event
                  ) =>
                    setPromotionForm(
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
              id="promotion-value"
              label="Discount value"
              type="number"
              min="0.01"
              step="0.01"
              value={
                promotionForm.value
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
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
              id="promotion-min-spend"
              label="Minimum spend"
              type="number"
              min="0"
              step="0.01"
              value={
                promotionForm.minSpend
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
                  (
                    current
                  ) => ({
                    ...current,
                    minSpend:
                      value
                  })
                )
              }
            />

            <Input
              id="promotion-max-discount"
              label="Maximum discount"
              type="number"
              min="0"
              step="0.01"
              value={
                promotionForm.maxDiscount
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
                  (
                    current
                  ) => ({
                    ...current,
                    maxDiscount:
                      value
                  })
                )
              }
            />

            <Input
              id="promotion-start-date"
              label="Start date"
              type="date"
              value={
                promotionForm.startDate
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
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
              id="promotion-end-date"
              label="End date"
              type="date"
              value={
                promotionForm.endDate
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
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

            <Input
              id="promotion-usage-limit"
              label="Usage limit"
              type="number"
              min="1"
              value={
                promotionForm.usageLimit
              }
              onChange={(
                value
              ) =>
                setPromotionForm(
                  (
                    current
                  ) => ({
                    ...current,
                    usageLimit:
                      value
                  })
                )
              }
            />
          </div>

          <FormField
            id="promotion-description"
            label="Description"
          >
            {() => (
              <textarea
                id="promotion-description"
                rows="3"
                value={
                  promotionForm.description
                }
                onChange={(
                  event
                ) =>
                  setPromotionForm(
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
                promotionForm.isActive
              }
              onChange={(
                event
              ) =>
                setPromotionForm(
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

          <ModalActions
            submitting={
              submitting
            }
            onCancel={
              closePromotionModal
            }
            submitLabel="Create promotion"
          />
        </form>
      </Modal>
    </>
  );
}

function SummaryCard({
  label,
  value,
  caption,
  icon: Icon
}) {
  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-forest-900/40">
            {
              label
            }
          </p>

          <p className="mt-3 text-3xl font-bold text-forest-950">
            {
              value
            }
          </p>

          <p className="mt-1 text-xs text-forest-900/45">
            {
              caption
            }
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist text-forest-900/55">
          <Icon
            size={20}
          />
        </div>
      </div>
    </article>
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

function ErrorBox({
  children
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {
        children
      }
    </div>
  );
}

function ModalActions({
  submitting,
  onCancel,
  submitLabel
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-forest-900/10 pt-5">
      <button
        type="button"
        onClick={
          onCancel
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
          : submitLabel}
      </button>
    </div>
  );
}