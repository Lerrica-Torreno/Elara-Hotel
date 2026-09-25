/*
  FRONT-END API CONTRACT ONLY
  ---------------------------
  This file shows the REST resources the React front end expects from the backend.
  It does not connect to a database and is not used while the project is running
  with mock data.

  The backend teammate can implement these endpoints with FastAPI/PostgreSQL.
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body.detail ?? message;
    } catch {
      // Keep the generic message if no JSON body is returned.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  rooms: {
    list: (query = "") => request(`/rooms${query ? `?${query}` : ""}`),
    get: (id) => request(`/rooms/${id}`),
    create: (payload) => request("/rooms", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => request(`/rooms/${id}`, { method: "DELETE" })
  },
  reservations: {
    list: (query = "") => request(`/reservations${query ? `?${query}` : ""}`),
    get: (id) => request(`/reservations/${id}`),
    create: (payload) => request("/reservations", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    remove: (id) => request(`/reservations/${id}`, { method: "DELETE" })
  },
  customers: {
    list: () => request("/customers"),
    get: (id) => request(`/customers/${id}`),
    create: (payload) => request("/customers", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
  },
  housekeeping: {
    list: () => request("/housekeeping-tasks"),
    update: (id, payload) => request(`/housekeeping-tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
  },
  maintenance: {
    list: () => request("/maintenance-tickets"),
    create: (payload) => request("/maintenance-tickets", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/maintenance-tickets/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
  },
  payments: {
    list: () => request("/payments"),
    create: (payload) => request("/payments", { method: "POST", body: JSON.stringify(payload) })
  },
  cancellations: {
    list: () => request("/cancellations"),
    create: (payload) => request("/cancellations", { method: "POST", body: JSON.stringify(payload) })
  },
  discounts: {
    list: () => request("/discounts"),
    create: (payload) => request("/discounts", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/discounts/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
  },
  promotions: {
    list: () => request("/promotions"),
    create: (payload) => request("/promotions", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/promotions/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
  },
  pricing: {
    preview: (payload) => request("/pricing/preview", { method: "POST", body: JSON.stringify(payload) }),
    calendar: (query = "") => request(`/pricing/calendar${query ? `?${query}` : ""}`)
  },
  roomAssignments: {
    recommend: (reservationId) => request(`/room-assignments/recommendations?reservation_id=${reservationId}`),
    assign: (payload) => request("/room-assignments", { method: "POST", body: JSON.stringify(payload) })
  }
};
