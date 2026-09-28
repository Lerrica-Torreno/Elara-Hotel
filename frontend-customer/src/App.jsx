import {
  useState
} from "react";

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

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";

import {
  stayError
} from "./utils/format";

export default function App() {
  const [
    currentPage,
    setCurrentPage
  ] = useState("Home");

  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);

  const [
    selectedRoom,
    setSelectedRoom
  ] = useState(null);

  const [
    reservation,
    setReservation
  ] = useState(null);

  const [
    bookingToCancel,
    setBookingToCancel
  ] = useState(null);

  const [
    search,
    setSearch
  ] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2
  });

  const [
    searchError,
    setSearchError
  ] = useState("");

  function navigate(
    page
  ) {
    setCurrentPage(page);
    setSearchError("");
    setMobileOpen(false);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 50);
  }

  function searchRooms(
    event
  ) {
    event.preventDefault();

    const error =
      stayError(search);

    if (error) {
      setSearchError(
        error
      );

      return;
    }

    navigate("Rooms");
  }

  function viewRoom(
    room
  ) {
    setSelectedRoom(
      room
    );

    navigate(
      "Room Details"
    );
  }

  function bookRoom(
    room
  ) {
    setSelectedRoom(
      room
    );

    navigate(
      "Booking"
    );
  }

  function confirmReservation(
    data
  ) {
    setReservation(data);

    navigate(
      "Confirmation"
    );
  }

  function cancelBooking(
    booking
  ) {
    setBookingToCancel(
      booking
    );

    navigate(
      "Cancellation"
    );
  }

  function completeCancellation(
    booking
  ) {
    setReservation(
      (current) => {
        if (
          !current ||
          current.id !==
            booking.id
        ) {
          return current;
        }

        return {
          ...current,
          status:
            "Cancelled"
        };
      }
    );

    setBookingToCancel(
      null
    );

    navigate(
      "My Booking"
    );
  }

  let page;

  switch (currentPage) {
    case "Home":
      page = (
        <HomePage
          search={
            search
          }
          setSearch={
            setSearch
          }
          onSearch={
            searchRooms
          }
          searchError={
            searchError
          }
          onNavigate={
            navigate
          }
          onViewRoom={
            viewRoom
          }
          onBookRoom={
            bookRoom
          }
        />
      );

      break;

    case "Rooms":
      page = (
        <RoomsPage
          search={
            search
          }
          onViewRoom={
            viewRoom
          }
          onBookRoom={
            bookRoom
          }
        />
      );

      break;

    case "Room Details":
      page = (
        <RoomDetailsPage
          room={
            selectedRoom
          }
          onBack={() =>
            navigate(
              "Rooms"
            )
          }
          onBook={
            bookRoom
          }
        />
      );

      break;

    case "Offers":
      page = (
        <OffersPage
          onNavigate={
            navigate
          }
        />
      );

      break;

    case "Booking":
      page = (
        <BookingPage
          room={
            selectedRoom
          }
          search={
            search
          }
          setSearch={
            setSearch
          }
          onBack={() =>
            navigate(
              "Rooms"
            )
          }
          onConfirmed={
            confirmReservation
          }
          onNavigate={
            navigate
          }
        />
      );

      break;

    case "Confirmation":
      page = (
        <ConfirmationPage
          reservation={
            reservation
          }
          onFindBooking={() =>
            navigate(
              "My Booking"
            )
          }
          onHome={() =>
            navigate(
              "Home"
            )
          }
        />
      );

      break;

    case "My Booking":
      page = (
        <MyBookingPage
          reservation={
            reservation
          }
          onCancel={
            cancelBooking
          }
        />
      );

      break;

    case "Cancellation":
      page = (
        <CancellationPage
          booking={
            bookingToCancel
          }
          onBack={() =>
            navigate(
              "My Booking"
            )
          }
          onCancelled={
            completeCancellation
          }
        />
      );

      break;

    case "Login":
      page = (
        <LoginPage
          onNavigate={
            navigate
          }
        />
      );

      break;

    case "Register":
      page = (
        <RegisterPage
          onNavigate={
            navigate
          }
        />
      );

      break;

    case "Account":
      page = (
        <AccountPage
          reservation={
            reservation
          }
          onNavigate={
            navigate
          }
        />
      );

      break;

    default:
      page = (
        <HomePage
          search={
            search
          }
          setSearch={
            setSearch
          }
          onSearch={
            searchRooms
          }
          searchError={
            searchError
          }
          onNavigate={
            navigate
          }
          onViewRoom={
            viewRoom
          }
          onBookRoom={
            bookRoom
          }
        />
      );
  }

  return (
    <div className="min-h-screen bg-cream text-forest-900">
      <Header
        currentPage={
          currentPage
        }
        onNavigate={
          navigate
        }
        mobileOpen={
          mobileOpen
        }
        setMobileOpen={
          setMobileOpen
        }
      />

      <main
        id="main-content"
        className={
          currentPage ===
          "Home"
            ? ""
            : "pt-20"
        }
      >
        {page}
      </main>

      <Footer
        onNavigate={
          navigate
        }
      />
    </div>
  );
}