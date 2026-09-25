import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { maintenanceTickets } from "../data/mockData";

export default function MaintenancePage() {
  return (
    <>
      <PageHeader title="Maintenance" description="Monitor room defects and work orders that affect room availability or guest experience." />
      <Card title="Open work orders" subtitle="Sample maintenance queue">
        <ul className="space-y-3">
          {maintenanceTickets.map((ticket) => (
            <li key={ticket.id} className="rounded-2xl border border-forest-900/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Room {ticket.room} · {ticket.issue}</p>
                  <p className="mt-1 text-sm text-forest-900/55">{ticket.id} · Technician {ticket.technician} · ETA {ticket.eta}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={ticket.priority === "Urgent" ? "red" : "amber"}>{ticket.priority}</Badge>
                  <Badge tone="blue">{ticket.status}</Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
