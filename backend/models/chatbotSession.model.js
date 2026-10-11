import mongoose, { Schema } from 'mongoose';

/**
 * ChatbotSession — persists structured symptom/session data on the backend.
 * Full chat history lives in browser localStorage; this stores only
 * the structured state the RAG pipeline needs.
 */
const chatbotSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    /** Current conversation phase */
    phase: {
      type: String,
      enum: ['greeting', 'collecting_symptoms', 'follow_up', 'analyzing', 'recommending', 'completed'],
      default: 'greeting',
    },
    /** Collected symptoms — structured list */
    symptoms: {
      type: [String],
      default: [],
    },
    /** Follow-up questions already asked */
    askedFollowUps: {
      type: [String],
      default: [],
    },
    /** Extracted metadata from conversation */
    metadata: {
      severity: { type: String, enum: ['unknown', 'mild', 'moderate', 'severe', 'emergency'], default: 'unknown' },
      duration: { type: String, default: '' },
      bodyArea: { type: String, default: '' },
      requestedDate: { type: String, default: '' },
      requestedSlot: { type: String, default: '' },
    },
    /** AI analysis results (cautious — never presented as diagnosis) */
    analysis: {
      possibleConditions: { type: [String], default: [] },
      recommendedSpeciality: { type: String, default: '' },
      confidenceNote: { type: String, default: '' },
    },
    /** Recommended doctor IDs from vector search */
    recommendedDoctors: {
      type: [Schema.Types.ObjectId],
      ref: 'doctor',
      default: [],
    },
    /** Whether an emergency was detected */
    emergencyDetected: {
      type: Boolean,
      default: false,
    },
    /** Session active/closed status */
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient lookup of active sessions per user
chatbotSessionSchema.index({ userId: 1, active: 1 });

// Auto-expire inactive sessions after 24 hours
chatbotSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

const chatbotSessionModel =
  mongoose.models.chatbot_session || mongoose.model('chatbot_session', chatbotSessionSchema);

export default chatbotSessionModel;

