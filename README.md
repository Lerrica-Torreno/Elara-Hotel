# Elara Hotel frontend

Two independent React/Vite interfaces for the hotel coursework project:

| Folder | Audience | Current scope |
| --- | --- | --- |
| `frontend-customer/` | Guests | Room browsing, stay search, pricing preview, booking walkthrough, session-only preview lookup, cancellation walkthrough |
| `admin/` | Staff | Dashboard and sample room, reservation, payment, housekeeping, maintenance, promotion, and pricing workflows |

## Run locally

Open a separate terminal for each interface:

```bash
cd frontend-customer
npm ci
npm run dev
```

```bash
cd admin
npm ci
npm run dev
```

From each folder, `npm run build` produces a production bundle in `dist/`.

## What works today

The guest can pick dates and party size, compare rooms that fit the party, choose a room type, enter guest details, and review an estimated total with an itemized sample rate and tax. Date, guest-count, and room-capacity checks run before review. The resulting reference is a **browser-session preview**, not a hotel reservation. It can be looked up only with the matching reference and email in the current session. The cancellation screen also demonstrates a form without submitting a request.

The staff interface uses local sample records. Its dashboard and payment totals describe those sample records; edits in one page are not yet shared across the other pages.

## Backend integration handoff

Before a real booking can be confirmed:

1. Agree on the API contract with the backend team. The draft helpers in `src/services/api.js` are **proposals**, not an implemented contract; the WebSystemsMidtermProj backend currently has routes under `/api/v1` with different payloads and authentication requirements.
2. Load room types and availability for the actual dates and party size. The counts in mock data do not establish live availability.
3. Obtain the itemized quote from one backend pricing service for both guest and staff interfaces. Validate discounts, taxes, and the final total on the server.
4. Submit a reservation and use the returned ID and status only after the server accepts it. Implement real lookup and cancellation with authorization and policy checks.
5. Connect staff edits and metrics to persisted records, and provide staff authentication before exposing operational data.
6. Replace sample photos, contact details, policies, and offer eligibility with verified hotel content before launch.

This frontend never writes to PostgreSQL directly. Use the backend as the source of truth for inventory, pricing, reservations, and payments.
