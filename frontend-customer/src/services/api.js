const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8000/api";

// ============================================================
// REQUEST
// ============================================================

async function request(
  path,
  options = {}
) {
  let response;

  try {
    response =
      await fetch(
        `${API_BASE_URL}${path}`,
        {
          ...options,

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",

            "X-Elara-Portal":
              "customer",

            ...(options.headers ??
              {})
          }
        }
      );
  } catch {
    throw new Error(
      "Unable to connect to the hotel server."
    );
  }

  if (
    response.status ===
    204
  ) {
    return null;
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) ?? "";

  let body = null;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    body =
      await response.json();
  } else {
    const text =
      await response.text();

    body =
      text
        ? {
            message:
              text
          }
        : null;
  }

  if (
    !response.ok
  ) {
    throw new Error(
      body?.error ??
        body?.message ??
        body?.detail ??
        `Request failed with status ${response.status}.`
    );
  }

  return body;
}

// ============================================================
// API
// ============================================================

export const api = {
  // ==========================================================
  // ROOM TYPES
  // ==========================================================

  roomTypes: {
    list: () =>
      request(
        "/public/room-types"
      )
  },

  // ==========================================================
  // AVAILABILITY
  // ==========================================================

  availability: ({
    checkIn,
    checkOut,
    guests
  }) => {
    const params =
      new URLSearchParams({
        checkIn,
        checkOut,

        guests:
          String(
            guests
          )
      });

    return request(
      `/public/availability?${params.toString()}`
    );
  },

  // ==========================================================
  // RESERVATIONS
  // ==========================================================

  reservations: {
    create: (
      payload
    ) =>
      request(
        "/reservations",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    mine: () =>
      request(
        "/reservations/mine"
      ),

    lookup: ({
      reference,
      email
    }) =>
      request(
        "/reservations/lookup",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              reference,
              email
            })
        }
      ),

    cancel: (
      id,
      payload = {}
    ) =>
      request(
        `/reservations/${id}/cancel`,
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  }
};