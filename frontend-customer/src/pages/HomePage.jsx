import {
  ArrowRight,
  CalendarDays,
  Coffee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
  Wifi
} from "lucide-react";

import SectionHeading from "../components/ui/SectionHeading";
import RoomCard from "../components/ui/RoomCard";
import { roomTypes } from "../data/mockData";
import { todayLocal } from "../utils/format";

export default function HomePage({
  search,
  setSearch,
  onSearch,
  searchError,
  onNavigate,
  onViewRoom,
  onBookRoom
}) {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[680px] overflow-hidden bg-forest-950">
        <img
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2000&q=90"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="hero-overlay absolute inset-0" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <Sparkles size={16} aria-hidden="true" />
              Tagaytay comfort, thoughtfully designed
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Your quiet escape
              <span className="block text-gold">
                above the city.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Discover comfortable rooms, transparent rates, and a simple
              booking experience at Elara Hotel Tagaytay.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("booking-search")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-forest-950 transition hover:brightness-105"
              >
                Find a room
                <ArrowRight size={17} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("Offers")}
                className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                View offers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING SEARCH */}
      <section
        id="booking-search"
        className="relative z-20 mx-auto -mt-16 max-w-6xl px-5 lg:px-8"
        aria-labelledby="search-title"
      >
        <form
          onSubmit={onSearch}
          className="glass rounded-3xl border border-white/60 p-5 shadow-lift md:p-6"
        >
          <h2
            id="search-title"
            className="text-lg font-bold text-forest-950"
          >
            Find your stay
          </h2>

          <p className="mt-1 text-sm text-forest-900/60">
            Choose your dates and number of guests to explore room types and sample rates. Live availability is not connected yet.
          </p>

          {searchError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{searchError}</p>}

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_.8fr_auto] md:items-end">
            <div>
              <label
                htmlFor="home-check-in"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest-950"
              >
                <CalendarDays size={16} aria-hidden="true" />
                Check-in
              </label>

              <input
                id="home-check-in"
                type="date"
                min={todayLocal()}
                value={search.checkIn}
                onChange={(e) =>
                  setSearch({
                    ...search,
                    checkIn: e.target.value
                  })
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-3 text-forest-950"
                required
              />
            </div>

            <div>
              <label
                htmlFor="home-check-out"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest-950"
              >
                <CalendarDays size={16} aria-hidden="true" />
                Check-out
              </label>

              <input
                id="home-check-out"
                type="date"
                min={search.checkIn || todayLocal()}
                value={search.checkOut}
                onChange={(e) =>
                  setSearch({
                    ...search,
                    checkOut: e.target.value
                  })
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-3 text-forest-950"
                required
              />
            </div>

            <div>
              <label
                htmlFor="home-guests"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-forest-950"
              >
                <Users size={16} aria-hidden="true" />
                Guests
              </label>

              <select
                id="home-guests"
                value={search.guests}
                onChange={(e) =>
                  setSearch({
                    ...search,
                    guests: Number(e.target.value)
                  })
                }
                className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-3 text-forest-950"
              >
                {[1, 2, 3, 4, 5].map((guest) => (
                  <option key={guest} value={guest}>
                    {guest} {guest === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white transition hover:bg-forest-800"
            >
              Search rooms
            </button>
          </div>
        </form>
      </section>

      {/* FEATURED ROOMS */}
      <section
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
        aria-labelledby="featured-rooms"
      >
        <div id="featured-rooms">
          <SectionHeading
            eyebrow="Stay your way"
            title="Rooms designed for slowing down."
            description="Choose the room type that fits your stay. Your exact room number is assigned by the hotel before arrival."
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {roomTypes.slice(0, 3).map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onView={onViewRoom}
              onBook={onBookRoom}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigate("Rooms")}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 px-4 py-2.5 font-semibold text-forest-950 transition hover:bg-mist"
        >
          View all rooms
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </section>

      {/* ELARA EXPERIENCE */}
      <section
        className="bg-forest-950 py-24 text-white"
        aria-labelledby="why-elara"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <header className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
              The Elara Experience
            </p>

            <h2
              id="why-elara"
              className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl"
            >
              Comfort without complication.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/75">
              A guest experience built around clarity, convenience, and the calm
              atmosphere of Tagaytay.
            </p>
          </header>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-gold">
                <Wifi size={19} aria-hidden="true" />
              </div>

              <h3 className="mt-5 font-bold text-white">
                Fast Wi-Fi
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Stay connected throughout your visit.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-gold">
                <Coffee size={19} aria-hidden="true" />
              </div>

              <h3 className="mt-5 font-bold text-white">
                Breakfast
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Start your morning with familiar favorites.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-gold">
                <Waves size={19} aria-hidden="true" />
              </div>

              <h3 className="mt-5 font-bold text-white">
                Relaxing spaces
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Unwind between Tagaytay adventures.
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-gold">
                <ShieldCheck size={19} aria-hidden="true" />
              </div>

              <h3 className="mt-5 font-bold text-white">
                Clear booking
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/65">
                See your room type, dates, rate, and booking status clearly.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section
        className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-24 lg:grid-cols-2 lg:px-8"
        aria-labelledby="location-title"
      >
        <figure className="overflow-hidden rounded-[2rem] shadow-soft">
          <img
            src="https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=1400&q=85"
            alt="Scenic highland landscape representing a Tagaytay stay"
            className="h-[430px] w-full object-cover"
          />
        </figure>

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gold">
            <MapPin size={16} aria-hidden="true" />
            Tagaytay City, Cavite
          </p>

          <h2
            id="location-title"
            className="mt-3 text-3xl font-bold tracking-tight text-forest-950 md:text-4xl"
          >
            Close to the view. Far from the rush.
          </h2>

          <p className="mt-5 leading-7 text-forest-900/65">
            Elara is imagined as a convenient base for cool-weather weekends,
            scenic drives, café hopping, and relaxed stays in Tagaytay.
          </p>
        </div>
      </section>
    </>
  );
}
