import {
  useMemo,
  useState
} from "react";
import {
  CalendarDays,
  ChevronDown,
  SlidersHorizontal,
  Users
} from "lucide-react";
import RoomCard from "../components/ui/RoomCard";
import { roomTypes } from "../data/mockData";
import { formatDate } from "../utils/format";

export default function RoomsPage({
  search,
  onViewRoom,
  onBookRoom
}) {
  const [capacity, setCapacity] = useState("All");
  const [sort, setSort] = useState("recommended");

  const visibleRooms = useMemo(() => {
    const minimumCapacity =
      capacity === "All"
        ? 1
        : Number(capacity);

    let result = roomTypes.filter(
      (room) =>
        room.capacity >=
        Math.max(
          Number(search.guests) || 1,
          minimumCapacity
        )
    );

    if (sort === "low") {
      result = [...result].sort(
        (a, b) =>
          a.displayRate -
          b.displayRate
      );
    }

    if (sort === "high") {
      result = [...result].sort(
        (a, b) =>
          b.displayRate -
          a.displayRate
      );
    }

    return result;
  }, [
    capacity,
    sort,
    search.guests
  ]);

  return (
    <section className="pb-20">
      <header className="border-b border-forest-900/10 bg-mist">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Rooms & suites
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-forest-950 md:text-5xl">
                Find your perfect room.
              </h1>

              <p className="mt-4 max-w-xl leading-7 text-forest-900/60">
                Discover thoughtfully designed rooms
                and suites created for restful nights,
                slow mornings, and memorable stays in
                Tagaytay.
              </p>
            </div>

            <p className="text-sm font-medium text-forest-900/50">
              {visibleRooms.length}{" "}
              {visibleRooms.length === 1
                ? "room type"
                : "room types"}{" "}
              available
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {(search.checkIn ||
          search.checkOut) && (
          <div className="relative z-10 -mt-6 grid gap-4 rounded-2xl border border-forest-900/10 bg-white p-5 shadow-soft sm:grid-cols-3">
            <StayDetail
              icon={CalendarDays}
              label="Check-in"
              value={
                search.checkIn
                  ? formatDate(
                      search.checkIn
                    )
                  : "Select date"
              }
            />

            <StayDetail
              icon={CalendarDays}
              label="Check-out"
              value={
                search.checkOut
                  ? formatDate(
                      search.checkOut
                    )
                  : "Select date"
              }
            />

            <StayDetail
              icon={Users}
              label="Guests"
              value={`${search.guests} ${
                Number(
                  search.guests
                ) === 1
                  ? "Guest"
                  : "Guests"
              }`}
            />
          </div>
        )}

        <div className="mt-10 flex flex-col justify-between gap-5 border-b border-forest-900/10 pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={18}
                className="text-gold"
                aria-hidden="true"
              />

              <span className="font-bold text-forest-950">
                Refine your stay
              </span>
            </div>

            <p className="mt-1 text-sm text-forest-900/50">
              Filter room types by capacity
              or sort by nightly rate.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <label
                htmlFor="room-capacity"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest-900/45"
              >
                Room capacity
              </label>

              <select
                id="room-capacity"
                value={capacity}
                onChange={(e) =>
                  setCapacity(
                    e.target.value
                  )
                }
                className="min-w-48 appearance-none rounded-xl border border-forest-900/15 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
              >
                <option value="All">
                  Any capacity
                </option>

                {[1, 2, 3, 4, 5].map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}+{" "}
                      {value === 1
                        ? "guest"
                        : "guests"}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute bottom-3 right-3 text-forest-900/45"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="room-sort"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest-900/45"
              >
                Sort by
              </label>

              <select
                id="room-sort"
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value
                  )
                }
                className="min-w-52 appearance-none rounded-xl border border-forest-900/15 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15"
              >
                <option value="recommended">
                  Recommended
                </option>

                <option value="low">
                  Price: Low to High
                </option>

                <option value="high">
                  Price: High to Low
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute bottom-3 right-3 text-forest-900/45"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-2">
          {visibleRooms.map(
            (room) => (
              <RoomCard
                key={room.id}
                room={room}
                onView={onViewRoom}
                onBook={onBookRoom}
              />
            )
          )}
        </div>

        {visibleRooms.length === 0 && (
          <div className="mt-10 rounded-2xl border border-forest-900/10 bg-white p-8 text-center">
            <h2 className="font-serif text-2xl font-semibold text-forest-950">
              No rooms found
            </h2>

            <p className="mt-2 text-sm text-forest-900/55">
              Try adjusting your guest
              count or room filters to
              view more available
              accommodations.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StayDetail({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="flex items-center gap-3 sm:border-r sm:border-forest-900/10 sm:last:border-r-0">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sand/50 text-forest-900">
        <Icon
          size={17}
          aria-hidden="true"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-forest-900/45">
          {label}
        </p>

        <p className="mt-0.5 font-semibold text-forest-950">
          {value}
        </p>
      </div>
    </div>
  );
}