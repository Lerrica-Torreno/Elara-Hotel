import { useState } from "react";
import { LogIn, LogOut, AlertTriangle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const arrivals = [
  { id: "ER-1042", guest: "Angela Reyes", room: 203, time: "2:00 PM", roomReady: true, payment: "Paid" },
  { id: "ER-1046", guest: "Paolo Rivera", room: 220, time: "3:30 PM", roomReady: true, payment: "Deposit" },
  { id: "ER-1044", guest: "Nina Flores", room: "TBA", time: "4:00 PM", roomReady: false, payment: "Unpaid" }
];

const departures = [
  { id: "ER-1035", guest: "Mark Santos", room: 201, time: "12:00 PM", balance: "Balance due" },
  { id: "ER-1036", guest: "John Lim", room: 205, time: "12:00 PM", balance: "Settled" }
];

export default function CheckInOutPage() {
  const [message, setMessage] = useState("");

  return (
    <>
      <PageHeader title="Check-in / Check-out" description="Verify room assignment, room readiness, and payment status before completing guest arrival or departure." />
      {message && <div role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Today's arrivals" subtitle="Bookings from the customer UI and front desk">
          <ul className="space-y-3">
            {arrivals.map((item) => {
              const ready = item.roomReady && item.room !== "TBA";
              return (
                <li key={item.id} className="rounded-2xl border border-forest-900/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.guest}</p>
                      <p className="text-sm text-forest-900/55">{item.id} · Room {item.room} · {item.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge tone={ready ? "green" : "red"}>{ready ? "Room Ready" : "Not Ready"}</Badge>
                      <Badge tone={item.payment === "Paid" ? "green" : item.payment === "Deposit" ? "amber" : "red"}>{item.payment}</Badge>
                    </div>
                  </div>
                  {!ready && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-700"><AlertTriangle size={14} aria-hidden="true" /> Assign and prepare a room before check-in.</p>}
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => setMessage(`${item.guest} marked as checked in in the frontend prototype.`)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <LogIn size={16} aria-hidden="true" /> Check in
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Today's departures" subtitle="Verify payment before closing stay">
          <ul className="space-y-3">
            {departures.map((item) => (
              <li key={item.id} className="rounded-2xl border border-forest-900/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.guest}</p>
                    <p className="text-sm text-forest-900/55">{item.id} · Room {item.room} · {item.time}</p>
                  </div>
                  <Badge tone={item.balance === "Settled" ? "green" : "amber"}>{item.balance}</Badge>
                </div>
                <button
                  type="button"
                  disabled={item.balance !== "Settled"}
                  onClick={() => setMessage(`${item.guest} marked as checked out. Room ${item.room} should move to housekeeping.`)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <LogOut size={16} aria-hidden="true" /> Check out
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
