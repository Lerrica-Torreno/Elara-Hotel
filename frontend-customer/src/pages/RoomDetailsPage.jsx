import { ArrowLeft, BedDouble, Check, Maximize2, Users } from "lucide-react";
import Badge from "../components/ui/Badge";
import { formatCurrency } from "../utils/format";

export default function RoomDetailsPage({ room, onBack, onBook }) {
  if (!room) return null;

  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-3 py-2 text-sm font-semibold">
          <ArrowLeft size={16} aria-hidden="true" /> Back to rooms
        </button>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <figure className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <img src={room.image} alt={`${room.name} room interior`} className="h-[520px] w-full object-cover" />
            <figcaption className="sr-only">{room.name} interior preview</figcaption>
          </figure>

          <article>
            <Badge tone="green">Room type preview · availability unverified</Badge>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-gold">{room.tagline}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-forest-950">{room.name}</h1>
            <p className="mt-5 leading-7 text-forest-900/65">{room.description}</p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Room details">
              <li className="rounded-2xl bg-mist p-4"><Users size={18} aria-hidden="true" /><p className="mt-2 text-sm font-semibold">Up to {room.capacity}</p></li>
              <li className="rounded-2xl bg-mist p-4"><BedDouble size={18} aria-hidden="true" /><p className="mt-2 text-sm font-semibold">{room.beds}</p></li>
              <li className="rounded-2xl bg-mist p-4"><Maximize2 size={18} aria-hidden="true" /><p className="mt-2 text-sm font-semibold">{room.size}</p></li>
            </ul>

            <section className="mt-7" aria-labelledby="room-amenities">
              <h2 id="room-amenities" className="font-bold">Included amenities</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {room.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm text-forest-900/70">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={14} aria-hidden="true" /></span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-8 rounded-3xl border border-gold/40 bg-amber-50 p-5">
              <p className="text-sm text-forest-900/55">Current sample rate</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(room.displayRate)} <span className="text-sm font-normal text-forest-900/50">per night</span></p>
              <p className="mt-2 text-xs text-forest-900/55">The final integrated rate should be returned by the backend pricing engine.</p>
              <button type="button" onClick={() => onBook(room)} className="mt-5 w-full rounded-xl bg-forest-900 px-4 py-3 font-semibold text-white">
                Book this room type
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
