import {
  useState
} from "react";

import {
  CheckCircle2,
  Save
} from "lucide-react";

import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import PageHeader from "../components/ui/PageHeader";

export default function SettingsPage({
  settings,
  setSettings
}) {
  const [
    saved,
    setSaved
  ] = useState(false);

  function submit(
    event
  ) {
    event.preventDefault();

    setSaved(true);

    window.setTimeout(
      () =>
        setSaved(
          false
        ),
      2500
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure property information and default front-desk operating times."
      />

      {saved && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2
            size={18}
          />

          Settings saved.
        </div>
      )}

      <form
        onSubmit={
          submit
        }
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <Card
            title="Property details"
            subtitle="Basic hotel contact information"
          >
            <div className="space-y-5">
              <Setting
                id="hotel-name"
                label="Property name"
                value={
                  settings.hotelName
                }
                onChange={(
                  value
                ) =>
                  setSettings({
                    ...settings,
                    hotelName:
                      value
                  })
                }
              />

              <Setting
                id="hotel-email"
                label="Email"
                type="email"
                value={
                  settings.email
                }
                onChange={(
                  value
                ) =>
                  setSettings({
                    ...settings,
                    email:
                      value
                  })
                }
              />

              <Setting
                id="hotel-phone"
                label="Phone"
                value={
                  settings.phone
                }
                onChange={(
                  value
                ) =>
                  setSettings({
                    ...settings,
                    phone:
                      value
                  })
                }
              />
            </div>
          </Card>

          <Card
            title="Stay defaults"
            subtitle="Default front-desk operating times"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Setting
                id="check-in-time"
                label="Check-in time"
                type="time"
                value={
                  settings.checkInTime
                }
                onChange={(
                  value
                ) =>
                  setSettings({
                    ...settings,
                    checkInTime:
                      value
                  })
                }
              />

              <Setting
                id="check-out-time"
                label="Check-out time"
                type="time"
                value={
                  settings.checkOutTime
                }
                onChange={(
                  value
                ) =>
                  setSettings({
                    ...settings,
                    checkOutTime:
                      value
                  })
                }
              />
            </div>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Save
              size={17}
            />

            Save settings
          </button>
        </div>
      </form>
    </>
  );
}

function Setting({
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
          className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5"
        />
      )}
    </FormField>
  );
}