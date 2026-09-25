import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import RoomCard from "../components/ui/RoomCard";
import { roomTypes } from "../data/mockData";

export default function RoomsPage({ search, onViewRoom, onBookRoom }) {
  const [capacity, setCapacity] = useState("All");
  const [sort, setSort] = useState("recommended");

  const visibleRooms = useMemo(() => {
    let result = roomTypes.filter((room) => capacity === "All" || room.capacity >= Number(capacity));
    if (sort === "low") result = [...result].sort((a,b) => a.displayRate - b.displayRate);
    if (sort === "high") result = [...result].sort((a,b) => b.displayRate - a.displayRate);
    return result;
  }, [capacity, sort]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <SectionHeading
        eyebrow="Rooms & suites"
        title="Find the room that fits your stay."
        description="Rates shown are frontend sample values. Once integrated, availability and final rates should come from the shared backend pricing and inventory APIs."
      />

      {(search.checkIn || search.checkOut) && (
        <aside className="mt-6 rounded-2xl border border-forest-900/10 bg-white p-4 text-sm text-forest-900/70">
          Search dates: <strong>{search.checkIn || "Not selected"}</strong> to <strong>{search.checkOut || "Not selected"}</strong> · {search.guests} guest(s)
        </aside>
      )}

      <form className="mt-8 flex flex-col gap-4 rounded-2xl border border-forest-900/10 bg-white p-4 sm:flex-row sm:items-end" aria-label="Room filters">
        <div className="flex-1">
          <label htmlFor="room-capacity" className="mb-2 block text-sm font-semibold">Minimum capacity</label>
          <select id="room-capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
            <option>All</option>
            {[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}+ guests</option>)}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="room-sort" className="mb-2 block text-sm font-semibold">Sort rooms</label>
          <select id="room-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
            <option value="recommended">Recommended</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>

        <p className="flex items-center gap-2 pb-2 text-sm text-forest-900/55"><Filter size={16} aria-hidden="true" /> {visibleRooms.length} room types</p>
      </form>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {visibleRooms.map((room) => (
          <RoomCard key={room.id} room={room} onView={onViewRoom} onBook={onBookRoom} />
        ))}
      </div>
    </section>
  );
}
