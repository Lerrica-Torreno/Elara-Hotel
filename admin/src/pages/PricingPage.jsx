import {
  useMemo,
  useState
} from "react";

import {
  BadgePercent,
  Plus,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";

import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";

import {
  calculateDynamicRate
} from "../utils/pricing";

import {
  formatCurrency
} from "../utils/format";

export default function PricingPage({
  pricingRules,
  setPricingRules,
  discounts,
  setDiscounts,
  promotions,
  setPromotions
}) {
  const [
    tab,
    setTab
  ] = useState(
    "Dynamic Pricing"
  );

  const [
    discountModal,
    setDiscountModal
  ] = useState(false);

  const [
    promotionModal,
    setPromotionModal
  ] = useState(false);

  const [
    calculator,
    setCalculator
  ] = useState({
    date: "",
    occupancyRate: 0,
    isHoliday: false,
    roomTypeAdjustmentPercent: 0,
    daysBeforeArrival: 0
  });

  const result =
    useMemo(
      () =>
        calculateDynamicRate({
          rules:
            pricingRules,

          ...calculator
        }),
      [
        pricingRules,
        calculator
      ]
    );

  return (
    <>
      <PageHeader
        eyebrow="Revenue management"
        title="Pricing & Promotions"
        description="Configure dynamic room pricing, discount rules, and promotional offers without overcrowding the workspace."
      />

      <div className="mb-6 inline-flex rounded-2xl border border-forest-900/10 bg-white p-1 shadow-soft">
        {[
          "Dynamic Pricing",
          "Discounts",
          "Promotions"
        ].map(
          (
            item
          ) => (
            <button
              key={
                item
              }
              type="button"
              onClick={() =>
                setTab(
                  item
                )
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab ===
                item
                  ? "bg-forest-900 text-white"
                  : "text-forest-900/55 hover:bg-mist"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {tab ===
        "Dynamic Pricing" && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card
            title="Pricing rules"
            subtitle="Core rules applied by the room-rate calculator"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberSetting
                id="pricing-base"
                label="Normal rate"
                value={
                  pricingRules.baseRate
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    baseRate:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-weekend"
                label="Weekend rate"
                value={
                  pricingRules.weekendRate
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    weekendRate:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-occupancy"
                label="High occupancy rate"
                value={
                  pricingRules.highOccupancyRate
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    highOccupancyRate:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-holiday"
                label="Holiday rate"
                value={
                  pricingRules.holidayRate
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    holidayRate:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-threshold"
                label="High occupancy threshold (%)"
                value={
                  pricingRules.highOccupancyThreshold
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    highOccupancyThreshold:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-season"
                label="Season multiplier"
                step="0.05"
                value={
                  pricingRules.seasonMultiplier
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    seasonMultiplier:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-history"
                label="Historical demand multiplier"
                step="0.05"
                value={
                  pricingRules.historicalDemandMultiplier
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    historicalDemandMultiplier:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-early-days"
                label="Early booking days"
                value={
                  pricingRules.earlyBirdDays
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    earlyBirdDays:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-early-discount"
                label="Early booking discount (%)"
                value={
                  pricingRules.earlyBirdDiscountPercent
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    earlyBirdDiscountPercent:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-last-days"
                label="Last-minute days"
                value={
                  pricingRules.lastMinuteDays
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    lastMinuteDays:
                      value
                  })
                }
              />

              <NumberSetting
                id="pricing-last-markup"
                label="Last-minute markup (%)"
                value={
                  pricingRules.lastMinuteMarkupPercent
                }
                onChange={(
                  value
                ) =>
                  setPricingRules({
                    ...pricingRules,
                    lastMinuteMarkupPercent:
                      value
                  })
                }
              />
            </div>
          </Card>

          <Card
            title="Rate calculator"
            subtitle="Preview the rate produced by the current rules"
          >
            <div className="space-y-4">
              <FormField
                id="calculator-date"
                label="Stay date"
              >
                {() => (
                  <input
                    id="calculator-date"
                    type="date"
                    value={
                      calculator.date
                    }
                    onChange={(
                      event
                    ) =>
                      setCalculator({
                        ...calculator,
                        date:
                          event
                            .target
                            .value
                      })
                    }
                    className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5"
                  />
                )}
              </FormField>

              <NumberSetting
                id="calculator-occupancy"
                label="Occupancy (%)"
                value={
                  calculator.occupancyRate
                }
                onChange={(
                  value
                ) =>
                  setCalculator({
                    ...calculator,
                    occupancyRate:
                      value
                  })
                }
              />

              <NumberSetting
                id="calculator-room-adjustment"
                label="Room type adjustment (%)"
                value={
                  calculator.roomTypeAdjustmentPercent
                }
                onChange={(
                  value
                ) =>
                  setCalculator({
                    ...calculator,
                    roomTypeAdjustmentPercent:
                      value
                  })
                }
              />

              <NumberSetting
                id="calculator-lead"
                label="Days before arrival"
                value={
                  calculator.daysBeforeArrival
                }
                onChange={(
                  value
                ) =>
                  setCalculator({
                    ...calculator,
                    daysBeforeArrival:
                      value
                  })
                }
              />

              <label className="flex items-center gap-3 rounded-xl border border-forest-900/10 p-4">
                <input
                  type="checkbox"
                  checked={
                    calculator.isHoliday
                  }
                  onChange={(
                    event
                  ) =>
                    setCalculator({
                      ...calculator,
                      isHoliday:
                        event
                          .target
                          .checked
                    })
                  }
                />

                <span className="text-sm font-semibold">
                  Holiday / special date
                </span>
              </label>
            </div>

            <div className="mt-6 rounded-2xl bg-mist p-5">
              <div className="flex items-center gap-3">
                <Sparkles
                  size={19}
                  className="text-gold"
                />

                <p className="text-sm font-semibold">
                  Calculated nightly rate
                </p>
              </div>

              <p className="mt-3 text-3xl font-bold text-forest-950">
                {formatCurrency(
                  result.rate
                )}
              </p>

              <div className="mt-4 space-y-2">
                {result.reasons.map(
                  (
                    reason,
                    index
                  ) => (
                    <div
                      key={`${reason.label}-${index}`}
                      className="flex justify-between gap-4 text-xs text-forest-900/50"
                    >
                      <span>
                        {
                          reason.label
                        }
                      </span>

                      <span>
                        {formatCurrency(
                          reason.value
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab ===
        "Discounts" && (
        <RulesSection
          icon={
            BadgePercent
          }
          items={
            discounts
          }
          title="No discount rules"
          description="Create controlled discounts that can later be applied to eligible reservations."
          actionLabel="Add discount"
          onAdd={() =>
            setDiscountModal(
              true
            )
          }
        />
      )}

      {tab ===
        "Promotions" && (
        <RulesSection
          icon={
            SlidersHorizontal
          }
          items={
            promotions
          }
          title="No promotions"
          description="Promotional campaigns will appear here when created."
          actionLabel="Add promotion"
          onAdd={() =>
            setPromotionModal(
              true
            )
          }
        />
      )}

      <RuleModal
        open={
          discountModal
        }
        title="Add discount"
        onClose={() =>
          setDiscountModal(
            false
          )
        }
        onSave={(
          rule
        ) => {
          setDiscounts(
            (
              current
            ) => [
              rule,
              ...current
            ]
          );

          setDiscountModal(
            false
          );
        }}
      />

      <RuleModal
        open={
          promotionModal
        }
        title="Add promotion"
        onClose={() =>
          setPromotionModal(
            false
          )
        }
        onSave={(
          rule
        ) => {
          setPromotions(
            (
              current
            ) => [
              rule,
              ...current
            ]
          );

          setPromotionModal(
            false
          );
        }}
      />
    </>
  );
}

function NumberSetting({
  id,
  label,
  value,
  onChange,
  step = "1"
}) {
  return (
    <FormField
      id={id}
      label={label}
    >
      {() => (
        <input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              Number(
                event
                  .target
                  .value
              )
            )
          }
          className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5"
        />
      )}
    </FormField>
  );
}

function RulesSection({
  icon,
  items,
  title,
  description,
  actionLabel,
  onAdd
}) {
  const Icon =
    icon;

  return (
    <Card className="!p-0">
      {!items.length ? (
        <EmptyState
          icon={Icon}
          title={title}
          description={
            description
          }
          actionLabel={
            actionLabel
          }
          onAction={
            onAdd
          }
        />
      ) : (
        <>
          <div className="flex justify-end border-b border-forest-900/10 p-4">
            <button
              type="button"
              onClick={
                onAdd
              }
              className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus
                size={16}
              />

              {actionLabel}
            </button>
          </div>

          <div className="divide-y divide-forest-900/10">
            {items.map(
              (
                item
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-semibold">
                      {
                        item.name
                      }
                    </p>

                    <p className="mt-1 text-sm text-forest-900/50">
                      {
                        item.value
                      }
                      % adjustment
                    </p>
                  </div>

                  <Badge
                    tone={
                      item.active
                        ? "green"
                        : "gray"
                    }
                  >
                    {item.active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
              )
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function RuleModal({
  open,
  title,
  onClose,
  onSave
}) {
  const [
    name,
    setName
  ] = useState("");

  const [
    value,
    setValue
  ] = useState("");

  function submit(
    event
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !value
    ) {
      return;
    }

    onSave({
      id:
        crypto.randomUUID?.() ??
        String(
          Date.now()
        ),

      name:
        name.trim(),

      value:
        Number(
          value
        ),

      active: true
    });

    setName("");
    setValue("");
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={
        onClose
      }
    >
      <form
        onSubmit={
          submit
        }
        className="space-y-5"
      >
        <FormField
          id={`${title}-name`}
          label="Name"
        >
          {() => (
            <input
              id={`${title}-name`}
              value={
                name
              }
              onChange={(
                event
              ) =>
                setName(
                  event
                    .target
                    .value
                )
              }
              className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5"
            />
          )}
        </FormField>

        <FormField
          id={`${title}-value`}
          label="Percentage (%)"
        >
          {() => (
            <input
              id={`${title}-value`}
              type="number"
              min="0"
              value={
                value
              }
              onChange={(
                event
              ) =>
                setValue(
                  event
                    .target
                    .value
                )
              }
              className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5"
            />
          )}
        </FormField>

        <button className="w-full rounded-xl bg-forest-900 px-4 py-3 font-semibold text-white">
          Save
        </button>
      </form>
    </Modal>
  );
}