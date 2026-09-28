import {
  useState
} from "react";

import {
  ArrowLeft,
  UserPlus
} from "lucide-react";

import {
  useCustomerAuth
} from "../context/CustomerAuthContext";

import FormField from "../components/ui/FormField";

export default function RegisterPage({
  onNavigate
}) {
  const {
    register
  } = useCustomerAuth();

  const [form, setForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });

  const [
    error,
    setError
  ] = useState("");

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  function update(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value
      })
    );
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setSubmitting(true);

      await register({
        firstName:
          form.firstName,

        lastName:
          form.lastName,

        email:
          form.email,

        phone:
          form.phone,

        password:
          form.password
      });

      onNavigate(
        "Account"
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
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() =>
            onNavigate("Home")
          }
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-forest-900/60 hover:text-forest-950"
        >
          <ArrowLeft
            size={16}
          />

          Back to hotel
        </button>

        <div className="rounded-[2rem] border border-forest-900/10 bg-white p-7 shadow-soft md:p-9">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-gold">
            <UserPlus
              size={20}
            />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Guest account
          </p>

          <h1 className="mt-2 font-serif text-4xl font-semibold text-forest-950">
            Create your account.
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-forest-900/55">
            Save your contact details
            and make managing future
            stays easier.
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
            <div className="grid gap-5 sm:grid-cols-2">
              <CustomerInput
                id="register-first-name"
                label="First name"
                value={
                  form.firstName
                }
                onChange={(
                  value
                ) =>
                  update(
                    "firstName",
                    value
                  )
                }
              />

              <CustomerInput
                id="register-last-name"
                label="Last name"
                value={
                  form.lastName
                }
                onChange={(
                  value
                ) =>
                  update(
                    "lastName",
                    value
                  )
                }
              />
            </div>

            <CustomerInput
              id="register-email"
              label="Email address"
              type="email"
              value={
                form.email
              }
              onChange={(
                value
              ) =>
                update(
                  "email",
                  value
                )
              }
            />

            <CustomerInput
              id="register-phone"
              label="Mobile number"
              type="tel"
              value={
                form.phone
              }
              onChange={(
                value
              ) =>
                update(
                  "phone",
                  value
                )
              }
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <CustomerInput
                id="register-password"
                label="Password"
                type="password"
                value={
                  form.password
                }
                onChange={(
                  value
                ) =>
                  update(
                    "password",
                    value
                  )
                }
              />

              <CustomerInput
                id="register-confirm-password"
                label="Confirm password"
                type="password"
                value={
                  form.confirmPassword
                }
                onChange={(
                  value
                ) =>
                  update(
                    "confirmPassword",
                    value
                  )
                }
              />
            </div>

            <p className="text-xs leading-5 text-forest-900/45">
              Passwords should contain
              at least 8 characters.
            </p>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="w-full rounded-xl bg-forest-900 px-5 py-3.5 font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
            >
              {submitting
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <div className="mt-7 border-t border-forest-900/10 pt-6 text-center">
            <p className="text-sm text-forest-900/55">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "Login"
                  )
                }
                className="font-semibold text-forest-950 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomerInput({
  id,
  label,
  value,
  onChange,
  type = "text"
}) {
  return (
    <FormField
      id={id}
      label={label}
    >
      {() => (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event
                .target
                .value
            )
          }
          className="w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
        />
      )}
    </FormField>
  );
}