import { useState } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailsPage from "./pages/RoomDetailsPage";
import OffersPage from "./pages/OffersPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import MyBookingPage from "./pages/MyBookingPage";
import CancellationPage from "./pages/CancellationPage";
import { stayError } from "./utils/format";

export default function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [search, setSearch] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2
  });
  const [searchError, setSearchError] = useState("");

  function navigate(page) {
  setCurrentPage(page);
  setSearchError("");

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, 50);
}

  function searchRooms(event) {
    event.preventDefault();
    const error = stayError(search);
    if (error) return setSearchError(error);
    navigate("Rooms");
  }

  function viewRoom(room) {
    setSelectedRoom(room);
    navigate("Room Details");
  }

  function bookRoom(room) {
    setSelectedRoom(room);
    navigate("Booking");
  }

  function confirmReservation(data) {
    setReservation(data);
    navigate("Confirmation");
  }

  function cancelBooking(booking) {
    setBookingToCancel(booking);
    navigate("Cancellation");
  }

  let page;

  if (currentPage === "Home") {
    page = (
      <HomePage
        search={search}
        setSearch={setSearch}
        onSearch={searchRooms}
        searchError={searchError}
        onNavigate={navigate}
        onViewRoom={viewRoom}
        onBookRoom={bookRoom}
      />
    );
  } else if (currentPage === "Rooms") {
    page = <RoomsPage search={search} onViewRoom={viewRoom} onBookRoom={bookRoom} />;
  } else if (currentPage === "Room Details") {
    page = <RoomDetailsPage room={selectedRoom} onBack={() => navigate("Rooms")} onBook={bookRoom} />;
  } else if (currentPage === "Offers") {
    page = <OffersPage onNavigate={navigate} />;
  } else if (currentPage === "Booking") {
    page = (
      <BookingPage
        room={selectedRoom}
        search={search}
        setSearch={setSearch}
        onBack={() => navigate("Rooms")}
        onConfirmed={confirmReservation}
      />
    );
  } else if (currentPage === "Confirmation") {
    page = (
      <ConfirmationPage
        reservation={reservation}
        onFindBooking={() => navigate("My Booking")}
        onHome={() => navigate("Home")}
      />
    );
  } else if (currentPage === "My Booking") {
    page = <MyBookingPage reservation={reservation} onCancel={cancelBooking} />;
  } else if (currentPage === "Cancellation") {
    page = (
      <CancellationPage
        booking={bookingToCancel}
        onBack={() => navigate("My Booking")}
        onDone={() => navigate("My Booking")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream text-forest-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to main content
      </a>

      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main id="main-content">
        {page}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
