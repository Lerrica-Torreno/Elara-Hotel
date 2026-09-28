export function formatCurrency(
  value
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style:
        "currency",

      currency:
        "PHP",

      maximumFractionDigits:
        0
    }
  ).format(
    Number(
      value || 0
    )
  );
}

export function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric"
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
}

export function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit"
    }
  ).format(
    new Date(value)
  );
}