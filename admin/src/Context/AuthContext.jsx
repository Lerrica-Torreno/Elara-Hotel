import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { api } from "../services/api";

const AuthContext =
  createContext(null);

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "FRONT_DESK",
  "HOUSEKEEPING",
  "MAINTENANCE"
];

function isAdminUser(
  user
) {
  return Boolean(
    user &&
      ADMIN_ROLES.includes(
        user.role
      )
  );
}

export function AuthProvider({
  children
}) {
  const [
    user,
    setUser
  ] =
    useState(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  // ==========================================================
  // RESTORE SESSION
  // ==========================================================

  useEffect(() => {
    let mounted =
      true;

    async function restoreSession() {
      try {
        const response =
          await api.auth.me();

        if (
          !mounted
        ) {
          return;
        }

        const currentUser =
          response?.user ??
          null;

        /*
         * Never allow CUSTOMER accounts
         * into the admin application.
         */
        if (
          !isAdminUser(
            currentUser
          )
        ) {
          setUser(
            null
          );

          return;
        }

        setUser(
          currentUser
        );
      } catch {
        if (
          mounted
        ) {
          setUser(
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

    restoreSession();

    return () => {
      mounted =
        false;
    };
  }, []);

  // ==========================================================
  // ADMIN LOGIN
  // ==========================================================

  async function login({
    email,
    password
  }) {
    if (
      !email?.trim()
    ) {
      throw new Error(
        "Email address is required."
      );
    }

    if (
      !password
    ) {
      throw new Error(
        "Password is required."
      );
    }

    const response =
      await api.auth.login({
        email:
          email
            .trim()
            .toLowerCase(),

        password
      });

    const adminUser =
      response?.user;

    if (
      !adminUser
    ) {
      throw new Error(
        "Unable to retrieve administrator account."
      );
    }

    /*
     * Additional frontend security guard.
     *
     * The backend already restricts /admin/login
     * to staff roles, but the frontend should
     * enforce the same rule.
     */
    if (
      !isAdminUser(
        adminUser
      )
    ) {
      setUser(
        null
      );

      throw new Error(
        "Administrator account required."
      );
    }

    setUser(
      adminUser
    );

    return adminUser;
  }

  // ==========================================================
  // CREATE STAFF
  // ==========================================================

  async function register({
    firstName,
    lastName,
    email,
    password,
    role = "ADMIN"
  }) {
    if (
      !firstName?.trim()
    ) {
      throw new Error(
        "First name is required."
      );
    }

    if (
      !lastName?.trim()
    ) {
      throw new Error(
        "Last name is required."
      );
    }

    if (
      !email?.trim()
    ) {
      throw new Error(
        "Email address is required."
      );
    }

    if (
      !password
    ) {
      throw new Error(
        "Password is required."
      );
    }

    if (
      !ADMIN_ROLES.includes(
        role
      ) ||
      role ===
        "SUPER_ADMIN"
    ) {
      throw new Error(
        "Invalid staff role."
      );
    }

    const response =
      await api.auth.createStaff({
        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        password,

        role
      });

    const staffUser =
      response?.user;

    if (
      !isAdminUser(
        staffUser
      )
    ) {
      throw new Error(
        "Unable to create staff account."
      );
    }

    return staffUser;
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function logout() {
    try {
      await api.auth.logout();
    } finally {
      setUser(
        null
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}