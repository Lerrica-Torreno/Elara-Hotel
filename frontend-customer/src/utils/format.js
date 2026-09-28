export function formatCurrency(value) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return "₱0";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return null;
    }

    // YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        trimmed
      )
    ) {
      const date =
        new Date(
          `${trimmed}T00:00:00`
        );

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    }

    // Full ISO timestamps from Prisma/backend
    const date =
      new Date(trimmed);

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

export function formatDate(value) {
  const date =
    parseDateValue(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(date);
}

export function nightsBetween(
  checkIn,
  checkOut
) {
  if (
    !checkIn ||
    !checkOut
  ) {
    return 0;
  }

  const start =
    parseDateValue(checkIn);

  const end =
    parseDateValue(checkOut);

  if (
    !start ||
    !end
  ) {
    return 0;
  }

  const startUtc =
    Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

  const endUtc =
    Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

  const ms =
    endUtc -
    startUtc;

  return ms > 0
    ? Math.round(
        ms / 86400000
      )
    : 0;
}

export function todayLocal() {
  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
        now.getTimezoneOffset() *
          60000
    );

  return local
    .toISOString()
    .slice(0, 10);
}

export function stayError(
  {
    checkIn,
    checkOut,
    guests
  },
  capacity
) {
  if (
    !checkIn ||
    !checkOut
  ) {
    return "Choose both check-in and check-out dates.";
  }

  if (
    checkIn <
    todayLocal()
  ) {
    return "Check-in cannot be in the past.";
  }

  if (
    nightsBetween(
      checkIn,
      checkOut
    ) < 1
  ) {
    return "Check-out must be after check-in.";
  }

  if (
    !Number.isInteger(
      Number(guests)
    ) ||
    Number(guests) < 1
  ) {
    return "Choose at least one guest.";
  }

  if (
    capacity &&
    Number(guests) >
      capacity
  ) {
    return `This room fits up to ${capacity} guests. Choose another room or reduce your party size.`;
  }

  return "";
}
