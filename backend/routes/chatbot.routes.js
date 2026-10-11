import express from 'express';
import authUser from '../middleware/authUser.js';
import {
  sendMessage,
  getSession,
  newSession,
  endCurrentSession,
  deleteSessionHandler,
  searchDoctorsHandler,
  getDoctorAvailability,
} from '../controllers/chatbot.controller.js';

const chatbotRouter = express.Router();

// All chatbot routes require user authentication
// userId is derived from JWT by authUser middleware

// ─── Chat ──────────────────────────────────────────────────────────
chatbotRouter.post('/message', authUser, sendMessage);

// ─── Session management ────────────────────────────────────────────
chatbotRouter.get('/session', authUser, getSession);
chatbotRouter.post('/session/new', authUser, newSession);
chatbotRouter.post('/session/end', authUser, endCurrentSession);
chatbotRouter.delete('/session/:sessionId', authUser, deleteSessionHandler);

// ─── Doctor search & availability ──────────────────────────────────
chatbotRouter.post('/doctors/search', authUser, searchDoctorsHandler);
chatbotRouter.get('/doctor/:docId/availability', authUser, getDoctorAvailability);

export default chatbotRouter;

