# ELARA Hotel Frontend

ELARA Hotel Frontend is the presentation layer of the Hotel Revenue & Room Management Platform.

The frontend is divided into two separate interfaces:

- Customer Frontend
- Admin / Staff Frontend

Both interfaces are built with React, Vite, Tailwind CSS, JavaScript, and JSX.

The Customer Frontend is used by hotel guests, while the Admin Frontend is used by hotel staff to manage hotel operations.

---

## Frontend Technologies

The frontend uses:

- React
- JavaScript
- JSX
- Vite
- Tailwind CSS
- HTML5
- Lucide React Icons

---

# Customer Frontend

The Customer Frontend provides guests with a simple and responsive hotel booking experience.

## Main Features

- Responsive homepage
- Hotel navigation
- Check-in date selection
- Check-out date selection
- Guest count selection
- Room search
- Room type browsing
- Room filtering
- Room sorting
- Room details
- Room amenities
- Hotel promotions
- Booking form
- Booking summary
- Payment option interface
- Reservation confirmation
- Booking lookup
- Cancellation request
- Responsive mobile navigation
- Hotel-style footer
- ELARA Hotel branding

---

## Customer Booking Flow

```text
Home
  ↓
Search Stay
  ↓
Browse Room Types
  ↓
View Room Details
  ↓
Select Room Type
  ↓
Enter Guest Information
  ↓
Review Booking
  ↓
Choose Payment Option
  ↓
Confirm Reservation
  ↓
View Booking
=======
# Elara Hotel Customer UI

A frontend-only React/Vite/Tailwind customer booking interface for the Elara Hotel Revenue & Room Management Platform.

## Customer Flow

1. Home page
2. Search by check-in, check-out, and guest count
3. Browse room types
4. View room details
5. Select a room type
6. Enter guest details
7. Review rate and payment option
8. Confirm reservation
9. View booking
10. Request cancellation

Customers book a **room type**, not a specific room number. The actual room assignment remains an admin/staff responsibility.

## Frontend Features

- Responsive customer navigation
- Accessible booking search form
- Room listing and filtering
- Room details
- Promotions / offers
- Multi-step booking form
- Booking summary
- Demo payment selection
- Reservation confirmation
- Reservation lookup
- Cancellation request
- Mobile-friendly navigation
- Error/status messages with text
- Focus-visible styles and keyboard-operable controls
- Semantic HTML structure

## Course Principles Applied

### Three-tier architecture
This React app is presentation-only. It does not access the database directly.

### Semantic HTML
The frontend uses meaningful elements such as:
- `header`
- `nav`
- `main`
- `section`
- `article`
- `aside`
- `figure`
- `footer`
- `form`
- `fieldset`
- `table` where appropriate

### Accessibility
- Real labels for form fields
- Meaningful alt text for informational images
- Decorative images use empty alt text
- Keyboard-operable controls
- Focus-visible styling
- Error messages use text, not only color
- Skip-to-content link
- Logical heading hierarchy

### React
- Reusable components
- Props
- `useState`
- Event handlers
- Controlled inputs
- `.map()` list rendering with stable ids

### REST-ready
`src/services/api.js` documents the customer-side API contract. The React app should eventually consume backend endpoints rather than duplicate business logic.

## Expected backend resources

Examples:

- `GET /api/room-types?check_in=...&check_out=...&guests=...`
- `GET /api/room-types/{id}`
- `POST /api/pricing/preview`
- `GET /api/promotions`
- `POST /api/reservations`
- `GET /api/reservations/{id}`
- `PATCH /api/reservations/{id}`
- `DELETE /api/reservations/{id}`
- `POST /api/payments`

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Current room rates and availability use mock data for frontend development.
- No real payment is processed.
- The backend should become the source of truth for room availability, final pricing, discounts, cancellation eligibility, payments, and reservation status.
