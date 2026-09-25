import { BedDouble, CalendarCheck, CircleDollarSign, LogOut, TrendingUp, Wrench, CreditCard, Layers3, Globe2, XCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { demandHistory, reservations, rooms } from "../data/mockData";

function Metric({ icon: Icon, label, value, note }) {
  return (
    <article className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist">
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-forest-900/50">{label}</p>
      <p className="mt-1 text-2xl font-bold text-forest-950">{value}</p>
      <p className="mt-1 text-xs text-forest-900/50">{note}</p>
    </article>
  );
}

export default function DashboardPage({ onNavigate }) {
  const occupied = rooms.filter((room) => room.status === "Occupied").length;
  const available = rooms.filter((room) => room.status === "Available").length;
  const onlineBookings = reservations.filter((r) => r.source === "Online Booking").length;
  const pendingAssignments = reservations.filter((r) => r.assignment === "Pending Assignment").length;
  const pendingPayments = reservations.filter((r) => r.payment === "Unpaid").length;

  return (
    <>
      <section className="mb-6 rounded-[2rem] bg-gradient-to-br from-forest-900 to-forest-700 p-6 text-white shadow-soft md:p-8" aria-labelledby="dashboard-summary">
        <p className="text-sm font-semibold text-gold">Friday, September 25, 2026</p>
        <h1 id="dashboard-summary" className="mt-2 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
          Elara is operating at <span className="text-gold">86% occupancy</span> today.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Customer bookings now flow into this admin workspace for payment tracking, room assignment, check-in, housekeeping, and revenue management.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("Dynamic Pricing")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-forest-950"
        >
          Review pricing
          <TrendingUp size={17} aria-hidden="true" />
        </button>
      </section>

      <section aria-labelledby="today-metrics">
        <h2 id="today-metrics" className="sr-only">Today&apos;s hotel metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={BedDouble} label="Occupancy" value="86%" note={`${occupied} occupied sample rooms`} />
          <Metric icon={CircleDollarSign} label="Today's revenue" value="₱174,300" note="+11.2% vs. yesterday" />
          <Metric icon={CalendarCheck} label="Arrivals" value="18" note="7 already checked in" />
          <Metric icon={LogOut} label="Departures" value="14" note="9 already completed" />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="customer-flow-metrics">
        <h2 id="customer-flow-metrics" className="sr-only">Customer booking flow metrics</h2>
        <Metric icon={Globe2} label="Online bookings" value={String(onlineBookings)} note="Created from customer UI" />
        <Metric icon={Layers3} label="Pending assignment" value={String(pendingAssignments)} note="Need actual room numbers" />
        <Metric icon={CreditCard} label="Pending payment" value={String(pendingPayments)} note="Require payment follow-up" />
        <Metric icon={XCircle} label="Cancellations" value="2" note="Review refunds & released rooms" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card title="7-day occupancy" subtitle="Historical demand view for pricing decisions">
          <figure>
            <div className="grid h-56 grid-cols-7 items-end gap-3" aria-label="Occupancy chart for the last seven days">
              {demandHistory.map((item) => (
                <div key={item.label} className="flex h-full flex-col justify-end">
                  <div className="rounded-t-xl bg-forest-900" style={{ height: `${item.occupancy}%` }} title={`${item.label}: ${item.occupancy}% occupancy`} />
                  <p className="mt-2 text-center text-xs font-semibold">{item.label}</p>
                  <p className="text-center text-[11px] text-forest-900/50">{item.occupancy}%</p>
                </div>
              ))}
            </div>
            <figcaption className="mt-4 text-xs text-forest-900/55">
              Customer-facing prices should be sourced from the same pricing service used by the admin platform.
            </figcaption>
          </figure>
        </Card>

        <Card title="Room inventory" subtitle="Current sample room statuses">
          <dl className="space-y-4">
            {[
              ["Occupied", occupied, "blue"],
              ["Available", available, "green"],
              ["Reserved", rooms.filter((r) => r.status === "Reserved").length, "amber"],
              ["Maintenance", rooms.filter((r) => r.status === "Maintenance").length, "red"]
            ].map(([label, value, tone]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-mist px-4 py-3">
                <dt className="font-medium">{label}</dt>
                <dd><Badge tone={tone}>{value} rooms</Badge></dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={() => onNavigate("Rooms")} className="mt-5 w-full rounded-xl border border-forest-900/15 py-2.5 text-sm font-semibold hover:bg-mist">
            Open room management
          </button>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card title="Incoming bookings" subtitle="Customer UI, walk-in, and admin-created reservations">
          <ul className="divide-y divide-forest-900/10">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="grid gap-3 py-4 lg:grid-cols-[1.1fr_.8fr_.8fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold">{reservation.guest}</p>
                  <p className="text-xs text-forest-900/55">{reservation.id} · {reservation.roomType}</p>
                </div>
                <Badge tone={reservation.source === "Online Booking" ? "blue" : "gray"}>{reservation.source}</Badge>
                <p className="text-sm text-forest-900/70">{reservation.assignment}</p>
                <Badge tone={reservation.payment === "Paid" ? "green" : reservation.payment === "Deposit" ? "amber" : "red"}>{reservation.payment}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Operational attention" subtitle="Items that need action">
          <ul className="space-y-3">
            <li className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <Wrench size={18} className="text-red-700" aria-hidden="true" />
              <div>
                <p className="font-semibold text-red-900">Room 204 maintenance</p>
                <p className="text-xs text-red-800">Urgent A/C work order is in progress.</p>
              </div>
            </li>
            <li className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">2 bookings need room assignment</p>
              <p className="text-xs text-amber-800">Customers booked room types, not specific room numbers.</p>
            </li>
            <li className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="font-semibold text-blue-900">2 unpaid bookings</p>
              <p className="text-xs text-blue-800">Review payment status before arrival.</p>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
