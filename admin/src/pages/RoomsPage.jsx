import { useMemo, useState } from "react";
import { BedDouble, Filter } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { rooms } from "../data/mockData";
import { formatCurrency } from "../utils/format";

const toneByStatus = {
  Available: "green",
  Occupied: "blue",
  Reserved: "amber",
  Maintenance: "red"
};

export default function RoomsPage() {
  const [status, setStatus] = useState("All");
  const [floor, setFloor] = useState("All");

  const filteredRooms = useMemo(
    () => rooms.filter((room) =>
      (status === "All" || room.status === status) &&
      (floor === "All" || String(room.floor) === floor)
    ),
    [status, floor]
  );

  return (
    <>
      <PageHeader
        title="Room Management"
        description="Monitor room availability, room type, floor, housekeeping readiness, guest occupancy, and current selling rate."
      />

      <Card className="mb-6">
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Room filters">
          <div>
            <label htmlFor="room-status" className="mb-2 block text-sm font-semibold">Status</label>
            <select id="room-status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5">
              {["All", "Available", "Occupied", "Reserved", "Maintenance"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="room-floor" className="mb-2 block text-sm font-semibold">Floor</label>
            <select id="room-floor" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5">
              {["All", "2", "3", "4"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <div className="flex items-end sm:col-span-2">
            <p className="flex items-center gap-2 text-sm text-forest-900/60">
              <Filter size={16} aria-hidden="true" />
              Showing {filteredRooms.length} of {rooms.length} sample rooms
            </p>
          </div>
        </form>
      </Card>

      <section aria-labelledby="room-list-heading">
        <h2 id="room-list-heading" className="sr-only">Hotel rooms</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <article key={room.id} className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
              <header className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist">
                  <BedDouble size={19} aria-hidden="true" />
                </div>
                <Badge tone={toneByStatus[room.status]}>{room.status}</Badge>
              </header>
              <h3 className="mt-5 text-xl font-bold">Room {room.id}</h3>
              <p className="mt-1 text-sm text-forest-900/55">{room.roomType} · Floor {room.floor}</p>

              <dl className="mt-5 space-y-3 border-t border-forest-900/10 pt-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Guest</dt><dd className="font-semibold">{room.guest}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Housekeeping</dt><dd className="font-semibold">{room.housekeeping}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-forest-900/55">Selling rate</dt><dd className="font-semibold">{room.rate ? formatCurrency(room.rate) : "Unavailable"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
