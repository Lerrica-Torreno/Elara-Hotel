import {
  useEffect,
  useState
} from "react";

import {
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  Hotel,
  LogIn,
  RefreshCw
} from "lucide-react";

import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";

import {
  formatCurrency
} from "../utils/format";

import {
  api
} from "../services/api";

const emptyMetrics = {
  totalRevenue: 0,
  pendingPaymentAmount: 0,
  activeBookings: 0,
  occupancyRate: 0,
  totalRooms: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  arrivalsToday: 0,
  departuresToday: 0
};

export default function DashboardPage({
  onNavigate
}) {
  const [
    metrics,
    setMetrics
  ] = useState(
    emptyMetrics
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  async function loadDashboard(
    showRefreshing = false
  ) {
    try {
      if (
        showRefreshing
      ) {
        setRefreshing(
          true
        );
      }

      setError("");

      const response =
        await api.dashboard.get();

      setMetrics({
        ...emptyMetrics,
        ...(response?.metrics ??
          {})
      });
    } catch (
      loadError
    ) {
      setError(
        loadError.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A focused overview of hotel revenue, reservations, room availability, and occupancy."
        action={
          <button
            type="button"
            onClick={() =>
              loadDashboard(
                true
              )
            }
            disabled={
              refreshing
            }
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          icon={
            CircleDollarSign
          }
          label="Total revenue"
          value={
            loading
              ? "—"
              : formatCurrency(
                  Number(
                    metrics.totalRevenue ??
                      0
                  )
                )
          }
        />

        <Metric
          icon={
            CircleDollarSign
          }
          label="Pending payments"
          value={
            loading
              ? "—"
              : formatCurrency(
                  Number(
                    metrics.pendingPaymentAmount ??
                      0
                  )
                )
          }
        />

        <Metric
          icon={
            CalendarDays
          }
          label="Active bookings"
          value={
            loading
              ? "—"
              : metrics.activeBookings
          }
        />

        <Metric
          icon={
            Hotel
          }
          label="Occupancy rate"
          value={
            loading
              ? "—"
              : `${Number(
                  metrics.occupancyRate ??
                    0
                )}%`
          }
        />

        <Metric
          icon={
            BedDouble
          }
          label="Available rooms"
          value={
            loading
              ? "—"
              : metrics.availableRooms
          }
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Card
          title="Hotel activity"
          subtitle="Current reservation and room operations"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <OverviewButton
              icon={
                CalendarDays
              }
              title="Active reservations"
              value={
                loading
                  ? "—"
                  : metrics.activeBookings
              }
              description="Current pending, confirmed, and checked-in stays"
              onClick={() =>
                onNavigate(
                  "Reservations"
                )
              }
            />

            <OverviewButton
              icon={
                BedDouble
              }
              title="Total rooms"
              value={
                loading
                  ? "—"
                  : metrics.totalRooms
              }
              description={`${metrics.availableRooms ?? 0} available · ${metrics.occupiedRooms ?? 0} occupied`}
              onClick={() =>
                onNavigate(
                  "Rooms / Inventory"
                )
              }
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ActivityStat
              label="Arrivals today"
              value={
                loading
                  ? "—"
                  : metrics.arrivalsToday
              }
            />

            <ActivityStat
              label="Departures today"
              value={
                loading
                  ? "—"
                  : metrics.departuresToday
              }
            />
          </div>
        </Card>

        <Card
          title="Front desk"
          subtitle="Manage arrivals and departures"
        >
          <button
            type="button"
            onClick={() =>
              onNavigate(
                "Front Desk"
              )
            }
            className="flex w-full items-center gap-4 rounded-2xl border border-forest-900/10 bg-mist p-5 text-left transition hover:bg-white"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-forest-900 text-gold">
              <LogIn
                size={19}
              />
            </div>

            <div>
              <p className="font-semibold text-forest-950">
                Open front desk
              </p>

              <p className="mt-1 text-sm text-forest-900/50">
                Check guests in,
                assign rooms, and
                process departures.
              </p>
            </div>
          </button>
        </Card>
      </div>
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value
}) {
  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-forest-900/40">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-forest-950">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist text-forest-900">
          <Icon
            size={20}
          />
        </div>
      </div>
    </article>
  );
}

function OverviewButton({
  icon: Icon,
  title,
  value,
  description,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="rounded-2xl border border-forest-900/10 bg-mist p-5 text-left transition hover:bg-white"
    >
      <Icon
        size={19}
        className="text-gold"
      />

      <p className="mt-4 font-semibold text-forest-950">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-forest-950">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-forest-900/45">
        {description}
      </p>
    </button>
  );
}

function ActivityStat({
  label,
  value
}) {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-900/40">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-forest-950">
        {value}
      </p>
    </div>
  );
}