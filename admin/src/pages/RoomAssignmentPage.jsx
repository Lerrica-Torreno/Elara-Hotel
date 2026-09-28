import { useState } from "react";
import { BedDouble, CheckCircle2, AlertTriangle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { reservations } from "../data/mockData";

const recommendations = [
  { room: 302, type: "Family Suite", score: 96, status: "Clean", reason: "Correct room type · Quiet floor · Near elevator" },
  { room: 305, type: "Family Suite", score: 89, status: "Clean", reason: "Correct room type · Quiet zone · Slightly farther" },
  { room: 401, type: "Elara Suite", score: 78, status: "Clean", reason: "Upgrade available · Higher-rate inventory" }
];

export default function RoomAssignmentPage() {
  const [assigned, setAssigned] = useState(null);
  const pending = reservations.filter((r) => r.assignment === "Pending Assignment");

  return (
    <>
      <PageHeader
        title="Room Assignment Optimizer"
        description="Customers reserve a room type, not a specific room number. Staff assign the actual room shortly before arrival using readiness and utilization criteria."
      />

      {assigned && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={18} aria-hidden="true" />
          Room {assigned} selected in this frontend prototype.
        </div>
      )}

      <Card title="Reservations awaiting room assignment" subtitle={`${pending.length} sample bookings need action`} className="mb-6">
        <ul className="space-y-3">
          {pending.map((booking) => (
            <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest-900/10 p-4">
              <div>
                <p className="font-semibold">{booking.guest} · {booking.id}</p>
                <p className="text-sm text-forest-900/55">{booking.roomType} · {booking.source}</p>
              </div>
              <Badge tone="amber">Pending Assignment</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card title="Selected booking profile" subtitle="ER-1045 · Miguel Tan">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Booked type</dt><dd className="font-semibold">Family Suite</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Preference</dt><dd className="font-semibold">Quiet room</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Arrival</dt><dd className="font-semibold">Sep 28 · 3:00 PM</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Guests</dt><dd className="font-semibold">4</dd></div>
          </dl>

          <aside className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle size={18} className="shrink-0" aria-hidden="true" />
            Only rooms that are available, clean, and not under maintenance should be recommended.
          </aside>
        </Card>

        <Card title="Recommended rooms" subtitle="Sample optimization ranking">
          <ol className="space-y-3">
            {recommendations.map((item, index) => (
              <li key={item.room} className={`rounded-2xl border p-4 ${index === 0 ? "border-gold bg-amber-50" : "border-forest-900/10"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white"><BedDouble size={18} aria-hidden="true" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">Room {item.room} · {item.type}</h3>
                      {index === 0 && <Badge tone="amber">Best match</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-forest-900/55">{item.reason}</p>
                  </div>
                  <Badge tone="green">{item.score}% match</Badge>
                </div>
                <button type="button" onClick={() => setAssigned(item.room)} className="mt-4 w-full rounded-xl bg-forest-900 py-2.5 text-sm font-semibold text-white">
                  Assign room {item.room}
                </button>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
