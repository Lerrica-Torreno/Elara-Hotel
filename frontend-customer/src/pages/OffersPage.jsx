import { Copy, Sparkles } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import Badge from "../components/ui/Badge";
import { promotions } from "../data/mockData";

export default function OffersPage({ onNavigate }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <SectionHeading
        eyebrow="Offers"
        title="A little more value for your stay."
        description="Only active, eligible promotions should be returned to customers after backend integration."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {promotions.map((promo) => (
          <article key={promo.id} className="relative overflow-hidden rounded-3xl border border-forest-900/10 bg-white p-6 shadow-soft">
            <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-gold/15" aria-hidden="true" />
            <Sparkles size={20} className="text-gold" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-bold">{promo.title}</h2>
            <p className="mt-2 text-3xl font-bold text-forest-950">{promo.value}</p>
            <p className="mt-3 text-sm leading-6 text-forest-900/60">{promo.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-mist px-3 py-2">
              <span className="text-xs text-forest-900/50">Promo code</span>
              <Badge tone="gold">{promo.code}</Badge>
            </div>
          </article>
        ))}
      </div>

      <button type="button" onClick={() => onNavigate("Rooms")} className="mt-8 rounded-xl bg-forest-900 px-5 py-3 font-semibold text-white">
        Browse rooms
      </button>
    </section>
  );
}
