import { BedDouble, Maximize2, Users } from "lucide-react";
import Badge from "./Badge";
import { formatCurrency } from "../../utils/format";

export default function RoomCard({ room, onView, onBook }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white shadow-soft">
      <figure className="relative h-64 overflow-hidden">
        <img
          src={room.image}
          alt={`${room.name} guest room`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <figcaption className="sr-only">{room.name} room preview</figcaption>
        <div className="absolute left-4 top-4">
          <Badge tone="green">{room.available} left</Badge>
        </div>
      </figure>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{room.tagline}</p>
        <h3 className="mt-2 text-2xl font-bold text-forest-950">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-forest-900/60">{room.description}</p>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-forest-900/55" aria-label={`${room.name} details`}>
          <li className="flex items-center gap-1.5"><Users size={15} aria-hidden="true" /> Up to {room.capacity}</li>
          <li className="flex items-center gap-1.5"><BedDouble size={15} aria-hidden="true" /> {room.beds}</li>
          <li className="flex items-center gap-1.5"><Maximize2 size={15} aria-hidden="true" /> {room.size}</li>
        </ul>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-forest-900/10 pt-5">
          <div>
            <p className="text-xs text-forest-900/50">Current rate from</p>
            <p className="text-xl font-bold">{formatCurrency(room.displayRate)} <span className="text-xs font-normal text-forest-900/45">/ night</span></p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => onView(room)} className="rounded-xl border border-forest-900/15 px-3 py-2 text-sm font-semibold hover:bg-mist">
              Details
            </button>
            <button type="button" onClick={() => onBook(room)} className="rounded-xl bg-forest-900 px-3 py-2 text-sm font-semibold text-white hover:bg-forest-800">
              Book
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
