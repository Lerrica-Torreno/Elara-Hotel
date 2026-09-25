import { Users } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { customers } from "../data/mockData";
import { formatCurrency } from "../utils/format";

export default function CustomersPage() {
  return (
    <>
      <PageHeader title="Customer Management" description="Review guest profiles, stay history, preferences, loyalty tier, and lifetime spend." />
      <section aria-labelledby="customer-list-heading">
        <h2 id="customer-list-heading" className="sr-only">Customer profiles</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {customers.map((customer) => (
            <article key={customer.id} className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-forest-900 text-white"><Users size={19} aria-hidden="true" /></div>
                <div>
                  <h2 className="font-semibold">{customer.name}</h2>
                  <p className="text-xs text-forest-900/55">{customer.email}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><dt>Past stays</dt><dd className="font-semibold">{customer.stays}</dd></div>
                <div className="flex justify-between"><dt>Lifetime spend</dt><dd className="font-semibold">{formatCurrency(customer.spend)}</dd></div>
                <div className="flex justify-between"><dt>Preference</dt><dd className="font-semibold">{customer.preference}</dd></div>
              </dl>
              <div className="mt-4"><Badge tone={customer.tier === "Gold" ? "amber" : customer.tier === "Silver" ? "blue" : "gray"}>{customer.tier} guest</Badge></div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
