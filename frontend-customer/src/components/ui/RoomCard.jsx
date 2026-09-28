import { ArrowUpRight, BedDouble, Users, Wifi } from "lucide-react";
import { formatCurrency } from "../../utils/format";

export default function RoomCard({ room, onView, onBook }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-forest-900/10 bg-white shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <figure className="relative h-72 overflow-hidden sm:h-80">
        <img
          src={room.image}
          alt={`${room.name} guest room`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-forest-950/70 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{room.tagline}</p>
            <h3 className="mt-1 font-serif text-3xl font-semibold">{room.name}</h3>
          </div>
          <p className="shrink-0 text-right text-sm text-white/75">
            From<br />
            <span className="text-lg font-bold text-white">{formatCurrency(room.displayRate)}</span>
          </p>
        </div>
      </figure>

      <div className="p-6">
        <p className="line-clamp-2 text-sm leading-6 text-forest-900/60">{room.description}</p>

        <ul className="mt-5 grid grid-cols-3 gap-2 border-y border-forest-900/10 py-4 text-xs text-forest-900/60" aria-label={`${room.name} amenities`}>
          <li className="flex items-center gap-1.5"><BedDouble size={15} aria-hidden="true" /> {room.beds.split("+")[0]}</li>
          <li className="flex items-center gap-1.5"><Users size={15} aria-hidden="true" /> {room.capacity} guests</li>
          <li className="flex items-center gap-1.5"><Wifi size={15} aria-hidden="true" /> Wi-Fi</li>
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onView(room)} className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-950 transition hover:text-forest-700">
            View details <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onBook(room)} className="rounded-full bg-forest-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-800">
            Reserve
          </button>
        </div>
      </div>
    </article>
  );
}
