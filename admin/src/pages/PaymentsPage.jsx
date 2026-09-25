import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { payments, reservations } from "../data/mockData";
import { formatCurrency } from "../utils/format";

export default function PaymentsPage() {
  const unpaid = reservations.filter((r) => r.payment === "Unpaid");
  const collected = payments.filter((p) => p.date === "2026-09-25" && p.status !== "Refunded").reduce((total, p) => total + p.amount, 0);
  const outstanding = unpaid.reduce((total, r) => total + r.amount, 0);
  const refunds = payments.filter((p) => p.status === "Refunded").reduce((total, p) => total + p.amount, 0);

  return (
    <>
      <PageHeader title="Payments" description="Preview payment records from sample online bookings, walk-ins, and front-desk reservations." />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card><p className="text-sm text-forest-900/55">Sample collected Sep 25</p><p className="mt-1 text-2xl font-bold">{formatCurrency(collected)}</p></Card>
        <Card><p className="text-sm text-forest-900/55">Sample unpaid bookings</p><p className="mt-1 text-2xl font-bold">{formatCurrency(outstanding)}</p></Card>
        <Card><p className="text-sm text-forest-900/55">Sample refunded transaction</p><p className="mt-1 text-2xl font-bold">{formatCurrency(refunds)}</p></Card>
        <Card><p className="text-sm text-forest-900/55">Unpaid bookings</p><p className="mt-1 text-2xl font-bold">{unpaid.length}</p></Card>
      </div>

      <Card title="Payment transactions" subtitle="Sample front-end records">
        <DataTable
          caption="Hotel payment transactions"
          columns={["Payment", "Reservation", "Guest", "Method", "Amount", "Status"]}
          rows={payments}
          renderRow={(payment) => (
            <tr key={payment.id}>
              <th scope="row" className="px-4 py-4 font-semibold">{payment.id}</th>
              <td className="px-4 py-4">{payment.reservation}</td>
              <td className="px-4 py-4">{payment.guest}</td>
              <td className="px-4 py-4">{payment.method}</td>
              <td className="px-4 py-4">{formatCurrency(payment.amount)}</td>
              <td className="px-4 py-4"><Badge tone={payment.status === "Paid" ? "green" : payment.status === "Refunded" ? "blue" : "amber"}>{payment.status}</Badge></td>
            </tr>
          )}
        />
      </Card>

      <Card title="Pending customer payments" subtitle="Bookings needing follow-up before arrival" className="mt-6">
        <ul className="space-y-3">
          {unpaid.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest-900/10 p-4">
              <div>
                <p className="font-semibold">{item.guest} · {item.id}</p>
                <p className="text-sm text-forest-900/55">{item.source} · {item.roomType}</p>
              </div>
              <Badge tone="red">Unpaid</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
