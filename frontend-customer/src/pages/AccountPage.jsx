import {
  useState
} from "react";

import {
  CalendarDays,
  LogOut,
  Mail,
  Phone,
  UserRound
} from "lucide-react";

import {
  useCustomerAuth
} from "../context/CustomerAuthContext";

export default function AccountPage({
  reservation,
  onNavigate
}) {
  const {
    customer,
    logout,
    updateProfile
  } = useCustomerAuth();

  const [editing, setEditing] =
    useState(false);

  const [form, setForm] =
    useState({
      firstName:
        customer?.firstName ?? "",

      lastName:
        customer?.lastName ?? "",

      phone:
        customer?.phone ?? ""
    });

  if (!customer) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8">
        <h1 className="font-serif text-4xl font-semibold text-forest-950">
          Sign in to your account.
        </h1>

        <p className="mt-3 text-forest-900/55">
          Access your profile and
          manage your stays after
          signing in.
        </p>

        <button
          type="button"
          onClick={() =>
            onNavigate("Login")
          }
          className="mt-6 rounded-xl bg-forest-900 px-6 py-3 font-semibold text-white"
        >
          Sign in
        </button>
      </section>
    );
  }

  function saveProfile() {
    updateProfile({
      firstName:
        form.firstName.trim(),

      lastName:
        form.lastName.trim(),

      phone:
        form.phone.trim()
    });

    setEditing(false);
  }

  async function handleLogout() {
    await logout();

    onNavigate("Home");
  }

  const matchingReservation =
    reservation &&
    reservation.email
      ?.toLowerCase() ===
      customer.email
        ?.toLowerCase()
      ? reservation
      : null;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-20 lg:px-8 lg:pt-24">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
            My Account
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold text-forest-950 md:text-5xl">
            Welcome,{" "}
            {customer.firstName}.
          </h1>

          <p className="mt-3 text-forest-900/55">
            Manage your profile and
            review your ELARA stays.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="inline-flex items-center gap-2 self-start rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-mist md:self-auto"
        >
          <LogOut
            size={16}
          />

          Sign out
        </button>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] border border-forest-900/10 bg-white p-6 shadow-soft md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Profile
              </p>

              <h2 className="mt-2 font-serif text-2xl font-semibold text-forest-950">
                Personal details
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                editing
                  ? saveProfile()
                  : setEditing(
                      true
                    )
              }
              className="rounded-xl border border-forest-900/15 px-4 py-2 text-sm font-semibold hover:bg-mist"
            >
              {editing
                ? "Save"
                : "Edit"}
            </button>
          </div>

          {editing ? (
            <div className="mt-6 space-y-4">
              <AccountInput
                label="First name"
                value={
                  form.firstName
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (current) => ({
                      ...current,
                      firstName:
                        value
                    })
                  )
                }
              />

              <AccountInput
                label="Last name"
                value={
                  form.lastName
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (current) => ({
                      ...current,
                      lastName:
                        value
                    })
                  )
                }
              />

              <AccountInput
                label="Mobile number"
                value={
                  form.phone
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (current) => ({
                      ...current,
                      phone:
                        value
                    })
                  )
                }
              />
            </div>
          ) : (
            <dl className="mt-7 space-y-5">
              <ProfileRow
                icon={UserRound}
                label="Name"
                value={`${customer.firstName} ${customer.lastName}`}
              />

              <ProfileRow
                icon={Mail}
                label="Email"
                value={
                  customer.email
                }
              />

              <ProfileRow
                icon={Phone}
                label="Mobile"
                value={
                  customer.phone ||
                  "Not provided"
                }
              />
            </dl>
          )}
        </section>

        <section className="rounded-[2rem] border border-forest-900/10 bg-white p-6 shadow-soft md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            My Stays
          </p>

          <h2 className="mt-2 font-serif text-2xl font-semibold text-forest-950">
            Upcoming reservations
          </h2>

          {matchingReservation ? (
            <article className="mt-6 rounded-2xl bg-mist p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-forest-900">
                  <CalendarDays
                    size={18}
                  />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-forest-950">
                    {
                      matchingReservation.roomType
                    }
                  </p>

                  <p className="mt-1 text-sm text-forest-900/55">
                    {
                      matchingReservation.checkIn
                    }{" "}
                    –{" "}
                    {
                      matchingReservation.checkOut
                    }
                  </p>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-forest-900/40">
                    {
                      matchingReservation.id
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "My Booking"
                  )
                }
                className="mt-5 w-full rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Manage reservation
              </button>
            </article>
          ) : (
            <div className="mt-6 rounded-2xl bg-mist px-5 py-10 text-center">
              <CalendarDays
                size={24}
                className="mx-auto text-forest-900/30"
              />

              <h3 className="mt-4 font-semibold text-forest-950">
                No upcoming stays
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-forest-900/50">
                Reservations associated
                with your account will
                appear here.
              </p>

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    "Rooms"
                  )
                }
                className="mt-5 rounded-xl bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Explore rooms
              </button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mist text-forest-900">
        <Icon
          size={17}
        />
      </div>

      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-forest-900/40">
          {label}
        </dt>

        <dd className="mt-1 font-semibold text-forest-950">
          {value}
        </dd>
      </div>
    </div>
  );
}

function AccountInput({
  label,
  value,
  onChange
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-forest-950">
        {label}
      </span>

      <input
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
        className="w-full rounded-xl border border-forest-900/15 px-4 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15"
      />
    </label>
  );
}