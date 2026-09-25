import { useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import RoomsPage from "./pages/RoomsPage";
import ReservationsPage from "./pages/ReservationsPage";
import CheckInOutPage from "./pages/CheckInOutPage";
import HousekeepingPage from "./pages/HousekeepingPage";
import MaintenancePage from "./pages/MaintenancePage";
import CustomersPage from "./pages/CustomersPage";
import PaymentsPage from "./pages/PaymentsPage";
import CancellationsPage from "./pages/CancellationsPage";
import DiscountsPage from "./pages/DiscountsPage";
import PromotionsPage from "./pages/PromotionsPage";
import DynamicPricingPage from "./pages/DynamicPricingPage";
import RoomAssignmentPage from "./pages/RoomAssignmentPage";

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [openReservationFromTopbar, setOpenReservationFromTopbar] = useState(false);

  function navigate(page) {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startReservation() {
    setActivePage("Reservations");
    setOpenReservationFromTopbar(true);
  }

  const pages = {
    Dashboard: <DashboardPage onNavigate={navigate} />,
    Rooms: <RoomsPage />,
    Reservations: (
      <ReservationsPage
        externalModalOpen={openReservationFromTopbar}
        onExternalModalHandled={() => setOpenReservationFromTopbar(false)}
      />
    ),
    "Check-in / Out": <CheckInOutPage />,
    Housekeeping: <HousekeepingPage />,
    Maintenance: <MaintenancePage />,
    Customers: <CustomersPage />,
    Payments: <PaymentsPage />,
    Cancellations: <CancellationsPage />,
    Discounts: <DiscountsPage />,
    Promotions: <PromotionsPage />,
    "Dynamic Pricing": <DynamicPricingPage />,
    "Room Assignment": <RoomAssignmentPage />
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={navigate}
      onNewReservation={startReservation}
    >
      {pages[activePage]}
    </AppLayout>
  );
}
