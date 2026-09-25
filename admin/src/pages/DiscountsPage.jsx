import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { discounts } from "../data/mockData";

export default function DiscountsPage() {
  return (
    <>
      <PageHeader
        title="Discounts"
        description="Manage discount rules that may be applied during customer booking or by hotel staff."
      />
      <aside className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        Active rules should be returned by the backend so the customer UI and admin UI evaluate the same eligibility conditions.
      </aside>
      <section className="grid gap-4 lg:grid-cols-3" aria-label="Discount rules">
        {discounts.map((discount) => (
          <article key={discount.id} className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{discount.name}</h2>
                <p className="mt-1 text-xs text-forest-900/55">Code: {discount.code}</p>
              </div>
              <Badge tone={discount.active ? "green" : "gray"}>{discount.active ? "Customer-visible" : "Inactive"}</Badge>
            </div>
            <p className="mt-5 text-3xl font-bold">{discount.value}</p>
            <p className="mt-2 text-sm text-forest-900/60">{discount.rule}</p>
          </article>
        ))}
      </section>
    </>
  );
}
