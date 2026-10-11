# RAG-Powered Healthcare Chatbot — Implementation Plan

## Doctor Availability Correction (2026-10-11)

- Added deterministic routing for questions such as “Which doctor is available today?” so they bypass symptom extraction and AI symptom assessment.
- Specialty-qualified availability requests now normalize common category names (for example, General Physician and Dermatology) and filter live results before cards are returned; broad doctor requests remain unfiltered.
- Doctor cards avoid duplicating the `Dr.` title when the stored doctor name already contains it.
- Added timezone-aware live slot generation using `CHATBOT_TIMEZONE`, then `TZ`, with `Asia/Kolkata` as the application default. Availability now excludes past/taken slots from the doctor’s `slot_booked` data and active, non-cancelled appointment records.
- Chatbot availability results query live doctor records and return verified specialty data, genuinely bookable slots, and the existing `/appointment/:doctorId` booking link. Vector-search results and cached frontend doctor data are not used to decide bookability.
- Updated the doctor availability endpoint and chatbot doctor cards to use `hasAvailability`/live slots rather than the general doctor flag alone.
- Made appointment slot claiming atomic in MongoDB and roll back the claim if appointment creation fails, preserving existing payment and cancellation workflows.
- Added a Hugging Face outage/credit circuit breaker and local symptom-message extraction fallback. Unsupported models, provider outages, and exhausted credits no longer cause repeated failed inference calls or turn greetings into symptoms.
- Removed hash-based embedding fallback. Doctor indexing and query vectors now use the configured Hugging Face model exclusively; embedding failures use MongoDB keyword text search and are surfaced to the web UI as degraded mode.
- Symptom intake now asks one concise follow-up round only. The next user response is analyzed instead of triggering another question round.
- Added a clickable specialist recommendation action that starts live, specialty-filtered availability discovery.
- Chatbot handlers use the authenticated JWT identity from `req.userId`; client-supplied user IDs are overwritten by middleware and are not trusted.
- Booking validates requested date/time against the same generated slot rules before atomically claiming the slot.
- Preserved emergency screening, adaptive symptom follow-up, authentication, and medical-safety messaging. No mobile files were modified.

### Validation Results

```text
backend: npm test
✅ All tests passed
✅ Covers availability-intent routing, symptom-intake routing, generated live slots,
   no remaining slots, booking conflicts, and local AI-unavailable symptom extraction

backend: node --check services/chatbot.service.js controllers/chatbot.controller.js controllers/user.controller.js
✅ Syntax checks passed

frontend: npm run build
✅ Vite production build succeeded
⚠️ Existing Browserslist freshness and bundle-size warnings only

git diff --check
✅ No whitespace errors
```

## Architecture Overview

```
┌──────────────────────┐     ┌─────────────────────────────────────────┐
│   React Frontend     │     │          Express Backend                │
│                      │     │                                         │
│  Chatbot.jsx (widget)│────▶│  /api/user/chatbot/*  (auth-protected) │
│  - Chat UI           │     │  ├── chatbot.controller.js              │
│  - Session state     │     │  ├── chatbot.routes.js                  │
│  - localStorage hist │     │  ├── chatbot.service.js (RAG logic)     │
│  - Doctor cards      │     │  ├── embedding.service.js (HF embed)    │
│  - Book link         │     │  └── chatbotSession.model.js            │
└──────────────────────┘     │                                         │
                             │  Vector Search: MongoDB Atlas            │
                             │  Embeddings: HF sentence-transformers   │
                             │  LLM: HF text-generation (existing)     │
                             └─────────────────────────────────────────┘
```

### Key Decisions
1. **Separate chatbot routes** (`/api/user/chatbot/*`) — keeps existing `/api/user/chatbot-response` unchanged for mobile backward-compatibility
2. **Auth-protected new endpoints** — use existing `authUser` middleware; derive userId from JWT
3. **Hybrid storage** — structured session data (symptoms, state) in MongoDB `chatbot_sessions` collection; chat history is limited to browser `sessionStorage` and is cleared when the tab session ends
4. **Hugging Face for embeddings** — `sentence-transformers/all-MiniLM-L6-v2` (384-dim) via HF Inference API
5. **MongoDB Atlas Vector Search** — index `doctor_embeddings` collection for semantic doctor retrieval
6. **Doctor profile text** — built from verified DB fields only: `name`, `speciality`, `degree`, `experience`, `about`, `fees`, `address`
7. **No mobile changes** — new routes are additive; old chatbot endpoint preserved exactly
8. **Fallback search** — if Atlas Vector Search or Hugging Face embeddings are unavailable, falls back to MongoDB keyword text search and reports degraded mode

---

## Checklist

### Phase 1: Backend Foundation
| # | Task | Status |
|---|------|--------|
| 1.1 | Create `ChatbotSession` model (MongoDB) | ✅ Completed |
| 1.2 | Create `DoctorEmbedding` model (MongoDB) | ✅ Completed |
| 1.3 | Create `embedding.service.js` (HF embedding calls) | ✅ Completed |
| 1.4 | Create `chatbot.service.js` (RAG orchestration) | ✅ Completed |
| 1.5 | Create `chatbot.controller.js` (route handlers) | ✅ Completed |
| 1.6 | Create `chatbot.routes.js` (auth-protected routes) | ✅ Completed |
| 1.7 | Register chatbot routes in `server.js` | ✅ Completed |
| 1.8 | Create doctor embedding generation script | ✅ Completed |

### Phase 2: RAG & Vector Search
| # | Task | Status |
|---|------|--------|
| 2.1 | Build doctor profile text from verified fields | ✅ Completed |
| 2.2 | Generate embeddings via HF API | ✅ Completed |
| 2.3 | Store in `doctor_embeddings` collection | ✅ Completed |
| 2.4 | Document Atlas Vector Search index creation | ✅ Completed |
| 2.5 | Implement semantic doctor search | ✅ Completed |
| 2.6 | Date-aware availability filtering | ✅ Completed |

### Phase 3: Chatbot Intelligence
| # | Task | Status |
|---|------|--------|
| 3.1 | Adaptive symptom collection with follow-up questions | ✅ Completed |
| 3.2 | Emergency/safety screening | ✅ Completed |
| 3.3 | Cautious medical analysis (not diagnosis) | ✅ Completed |
| 3.4 | Uncertainty handling when AI analyses disagree | ✅ Completed |
| 3.5 | Session state management (structured symptoms) | ✅ Completed |

### Phase 4: Frontend Integration
| # | Task | Status |
|---|------|--------|
| 4.1 | Replace Chatbot.jsx with RAG-powered version | ✅ Completed |
| 4.2 | Auth gate — require login to use chatbot | ✅ Completed |
| 4.3 | Doctor recommendation cards with book links | ✅ Completed |
| 4.4 | Session management UI (new/clear session) | ✅ Completed |
| 4.5 | Error handling and loading states | ✅ Completed |

### Phase 5: Security & Testing
| # | Task | Status |
|---|------|--------|
| 5.1 | Protect all chatbot endpoints with `authUser` | ✅ Completed |
| 5.2 | Session ownership enforcement | ✅ Completed |
| 5.3 | Input validation and sanitization | ✅ Completed |
| 5.4 | Backend chatbot regression tests | ✅ Completed (all assertions pass) |
| 5.5 | Backend tests for booking edge cases | ✅ Completed |
| 5.6 | Frontend build verification | ✅ Completed (Vite build passes) |
| 5.7 | Mobile code unchanged verification | ✅ Completed (0 mobile files modified) |

---

## Environment Variables

### New (add to `backend/.env`)
```env
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHATBOT_TIMEZONE=Asia/Kolkata
CORS_ALLOWED_ORIGINS=https://your-frontend.example.com
```

### Existing (already required)
```env
HUGGING_API_KEY=          # Reused for both text-gen and embeddings
HUGGINGFACE_MODEL=        # Optional: primary text-gen model
HUGGINGFACE_FALLBACK_MODELS=  # Optional: comma-separated fallbacks
HF_ROUTER_ORIGIN=        # Optional: defaults to https://router.huggingface.co
MONGODB_URI=              # Required
JWT_SECRET=               # Required
CORS_ALLOWED_ORIGINS=    # Comma-separated production frontend origins
VITE_BACKEND_URL=         # Frontend build-time variable; configure in frontend/.env.production
```

---

## MongoDB Atlas Vector Search Setup

### Step 1: Generate doctor embeddings
```bash
cd backend
npm run generate-embeddings
```
This creates documents in the `doctor_embeddings` collection with 384-dim vectors.

### Step 2: Create Atlas Vector Search index

1. Go to MongoDB Atlas → your cluster → Browse Collections
2. Select the `doctor_embeddings` collection
3. Go to the **Atlas Search** tab → **Create Search Index**
4. Choose **JSON Editor** and enter:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "speciality"
    },
    {
      "type": "filter",
      "path": "available"
    }
  ]
}
```

5. Name the index: `doctor_vector_index`
6. Click **Create**

### Step 3: Re-index when doctors change
Run `npm run generate-embeddings` after adding, updating, or removing doctors. The script handles creates, updates, and orphan cleanup.

### Fallback behavior
If Hugging Face embeddings or the Atlas Vector Search index is unavailable, the chatbot uses MongoDB keyword text matching and marks the response as degraded mode. It never writes or queries hash-based vectors in the Atlas index.

---

## API Endpoints

All endpoints are under `/api/user/chatbot/` and require the `token` header (JWT).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message` | Send a message to the chatbot |
| GET | `/session` | Get current active session |
| POST | `/session/new` | Start a new conversation |
| POST | `/session/end` | End current session |
| DELETE | `/session/:sessionId` | Delete a session |
| POST | `/doctors/search` | Semantic doctor search |
| GET | `/doctor/:docId/availability` | Live doctor availability |

---

## Verification Results

### Backend Tests (`npm test`)
```
All assertions passed
- Emergency screening: 12 emergency + 8 non-emergency cases
- Doctor profile text builder: 3 test cases (full, minimal, empty)
- Input validation: 3 test categories (HTML sanitization, length, empty)
- Follow-up question logic: 3 scenarios
- Session ownership: 2 test cases
- Booking availability: 4 slot cases + 1 concurrent booking edge case
```

### Frontend Build
```
✓ Vite production build succeeds with no errors
```

### Mobile App Boundary
```
0 files modified in mobile/ directory
0 files modified in admin/ directory
git diff --name-only -- mobile/ admin/ → (empty)
```

### Backend Syntax Check
```
All 7 new files pass node --check (zero syntax errors):
  - server.js, chatbot.routes.js, chatbot.controller.js
  - chatbotSession.model.js, doctorEmbedding.model.js
  - embedding.service.js, chatbot.service.js
```

---

## Files Changed

### New files (10)
| File | Purpose |
|------|---------|
| `backend/models/chatbotSession.model.js` | Session data model (symptoms, phase, analysis) |
| `backend/models/doctorEmbedding.model.js` | Vector embedding storage for doctors |
| `backend/services/embedding.service.js` | HF embedding API integration |
| `backend/services/chatbot.service.js` | RAG orchestration (symptom collection, analysis, search) |
| `backend/controllers/chatbot.controller.js` | Auth-protected route handlers |
| `backend/routes/chatbot.routes.js` | Express route definitions |
| `backend/scripts/generate-doctor-embeddings.js` | Embedding generation CLI script |
| `backend/tests/chatbot.test.js` | Test suite (28 tests) |
| `IMPLEMENTATION.md` | This file |

### Modified files
| File | Change |
|------|--------|
| `backend/server.js` | Added chatbot router import + mount (2 lines) |
| `backend/package.json` | Added `test` and `generate-embeddings` scripts |
| `backend/.env.example` | Added `HF_EMBEDDING_MODEL` variable |
| `frontend/src/pages/Chatbot.jsx` | Replaced with RAG-powered version |
| `backend/middleware/authUser.js` | JWT identity enforcement and 401 responses |
| `backend/controllers/chatbot.controller.js` | Authenticated identity and degraded-mode response |
| `backend/controllers/user.controller.js` | Generated-slot validation before atomic booking |
| `backend/server.js` | Environment-configurable CORS origins |

### Unchanged
- **All mobile files** — zero modifications
- **All admin files** — zero modifications
- **Existing user routes** — `/api/user/chatbot-response` preserved for mobile backward compatibility
- **Booking, payment, appointment workflows** — preserved; booking now rejects stale/non-generated slots before the existing atomic claim and payment flow

---

## Limitations & Known Issues

1. **Atlas Vector Search index is manual** — must be created via Atlas UI (not automatable via Mongoose). The chatbot degrades gracefully to text-based search without it.
2. **Hugging Face is required for semantic RAG** — if `HUGGING_API_KEY` is unavailable, doctor search remains available through degraded MongoDB text matching, and the embedding generation script fails rather than writing incompatible vectors.
3. **Concurrent booking protection** — booking uses an atomic doctor-slot claim and rolls the claim back if appointment creation fails. Payment remains a separate existing workflow after appointment creation.
4. **JWT tokens have no expiration** — inherited from existing auth system; not changed.
5. **Session TTL** — sessions auto-expire after 24 hours via MongoDB TTL index on `updatedAt`.
6. **Embedding model cold start** — first call to HF embedding API may take 10-20s if model is cold; subsequent calls are fast.
