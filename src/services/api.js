/*
  FRONT-END API CONTRACT
  ----------------------
  The customer UI should communicate with the backend through REST endpoints.
  No database access belongs in this React app.

  During frontend development the app uses mock data. Once the backend is ready,
  these functions can replace mock-data reads without redesigning the UI.
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
      // Keep the generic message when the response has no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  roomTypes: {
    availability: (params) => request(`/room-types?${new URLSearchParams(params).toString()}`),
    get: (id) => request(`/room-types/${id}`)
  },
  pricing: {
    preview: (payload) => request("/pricing/preview", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  },
  promotions: {
    list: (params = {}) => request(`/promotions?${new URLSearchParams(params).toString()}`)
  },
  reservations: {
    create: (payload) => request("/reservations", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    get: (id) => request(`/reservations/${id}`),
    update: (id, payload) => request(`/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
    remove: (id) => request(`/reservations/${id}`, {
      method: "DELETE"
    })
  },
  payments: {
    create: (payload) => request("/payments", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  }
};
