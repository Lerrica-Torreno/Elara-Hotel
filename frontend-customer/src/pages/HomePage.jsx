import {
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  Coffee,
  ConciergeBell,
  Dumbbell,
  GlassWater,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Waves
} from "lucide-react";

import RoomCard from "../components/ui/RoomCard";
import { roomTypes } from "../data/mockData";
import { todayLocal } from "../utils/format";

const experiences = [
  {
    icon: Waves,
    title: "Infinity Pool",
    description:
      "A serene poolside escape framed by Tagaytay's cool mountain atmosphere.",
    image:
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85"
  },
  {
    icon: Sparkles,
    title: "Wellness & Spa",
    description:
      "Quiet treatment spaces designed for rest, recovery, and unhurried afternoons.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85"
  },
  {
    icon: ChefHat,
    title: "Signature Dining",
    description:
      "Seasonal comfort food, local ingredients, and relaxed all-day dining.",
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85"
  },
  {
    icon: ConciergeBell,
    title: "Thoughtful Service",
    description:
      "Warm, attentive hospitality from arrival through your final morning.",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85"
  }
];

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
      <section className="relative min-h-screen overflow-hidden bg-forest-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2200&q=90"
          alt="Elegant hotel exterior surrounded by lush greenery"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="hero-overlay absolute inset-0" />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-forest-950/35 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-44 pt-32 lg:px-8 lg:pb-36">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border-b border-white/35 pb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/85">
              <MapPin
                size={15}
                className="text-gold"
                aria-hidden="true"
              />

              Tagaytay, Cavite
            </div>

            <h1 className="mt-7 max-w-4xl font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-8xl">
              A quieter kind of

              <span className="block font-bold text-gold">
                luxury.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              Contemporary comfort, cool
              mountain air, and thoughtful
              hospitality come together in
              a refined Tagaytay escape
              made for slower days.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "booking-search"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth"
                    })
                }
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 font-bold text-forest-950 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Plan your stay

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "brand-story"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth"
                    })
                }
                className="min-h-12 rounded-full border border-white/35 bg-white/5 px-6 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Discover Elara
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="booking-search"
        className="relative z-20 mx-auto -mt-28 max-w-7xl scroll-mt-32 px-5 lg:px-8"
        aria-label="Quick booking"
      >
        <form
          onSubmit={onSearch}
          className="rounded-[2rem] border border-forest-900/10 bg-cream p-5 shadow-lift md:p-7"
        >
          <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
                Reserve your escape
              </p>

              <h2 className="mt-1 font-serif text-3xl font-semibold text-forest-950">
                Find your perfect stay
              </h2>
            </div>

            <p className="text-sm text-forest-900/55">
              Best available rates for
              your selected stay.
            </p>
          </div>

          {searchError && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              {searchError}
            </p>
          )}

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_.8fr_auto] lg:items-end">
            <BookingField
              label="Check-in"
              icon={
                <CalendarDays
                  size={16}
                  aria-hidden="true"
                />
              }
            >
              <input
                type="date"
                min={todayLocal()}
                value={
                  search.checkIn
                }
                onChange={(e) =>
                  setSearch(
                    (current) => ({
                      ...current,
                      checkIn:
                        e.target
                          .value
                    })
                  )
                }
                className="booking-control"
                required
              />
            </BookingField>

            <BookingField
              label="Check-out"
              icon={
                <CalendarDays
                  size={16}
                  aria-hidden="true"
                />
              }
            >
              <input
                type="date"
                min={
                  search.checkIn ||
                  todayLocal()
                }
                value={
                  search.checkOut
                }
                onChange={(e) =>
                  setSearch(
                    (current) => ({
                      ...current,
                      checkOut:
                        e.target
                          .value
                    })
                  )
                }
                className="booking-control"
                required
              />
            </BookingField>

            <BookingField
              label="Guests"
              icon={
                <Users
                  size={16}
                  aria-hidden="true"
                />
              }
            >
              <select
                value={search.guests}
                onChange={(e) =>
                  setSearch(
                    (current) => ({
                      ...current,
                      guests:
                        Number(
                          e.target
                            .value
                        )
                    })
                  )
                }
                className="booking-control"
              >
                {[1, 2, 3, 4, 5].map(
                  (guest) => (
                    <option
                      key={guest}
                      value={guest}
                    >
                      {guest}{" "}
                      {guest === 1
                        ? "Guest"
                        : "Guests"}
                    </option>
                  )
                )}
              </select>
            </BookingField>

            <button
              type="submit"
              className="h-[54px] rounded-2xl bg-forest-900 px-6 font-bold text-white transition hover:bg-forest-800 lg:min-w-52"
            >
              Check availability
            </button>
          </div>
        </form>
      </section>

      <section
        id="brand-story"
        className="mx-auto grid max-w-7xl scroll-mt-28 gap-12 px-5 py-24 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:px-8 lg:py-32"
      >
        <div className="relative min-h-[520px]">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
            alt="Elegant hotel lounge with warm natural finishes"
            className="h-[500px] w-[88%] rounded-[2rem] object-cover shadow-soft"
          />

          <div className="absolute bottom-0 right-0 w-56 rounded-[1.75rem] border border-forest-900/10 bg-cream p-6 shadow-lift sm:w-64">
            <p className="font-serif text-4xl font-semibold text-forest-950">
              Stay well.
            </p>

            <p className="mt-3 text-sm leading-6 text-forest-900/60">
              Unhurried comfort shaped by
              warm details, natural
              textures, and genuine local
              hospitality.
            </p>
          </div>
        </div>

        <div className="max-w-xl lg:justify-self-end">
          <SectionKicker>
            Our story
          </SectionKicker>

          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-forest-950 md:text-5xl">
            Designed to feel considered,
            never complicated.
          </h2>

          <p className="mt-6 text-base leading-8 text-forest-900/65">
            Elara is a modern retreat
            inspired by Tagaytay's relaxed
            pace. Every space balances
            quiet sophistication with the
            ease of a place you can settle
            into immediately—from restful
            rooms and warm shared spaces
            to thoughtful service that
            stays one step ahead.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Calm, contemporary interiors",
              "Cool-weather Tagaytay setting",
              "Simple, transparent booking",
              "Warm personalized service"
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm font-semibold text-forest-900/75"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand text-forest-900">
                  <Check
                    size={14}
                    aria-hidden="true"
                  />
                </span>

                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="rooms"
        className="scroll-mt-24 bg-mist py-24 lg:py-28"
        aria-labelledby="rooms-title"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <SectionKicker>
                Rooms & suites
              </SectionKicker>

              <h2
                id="rooms-title"
                className="mt-3 font-serif text-4xl font-semibold text-forest-950 md:text-5xl"
              >
                Space to rest beautifully.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-forest-900/60">
                Thoughtful layouts,
                generous comfort, and the
                essentials you expect from
                a restorative stay.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate("Rooms")
              }
              className="inline-flex items-center gap-2 self-start border-b border-forest-900/30 pb-1 text-sm font-bold text-forest-950 md:self-auto"
            >
              View all rooms

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {roomTypes
              .slice(0, 3)
              .map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onView={
                    onViewRoom
                  }
                  onBook={
                    onBookRoom
                  }
                />
              ))}
          </div>
        </div>
      </section>

      <section
        id="amenities"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 lg:px-8 lg:py-32"
      >
        <div className="max-w-2xl">
          <SectionKicker>
            Amenities & experiences
          </SectionKicker>

          <h2 className="mt-3 font-serif text-4xl font-semibold text-forest-950 md:text-5xl">
            Everything you need to slow
            down.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((item) => {
            const Icon =
              item.icon;

            return (
              <article
                key={item.title}
                className="group relative min-h-[360px] overflow-hidden rounded-[2rem] bg-forest-950 shadow-soft"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-forest-950">
                    <Icon
                      size={19}
                      aria-hidden="true"
                    />
                  </span>

                  <h3 className="mt-4 font-serif text-2xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {
                      item.description
                    }
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="dining"
        className="scroll-mt-24 bg-forest-950 py-24 text-white lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="max-w-xl">
            <SectionKicker light>
              Dining at Elara
            </SectionKicker>

            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight md:text-5xl">
              A table inspired by comfort
              and place.
            </h2>

            <p className="mt-6 leading-8 text-white/65">
              From slow breakfasts to
              candlelit dinners, our
              dining experience celebrates
              familiar flavors, fresh
              ingredients, and the easy
              rhythm of a Tagaytay
              getaway.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/75">
              <span className="experience-pill">
                <Coffee size={15} />
                Breakfast
              </span>

              <span className="experience-pill">
                <ChefHat size={15} />
                All-day dining
              </span>

              <span className="experience-pill">
                <GlassWater size={15} />
                Evening lounge
              </span>
            </div>
          </div>

          <figure className="overflow-hidden rounded-[2.25rem]">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85"
              alt="Refined restaurant dining table"
              className="h-[500px] w-full object-cover"
            />
          </figure>
        </div>
      </section>

      <section
        className="bg-cream py-24 lg:py-28"
        aria-labelledby="reviews-title"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center">
            <SectionKicker>
              Guest impressions
            </SectionKicker>

            <h2
              id="reviews-title"
              className="mt-3 font-serif text-4xl font-semibold text-forest-950 md:text-5xl"
            >
              The kind of stay people
              remember.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <Review
              quote="The room felt calm and polished without being overly formal. The whole stay was effortless from check-in to breakfast."
              name="Mara D."
              label="Weekend stay"
            />

            <Review
              quote="Beautiful interiors, genuinely warm service, and a peaceful atmosphere that made us want to extend our trip."
              name="Paolo R."
              label="Couples escape"
            />

            <Review
              quote="A great balance of comfort and style. Everything felt thoughtfully designed, especially the shared spaces and dining."
              name="Bianca S."
              label="Family stay"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-forest-900/10 pt-8 text-xs font-bold uppercase tracking-[0.2em] text-forest-900/40">
            <span>Guest favorite</span>
            <span>Tagaytay escapes</span>
            <span>Design-led stays</span>
            <span>Local hospitality</span>
          </div>
        </div>
      </section>

      <section
        id="location"
        className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-5 py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-32"
      >
        <div className="order-2 lg:order-1">
          <SectionKicker>
            Location
          </SectionKicker>

          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-forest-950 md:text-5xl">
            Close to the view. Far from
            the rush.
          </h2>

          <p className="mt-5 max-w-xl leading-8 text-forest-900/65">
            Set in Tagaytay City, Elara
            puts cool-weather cafés,
            scenic drives, and relaxed
            weekend experiences within
            easy reach while keeping your
            stay calm and tucked away.
          </p>

          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-mist p-5 text-sm text-forest-900/70">
            <MapPin
              size={20}
              className="mt-0.5 shrink-0 text-gold"
              aria-hidden="true"
            />

            <div>
              <strong className="block text-forest-950">
                Tagaytay City, Cavite,
                Philippines
              </strong>

              <span>
                A convenient base for
                weekend escapes south of
                Metro Manila.
              </span>
            </div>
          </div>
        </div>

        <figure className="order-1 overflow-hidden rounded-[2rem] shadow-soft lg:order-2">
          <img
            src="https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=1400&q=85"
            alt="Scenic highland landscape in Tagaytay"
            className="h-[480px] w-full object-cover"
          />
        </figure>
      </section>

      <section className="bg-sand/70 py-14">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-3 lg:px-8">
          <TrustItem
            icon={ShieldCheck}
            title="Secure booking"
            text="Clear reservation details and straightforward confirmation."
          />

          <TrustItem
            icon={Dumbbell}
            title="Thoughtful amenities"
            text="Comfort-first facilities for restful, easy stays."
          />

          <TrustItem
            icon={ConciergeBell}
            title="Guest-first service"
            text="Helpful support before, during, and after your stay."
          />
        </div>
      </section>
    </>
  );
}

function BookingField({
  label,
  icon,
  children
}) {
  return (
    <label className="block rounded-2xl border border-forest-900/10 bg-white px-4 py-3 transition focus-within:border-forest-700 focus-within:ring-2 focus-within:ring-forest-900/5">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-forest-900/55">
        {icon}
        {label}
      </span>

      {children}
    </label>
  );
}

function SectionKicker({
  children
}) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
      {children}
    </p>
  );
}

function Review({
  quote,
  name,
  label
}) {
  return (
    <article className="rounded-[2rem] border border-forest-900/10 bg-white p-7 shadow-soft">
      <div
        className="flex gap-1 text-gold"
        aria-label="5 out of 5 stars"
      >
        {Array.from({
          length: 5
        }).map((_, index) => (
          <Star
            key={index}
            size={15}
            fill="currentColor"
          />
        ))}
      </div>

      <Quote
        size={28}
        className="mt-6 text-sand"
        aria-hidden="true"
      />

      <p className="mt-4 font-serif text-2xl leading-9 text-forest-950">
        “{quote}”
      </p>

      <div className="mt-6 border-t border-forest-900/10 pt-5">
        <p className="font-bold text-forest-950">
          {name}
        </p>

        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-forest-900/45">
          {label}
        </p>
      </div>
    </article>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text
}) {
  return (
    <div className="flex gap-4 rounded-2xl p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-900 text-gold">
        <Icon
          size={18}
          aria-hidden="true"
        />
      </span>

      <div>
        <h3 className="font-bold text-forest-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-forest-900/60">
          {text}
        </p>
      </div>
    </div>
  );
}