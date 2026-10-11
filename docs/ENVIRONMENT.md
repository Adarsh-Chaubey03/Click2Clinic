# Environment and integrations

Create the relevant `.env` file from its neighboring `.env.example` template.
The templates contain placeholders only; credentials must remain local.

## Backend

The backend expects:

- `PORT` and `MONGODB_URI` for the HTTP server and MongoDB connection.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_API_KEY`, and
  `CLOUDINARY_CLOUD_API_SECRET` for uploaded media.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` for administrative access
  and token signing.
- `CURRENCY` for order and payment formatting.
- `HUGGING_API_KEY` for the chatbot AI integration.
- `RAZORPAY_ID` and `RAZORPAY_SECRET` for payment creation and verification.

## Web clients

The patient client uses `VITE_BACKEND_URL` and `VITE_RAZORPAY_ID`. The admin
client uses `VITE_BACKEND_URL`. These values are exposed to the browser, so
they must never contain private credentials.

## Mobile client

The Expo app uses `EXPO_PUBLIC_BACKEND_URL` and
`EXPO_PUBLIC_RAZORPAY_ID`. Set the backend URL to a host reachable from the
device or emulator rather than assuming that `localhost` refers to the
development computer.

## Runtime integrations

MongoDB stores application data, Cloudinary stores uploaded files, Razorpay
handles payment requests, and Socket.IO supports consultation signaling. The
backend remains the boundary for private credentials and authenticated API
calls.
