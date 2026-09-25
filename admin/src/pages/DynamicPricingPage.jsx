import { useMemo, useState } from "react";
import { Gauge, Info, TrendingUp } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import { demandHistory, roomTypes } from "../data/mockData";
import { formatCurrency } from "../utils/format";

export default function DynamicPricingPage() {
  const [occupancy, setOccupancy] = useState(86);
  const [season, setSeason] = useState("Holiday");
  const [dayType, setDayType] = useState("Weekend");
  const [roomType, setRoomType] = useState("Deluxe King");
  const [leadTime, setLeadTime] = useState(7);
  const [historicalDemand, setHistoricalDemand] = useState("High");

  const selectedRoom = roomTypes.find((room) => room.name === roomType);

  const preview = useMemo(() => {
    const factors = [];
    let rate = selectedRoom.baseRate;

    factors.push({ label: "Base room rate", amount: selectedRoom.baseRate });

    if (dayType === "Weekend") {
      rate += 500;
      factors.push({ label: "Weekend adjustment", amount: 500 });
    }

    if (occupancy >= 80) {
      rate += 500;
      factors.push({ label: "High occupancy adjustment", amount: 500 });
    } else if (occupancy <= 45) {
      rate -= 250;
      factors.push({ label: "Low occupancy adjustment", amount: -250 });
    }

    if (season === "Holiday") {
      rate += 500;
      factors.push({ label: "Holiday adjustment", amount: 500 });
    } else if (season === "Peak") {
      rate += 300;
      factors.push({ label: "Peak-season adjustment", amount: 300 });
    }

    if (historicalDemand === "High") {
      rate += 200;
      factors.push({ label: "Historical demand adjustment", amount: 200 });
    } else if (historicalDemand === "Low") {
      rate -= 150;
      factors.push({ label: "Historical demand adjustment", amount: -150 });
    }

    if (leadTime <= 2 && occupancy > 70) {
      rate += 300;
      factors.push({ label: "Short lead-time adjustment", amount: 300 });
    } else if (leadTime >= 30 && occupancy < 65) {
      rate -= 200;
      factors.push({ label: "Early-booking adjustment", amount: -200 });
    }

    return { rate: Math.max(rate, 2000), factors };
  }, [occupancy, season, dayType, roomType, leadTime, historicalDemand, selectedRoom]);

  return (
    <>
      <PageHeader
        title="Dynamic Pricing"
        description="Admin view of the proposed pricing engine. The customer UI should display the same backend-calculated rate shown here so both sides stay consistent."
      />

      <aside className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" aria-label="Pricing prototype note">
        <div className="flex gap-3">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            This page demonstrates the required inputs—occupancy, season, day of week, historical demand, room type, and booking lead time. The customer UI should request this same rate from the backend rather than calculating a separate price.
          </p>
        </div>
      </aside>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card title="Pricing inputs" subtitle="Change any value to preview the interface behavior">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <FormField id="pricing-room-type" label="Room type">
              {() => (
                <select id="pricing-room-type" value={roomType} onChange={(e) => setRoomType(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
                  {roomTypes.map((room) => <option key={room.id}>{room.name}</option>)}
                </select>
              )}
            </FormField>

            <FormField id="occupancy" label={`Occupancy: ${occupancy}%`} hint="Higher occupancy can justify a higher selling rate.">
              {({ describedBy }) => (
                <input id="occupancy" type="range" min="20" max="100" value={occupancy} onChange={(e) => setOccupancy(Number(e.target.value))} aria-describedby={describedBy} className="w-full accent-forest-900" />
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="season" label="Season">
                {() => (
                  <select id="season" value={season} onChange={(e) => setSeason(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
                    {["Regular", "Peak", "Holiday"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                )}
              </FormField>

              <FormField id="day-type" label="Day of week">
                {() => (
                  <select id="day-type" value={dayType} onChange={(e) => setDayType(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
                    {["Weekday", "Weekend"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                )}
              </FormField>
            </div>

            <FormField id="historical-demand" label="Historical demand">
              {() => (
                <select id="historical-demand" value={historicalDemand} onChange={(e) => setHistoricalDemand(e.target.value)} className="w-full rounded-xl border border-forest-900/15 px-3 py-2.5">
                  {["Low", "Normal", "High"].map((item) => <option key={item}>{item}</option>)}
                </select>
              )}
            </FormField>

            <FormField id="lead-time" label={`Booking lead time: ${leadTime} days`}>
              {() => (
                <input id="lead-time" type="range" min="0" max="60" value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value))} className="w-full accent-forest-900" />
              )}
            </FormField>
          </form>
        </Card>

        <div className="space-y-6">
          <section className="rounded-3xl bg-forest-950 p-6 text-white shadow-soft" aria-labelledby="pricing-recommendation">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Frontend preview</p>
                <h2 id="pricing-recommendation" className="mt-2 text-2xl font-bold">Recommended selling rate</h2>
                <p className="mt-3 text-5xl font-bold text-gold">{formatCurrency(preview.rate)}</p>
                <p className="mt-2 text-sm text-white/60">{roomType} · per night</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3"><Gauge aria-hidden="true" /></div>
            </div>
          </section>

          <Card title="Rate explanation" subtitle="Transparent factor breakdown">
            <dl className="space-y-3">
              {preview.factors.map((factor) => (
                <div key={factor.label} className="flex items-center justify-between gap-4 rounded-2xl bg-mist px-4 py-3">
                  <dt className="text-sm">{factor.label}</dt>
                  <dd className={`font-semibold ${factor.amount > 0 ? "text-emerald-700" : factor.amount < 0 ? "text-red-700" : ""}`}>
                    {factor.amount > 0 ? "+" : ""}{formatCurrency(factor.amount)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <Card title="Historical demand" subtitle="Sample 7-day occupancy and revenue" className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Historical demand data used as an input to dynamic pricing</caption>
            <thead><tr className="border-b border-forest-900/10"><th className="px-3 py-3">Day</th><th className="px-3 py-3">Occupancy</th><th className="px-3 py-3">Revenue</th></tr></thead>
            <tbody className="divide-y divide-forest-900/10">
              {demandHistory.map((item) => (
                <tr key={item.label}><th scope="row" className="px-3 py-3 font-semibold">{item.label}</th><td className="px-3 py-3">{item.occupancy}%</td><td className="px-3 py-3">{formatCurrency(item.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
