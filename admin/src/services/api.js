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
              "admin",

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

  let data = null;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  } else {
    const text =
      await response.text();

    data =
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
    const message =
      data?.error ??
      data?.message ??
      data?.detail ??
      `Request failed with status ${response.status}.`;

    throw new Error(
      message
    );
  }

  return data;
}

// ============================================================
// QUERY BUILDER
// ============================================================

function buildQuery(
  values = {}
) {
  const params =
    new URLSearchParams();

  Object.entries(
    values
  ).forEach(
    ([
      key,
      value
    ]) => {
      if (
        value !==
          undefined &&
        value !==
          null &&
        value !==
          ""
      ) {
        params.set(
          key,
          String(
            value
          )
        );
      }
    }
  );

  const query =
    params.toString();

  return query
    ? `?${query}`
    : "";
}

// ============================================================
// API
// ============================================================

export const api = {
  // ==========================================================
  // AUTH
  // ==========================================================

  auth: {
    login: ({
      email,
      password
    }) =>
      request(
        "/auth/admin/login",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              email,
              password
            })
        }
      ),

    me: () =>
      request(
        "/auth/me"
      ),

    logout: () =>
      request(
        "/auth/logout",
        {
          method:
            "POST"
        }
      ),

    createStaff: (
      payload
    ) =>
      request(
        "/auth/admin/staff",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    bootstrapAdmin: (
      payload
    ) =>
      request(
        "/auth/admin/bootstrap",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  },

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  dashboard: {
    get: () =>
      request(
        "/admin/dashboard"
      )
  },

  // ==========================================================
  // ROOM TYPES
  // ==========================================================

  roomTypes: {
    list: () =>
      request(
        "/admin/room-types"
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/room-types",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    update: (
      id,
      payload
    ) =>
      request(
        `/admin/room-types/${id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  },

  // ==========================================================
  // ROOMS
  // ==========================================================

  rooms: {
    list: (
      status = ""
    ) =>
      request(
        `/admin/rooms${buildQuery({
          status
        })}`
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/rooms",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    update: (
      id,
      payload
    ) =>
      request(
        `/admin/rooms/${id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  },

  // ==========================================================
  // RESERVATIONS
  // ==========================================================

  reservations: {
    list: ({
      status = "",
      search = ""
    } = {}) =>
      request(
        `/admin/reservations${buildQuery({
          status,
          q: search
        })}`
      ),

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

    assignOptimal: (
      id
    ) =>
      request(
        `/admin/reservations/${id}/assign-optimal`,
        {
          method:
            "POST"
        }
      ),

    checkIn: (
      id
    ) =>
      request(
        `/admin/reservations/${id}/check-in`,
        {
          method:
            "POST"
        }
      ),

    checkOut: (
      id
    ) =>
      request(
        `/admin/reservations/${id}/check-out`,
        {
          method:
            "POST"
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
  },

  // ==========================================================
  // CUSTOMERS
  // ==========================================================

  customers: {
    list: (
      search = ""
    ) =>
      request(
        `/admin/customers${buildQuery({
          search
        })}`
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/customers",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    update: (
      id,
      payload
    ) =>
      request(
        `/admin/customers/${id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  },

  // ==========================================================
  // PAYMENTS
  // ==========================================================

  payments: {
    list: ({
      status = "",
      search = ""
    } = {}) =>
      request(
        `/admin/payments${buildQuery({
          status,
          q: search
        })}`
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/payments",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  },

  // ==========================================================
  // PRICING RULES
  // ==========================================================

  pricingRules: {
    list: () =>
      request(
        "/admin/pricing-rules"
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/pricing-rules",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    update: (
      id,
      payload
    ) =>
      request(
        `/admin/pricing-rules/${id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    remove: (
      id
    ) =>
      request(
        `/admin/pricing-rules/${id}`,
        {
          method:
            "DELETE"
        }
      )
  },

  // ==========================================================
  // PROMOTIONS
  // ==========================================================

  promotions: {
    list: () =>
      request(
        "/admin/promotions"
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/promotions",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    update: (
      id,
      payload
    ) =>
      request(
        `/admin/promotions/${id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify(
              payload
            )
        }
      )
  },

  // ==========================================================
  // DISCOUNTS
  // ==========================================================

  discounts: {
    list: () =>
      request(
        "/admin/discounts"
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/discounts",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    update: (
      id,
      payload
    ) =>
      request(
        `/admin/discounts/${id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    remove: (
      id
    ) =>
      request(
        `/admin/discounts/${id}`,
        {
          method:
            "DELETE"
        }
      )
  },

  // ==========================================================
  // HOUSEKEEPING
  // ==========================================================

  housekeeping: {
    list: () =>
      request(
        "/admin/housekeeping"
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/housekeeping",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    complete: (
      id
    ) =>
      request(
        `/admin/housekeeping/${id}/complete`,
        {
          method:
            "POST"
        }
      )
  },

  // ==========================================================
  // MAINTENANCE
  // ==========================================================

  maintenance: {
    list: () =>
      request(
        "/admin/maintenance"
      ),

    create: (
      payload
    ) =>
      request(
        "/admin/maintenance",
        {
          method:
            "POST",

          body:
            JSON.stringify(
              payload
            )
        }
      ),

    resolve: (
      id
    ) =>
      request(
        `/admin/maintenance/${id}/resolve`,
        {
          method:
            "POST"
        }
      )
  }
};