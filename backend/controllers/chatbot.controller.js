/**
 * chatbot.controller.js
 *
 * Auth-protected handlers for the RAG-powered chatbot.
 * userId is derived from JWT via authUser middleware — never trusted from client.
 */

import chatbotSessionModel from '../models/chatbotSession.model.js';
import {
  processMessage,
  getOrCreateSession,
  endSession,
  deleteSession,
  searchDoctors,
  screenForEmergency,
  findDoctorsWithAvailableSlots,
  getTodaySlotDate,
} from '../services/chatbot.service.js';
import doctorModel from '../models/doctor.models.js';

/**
 * POST /api/user/chatbot/message
 * Process a user message through the RAG pipeline.
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
      });
    }

    // Sanitize: strip HTML tags, limit length
    const sanitized = message
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 2000);

    const result = await processMessage(userId, sanitized, sessionId);

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Chatbot sendMessage error:', error.message);

    if (error.statusCode === 429) {
      return res.status(429).json({
        success: false,
        message: 'AI service rate limit reached. Please try again shortly.',
      });
    }
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: 'You cannot access this chatbot session.' });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your message. Please try again.',
    });
  }
};

/**
 * GET /api/user/chatbot/session
 * Get the current active session for the user.
 */
export const getSession = async (req, res) => {
  try {
    const userId = req.userId;
    const session = await chatbotSessionModel
      .findOne({ userId, active: true })
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      session: session || null,
    });
  } catch (error) {
    console.error('Chatbot getSession error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
};

/**
 * POST /api/user/chatbot/session/new
 * Start a new chatbot session (ends any active session).
 */
export const newSession = async (req, res) => {
  try {
    const userId = req.userId;

    // End any existing active sessions
    await chatbotSessionModel.updateMany(
      { userId, active: true },
      { active: false, phase: 'completed' }
    );

    const session = await chatbotSessionModel.create({
      userId,
      phase: 'greeting',
    });

    return res.json({
      success: true,
      session,
      message: "Hello! 👋 I'm your AI Health Assistant.\n\nDescribe your symptoms and I'll help identify possible conditions and find the right specialist for you.\n\n⚠️ *This is for reference only — always consult a healthcare professional.*",
    });
  } catch (error) {
    console.error('Chatbot newSession error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create session' });
  }
};

/**
 * POST /api/user/chatbot/session/end
 * End the current active session.
 */
export const endCurrentSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    const session = await endSession(sessionId, userId);
    return res.json({ success: true, message: 'Session ended', session });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error('Chatbot endSession error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to end session' });
  }
};

/**
 * DELETE /api/user/chatbot/session/:sessionId
 * Delete a session (enforces ownership).
 */
export const deleteSessionHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    await deleteSession(sessionId, userId);
    return res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error('Chatbot deleteSession error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete session' });
  }
};

/**
 * POST /api/user/chatbot/doctors/search
 * Semantic doctor search (useful when user wants to search independently).
 */
export const searchDoctorsHandler = async (req, res) => {
  try {
    const { query, speciality, date } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const result = await searchDoctors(query.trim(), {
      speciality,
      requestedDate: date,
      limit: 10,
    });

    return res.json({
      success: true,
      doctors: result.doctors || result,
      degradedMode: result.degradedMode || false,
    });
  } catch (error) {
    console.error('Doctor search error:', error.message);
    return res.status(500).json({ success: false, message: 'Doctor search failed' });
  }
};

/**
 * GET /api/user/chatbot/doctor/:docId/availability
 * Get live availability for a specific doctor.
 * Uses backend data only — never trusts cached frontend data.
 */
export const getDoctorAvailability = async (req, res) => {
  try {
    const { docId } = req.params;
    const { date } = req.query;

    const doctor = await doctorModel.findById(docId).select(
      'name speciality degree experience address image available slot_booked fees'
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const requestedDate = date || getTodaySlotDate();
    const availableDoctor = (await findDoctorsWithAvailableSlots(requestedDate))
      .find((item) => item.doctorId.toString() === docId);
    const result = {
      doctorId: docId,
      name: doctor.name,
      speciality: doctor.speciality,
      available: Boolean(availableDoctor),
      fees: doctor.fees,
      date: requestedDate,
      availableSlots: availableDoctor?.availableSlots || [],
      hasSlots: Boolean(availableDoctor),
    };

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Doctor availability error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch availability' });
  }
};
