import {
  useState
} from "react";

import {
  useAuth
} from "./Context/AuthContext";

import AuthPage from "./components/auth/AuthPage";
import AppLayout from "./components/layout/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import ReservationsPage from "./pages/ReservationsPage";
import RoomsPage from "./pages/RoomsPage";
import CheckInOutPage from "./pages/CheckInOutPage";
import HousekeepingPage from "./pages/HousekeepingPage";
import MaintenancePage from "./pages/MaintenancePage";
import CustomersPage from "./pages/CustomersPage";
import PaymentsPage from "./pages/PaymentsPage";
import CancellationsPage from "./pages/CancellationsPage";
import DiscountsPage from "./pages/DiscountsPage";
import DynamicPricingPage from "./pages/DynamicPricingPage";

export default function App() {
  const {
    user,
    loading
  } = useAuth();

  const [
    activePage,
    setActivePage
  ] = useState(
    "Dashboard"
  );

  const [
    pageVersion,
    setPageVersion
  ] = useState(0);

  /*
   * These remain shared because several existing
   * pages still receive their state setters from App.
   *
   * The pages themselves can continue synchronizing
   * these arrays with the backend.
   */
  const [
    reservations,
    setReservations
  ] = useState([]);

  const [
    rooms,
    setRooms
  ] = useState([]);

  const [
    guests,
    setGuests
  ] = useState([]);

  const [
    discounts,
    setDiscounts
  ] = useState([]);

  const [
    promotions,
    setPromotions
  ] = useState([]);

  const [
    housekeepingTasks,
    setHousekeepingTasks
  ] = useState([]);

  const [
    maintenanceTickets,
    setMaintenanceTickets
  ] = useState([]);

  const [
    pricingRules,
    setPricingRules
  ] = useState({
    baseRate: 3000,

    weekendRate: 3500,

    highOccupancyRate: 4000,

    holidayRate: 4500,

    highOccupancyThreshold: 80,

    seasonMultiplier: 1,

    historicalDemandMultiplier: 1,

    earlyBirdDays: 30,

    earlyBirdDiscountPercent: 0,

    lastMinuteDays: 3,

    lastMinuteMarkupPercent: 0
  });

  function navigate(
    page
  ) {
    setActivePage(
      page
    );

    setPageVersion(
      (current) =>
        current + 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  if (
    loading
  ) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-forest-900/15 border-t-gold" />

          <p className="mt-4 text-sm font-semibold text-forest-900/60">
            Loading ELARA Admin...
          </p>
        </div>
      </div>
    );
  }

  if (
    !user
  ) {
    return (
      <AuthPage />
    );
  }

  function renderPage() {
    switch (
      activePage
    ) {
      case "Dashboard":
        return (
          <DashboardPage
            key={`dashboard-${pageVersion}`}
            onNavigate={
              navigate
            }
          />
        );

      case "Reservations":
        return (
          <ReservationsPage
            key={`reservations-${pageVersion}`}
            reservations={
              reservations
            }
            setReservations={
              setReservations
            }
            rooms={
              rooms
            }
            guests={
              guests
            }
            setGuests={
              setGuests
            }
          />
        );

      case "Front Desk":
        return (
          <CheckInOutPage
            key={`front-desk-${pageVersion}`}
            reservations={
              reservations
            }
            setReservations={
              setReservations
            }
            rooms={
              rooms
            }
            setRooms={
              setRooms
            }
          />
        );

      case "Rooms / Inventory":
        return (
          <RoomsPage
            key={`rooms-${pageVersion}`}
            rooms={
              rooms
            }
            setRooms={
              setRooms
            }
          />
        );

      case "Housekeeping":
        return (
          <HousekeepingPage
            key={`housekeeping-${pageVersion}`}
            rooms={
              rooms
            }
            setRooms={
              setRooms
            }
            tasks={
              housekeepingTasks
            }
            setTasks={
              setHousekeepingTasks
            }
          />
        );

      case "Maintenance":
        return (
          <MaintenancePage
            key={`maintenance-${pageVersion}`}
            rooms={
              rooms
            }
            setRooms={
              setRooms
            }
            tickets={
              maintenanceTickets
            }
            setTickets={
              setMaintenanceTickets
            }
          />
        );

      case "Guests":
        return (
          <CustomersPage
            key={`guests-${pageVersion}`}
            guests={
              guests
            }
            setGuests={
              setGuests
            }
            reservations={
              reservations
            }
          />
        );

      case "Payments":
        return (
          <PaymentsPage
            key={`payments-${pageVersion}`}
          />
        );

      case "Pricing & Promotions":
        return (
          <DynamicPricingPage
            key={`pricing-${pageVersion}`}
            rooms={
              rooms
            }
            pricingRules={
              pricingRules
            }
            setPricingRules={
              setPricingRules
            }
            discounts={
              discounts
            }
            setDiscounts={
              setDiscounts
            }
            promotions={
              promotions
            }
            setPromotions={
              setPromotions
            }
          />
        );

      case "Cancellations":
        return (
          <CancellationsPage
            key={`cancellations-${pageVersion}`}
            reservations={
              reservations
            }
            setReservations={
              setReservations
            }
          />
        );

      case "Discounts":
        return (
          <DiscountsPage
            key={`discounts-${pageVersion}`}
            discounts={
              discounts
            }
            setDiscounts={
              setDiscounts
            }
          />
        );

      case "Settings":
        return (
          <ComingSoonPage
            eyebrow="Administration"
            title="Settings"
            description="Configure hotel information, operational defaults, administrative preferences, and system-wide settings."
            emptyTitle="No additional configuration"
            emptyDescription="Hotel settings can be managed here as the platform configuration expands."
          />
        );

      default:
        return (
          <DashboardPage
            key={`dashboard-default-${pageVersion}`}
            onNavigate={
              navigate
            }
          />
        );
    }
  }

  return (
    <AppLayout
      activePage={
        activePage
      }
      onNavigate={
        navigate
      }
    >
      {renderPage()}
    </AppLayout>
  );
}

function ComingSoonPage({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyDescription
}) {
  return (
    <section>
      <header className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest-950">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-forest-900/50">
          {description}
        </p>
      </header>

      <div className="rounded-3xl border border-forest-900/10 bg-white px-6 py-16 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mist text-forest-900/40">
          <span className="text-xl">
            —
          </span>
        </div>

        <h2 className="mt-5 font-semibold text-forest-950">
          {
            emptyTitle
          }
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-forest-900/50">
          {
            emptyDescription
          }
        </p>
      </div>
    </section>
  );
}