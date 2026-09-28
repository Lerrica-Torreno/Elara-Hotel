import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const CustomerAuthContext =
  createContext(null);

const CUSTOMER_SESSION_KEY =
  "elara_customer_session";

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
    const error =
      new Error(
        body?.message ??
          body?.error ??
          body?.detail ??
          "Request failed."
      );

    error.status =
      response.status;

    throw error;
  }

  return body;
}

// ============================================================
// NORMALIZE CUSTOMER
// ============================================================

function normalizeCustomer(
  user,
  fallbackPhone = ""
) {
  if (
    !user ||
    user.role !==
      "CUSTOMER"
  ) {
    return null;
  }

  return {
    id:
      user.id,

    firstName:
      user.firstName ??
      "",

    lastName:
      user.lastName ??
      "",

    email:
      user.email ??
      "",

    phone:
      user.phone ??
      user.customerProfile?.phone ??
      fallbackPhone ??
      "",

    role:
      user.role
  };
}

// ============================================================
// PROVIDER
// ============================================================

export function CustomerAuthProvider({
  children
}) {
  const [
    customer,
    setCustomer
  ] =
    useState(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  // ==========================================================
  // SESSION CACHE
  // ==========================================================

  function saveSession(
    value
  ) {
    if (
      !value
    ) {
      sessionStorage.removeItem(
        CUSTOMER_SESSION_KEY
      );

      return;
    }

    sessionStorage.setItem(
      CUSTOMER_SESSION_KEY,
      JSON.stringify(
        value
      )
    );
  }

  function readSession() {
    try {
      const saved =
        sessionStorage.getItem(
          CUSTOMER_SESSION_KEY
        );

      return saved
        ? JSON.parse(
            saved
          )
        : null;
    } catch {
      sessionStorage.removeItem(
        CUSTOMER_SESSION_KEY
      );

      return null;
    }
  }

  // ==========================================================
  // REFRESH CUSTOMER SESSION
  // ==========================================================

  async function refreshCustomer() {
    try {
      const response =
        await request(
          "/auth/me"
        );

      const currentUser =
        response?.user ??
        null;

      if (
        currentUser?.role !==
        "CUSTOMER"
      ) {
        setCustomer(
          null
        );

        saveSession(
          null
        );

        return null;
      }

      const cached =
        readSession();

      const normalized =
        normalizeCustomer(
          currentUser,
          cached?.phone ??
            ""
        );

      setCustomer(
        normalized
      );

      saveSession(
        normalized
      );

      return normalized;
    } catch (
      error
    ) {
      if (
        error.status ===
          401 ||
        error.status ===
          403
      ) {
        setCustomer(
          null
        );

        saveSession(
          null
        );

        return null;
      }

      setCustomer(
        null
      );

      return null;
    }
  }

  // ==========================================================
  // INITIAL SESSION RESTORE
  // ==========================================================

  useEffect(() => {
    let mounted =
      true;

    async function initialize() {
      try {
        const response =
          await request(
            "/auth/me"
          );

        if (
          !mounted
        ) {
          return;
        }

        const currentUser =
          response?.user ??
          null;

        if (
          currentUser?.role !==
          "CUSTOMER"
        ) {
          setCustomer(
            null
          );

          saveSession(
            null
          );

          return;
        }

        const cached =
          readSession();

        const normalized =
          normalizeCustomer(
            currentUser,
            cached?.phone ??
              ""
          );

        setCustomer(
          normalized
        );

        saveSession(
          normalized
        );
      } catch {
        if (
          mounted
        ) {
          setCustomer(
            null
          );

          saveSession(
            null
          );
        }
      } finally {
        if (
          mounted
        ) {
          setLoading(
            false
          );
        }
      }
    }

    initialize();

    return () => {
      mounted =
        false;
    };
  }, []);

  // ==========================================================
  // REGISTER CUSTOMER
  // ==========================================================

  async function register({
    firstName,
    lastName,
    email,
    phone,
    password
  }) {
    if (
      !firstName?.trim() ||
      !lastName?.trim()
    ) {
      throw new Error(
        "Please enter your full name."
      );
    }

    if (
      !email?.trim()
    ) {
      throw new Error(
        "Please enter your email address."
      );
    }

    if (
      !password ||
      password.length <
        8
    ) {
      throw new Error(
        "Password must contain at least 8 characters."
      );
    }

    if (
      !/[A-Z]/.test(
        password
      )
    ) {
      throw new Error(
        "Password must include an uppercase letter."
      );
    }

    if (
      !/[a-z]/.test(
        password
      )
    ) {
      throw new Error(
        "Password must include a lowercase letter."
      );
    }

    if (
      !/[0-9]/.test(
        password
      )
    ) {
      throw new Error(
        "Password must include a number."
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const response =
      await request(
        "/auth/customer/register",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              firstName:
                firstName.trim(),

              lastName:
                lastName.trim(),

              email:
                normalizedEmail,

              phone:
                phone?.trim() ||
                undefined,

              password
            })
        }
      );

    const currentUser =
      response?.user;

    if (
      !currentUser ||
      currentUser.role !==
        "CUSTOMER"
    ) {
      throw new Error(
        "The server did not create a customer account."
      );
    }

    const normalized =
      normalizeCustomer(
        currentUser,
        phone?.trim() ??
          ""
      );

    setCustomer(
      normalized
    );

    saveSession(
      normalized
    );

    return normalized;
  }

  // ==========================================================
  // CUSTOMER LOGIN
  // ==========================================================

  async function login({
    email,
    password
  }) {
    if (
      !email?.trim() ||
      !password
    ) {
      throw new Error(
        "Please enter your email and password."
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const response =
      await request(
        "/auth/customer/login",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              email:
                normalizedEmail,

              password
            })
        }
      );

    const currentUser =
      response?.user;

    if (
      !currentUser ||
      currentUser.role !==
        "CUSTOMER"
    ) {
      setCustomer(
        null
      );

      saveSession(
        null
      );

      throw new Error(
        "Customer account required."
      );
    }

    const normalized =
      normalizeCustomer(
        currentUser
      );

    setCustomer(
      normalized
    );

    saveSession(
      normalized
    );

    return normalized;
  }

  // ==========================================================
  // CUSTOMER LOGOUT
  // ==========================================================

  async function logout() {
    try {
      await request(
        "/auth/logout",
        {
          method:
            "POST"
        }
      );
    } finally {
      setCustomer(
        null
      );

      saveSession(
        null
      );
    }
  }

  // ==========================================================
  // LOCAL DISPLAY PROFILE UPDATE
  // ==========================================================

  function updateProfile(
    updates
  ) {
    if (
      !customer
    ) {
      return;
    }

    const updated = {
      ...customer,
      ...updates,

      role:
        "CUSTOMER"
    };

    setCustomer(
      updated
    );

    saveSession(
      updated
    );
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        register,
        login,
        logout,
        refreshCustomer,
        updateProfile
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useCustomerAuth() {
  const context =
    useContext(
      CustomerAuthContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useCustomerAuth must be used inside CustomerAuthProvider."
    );
  }

  return context;
}