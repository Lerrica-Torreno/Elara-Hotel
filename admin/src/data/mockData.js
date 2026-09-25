export const roomTypes = [
  { id: "rt-deluxe", name: "Deluxe King", baseRate: 3000, capacity: 2 },
  { id: "rt-twin", name: "Premier Twin", baseRate: 3400, capacity: 3 },
  { id: "rt-family", name: "Family Suite", baseRate: 4300, capacity: 5 },
  { id: "rt-suite", name: "Elara Suite", baseRate: 4800, capacity: 4 }
];

export const rooms = [
  { id: 201, roomType: "Deluxe King", floor: 2, status: "Occupied", housekeeping: "Clean", guest: "Mark Santos", rate: 4000 },
  { id: 202, roomType: "Deluxe King", floor: 2, status: "Available", housekeeping: "Clean", guest: "—", rate: 3500 },
  { id: 203, roomType: "Premier Twin", floor: 2, status: "Reserved", housekeeping: "Clean", guest: "Angela Reyes", rate: 3900 },
  { id: 204, roomType: "Premier Twin", floor: 2, status: "Maintenance", housekeeping: "Out of service", guest: "—", rate: 0 },
  { id: 205, roomType: "Elara Suite", floor: 2, status: "Occupied", housekeeping: "Clean", guest: "John Lim", rate: 5900 },
  { id: 206, roomType: "Deluxe King", floor: 2, status: "Available", housekeeping: "Dirty", guest: "—", rate: 3500 },
  { id: 301, roomType: "Elara Suite", floor: 3, status: "Reserved", housekeeping: "Clean", guest: "Carlo Dela Cruz", rate: 6200 },
  { id: 302, roomType: "Family Suite", floor: 3, status: "Available", housekeeping: "Clean", guest: "—", rate: 4700 },
  { id: 303, roomType: "Family Suite", floor: 3, status: "Occupied", housekeeping: "Clean", guest: "Nina Flores", rate: 5000 },
  { id: 304, roomType: "Deluxe King", floor: 3, status: "Available", housekeeping: "Inspect", guest: "—", rate: 3600 },
  { id: 401, roomType: "Elara Suite", floor: 4, status: "Available", housekeeping: "Clean", guest: "—", rate: 6500 },
  { id: 402, roomType: "Premier Twin", floor: 4, status: "Occupied", housekeeping: "Clean", guest: "Miguel Tan", rate: 4100 }
];

export const reservations = [
  { id: "ER-1042", guest: "Angela Reyes", source: "Online Booking", room: "203", roomType: "Premier Twin", checkIn: "2026-09-25", checkOut: "2026-09-27", amount: 7800, status: "Confirmed", payment: "Paid", assignment: "Assigned" },
  { id: "ER-1043", guest: "Carlo Dela Cruz", source: "Online Booking", room: "301", roomType: "Elara Suite", checkIn: "2026-09-26", checkOut: "2026-09-28", amount: 12400, status: "Confirmed", payment: "Deposit", assignment: "Assigned" },
  { id: "ER-1044", guest: "Nina Flores", source: "Online Booking", room: "TBA", roomType: "Deluxe King", checkIn: "2026-09-27", checkOut: "2026-09-29", amount: 7000, status: "Pending", payment: "Unpaid", assignment: "Pending Assignment" },
  { id: "ER-1045", guest: "Miguel Tan", source: "Admin Created", room: "TBA", roomType: "Family Suite", checkIn: "2026-09-28", checkOut: "2026-09-30", amount: 9400, status: "Pending", payment: "Unpaid", assignment: "Pending Assignment" },
  { id: "ER-1046", guest: "Paolo Rivera", source: "Walk-in", room: "220", roomType: "Deluxe King", checkIn: "2026-09-25", checkOut: "2026-09-26", amount: 3600, status: "Confirmed", payment: "Deposit", assignment: "Assigned" }
];

export const housekeepingTasks = [
  { id: "HK-31", room: 206, task: "Full cleaning", priority: "High", assignedTo: "Lina M.", status: "In progress" },
  { id: "HK-32", room: 304, task: "Final inspection", priority: "Medium", assignedTo: "Paolo R.", status: "Queued" },
  { id: "HK-33", room: 318, task: "Linen refresh", priority: "Low", assignedTo: "Mae S.", status: "Queued" }
];

export const maintenanceTickets = [
  { id: "MT-81", room: 204, issue: "Air-conditioning not cooling", priority: "Urgent", technician: "R. Cruz", status: "In progress", eta: "45 min" },
  { id: "MT-82", room: 115, issue: "Bathroom faucet leak", priority: "Medium", technician: "J. Santos", status: "Assigned", eta: "2 hrs" }
];

export const customers = [
  { id: "C-101", name: "Angela Reyes", email: "angela@example.com", stays: 6, spend: 42500, tier: "Gold", preference: "High floor" },
  { id: "C-102", name: "Miguel Tan", email: "miguel@example.com", stays: 3, spend: 21800, tier: "Silver", preference: "King bed" },
  { id: "C-103", name: "Nina Flores", email: "nina@example.com", stays: 1, spend: 7000, tier: "New", preference: "Quiet room" }
];

export const payments = [
  { id: "PAY-9001", reservation: "ER-1042", guest: "Angela Reyes", method: "Credit Card", amount: 7800, status: "Paid", date: "2026-09-25" },
  { id: "PAY-9002", reservation: "ER-1043", guest: "Carlo Dela Cruz", method: "GCash", amount: 6200, status: "Deposit", date: "2026-09-25" },
  { id: "PAY-9003", reservation: "ER-1041", guest: "Daniel Cruz", method: "Credit Card", amount: 3500, status: "Refunded", date: "2026-09-24" }
];

export const cancellations = [
  { id: "CN-201", reservation: "ER-1039", guest: "Daniel Cruz", roomType: "Deluxe King", refund: 3500, reason: "Guest request", status: "Refunded" },
  { id: "CN-202", reservation: "ER-1040", guest: "Lea Gomez", roomType: "Premier Twin", refund: 0, reason: "Non-refundable rate", status: "Closed" }
];

export const discounts = [
  { id: "DISC-01", name: "Senior / PWD", code: "AUTO", value: "20%", rule: "Eligible direct bookings", active: true },
  { id: "DISC-02", name: "Long Stay", code: "STAY5", value: "12%", rule: "5 nights or more", active: true },
  { id: "DISC-03", name: "Early Booker", code: "EARLY15", value: "15%", rule: "30+ days before arrival", active: true }
];

export const promotions = [
  { id: "PROMO-01", name: "Tagaytay Weekend", code: "WEEKEND10", value: "10%", period: "Fri–Sun", active: true },
  { id: "PROMO-02", name: "Rainy Season Escape", code: "RAINY15", value: "15%", period: "September dates", active: true },
  { id: "PROMO-03", name: "Suite Upgrade", code: "SUITEUP", value: "₱700 off", period: "Selected suite dates", active: false }
];

export const demandHistory = [
  { label: "Mon", occupancy: 64, revenue: 118000 },
  { label: "Tue", occupancy: 67, revenue: 126000 },
  { label: "Wed", occupancy: 72, revenue: 131000 },
  { label: "Thu", occupancy: 75, revenue: 145000 },
  { label: "Fri", occupancy: 79, revenue: 161000 },
  { label: "Sat", occupancy: 86, revenue: 174300 },
  { label: "Sun", occupancy: 74, revenue: 153000 }
];
