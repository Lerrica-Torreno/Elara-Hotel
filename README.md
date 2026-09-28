# Elara Hotel

Elara Hotel is a full-stack hotel reservation and operations management system designed to support both customer-facing hotel booking and internal hotel operations.

The application is divided into three main parts:

- Customer Portal
- Admin / Staff Portal
- Backend API and Database

Elara is built with React, Vite, Tailwind CSS, Node.js, Express.js, Prisma ORM, and PostgreSQL.

The backend acts as the central source of truth for reservations, room availability, physical room assignment, payments, cancellations, pricing, housekeeping, maintenance, and user data.

---

# Project Overview

Elara Hotel is designed to simulate a realistic hotel management environment.

Customers can browse room types, create reservations, access their bookings, view payment information, and cancel eligible reservations.

Hotel staff can manage reservations, physical room inventory, room assignments, guest check-in and check-out, housekeeping, maintenance, payments, cancellations, guests, discounts, promotions, and pricing rules.

The system is designed so that important hotel operations are handled through backend-controlled workflows instead of relying only on frontend state.

Examples include:

- assigning a room changes its operational state
- checking in a guest changes the room to occupied
- checking out a guest changes the room to cleaning
- completing housekeeping changes the room back to available
- creating a maintenance ticket changes the room to maintenance
- resolving maintenance changes the room to cleaning

---

# Architecture

Elara follows a client-server architecture.

```text
┌─────────────────────────────┐
│       Customer Portal       │
│                             │
│ React + Vite + Tailwind CSS │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│         Backend API         │
│                             │
│ Node.js + Express.js        │
│ Authentication              │
│ Business Logic              │
│ Validation                  │
└──────────────┬──────────────┘
               │
               │ Prisma ORM
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│                             │
│ Users                       │
│ Customers                   │
│ Reservations                │
│ Rooms                       │
│ Payments                    │
│ Pricing                     │
│ Housekeeping                │
│ Maintenance                 │
└─────────────────────────────┘
               ▲
               │
               │ REST API
┌──────────────┴──────────────┐
│      Admin / Staff UI       │
│                             │
│ React + Vite + Tailwind CSS │
└─────────────────────────────┘
```

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Lucide React
- Fetch API
- Reusable UI components

## Backend

- Node.js
- Express.js
- JavaScript
- REST API
- Prisma ORM
- Authentication middleware
- Role-based access control

## Database

- PostgreSQL 16

## Development Tools

- npm
- Git
- GitHub
- Docker Desktop
- Prisma Studio
- VS Code
- Postman

---

# Main Features

## Customer Portal

The customer portal supports:

- room type browsing
- hotel booking
- customer authentication
- reservation creation
- booking history
- booking details
- discount and promotion handling
- payment information
- reservation cancellation
- responsive mobile and desktop layouts

## Admin / Staff Portal

The admin portal supports:

- dashboard
- reservation management
- room inventory
- front desk operations
- physical room assignment
- guest check-in
- guest check-out
- housekeeping
- maintenance
- customer management
- payment recording
- cancellations
- discounts
- promotions
- dynamic pricing
- room status tracking

---

# Customer Portal

The customer application is designed to behave like a real hotel website.

Customers browse room types rather than physical room numbers.

For example:

```text
Deluxe King
Premier Twin
Family Room
Executive Suite
```

Customers do not directly choose:

```text
Room 301
Room 402
Room 501
Room 602
```

Physical room assignment is handled by hotel staff after the reservation is created.

---

# Customer Booking Flow

Typical customer booking flow:

```text
Select Stay Dates
        ↓
Choose Room Type
        ↓
Enter Guest Information
        ↓
Apply Discount or Promotion
        ↓
Backend Calculates Price
        ↓
Review Reservation
        ↓
Create Reservation
        ↓
Receive Reservation Reference
```

The backend validates the reservation and pricing information.

---

# My Booking

The My Booking area can display:

- reservation reference
- guest name
- room type
- assigned room
- check-in date
- check-out date
- reservation status
- payment information
- discounts
- promotions
- total reservation amount
- cancellation eligibility

---

# Admin / Staff Portal

The internal admin application contains the main hotel operational modules.

The main sections are:

```text
Dashboard
Reservations
Rooms
Front Desk
Housekeeping
Maintenance
Guests
Payments
Cancellations
Pricing & Promotions
Settings
```

---

# Dashboard

The dashboard displays hotel operational data from the backend.

Typical information includes:

- total revenue
- active reservations
- room occupancy
- available rooms
- total physical rooms
- arrivals
- departures
- booking activity

---

# Reservations

The Reservations module allows hotel staff to:

- view reservations
- search reservations
- inspect guest information
- view room type
- inspect check-in and check-out dates
- view reservation status
- view assigned room
- create reservations
- refresh reservation data

Typical reservation statuses include:

```text
PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
CANCELLED
```

---

# Rooms and Inventory

The Rooms & Inventory page represents the hotel's physical room inventory.

Each room includes information such as:

- room number
- room type
- floor
- capacity
- base rate
- operational status

Room status is displayed as operational information and is normally changed through hotel workflows rather than manually from the inventory table.

Possible room statuses include:

```text
AVAILABLE
RESERVED
OCCUPIED
CLEANING
MAINTENANCE
```

---

# Room Types

The hotel currently contains the following room types:

| Room Type | Code | Capacity | Bed Configuration | Base Rate |
|---|---|---:|---|---:|
| Deluxe King | DELUXE | 2 | 1 King Bed | ₱3,000 |
| Premier Twin | TWIN | 3 | 2 Twin Beds | ₱3,200 |
| Family Room | FAMILY | 4 | 2 Queen Beds | ₱3,800 |
| Executive Suite | SUITE | 2 | 1 King Bed | ₱5,000 |

---

# Physical Room Inventory

## Floor 3

Rooms:

```text
301
302
303
304
305
```

Room Type:

```text
Deluxe King
```

## Floor 4

Rooms:

```text
401
402
403
404
405
```

Room Type:

```text
Premier Twin
```

## Floor 5

Rooms:

```text
501
502
503
```

Room Type:

```text
Family Room
```

## Floor 6

Rooms:

```text
601
602
```

Room Type:

```text
Executive Suite
```

Total physical rooms:

```text
15
```

---

# Front Desk

The Front Desk module manages guest arrival and departure operations.

It supports:

- room assignment
- room assignment filtering
- check-in
- check-out

Reservation filters include:

```text
All
Assigned
Not Assigned
```

Each reservation can display its assigned physical room.

Example:

```text
Physical Room

Room 305
Deluxe King
Floor 3
Reserved
```

If no room is assigned:

```text
Room not yet assigned
```

If no suitable room can be assigned:

```text
No suitable available room found.
```

The error is displayed directly inside the affected reservation.

---

# Room Assignment

Customers reserve a room type.

The actual physical room is assigned later.

Example:

```text
Reservation:
Executive Suite

Eligible Rooms:
601
602
```

The system attempts to assign a room that matches the reservation's required room type.

---

# Check-In Workflow

Typical check-in flow:

```text
Confirmed Reservation
        ↓
Physical Room Assigned
        ↓
Guest Checks In
        ↓
Reservation = CHECKED_IN
        ↓
Room = OCCUPIED
```

A reservation should have a valid physical room assignment before check-in.

---

# Check-Out Workflow

Typical check-out flow:

```text
Guest Checks Out
        ↓
Reservation = CHECKED_OUT
        ↓
Room = CLEANING
        ↓
Housekeeping Task Created
```

This prevents a room from immediately becoming available before it has been cleaned.

---

# Housekeeping

The Housekeeping module manages room cleaning tasks.

Housekeeping tasks can be created after:

- guest checkout
- maintenance completion
- manual cleaning task creation

The page supports:

```text
All
Pending
Completed
```

Each task can display:

- room number
- room type
- priority
- task status
- notes
- assigned staff
- completion timestamp

Priorities include:

```text
LOW
NORMAL
HIGH
URGENT
```

When housekeeping completes a room:

```text
Housekeeping Task = COMPLETED
Room = AVAILABLE
```

---

# Maintenance

The Maintenance module manages repair and service issues for physical rooms.

Maintenance tickets can include:

- room
- issue title
- issue description
- priority
- ticket status
- assigned staff
- creation date
- resolution date

Example maintenance issues:

```text
Air Conditioning Not Cooling
Bathroom Sink Leak
Faulty Room Door Lock
Electrical Issue
Damaged Furniture
Plumbing Problem
```

Priorities include:

```text
LOW
NORMAL
HIGH
URGENT
```

Maintenance status labels can include:

```text
Open
In Progress
Resolved
```

When a maintenance ticket is created:

```text
Room = MAINTENANCE
```

When the ticket is resolved:

```text
Maintenance Ticket = COMPLETED
Room = CLEANING
```

A housekeeping task is then created before the room becomes available again.

---

# Complete Room Lifecycle

Normal stay:

```text
AVAILABLE
   ↓
RESERVED
   ↓
OCCUPIED
   ↓
CLEANING
   ↓
AVAILABLE
```

Maintenance flow:

```text
MAINTENANCE
   ↓
CLEANING
   ↓
AVAILABLE
```

---

# Guests

The Guests module displays customer records connected to the hotel database.

Guest information may include:

- full name
- email address
- phone number
- customer account information
- reservation history

Customer profiles can be associated with reservations created through the customer portal or hotel staff.

---

# Payments

The Payments module records payments associated with reservations.

A payment record may contain:

- reservation
- amount
- payment method
- provider
- payment reference
- payment status
- transaction timestamp

Example providers:

```text
GCash
BDO Unibank
BPI
```

Example payment references:

```text
GC-260928-847251
BDO-9361847205
BPI-TRX-58274193
```

The backend validates the reservation's outstanding balance.

A payment cannot exceed the remaining balance.

Fully paid reservations are not shown as eligible when recording another payment.

---

# Discounts

Elara supports discount codes.

Current examples include:

```text
WELCOME10
STAY15
SAVE500
PREMIUM1000
MIDWEEK12
```

Discounts can use:

```text
Percentage Discount
Fixed Amount Discount
```

Discount configuration can include:

- discount value
- minimum spend
- valid dates
- active status

---

# Promotions

Elara also supports promotional codes.

Examples include:

```text
WEEKEND15
SUITE2000
HOLIDAY20
STAY10
FIRST1000
```

Promotions can contain:

- promotion type
- promotion value
- minimum spend
- maximum discount
- validity period
- usage limits

---

# Dynamic Pricing

Elara includes dynamic pricing rules.

Pricing rule types include:

```text
WEEKEND
ROOM_TYPE
HOLIDAY
LEAD_TIME
```

Rules can increase or decrease the normal room rate.

Example:

```text
Deluxe King Base Rate:
₱3,000

Weekend Adjustment:
+20%
```

Dynamic pricing is calculated through backend business logic.

---

# Pricing Flow

The reservation amount can be based on:

```text
Base Room Rate
      ↓
Dynamic Pricing Adjustment
      ↓
Discount / Promotion
      ↓
Tax
      ↓
Final Reservation Total
```

The backend is responsible for validating final pricing.

---

# Cancellations

The Cancellations module is divided into:

```text
Eligible Reservations
Recent Cancellations
```

Eligible reservations can be filtered using:

```text
All
Assigned
Not Assigned
Fully Paid
Outstanding
```

Recent cancellations can be filtered using:

```text
All
With Payment
Without Payment
```

Cancellation information can include:

- reservation reference
- guest
- room type
- stay dates
- cancellation reason
- total reservation amount
- amount paid
- inventory release status

Reservations that can normally be cancelled include:

```text
PENDING
CONFIRMED
```

When an eligible reservation is cancelled:

```text
Reservation = CANCELLED
```

Associated inventory is released according to backend rules.

---

# Authentication

Elara uses separate authentication sessions for the admin portal and customer portal.

Example cookies:

```text
elara_admin_session
elara_customer_session
```

This allows a customer session and admin session to remain active independently.

Frontend requests use credentials when communicating with the backend.

Example:

```javascript
fetch(url, {
  credentials: "include"
});
```

---

# Roles

The backend supports role-based access.

Roles include:

```text
SUPER_ADMIN
ADMIN
FRONT_DESK
HOUSEKEEPING
MAINTENANCE
CUSTOMER
```

Different backend operations can be restricted depending on the authenticated user's role.

---

# Database

Elara uses PostgreSQL.

Current development configuration:

```text
PostgreSQL Version:
16

Database:
elara_hotel

Local Port:
5433
```

The development database can run through Docker.

---

# Main Database Models

The Prisma schema includes the following main models:

```text
User
CustomerProfile
RoomType
Room
Reservation
Payment
Discount
PricingRule
Promotion
HousekeepingTask
MaintenanceTicket
```

These models represent the main hotel, customer, reservation, financial, and operational data.

---

# Repository Structure

```text
Elara-Hotel/
│
├── admin/
│   ├── src/
│   │   ├── components/
│   │   ├── Context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── frontend-customer/
│   ├── src/
│   │   ├── components/
│   │   ├── Context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── ELARA-Hotel-Backend/
│   └── elara-backend/
│       ├── prisma/
│       │   ├── migrations/
│       │   └── schema.prisma
│       │
│       ├── scripts/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── routes/
│       │   └── services/
│       │
│       └── package.json
│
├── .gitignore
└── README.md
```

---

# Prerequisites

Before running Elara, install:

- Node.js
- npm
- Git
- Docker Desktop
- PostgreSQL 16 or PostgreSQL Docker image

Recommended development tools:

- Visual Studio Code
- Prisma Studio
- Postman

---

# Environment Configuration

Environment files are excluded from Git.

The repository `.gitignore` should contain:

```gitignore
node_modules/
dist/

.env
.env.*
!.env.example

.vscode/
.idea/

.DS_Store
Thumbs.db
```

---

# Backend Environment

Create:

```text
ELARA-Hotel-Backend/elara-backend/.env
```

Example:

```env
NODE_ENV=development

PORT=8000

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/elara_hotel?schema=public"

JWT_SECRET="YOUR_SECRET"

JWT_EXPIRES_IN="8h"

ADMIN_APP_ORIGIN="http://localhost:5173"

CUSTOMER_APP_ORIGIN="http://localhost:5174"

COOKIE_SECURE=false
```

Use your own database password and JWT secret.

Do not commit the real `.env` file.

---

# Admin Environment

Create:

```text
admin/.env
```

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

# Customer Environment

Create:

```text
frontend-customer/.env
```

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

# Database Setup

Elara currently uses PostgreSQL 16.

Example Docker container:

```powershell
docker run --name elara-postgres `
  -e POSTGRES_PASSWORD=YOUR_PASSWORD `
  -e POSTGRES_DB=elara_hotel `
  -p 5433:5432 `
  -d postgres:16
```

Check running containers:

```powershell
docker ps
```

Start an existing database container:

```powershell
docker start elara-postgres
```

---

# Backend Setup

Navigate to the backend folder:

```powershell
cd ELARA-Hotel-Backend\elara-backend
```

Install dependencies:

```powershell
npm install
```

Generate the Prisma client:

```powershell
npx prisma generate
```

Apply database migrations:

```powershell
npx prisma migrate dev
```

Start the backend:

```powershell
npm run dev
```

Backend:

```text
http://localhost:8000
```

API:

```text
http://localhost:8000/api
```

---

# Admin Frontend Setup

Open another terminal.

Navigate to:

```powershell
cd admin
```

Install dependencies:

```powershell
npm install
```

Start the application:

```powershell
npm run dev
```

Admin:

```text
http://localhost:5173
```

---

# Customer Frontend Setup

Open another terminal.

Navigate to:

```powershell
cd frontend-customer
```

Install dependencies:

```powershell
npm install
```

Start the application:

```powershell
npm run dev
```

Customer portal:

```text
http://localhost:5174
```

---

# Running the Complete Application

Use three terminals.

Terminal 1:

```powershell
cd ELARA-Hotel-Backend\elara-backend
npm run dev
```

Terminal 2:

```powershell
cd admin
npm run dev
```

Terminal 3:

```powershell
cd frontend-customer
npm run dev
```

The system will then be available at:

```text
Admin:
http://localhost:5173

Customer:
http://localhost:5174

Backend:
http://localhost:8000

API:
http://localhost:8000/api
```

---

# Prisma Commands

Generate Prisma client:

```powershell
npx prisma generate
```

Create and apply a development migration:

```powershell
npx prisma migrate dev --name migration_name
```

Check migration status:

```powershell
npx prisma migrate status
```

Open Prisma Studio:

```powershell
npx prisma studio
```

---

# API

The application uses a REST API.

Major API areas include:

```text
Authentication
Reservations
Rooms
Room Types
Payments
Housekeeping
Maintenance
Admin Operations
```

Examples of operations include:

```text
Login
Logout
Register Customer
List Reservations
Create Reservation
Cancel Reservation
Assign Room
Check In
Check Out
List Rooms
List Room Types
Record Payment
List Housekeeping Tasks
Complete Housekeeping Task
List Maintenance Tickets
Resolve Maintenance Ticket
```

---

# Local Network Testing

Elara can be tested from another device on the same local network.

Find the computer's IPv4 address:

```powershell
ipconfig
```

Example:

```text
192.168.1.25
```

Run the frontend with network access enabled:

```powershell
npm run dev -- --host 0.0.0.0
```

Do this for both frontend applications.

The device may then access:

```text
http://192.168.1.25:5173
```

for the admin portal and:

```text
http://192.168.1.25:5174
```

for the customer portal.

For this setup, the frontend API environment variable must use the computer's local IP instead of `localhost`.

Example:

```env
VITE_API_BASE_URL=http://192.168.1.25:8000/api
```

The backend CORS configuration must also allow the corresponding frontend addresses.

---

# Mobile and Responsive Testing

The interface should be checked on:

- Windows desktop
- Windows laptop
- Android Chrome
- iPhone Safari
- Android tablet
- iPad
- Chrome responsive device mode

Recommended checks:

- navigation fits smaller screens
- cards stack correctly
- buttons remain accessible
- forms remain readable
- modal windows fit the viewport
- tables can scroll when required
- date inputs remain usable
- booking flow works
- login and logout work
- reservation screens remain readable
- admin cards remain usable
- front desk controls remain accessible
- housekeeping tasks remain readable
- maintenance tasks remain readable

---

# Security

The following files and values should not be committed:

```text
.env
.env.local
database passwords
JWT secrets
node_modules
```

Authentication is separated between admin and customer sessions.

Important application rules are validated through the backend.

Before committing changes:

```powershell
git status
```

Verify that `.env` files are not staged.

---

# Development Data

The backend contains scripts for development and test data.

Scripts are stored under:

```text
ELARA-Hotel-Backend/elara-backend/scripts/
```

Examples include:

```text
reset-demo-data.js
seed-test-bookings.js
```

---

# Resetting Demo Data

To reset operational test data:

```powershell
node scripts/reset-demo-data.js
```

The reset script is intended for development use.

It removes operational records such as:

- payments
- housekeeping tasks
- maintenance tickets
- reservations
- customer profiles
- customer users

while preserving hotel configuration such as:

- staff users
- physical rooms
- room types
- discounts
- promotions
- pricing rules

---

# Troubleshooting

## Failed to Fetch

If the frontend shows:

```text
Failed to fetch
```

check:

- backend is running
- backend port is correct
- frontend `.env` uses the correct API URL
- CORS configuration is correct

Expected local API:

```text
http://localhost:8000/api
```

Restart Vite after changing `.env`.

---

## CORS Error

Verify:

```env
ADMIN_APP_ORIGIN=http://localhost:5173
CUSTOMER_APP_ORIGIN=http://localhost:5174
```

The configured origins must match the actual frontend URLs.

---

## PostgreSQL Connection Error

Check:

```powershell
docker ps
```

If the database container is stopped:

```powershell
docker start elara-postgres
```

Also verify:

```env
DATABASE_URL
```

Check the:

- username
- password
- host
- port
- database name

---

## Prisma Client Error

Run:

```powershell
npx prisma generate
```

Then restart the backend.

---

## Prisma Schema Changed

Run:

```powershell
npx prisma migrate dev --name describe_change
```

Then:

```powershell
npx prisma generate
```

---

## Port Already in Use

Check the backend port:

```powershell
netstat -ano | findstr :8000
```

Check the admin port:

```powershell
netstat -ano | findstr :5173
```

Check the customer port:

```powershell
netstat -ano | findstr :5174
```

---

## No Suitable Available Room Found

This means the system cannot find an available physical room matching the reservation's room type.

Check the Rooms & Inventory page.

Possible blocking room statuses include:

```text
RESERVED
OCCUPIED
CLEANING
MAINTENANCE
```

---

## Guest Cannot Check In

Verify:

- reservation is valid
- reservation is eligible for check-in
- physical room is assigned
- room is not under maintenance
- backend accepted the operation

---

## Payment Cannot Be Recorded

Check whether:

- reservation is already fully paid
- payment exceeds outstanding balance
- reservation exists
- payment data is valid

---

# Current Elara Workflow Summary

```text
Customer Browses Rooms
        ↓
Customer Creates Reservation
        ↓
Reservation Stored in PostgreSQL
        ↓
Staff Reviews Reservation
        ↓
Physical Room Assigned
        ↓
Room = RESERVED
        ↓
Guest Checks In
        ↓
Room = OCCUPIED
        ↓
Guest Checks Out
        ↓
Room = CLEANING
        ↓
Housekeeping Completes Cleaning
        ↓
Room = AVAILABLE
```

Maintenance:

```text
Maintenance Issue
        ↓
Ticket Created
        ↓
Room = MAINTENANCE
        ↓
Ticket Resolved
        ↓
Room = CLEANING
        ↓
Housekeeping Completes Cleaning
        ↓
Room = AVAILABLE
```

The same system also manages:

```text
Customers
Payments
Cancellations
Discounts
Promotions
Dynamic Pricing
Reservations
Room Inventory
Housekeeping
Maintenance
```

---

# Git Workflow

Check changes:

```powershell
git status
```

Stage changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Update Elara Hotel"
```

Push:

```powershell
git push
```

---

# Elara Hotel

Elara Hotel combines customer reservations, physical room inventory, front desk operations, housekeeping, maintenance, payments, cancellations, pricing, and administrative management into one integrated full-stack hotel platform.
