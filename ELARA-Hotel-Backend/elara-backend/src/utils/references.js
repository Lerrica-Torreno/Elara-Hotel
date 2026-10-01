// Pad date components when building human-readable reservation references.
function pad(value) {
  return String(value).padStart(2, '0');
}

// Generate a date-stamped identifier for a new reservation.
export function reservationReference() {
  const now = new Date();
  const date = `${String(now.getFullYear()).slice(-2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ELA-${date}-${random}`;
}

// Generate a unique-looking identifier for a recorded payment.
export function paymentReference() {
  const now = new Date();
  return `PAY-${now.getTime()}-${Math.floor(100 + Math.random() * 900)}`;
}
