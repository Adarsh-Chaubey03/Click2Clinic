# Click to Clinic

Click to Clinic is a healthcare management platform for patients, doctors,
laboratories, pharmacies, and administrators.

## Applications

- `backend/` is the Express and MongoDB API. It owns authentication,
  authorization, uploads, payments, consultations, and AI endpoints.
- `frontend/` is the Vite patient portal.
- `admin/` is the Vite administrator and doctor portal.
- `mobile/` is the Expo client for patient, doctor, and administrator flows.
The browser and mobile clients call the backend API. The backend connects to
MongoDB for persistence, Cloudinary for uploaded media, Razorpay for payments,
Socket.IO for consultation signaling, and the configured AI services.

## Local development

Install dependencies in each application directory:

```text
npm install --prefix backend
npm install --prefix frontend
npm install --prefix admin
npm install --prefix mobile
```

Create environment files from the templates described in
[`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md), then use the root commands:

```text
npm run dev:backend
npm run dev:frontend
npm run dev:admin
npm run dev:mobile
```

Each command is independent and can run in its own terminal.

## Available functionality

The platform provides:

- patient registration, profiles, doctor discovery, appointment booking, lab
  bookings, medicine shopping, checkout, order history, diagnosis assistance,
  chatbot, disease awareness, maps, and consultations;
- doctor authentication, schedules, appointment handling, patient reports,
  AI-assisted prescriptions and consultations;
- administrator authentication, dashboard metrics, doctor verification,
  medicine and laboratory management, appointment oversight, and order
  operations; and
- Expo navigation and client screens for patient, doctor, and administrator
  workflows.

Payment, file upload, AI, and consultation features require the integrations
listed in [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).
