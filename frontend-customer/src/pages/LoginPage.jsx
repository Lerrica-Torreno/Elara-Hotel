import {
  useState
} from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole
} from "lucide-react";

import {
  useCustomerAuth
} from "../context/CustomerAuthContext";

import FormField from "../components/ui/FormField";

export default function LoginPage({
  onNavigate,
  returnPage = "Home"
}) {
  const {
    login
  } = useCustomerAuth();

  const [form, setForm] =
    useState({
      email: "",
      password: ""
    });

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  async function submit(
    event
  ) {
    event.preventDefault();

    setError("");

    try {
      setSubmitting(true);

      await login({
        email:
          form.email,

        password:
          form.password
      });

      onNavigate(
        returnPage === "Login"
          ? "Account"
          : returnPage
      );
    } catch (requestError) {
      setError(
        requestError.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-cream px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() =>
            onNavigate("Home")
          }
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-forest-900/60 transition hover:text-forest-950"
        >
          <ArrowLeft
            size={16}
          />

          Back to hotel
        </button>

        <div className="rounded-[2rem] border border-forest-900/10 bg-white p-7 shadow-soft md:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-gold">
            <LockKeyhole
              size={20}
            />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Guest account
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold text-forest-950">
            Welcome back.
          </h1>

          <p className="mt-3 leading-7 text-forest-900/55">
            Sign in to view your
            stays and manage your
            guest profile.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-7 space-y-5"
          >
            <FormField
              id="customer-login-email"
              label="Email address"
            >
              {() => (
                <input
                  id="customer-login-email"
                  type="email"
                  autoComplete="email"
                  value={
                    form.email
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        email:
                          event
                            .target
                            .value
                      })
                    )
                  }
                  className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                />
              )}
            </FormField>

            <FormField
              id="customer-login-password"
              label="Password"
            >
              {() => (
                <div className="relative">
                  <input
                    id="customer-login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={
                      form.password
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,

                          password:
                            event
                              .target
                              .value
                        })
                      )
                    }
                    className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 pr-12 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-forest-900/40 hover:bg-mist"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              )}
            </FormField>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="w-full rounded-xl bg-forest-900 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <div className="mt-7 border-t border-forest-900/10 pt-6 text-center">
            <p className="text-sm text-forest-900/55">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "Register"
                  )
                }
                className="font-semibold text-forest-950 hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}