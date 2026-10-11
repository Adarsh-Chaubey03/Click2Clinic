# Click2Clinic

## Digital Healthcare Management Platform

Click2Clinic is a full-stack healthcare platform designed to connect patients,
doctors, laboratories, pharmacies, and administrators through a unified
digital experience. The project demonstrates how healthcare workflows can be
organized across web, mobile, and administrative applications while keeping
authentication, appointments, consultations, medical services, and commerce
connected through a shared backend.

> **Project status:** Active development
> **Repository type:** Full-stack monorepo
> **Primary runtime:** Node.js 18+

---

## Executive Summary

Click2Clinic addresses the fragmentation commonly found in healthcare
operations. Patients can discover doctors, schedule appointments, book
diagnostic tests, order medicines, access health information, and communicate
with healthcare professionals from one platform. Doctors can manage their
availability and patient-related workflows, while administrators can oversee
users, services, inventory, appointments, and orders.

The system is structured as a multi-client application:

| Application | Audience | Responsibility |
| --- | --- | --- |
| `frontend/` | Patients | Patient-facing web portal |
| `admin/` | Administrators and doctors | Operations and clinical management portal |
| `mobile/` | Patients, doctors, and administrators | Expo-based mobile client |
| `backend/` | All clients | REST API, authentication, integrations, and persistence |

---

## Business Capabilities

### Patient experience

- Account registration, login, profile management, and authentication
- Doctor discovery by speciality
- Appointment scheduling and appointment history
- Laboratory test discovery and booking
- Pharmacy browsing, medicine details, cart, checkout, and order history
- Online consultation and real-time communication workflows
- Health awareness content and disease information
- Location and map-based healthcare discovery
- Chatbot-assisted health guidance and doctor availability discovery
- RAG-powered doctor recommendations using symptom context, speciality
  matching, semantic vector search, and live slot availability

### Doctor experience

- Doctor authentication and profile management
- Availability and schedule management
- Appointment review and handling
- Patient and consultation workflows
- Medical report and prescription-related operations
- Support for AI-assisted consultation and prescription scenarios

### Administration experience

- Dashboard and operational metrics
- Doctor verification and management
- Medicine inventory management
- Laboratory and test management
- Appointment and order oversight
- Administrative authentication and access control

---

## Architecture

Click2Clinic uses a client-server architecture:

```text
Patient Web Portal ───────┐
Admin/Doctor Portal ──────┼──> Express REST API ───> MongoDB
Expo Mobile Client ───────┘             │
                                       ├── Cloudinary
                                       ├── Razorpay
                                       ├── Socket.IO
                                       ├── Gemini / AI services
                                       └── MongoDB Atlas Vector Search
```

### Backend responsibilities

The backend is implemented with Express and MongoDB/Mongoose. It provides:

- RESTful API endpoints for users, doctors, appointments, laboratories,
  medicines, orders, consultations, uploads, and administration
- JWT-based authentication and role-aware access control
- Password protection using bcrypt
- File upload handling through Multer and Cloudinary
- Payment integration through Razorpay
- Real-time consultation signaling through Socket.IO
- AI-assisted symptom analysis and doctor recommendations through Gemini
- Retrieval-Augmented Generation (RAG) for semantic doctor matching
- MongoDB Atlas Vector Search over Gemini-generated doctor-profile embeddings
- Input validation, CORS configuration, and environment-based configuration

### Frontend responsibilities

The patient web portal is built with React and Vite. It provides responsive
healthcare journeys, routing, protected user flows, pharmacy commerce,
appointments, laboratory bookings, consultations, maps, notifications, and
localized UI support.

### Admin and mobile responsibilities

The administration portal provides operational control over the platform. The
Expo application extends the core workflows to Android, iOS, and web-capable
mobile environments.

---

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| UI and interaction | Framer Motion, Headless UI, React Icons, React Toastify |
| Backend | Node.js, Express, ES Modules |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Payments | Razorpay |
| Media | Cloudinary, Multer |
| Real-time communication | Socket.IO |
| AI capabilities | Google Generative AI / Gemini |
| Doctor recommendation search | Gemini embeddings, MongoDB Atlas Vector Search, MongoDB text-search fallback |
| Maps and location | Leaflet, React Leaflet |
| Mobile | Expo, React Native, React Navigation |
| Quality tooling | ESLint, Vite production builds, Node-based backend tests |

---

## Engineering Highlights

This project demonstrates the following engineering competencies:

- Designing a modular monorepo with separate web, mobile, admin, and API
  applications
- Building role-based healthcare workflows around a shared API
- Integrating third-party services for payments, media, maps, real-time
  communication, and AI
- Implementing a RAG pipeline that combines Gemini symptom analysis with
  semantic retrieval of doctor profiles
- Managing asynchronous data loading and client-side state for appointments,
  pharmacy carts, and authenticated sessions
- Supporting responsive user experiences across patient and operations portals
- Using environment variables for secrets and deployment-specific settings
- Applying reusable UI components and shared application context patterns
- Providing fallback behavior for selected cached or external-service flows

---

## Repository Structure

```text
Click2Clinic/
├── admin/                  # Administrator and doctor portal
├── backend/                # Express API and service integrations
├── frontend/               # Patient-facing React application
├── mobile/                 # Expo / React Native application
├── package.json            # Workspace configuration and root scripts
└── README.md
```

---

## Prerequisites

Install the following before starting local development:

- Node.js 18 or later
- npm
- MongoDB, either locally or through a hosted MongoDB provider
- Credentials for the optional external services listed below
- Expo tooling if the mobile application is being run on a device or emulator

---

## Local Setup

### 1. Install dependencies

Run the following commands from the repository root:

```bash
npm install --prefix backend
npm install --prefix frontend
npm install --prefix admin
npm install --prefix mobile
```

### 2. Configure environment variables

Create the following files from the available examples:

```text
backend/.env
frontend/.env
```

Do not commit these files. They may contain database credentials, payment
secrets, JWT signing keys, cloud credentials, and AI API keys.

#### Backend configuration

The backend environment supports:

```dotenv
PORT=3000
CORS_ALLOWED_ORIGINS=http://localhost:5173
MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_CLOUD_API_KEY=
CLOUDINARY_CLOUD_API_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
JWT_SECRET=
CURRENCY=$
RAZORPAY_ID=
RAZORPAY_SECRET=
GEMINI_API_KEY=
CHATBOT_TIMEZONE=Asia/Kolkata
```

#### Frontend configuration

```dotenv
VITE_BACKEND_URL=http://localhost:3000
VITE_RAZORPAY_ID=
```

The `admin` and `mobile` applications use the backend URL configuration
required by their local implementation and deployment environment.

### 3. Start the applications

Run each application in a separate terminal:

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:admin
npm run dev:mobile
```

The frontend and admin applications are served by Vite. The backend runs on
the configured API port, which defaults to `3000`.

---

## Available Scripts

### Root scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:backend` | Start the backend with Nodemon |
| `npm run dev:frontend` | Start the patient web portal |
| `npm run dev:admin` | Start the admin and doctor portal |
| `npm run dev:mobile` | Start the Expo development server |

### Application scripts

```bash
# Backend
npm --prefix backend test
npm --prefix backend start
npm --prefix backend run generate-embeddings

# Web applications
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix admin run lint
npm --prefix admin run build

# Mobile
npm --prefix mobile run android
npm --prefix mobile run ios
npm --prefix mobile run web
```

---

## Quality and Security Considerations

- Keep secrets in local environment files or a managed secret store.
- Use a strong, unique `JWT_SECRET` outside local development.
- Restrict `CORS_ALLOWED_ORIGINS` to trusted client domains in deployment.
- Use HTTPS for production API, payment, authentication, and upload traffic.
- Validate and authorize all role-sensitive API operations.
- Review third-party service quotas, webhook configuration, and payment
  verification before production release.
- Run linting and production builds for the affected client before merging.
- Run the backend test command after changes to chatbot or availability logic.

This repository is intended for development and demonstration unless a
deployment environment explicitly provides the required production controls,
monitoring, data governance, and healthcare compliance processes.

---

## Professional Project Summary

**Click2Clinic is a multi-platform healthcare management solution that
combines patient engagement, doctor operations, laboratory services, pharmacy
commerce, and administrative oversight in one scalable full-stack
architecture.** It showcases practical experience in React, Node.js, MongoDB,
third-party API integration, authentication, real-time communication,
responsive design, and cross-platform mobile development.

The project is suitable for evaluating skills in:

- Full-stack application design
- API and database development
- Role-based workflow implementation
- Healthcare and e-commerce domain modeling
- External service integration
- Responsive web and mobile product development
- Maintainable repository organization and engineering practices

---

## RAG-Based Doctor Recommendation System

The chatbot uses a Retrieval-Augmented Generation workflow to recommend
relevant doctors from the application's verified doctor data. The RAG flow is
implemented in the backend and is designed to keep recommendations connected
to live platform data rather than returning generic AI-generated names.

### Retrieval flow

1. **Collect user context**
   The chatbot validates the message, screens for emergencies, and maintains a
   protected chatbot session containing symptoms, duration, severity, body
   area, requested date, and requested time slot.
2. **Analyze symptoms**
   Gemini analyzes the structured symptom context and returns possible
   conditions, a recommended speciality, precautions, and an urgency level.
   The response is clearly presented as assistance rather than a diagnosis.
3. **Build the retrieval query**
   The collected symptoms and Gemini's recommended speciality are combined into
   a search query.
4. **Retrieve relevant doctor profiles**
   Doctor profile text is embedded with Gemini's embedding model and stored in
   the `doctor_embeddings` collection. MongoDB Atlas Vector Search retrieves
   semantically relevant profiles using the configured `vector_index`.
5. **Apply live availability data**
   Retrieved profiles are reconciled with the current doctor records so that
   availability, booked slots, fees, and requested-date slots are not stale
   values from the embedding document.
6. **Return actionable recommendations**
   The chatbot returns a small list of matching doctors, their speciality,
   experience, fees, profile image, and bookable slots where available. The
   patient can continue directly to the appointment flow.

### Embeddings and fallback behavior

- Doctor embeddings are generated by
  `backend/scripts/generate-doctor-embeddings.js`.
- The backend command is:

  ```bash
  npm --prefix backend run generate-embeddings
  ```

- Embeddings are generated from verified doctor fields such as name,
  speciality, degree, experience, and profile information.
- Gemini uses document and query retrieval task types so stored doctor
  profiles and user searches are compared semantically.
- If Gemini embedding generation or Atlas Vector Search is unavailable, the
  backend falls back to MongoDB keyword text search instead of fabricating
  local vectors or silently returning unrelated results.
- Direct questions such as “Which doctor is available today?” use the live
  availability workflow and return doctors with genuinely bookable slots.
- Emergency screening runs before symptom analysis and doctor retrieval.

The RAG implementation is centered in:

```text
backend/services/embedding.service.js
backend/services/chatbot.service.js
backend/models/doctorEmbedding.model.js
backend/models/chatbotSession.model.js
backend/scripts/generate-doctor-embeddings.js
```

---

## License and Usage

No explicit open-source license is currently defined for this repository.
Treat the source code as private unless the project owner provides separate
written permission for reuse, distribution, or commercial deployment.
