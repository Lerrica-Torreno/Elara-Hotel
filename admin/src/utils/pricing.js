export function calculateDynamicRate({
  rules,
  date,
  occupancyRate = 0,
  isHoliday = false,
  roomTypeAdjustmentPercent = 0,
  daysBeforeArrival = 0
}) {
  const targetDate =
    date
      ? new Date(
          `${date}T00:00:00`
        )
      : new Date();

  const day =
    targetDate.getDay();

  const weekend =
    day === 0 ||
    day === 6;

  let rate =
    Number(
      rules.baseRate ||
        0
    );

  const reasons = [
    {
      label:
        "Base rate",

      value:
        rate
    }
  ];

  if (
    weekend &&
    Number(
      rules.weekendRate
    ) >
      rate
  ) {
    rate =
      Number(
        rules.weekendRate
      );

    reasons.push({
      label:
        "Weekend rate",

      value:
        rate
    });
  }

  if (
    Number(
      occupancyRate
    ) >=
      Number(
        rules.highOccupancyThreshold
      ) &&
    Number(
      rules.highOccupancyRate
    ) >
      rate
  ) {
    rate =
      Number(
        rules.highOccupancyRate
      );

    reasons.push({
      label:
        "High occupancy rate",

      value:
        rate
    });
  }

  if (
    isHoliday &&
    Number(
      rules.holidayRate
    ) >
      rate
  ) {
    rate =
      Number(
        rules.holidayRate
      );

    reasons.push({
      label:
        "Holiday rate",

      value:
        rate
    });
  }

  const seasonMultiplier =
    Number(
      rules.seasonMultiplier ||
        1
    );

  if (
    seasonMultiplier !==
    1
  ) {
    rate *=
      seasonMultiplier;

    reasons.push({
      label:
        "Season adjustment",

      value:
        rate
    });
  }

  const historicalMultiplier =
    Number(
      rules.historicalDemandMultiplier ||
        1
    );

  if (
    historicalMultiplier !==
    1
  ) {
    rate *=
      historicalMultiplier;

    reasons.push({
      label:
        "Historical demand",

      value:
        rate
    });
  }

  if (
    Number(
      roomTypeAdjustmentPercent
    )
  ) {
    rate *=
      1 +
      Number(
        roomTypeAdjustmentPercent
      ) /
        100;

    reasons.push({
      label:
        "Room type adjustment",

      value:
        rate
    });
  }

  const earlyBirdDays =
    Number(
      rules.earlyBirdDays ||
        0
    );

  const earlyBirdDiscount =
    Number(
      rules.earlyBirdDiscountPercent ||
        0
    );

  if (
    earlyBirdDays &&
    daysBeforeArrival >=
      earlyBirdDays &&
    earlyBirdDiscount >
      0
  ) {
    rate *=
      1 -
      earlyBirdDiscount /
        100;

    reasons.push({
      label:
        "Early booking discount",

      value:
        rate
    });
  }

  const lastMinuteDays =
    Number(
      rules.lastMinuteDays ||
        0
    );

  const lastMinuteMarkup =
    Number(
      rules.lastMinuteMarkupPercent ||
        0
    );

  if (
    daysBeforeArrival <=
      lastMinuteDays &&
    lastMinuteMarkup >
      0
  ) {
    rate *=
      1 +
      lastMinuteMarkup /
        100;

    reasons.push({
      label:
        "Short lead-time adjustment",

      value:
        rate
    });
  }

  return {
    rate:
      Math.round(rate),

    reasons
  };
}