import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { cancellations } from "../data/mockData";
import { formatCurrency } from "../utils/format";

export default function CancellationsPage() {
  return (
    <>
      <PageHeader
        title="Cancellations"
        description="Handle customer-initiated and staff-initiated cancellations, refunds, and room inventory release."
      />

      <Card title="Cancellation workflow" subtitle="What the admin should verify">
        <ol className="grid gap-3 md:grid-cols-4">
          {[
            ["1", "Receive cancellation", "Customer UI or admin action"],
            ["2", "Check policy", "Refundable vs. non-refundable"],
            ["3", "Process refund", "Update payment status"],
            ["4", "Release inventory", "Return room type capacity to sale"]
          ].map(([step, title, text]) => (
            <li key={step} className="rounded-2xl bg-mist p-4">
              <span className="text-xs font-bold text-gold">STEP {step}</span>
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-xs text-forest-900/55">{text}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Recent cancellations" subtitle="Sample cancellation records" className="mt-6">
        <ul className="space-y-3">
          {cancellations.map((item) => (
            <li key={item.id} className="rounded-2xl border border-forest-900/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.reservation} · {item.guest}</p>
                  <p className="mt-1 text-sm text-forest-900/55">{item.roomType} · {item.reason}</p>
                  <p className="mt-1 text-sm">Refund: <strong>{formatCurrency(item.refund)}</strong></p>
                  <p className="mt-1 text-xs text-emerald-700">Inventory release: Room type capacity returned to availability</p>
                </div>
                <Badge tone={item.status === "Refunded" ? "blue" : "gray"}>{item.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
