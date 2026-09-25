import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { promotions } from "../data/mockData";

export default function PromotionsPage() {
  return (
    <>
      <PageHeader
        title="Promotions"
        description="Control which campaigns are shown to customers and applied during booking."
      />
      <aside className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Customer UI should display only active promotions that are valid for the selected dates and room type.
      </aside>
      <section className="grid gap-4 lg:grid-cols-3" aria-label="Promotional campaigns">
        {promotions.map((promotion) => (
          <article key={promotion.id} className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{promotion.name}</h2>
                <p className="mt-1 text-xs text-forest-900/55">Code: {promotion.code}</p>
              </div>
              <Badge tone={promotion.active ? "green" : "gray"}>{promotion.active ? "Visible to customers" : "Hidden"}</Badge>
            </div>
            <p className="mt-5 text-3xl font-bold">{promotion.value}</p>
            <p className="mt-2 text-sm text-forest-900/60">{promotion.period}</p>
          </article>
        ))}
      </section>
    </>
  );
}
