import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/admin.routes.js';
import doctorRouter from './routes/doctor.routes.js';
import userRouter from './routes/user.routes.js';
import orderRouter from './routes/order.routes.js';
import consultationRouter from './routes/consultation.routes.js';
import chatbotRouter from './routes/chatbot.routes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

// ✅ Correct PORT binding for Render
const port = process.env.PORT || 3000;

// ✅ Allowed frontend origins
const allowedOrigins = [
  'https://click2clinic-frontend.onrender.com',
  'https://click2clinic-backend.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
  'http://localhost:19000',
  'https://click2clinic.shop',
  'https://www.click2clinic.shop',
  'https://admin.click2clinic.shop',
];

// ✅ Apply CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ✅ Handle preflight requests
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Connect DB and Cloudinary
connectDB();
connectCloudinary();

// ✅ API Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/order', orderRouter);
app.use('/api/consultation', consultationRouter);
app.use('/api/user/chatbot', chatbotRouter);

// ✅ Create HTTP + WebSocket server
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// ✅ Attach socket.io to app
app.set('io', io);

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-user-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('join-doctor-room', (doctorId) => {
    socket.join(doctorId);
    console.log(`Doctor ${doctorId} joined room`);
  });

  socket.on('call-accepted', ({ userId, doctorId, roomId }) => {
    io.to(doctorId).emit('call-accepted', { userId, doctorId, roomId });
    io.to(userId).emit('connection-confirmed', { userId, doctorId, roomId });
    io.to(doctorId).emit('connection-confirmed', { userId, doctorId, roomId });
  });

  socket.on('signal', ({ signal, to, roomId }) => {
    socket.to(to).emit('signal', { signal, from: socket.id, roomId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ✅ Root health-check route
app.get('/', (req, res) => {
  res.send('API WORKING great');
});

// ✅ Start server (Render will inject PORT)
server.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
