import {
  useState
} from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Hotel,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";

import { useAuth } from "../../Context/AuthContext";

import FormField from "../ui/FormField";

import elaraLogo from "../../assets/elara-logo.png";

const loginInitial = {
  email: "",
  password: ""
};

const registerInitial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export default function AuthPage() {
  const {
    login,
    register
  } = useAuth();

  const [
    mode,
    setMode
  ] = useState("login");

  const [
    loginForm,
    setLoginForm
  ] = useState(
    loginInitial
  );

  const [
    registerForm,
    setRegisterForm
  ] = useState(
    registerInitial
  );

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  function validatePassword(
    password
  ) {
    if (
      password.length < 8
    ) {
      return "Password must contain at least 8 characters.";
    }

    if (
      !/[A-Z]/.test(
        password
      )
    ) {
      return "Password must contain at least one uppercase letter.";
    }

    if (
      !/[a-z]/.test(
        password
      )
    ) {
      return "Password must contain at least one lowercase letter.";
    }

    if (
      !/\d/.test(
        password
      )
    ) {
      return "Password must contain at least one number.";
    }

    return "";
  }

  async function submitLogin(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      !loginForm.email.trim() ||
      !loginForm.password
    ) {
      setError(
        "Enter your email address and password."
      );

      return;
    }

    try {
      setLoading(true);

      await login({
        email:
          loginForm.email
            .trim()
            .toLowerCase(),

        password:
          loginForm.password
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      !registerForm.firstName.trim() ||
      !registerForm.lastName.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      setError(
        "Complete all required fields."
      );

      return;
    }

    const passwordError =
      validatePassword(
        registerForm.password
      );

    if (passwordError) {
      setError(
        passwordError
      );

      return;
    }

    if (
      registerForm.password !==
      registerForm.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      await register({
        firstName:
          registerForm.firstName.trim(),

        lastName:
          registerForm.lastName.trim(),

        email:
          registerForm.email
            .trim()
            .toLowerCase(),

        password:
          registerForm.password
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to create the administrator account."
      );
    } finally {
      setLoading(false);
    }
  }

  function changeMode(
    nextMode
  ) {
    setMode(nextMode);
    setError("");
    setShowPassword(false);
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-forest-950 lg:block">
          <img
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1800&q=88"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-forest-950/50 via-forest-950/75 to-forest-950" />

          <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white">
                <img
                  src={elaraLogo}
                  alt="ELARA Hotel"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <p className="font-bold tracking-[0.22em]">
                  ELARA
                </p>

                <p className="text-xs text-white/55">
                  Hotel Administration
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                Hotel Management
              </p>

              <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight">
                One workspace for
                every part of the stay.
              </h1>

              <p className="mt-6 max-w-lg leading-8 text-white/65">
                Manage rooms,
                reservations, front
                desk operations,
                housekeeping,
                maintenance, payments,
                pricing, and guest
                relationships from one
                secure administrative
                workspace.
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/55">
              <ShieldCheck
                size={18}
                className="text-gold"
              />

              Authorized hotel personnel only
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-soft">
                <img
                  src={elaraLogo}
                  alt="ELARA Hotel"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <p className="font-bold tracking-[0.2em] text-forest-950">
                  ELARA
                </p>

                <p className="text-xs text-forest-900/45">
                  Hotel Administration
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-gold">
                {mode ===
                "login" ? (
                  <LockKeyhole
                    size={21}
                  />
                ) : (
                  <Hotel
                    size={21}
                  />
                )}
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                {mode ===
                "login"
                  ? "Admin access"
                  : "Administrator registration"}
              </p>

              <h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-forest-950">
                {mode ===
                "login"
                  ? "Welcome back."
                  : "Create an admin account."}
              </h2>

              <p className="mt-3 leading-7 text-forest-900/55">
                {mode ===
                "login"
                  ? "Sign in to access the ELARA hotel management platform."
                  : "Register an authorized administrator account to access hotel operations."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {error}
              </div>
            )}

            {mode ===
            "login" ? (
              <form
                onSubmit={
                  submitLogin
                }
                className="space-y-5"
                noValidate
              >
                <FormField
                  id="login-email"
                  label="Email address"
                >
                  {() => (
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={
                        loginForm.email
                      }
                      onChange={(
                        event
                      ) =>
                        setLoginForm({
                          ...loginForm,
                          email:
                            event
                              .target
                              .value
                        })
                      }
                      placeholder="admin@elarahotel.com"
                      className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                    />
                  )}
                </FormField>

                <FormField
                  id="login-password"
                  label="Password"
                >
                  {() => (
                    <div className="relative">
                      <input
                        id="login-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="current-password"
                        value={
                          loginForm.password
                        }
                        onChange={(
                          event
                        ) =>
                          setLoginForm({
                            ...loginForm,
                            password:
                              event
                                .target
                                .value
                          })
                        }
                        className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 pr-12 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (
                              current
                            ) =>
                              !current
                          )
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-forest-900/45 hover:bg-mist hover:text-forest-950"
                      >
                        {showPassword ? (
                          <EyeOff
                            size={
                              18
                            }
                          />
                        ) : (
                          <Eye
                            size={
                              18
                            }
                          />
                        )}
                      </button>
                    </div>
                  )}
                </FormField>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight
                      size={
                        17
                      }
                    />
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={
                  submitRegister
                }
                className="space-y-5"
                noValidate
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    id="register-first-name"
                    label="First name"
                  >
                    {() => (
                      <input
                        id="register-first-name"
                        autoComplete="given-name"
                        value={
                          registerForm.firstName
                        }
                        onChange={(
                          event
                        ) =>
                          setRegisterForm({
                            ...registerForm,
                            firstName:
                              event
                                .target
                                .value
                          })
                        }
                        className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                      />
                    )}
                  </FormField>

                  <FormField
                    id="register-last-name"
                    label="Last name"
                  >
                    {() => (
                      <input
                        id="register-last-name"
                        autoComplete="family-name"
                        value={
                          registerForm.lastName
                        }
                        onChange={(
                          event
                        ) =>
                          setRegisterForm({
                            ...registerForm,
                            lastName:
                              event
                                .target
                                .value
                          })
                        }
                        className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                      />
                    )}
                  </FormField>
                </div>

                <FormField
                  id="register-email"
                  label="Work email"
                >
                  {() => (
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={
                        registerForm.email
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterForm({
                          ...registerForm,
                          email:
                            event
                              .target
                              .value
                        })
                      }
                      className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                    />
                  )}
                </FormField>

                <FormField
                  id="register-password"
                  label="Password"
                  hint="Use at least 8 characters with uppercase, lowercase, and a number."
                >
                  {({
                    describedBy
                  }) => (
                    <input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      aria-describedby={
                        describedBy
                      }
                      value={
                        registerForm.password
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterForm({
                          ...registerForm,
                          password:
                            event
                              .target
                              .value
                        })
                      }
                      className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                    />
                  )}
                </FormField>

                <FormField
                  id="register-confirm-password"
                  label="Confirm password"
                >
                  {() => (
                    <input
                      id="register-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={
                        registerForm.confirmPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterForm({
                          ...registerForm,
                          confirmPassword:
                            event
                              .target
                              .value
                        })
                      }
                      className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                    />
                  )}
                </FormField>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-forest-900/10 pt-6 text-center">
              <p className="text-sm text-forest-900/55">
                {mode ===
                "login"
                  ? "Need an administrator account?"
                  : "Already registered?"}

                {" "}

                <button
                  type="button"
                  onClick={() =>
                    changeMode(
                      mode ===
                        "login"
                        ? "register"
                        : "login"
                    )
                  }
                  className="font-semibold text-forest-950 underline-offset-4 hover:underline"
                >
                  {mode ===
                  "login"
                    ? "Register"
                    : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}