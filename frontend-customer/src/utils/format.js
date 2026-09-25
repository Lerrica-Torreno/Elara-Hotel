export function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const ms = end - start;
  return ms > 0 ? Math.round(ms / 86400000) : 0;
}

export function todayLocal() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function stayError({ checkIn, checkOut, guests }, capacity) {
  if (!checkIn || !checkOut) return "Choose both check-in and check-out dates.";
  if (checkIn < todayLocal()) return "Check-in cannot be in the past.";
  if (nightsBetween(checkIn, checkOut) < 1) return "Check-out must be after check-in.";
  if (!Number.isInteger(Number(guests)) || Number(guests) < 1) return "Choose at least one guest.";
  if (capacity && Number(guests) > capacity) return `This room fits up to ${capacity} guests. Choose another room or reduce your party size.`;
  return "";
}
