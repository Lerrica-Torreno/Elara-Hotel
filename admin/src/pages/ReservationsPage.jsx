import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import FormField from "../components/ui/FormField";
import { reservations as initialReservations, roomTypes } from "../data/mockData";
import { formatCurrency, formatDate } from "../utils/format";

function statusTone(value) {
  if (["Confirmed", "Paid", "Assigned"].includes(value)) return "green";
  if (["Pending", "Deposit", "Pending Assignment"].includes(value)) return "amber";
  if (value === "Unpaid") return "red";
  return "gray";
}

export default function ReservationsPage({ externalModalOpen, onExternalModalHandled }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    guest: "",
    source: "Admin Created",
    roomType: "Deluxe King",
    checkIn: "",
    checkOut: ""
  });
  const [error, setError] = useState("");

  const isOpen = modalOpen || externalModalOpen;

  const visible = useMemo(
    () => reservations.filter((item) =>
      (status === "All" || item.status === status) &&
      (source === "All" || item.source === source)
    ),
    [reservations, status, source]
  );

  function closeModal() {
    setModalOpen(false);
    setError("");
    onExternalModalHandled?.();
  }

  function submitReservation(event) {
    event.preventDefault();

    if (!form.guest.trim() || !form.checkIn || !form.checkOut) {
      setError("Guest name, check-in, and check-out are required.");
      return;
    }
    if (form.checkOut <= form.checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    const nextId = `ER-${1042 + reservations.length}`;
    setReservations((current) => [
      ...current,
      {
        id: nextId,
        guest: form.guest.trim(),
        source: form.source,
        room: "TBA",
        roomType: form.roomType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        amount: 0,
        status: "Pending",
        payment: "Unpaid",
        assignment: "Pending Assignment"
      }
    ]);

    setForm({ guest: "", source: "Admin Created", roomType: "Deluxe King", checkIn: "", checkOut: "" });
    closeModal();
  }

  return (
    <>
      <PageHeader
        title="Reservations"
        description="Manage bookings from the customer UI, walk-ins, and admin-created reservations. Customers choose a room type; staff assign the actual room later."
        action={
          <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white">
            <Plus size={17} aria-hidden="true" /> New reservation
          </button>
        }
      />

      <Card>
        <form className="mb-5 grid gap-4 sm:grid-cols-2 lg:max-w-2xl" aria-label="Reservation filters">
          <div>
            <label htmlFor="reservation-status" className="mb-2 block text-sm font-semibold">Status</label>
            <select id="reservation-status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5">
              {["All", "Confirmed", "Pending"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="reservation-source" className="mb-2 block text-sm font-semibold">Booking source</label>
            <select id="reservation-source" value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2.5">
              {["All", "Online Booking", "Walk-in", "Admin Created"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </form>

        <DataTable
          caption="Hotel reservations"
          columns={["Reservation", "Guest / Source", "Room Type", "Assigned Room", "Payment", "Status"]}
          rows={visible}
          renderRow={(reservation) => (
            <tr key={reservation.id}>
              <th scope="row" className="px-4 py-4 font-semibold">
                {reservation.id}
                <span className="mt-1 block text-xs font-normal text-forest-900/45">{formatDate(reservation.checkIn)} – {formatDate(reservation.checkOut)}</span>
              </th>
              <td className="px-4 py-4">
                <p className="font-medium">{reservation.guest}</p>
                <Badge tone={reservation.source === "Online Booking" ? "blue" : "gray"}>{reservation.source}</Badge>
              </td>
              <td className="px-4 py-4">
                <p>{reservation.roomType}</p>
                <p className="text-xs text-forest-900/45">{reservation.amount ? formatCurrency(reservation.amount) : "Rate pending"}</p>
              </td>
              <td className="px-4 py-4">
                <p className="font-medium">{reservation.room}</p>
                <span className="text-xs text-forest-900/50">{reservation.assignment}</span>
              </td>
              <td className="px-4 py-4"><Badge tone={statusTone(reservation.payment)}>{reservation.payment}</Badge></td>
              <td className="px-4 py-4"><Badge tone={statusTone(reservation.status)}>{reservation.status}</Badge></td>
            </tr>
          )}
        />
      </Card>

      <Modal open={isOpen} title="Create reservation" onClose={closeModal}>
        <form onSubmit={submitReservation} className="space-y-5" noValidate>
          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              Error: {error}
            </div>
          )}

          <FormField id="guest-name" label="Guest name">
            {({ describedBy }) => (
              <input id="guest-name" value={form.guest} onChange={(e) => setForm({ ...form, guest: e.target.value })} aria-describedby={describedBy} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5" />
            )}
          </FormField>

          <FormField id="booking-source" label="Booking source">
            {() => (
              <select id="booking-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
                {["Admin Created", "Walk-in", "Online Booking"].map((item) => <option key={item}>{item}</option>)}
              </select>
            )}
          </FormField>

          <FormField id="room-type" label="Room type" hint="Specific room number is assigned by hotel staff later.">
            {({ describedBy }) => (
              <select id="room-type" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} aria-describedby={describedBy} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
                {roomTypes.map((roomType) => <option key={roomType.id}>{roomType.name}</option>)}
              </select>
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="check-in" label="Check-in">
              {() => <input id="check-in" type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5" />}
            </FormField>
            <FormField id="check-out" label="Check-out">
              {() => <input id="check-out" type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5" />}
            </FormField>
          </div>

          <footer className="flex justify-end gap-3 border-t border-forest-900/10 pt-5">
            <button type="button" onClick={closeModal} className="rounded-xl border border-forest-900/15 px-4 py-2.5 font-semibold">Cancel</button>
            <button type="submit" className="rounded-xl bg-forest-900 px-4 py-2.5 font-semibold text-white">Create reservation</button>
          </footer>
        </form>
      </Modal>
    </>
  );
}
