/**
 * chatbot.service.js
 *
 * Core RAG orchestration for the healthcare chatbot.
 * LLM  : Google Gemini (gemini-1.5-flash) — replaces Hugging Face
 * Embeds: Gemini text-embedding-004 via embedding.service.js
 *
 * Handles: symptom collection, follow-up generation, emergency screening,
 * semantic doctor retrieval, and date-aware availability filtering.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import doctorModel from '../models/doctor.models.js';
import doctorEmbeddingModel from '../models/doctorEmbedding.model.js';
import chatbotSessionModel from '../models/chatbotSession.model.js';
import appointmentModel from '../models/appointment.models.js';
import { generateQueryEmbedding, buildDoctorProfileText } from './embedding.service.js';

// ─── Timezone helpers ─────────────────────────────────────────────
const DEFAULT_TIME_ZONE = 'Asia/Kolkata';
const SLOT_START_HOUR = 10;
const SLOT_END_HOUR = 21;
const SLOT_INTERVAL_MINUTES = 30;

function getApplicationTimeZone() {
  return process.env.CHATBOT_TIMEZONE || process.env.TZ || DEFAULT_TIME_ZONE;
}

function getDatePartsInTimeZone(date = new Date(), timeZone = getApplicationTimeZone()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
  return values.hour === 24 ? { ...values, hour: 0 } : values;
}

export function getTodaySlotDate(timeZone = getApplicationTimeZone()) {
  const { day, month, year } = getDatePartsInTimeZone(new Date(), timeZone);
  return `${day}_${month}_${year}`;
}

function slotDateToComparableValue(slotDate) {
  const match = /^(\d{1,2})_(\d{1,2})_(\d{4})$/.exec(slotDate || '');
  if (!match) return null;
  return Number(`${match[3]}${match[2].padStart(2, '0')}${match[1].padStart(2, '0')}`);
}

// ─── Availability intent detection ───────────────────────────────
export function isDoctorAvailabilityRequest(message) {
  const normalized = message.toLowerCase();
  const asksAboutDoctor =
    /\b(?:doctor|doctors|specialist|specialists|physician|physicians|cardiologist|dermatologist|neurologist|gastroenterologist|gynecologist|pediatrician|orthopedic|dentist)\b/.test(
      normalized
    );
  const asksAboutAvailability =
    /\b(?:available|availability|free|open|booking|book)\b/.test(normalized);
  const asksForToday = /\b(?:today|now|currently|right now)\b/.test(normalized);
  const asksWhichDoctor = /\b(?:which|what|any|show|find|list)\b/.test(normalized);
  return asksAboutDoctor && asksAboutAvailability && (asksForToday || asksWhichDoctor);
}

// ─── Speciality aliases ───────────────────────────────────────────
const SPECIALITY_ALIASES = [
  ['general physician', ['general physician', 'general medicine', 'physician']],
  ['dermatologist', ['dermatologist', 'dermatology', 'skin specialist']],
  ['cardiologist', ['cardiologist', 'cardiology', 'heart specialist']],
  ['neurologist', ['neurologist', 'neurology']],
  ['gastroenterologist', ['gastroenterologist', 'gastroenterology']],
  ['gynecologist', ['gynecologist', 'gynecology', 'gynaecologist', 'gynaecology']],
  [
    'pediatrician',
    ['pediatrician', 'pediatrics', 'paediatrician', 'paediatrics', 'child specialist'],
  ],
  ['orthopedic', ['orthopedic', 'orthopaedic', 'orthopedics', 'bone specialist']],
  ['dentist', ['dentist', 'dental']],
];

export function extractRequestedSpeciality(message) {
  const normalized = message.toLowerCase().replace(/[^\w\s]/g, ' ');
  const match = SPECIALITY_ALIASES.find(([, aliases]) =>
    aliases.some((alias) => normalized.includes(alias))
  );
  return match?.[0] || '';
}

function specialityMatches(value, requestedSpeciality) {
  if (!requestedSpeciality) return true;
  const normalized = String(value || '').toLowerCase();
  const aliases =
    SPECIALITY_ALIASES.find(([canonical]) => canonical === requestedSpeciality)?.[1] || [
      requestedSpeciality,
    ];
  return aliases.some((alias) => normalized.includes(alias));
}

// ─── Slot generation ─────────────────────────────────────────────
export function getBookableSlotTimes(
  doctor,
  slotDate,
  now = new Date(),
  timeZone = getApplicationTimeZone()
) {
  const { day, month, year, hour, minute } = getDatePartsInTimeZone(now, timeZone);
  const todayKey = `${day}_${month}_${year}`;
  const requestedDateValue = slotDateToComparableValue(slotDate);
  const todayValue = slotDateToComparableValue(todayKey);
  if (requestedDateValue === null || requestedDateValue < todayValue) return [];

  const bookedSlots = new Set(doctor.slot_booked?.[slotDate] || []);
  const slots = [];
  const isToday = slotDate === todayKey;
  let startMinutes = SLOT_START_HOUR * 60;

  if (isToday) {
    const currentMinutes = hour * 60 + minute;
    startMinutes = Math.max(startMinutes, currentMinutes + 60);
    startMinutes = Math.ceil(startMinutes / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
  }

  for (
    let minutes = startMinutes;
    minutes < SLOT_END_HOUR * 60;
    minutes += SLOT_INTERVAL_MINUTES
  ) {
    const slotHour = Math.floor(minutes / 60);
    const slotMinute = minutes % 60;
    const suffix = slotHour >= 12 ? 'pm' : 'am';
    const displayHour = slotHour % 12 || 12;
    const slotTime = `${String(displayHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')} ${suffix}`;
    if (!bookedSlots.has(slotTime)) slots.push(slotTime);
  }

  return slots;
}

export async function findDoctorsWithAvailableSlots(
  slotDate = getTodaySlotDate(),
  requestedSpeciality = ''
) {
  const doctors = await doctorModel
    .find({})
    .select('name speciality degree experience fees address image available slot_booked');

  const doctorIds = doctors.map((d) => d._id.toString());
  const appointments = doctorIds.length
    ? await appointmentModel
        .find({ docId: { $in: doctorIds }, slotData: slotDate, cancelled: { $ne: true } })
        .select('docId slotTime')
    : [];

  const appointmentSlots = new Map();
  for (const appt of appointments) {
    const id = appt.docId.toString();
    if (!appointmentSlots.has(id)) appointmentSlots.set(id, new Set());
    appointmentSlots.get(id).add(appt.slotTime);
  }

  return doctors
    .map((doctor) => {
      if (!specialityMatches(doctor.speciality, requestedSpeciality)) return null;
      if (!doctor.available) return null;
      const activeApptSlots = appointmentSlots.get(doctor._id.toString()) || new Set();
      const slotTimes = getBookableSlotTimes(doctor, slotDate).filter(
        (st) => !activeApptSlots.has(st)
      );
      if (slotTimes.length === 0) return null;
      return {
        _id: doctor._id,
        doctorId: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        fees: doctor.fees,
        address: doctor.address,
        image: doctor.image,
        available: true,
        hasAvailability: true,
        availableSlots: slotTimes,
        date: slotDate,
      };
    })
    .filter(Boolean);
}

// ─── Emergency screening ──────────────────────────────────────────
const EMERGENCY_PATTERNS = [
  /chest\s*pain/i,
  /difficulty\s*breathing/i,
  /can'?t\s*breathe/i,
  /shortness\s*of\s*breath/i,
  /severe\s*bleeding/i,
  /unconscious/i,
  /seizure/i,
  /stroke/i,
  /heart\s*attack/i,
  /suicid/i,
  /self[\s-]*harm/i,
  /overdose/i,
  /anaphyla/i,
  /severe\s*allergic/i,
  /choking/i,
  /paralysis/i,
  /sudden\s*numbness/i,
  /loss\s*of\s*consciousness/i,
  /severe\s*head\s*injury/i,
  /poison/i,
];

const EMERGENCY_GUIDANCE = `🚨 **URGENT: This sounds like it could be a medical emergency.**

Please take these steps immediately:
• **Call emergency services (911 / 112 / local emergency number)**
• If someone is with you, ask them to stay and help
• Do not drive yourself — call an ambulance
• If you're having chest pain, chew an aspirin if available and not allergic

⚠️ This chatbot cannot provide emergency medical care. Please seek immediate professional help.`;

export function screenForEmergency(message) {
  const lower = message.toLowerCase();
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(lower)) return { isEmergency: true, guidance: EMERGENCY_GUIDANCE };
  }
  return { isEmergency: false };
}

// ─── Follow-up question templates ────────────────────────────────
const FOLLOW_UP_TEMPLATES = {
  duration: 'How long have you been experiencing these symptoms? (e.g., a few hours, days, weeks)',
  severity: 'On a scale of 1–10, how would you rate the severity of your symptoms?',
  location: 'Can you specify where exactly you feel the discomfort or pain?',
  onset: 'Did the symptoms start suddenly or gradually?',
  triggers: 'Have you noticed anything that makes the symptoms worse or better?',
  medications: 'Are you currently taking any medications or have you tried any remedies?',
  history: 'Do you have any pre-existing medical conditions?',
  additional: "Are there any other symptoms you're experiencing that you haven't mentioned?",
};

// ─── Gemini LLM helper ────────────────────────────────────────────
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment');
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Call Gemini chat API and return the raw text response.
 * Uses gemini-1.5-flash for speed + free-tier availability.
 */
async function callGemini(prompt) {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
    systemInstruction:
      'You are a medical assistant AI. Always respond with valid JSON only. ' +
      'Never provide a definitive diagnosis — present findings as possibilities. ' +
      'Be cautious and recommend professional medical consultation.',
  });

  const result = await model.generateContent(prompt);
  const text = result?.response?.text();
  if (!text || !text.trim()) throw new Error('Empty response from Gemini');
  return text.trim();
}

function extractFirstJsonObject(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    /* fall through */
  }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    return JSON.parse(cleaned.slice(first, last + 1));
  } catch {
    return null;
  }
}

// ─── Session management ───────────────────────────────────────────
export async function getOrCreateSession(userId) {
  let session = await chatbotSessionModel
    .findOne({ userId, active: true })
    .sort({ updatedAt: -1 });
  if (!session) {
    session = await chatbotSessionModel.create({ userId, phase: 'greeting' });
  }
  return session;
}

export async function endSession(sessionId, userId) {
  const session = await chatbotSessionModel.findById(sessionId);
  if (!session) throw new Error('Session not found');
  if (session.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized: session does not belong to user');
  }
  session.active = false;
  session.phase = 'completed';
  await session.save();
  return session;
}

export async function deleteSession(sessionId, userId) {
  const session = await chatbotSessionModel.findById(sessionId);
  if (!session) throw new Error('Session not found');
  if (session.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized: session does not belong to user');
  }
  await chatbotSessionModel.findByIdAndDelete(sessionId);
  return { deleted: true };
}

// ─── Follow-up question picker ────────────────────────────────────
function pickFollowUps(session) {
  const asked = new Set(session.askedFollowUps || []);
  const needed = [];
  if (session.symptoms.length > 0) {
    if (!session.metadata?.duration && !asked.has('duration')) needed.push('duration');
    if (session.metadata?.severity === 'unknown' && !asked.has('severity'))
      needed.push('severity');
    if (!session.metadata?.bodyArea && !asked.has('location')) needed.push('location');
    if (!asked.has('onset')) needed.push('onset');
    if (!asked.has('additional')) needed.push('additional');
  }
  return needed.slice(0, 1); // One concise follow-up round only
}

// ─── Message extraction (Gemini with local fallback) ─────────────
async function extractFromMessage(message, existingSymptoms) {
  const prompt = `Analyze this patient message and extract structured data.

Patient says: "${message}"
Already known symptoms: ${existingSymptoms.length > 0 ? existingSymptoms.join(', ') : 'none yet'}

Respond ONLY with JSON (no extra text, no markdown):
{
  "newSymptoms": ["list of NEW symptoms mentioned, if any"],
  "severity": "mild|moderate|severe|unknown",
  "duration": "duration mentioned or empty string",
  "bodyArea": "body area mentioned or empty string",
  "requestedDate": "if patient mentions wanting an appointment on a specific date, extract it, else empty string",
  "requestedSlot": "if patient mentions a time preference, extract it, else empty string",
  "isAskingForDoctor": true,
  "isGreeting": false,
  "isNonMedical": false
}`;

  try {
    const raw = await callGemini(prompt);
    const parsed = extractFirstJsonObject(raw);
    return (
      parsed || {
        newSymptoms: [],
        severity: 'unknown',
        duration: '',
        bodyArea: '',
        requestedDate: '',
        requestedSlot: '',
        isAskingForDoctor: false,
        isGreeting: false,
        isNonMedical: false,
      }
    );
  } catch (err) {
    console.warn('Gemini message extraction unavailable; using local extraction:', err.message);
    return extractMessageLocally(message, existingSymptoms);
  }
}

export function extractMessageLocally(message, existingSymptoms = []) {
  const normalized = message.trim().toLowerCase();
  const isGreeting =
    /^(?:hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized);
  const isAskingForDoctor =
    /\b(?:doctor|specialist|appointment|book)\b/.test(normalized);
  const isNonMedical =
    /^(?:thanks|thank you|ok|okay|bye|goodbye)\b/.test(normalized);
  const severity = /\b(?:severe|very bad|unbearable|excruciating)\b/.test(normalized)
    ? 'severe'
    : /\b(?:mild|slight|little)\b/.test(normalized)
    ? 'mild'
    : 'unknown';
  const durationMatch = normalized.match(
    /\b(?:for|since)\s+([\w\s]+?)(?=\s+(?:and|with|but)\b|[,.!?]|$)/i
  );
  const bodyAreaMatch = normalized.match(
    /\b(?:in|on|around|near)\s+(?:my\s+)?([a-z\s]+?)(?=\s+(?:and|with|but)\b|[,.!?]|$)/i
  );
  return {
    newSymptoms:
      isGreeting || isNonMedical || existingSymptoms.length > 0 ? [] : [message.trim()],
    severity,
    duration: durationMatch?.[1]?.trim() || '',
    bodyArea: bodyAreaMatch?.[1]?.trim() || '',
    requestedDate: /\btoday\b/.test(normalized) ? getTodaySlotDate() : '',
    requestedSlot: '',
    isAskingForDoctor,
    isGreeting,
    isNonMedical,
  };
}

// ─── Symptom analysis (Gemini with safe fallback) ─────────────────
async function analyzeSymptoms(symptoms, metadata) {
  const prompt = `You are a cautious medical assistant. Based on the symptoms below, provide a preliminary analysis.

Symptoms: ${symptoms.join(', ')}
Duration: ${metadata.duration || 'not specified'}
Severity: ${metadata.severity || 'not specified'}
Body area: ${metadata.bodyArea || 'not specified'}

IMPORTANT:
- Do NOT provide a definitive diagnosis. Present everything as possibilities.
- If uncertain, say so explicitly.
- recommendedSpeciality must be ONE of: General Physician, Dermatologist, Cardiologist, Neurologist, Gastroenterologist, Gynecologist, Pediatrician, Orthopedic, Dentist

Respond ONLY with JSON (no extra text, no markdown):
{
  "possibleConditions": ["condition1 (possibility, not a diagnosis)", "condition2"],
  "recommendedSpeciality": "type of specialist to consult",
  "confidenceNote": "brief note about confidence level and why professional evaluation is important",
  "precautions": ["precaution1", "precaution2", "precaution3"],
  "urgency": "low|moderate|high"
}`;

  try {
    const raw = await callGemini(prompt);
    const parsed = extractFirstJsonObject(raw);
    if (!parsed) throw new Error('Could not parse Gemini JSON response');
    return parsed;
  } catch (err) {
    console.error('Gemini symptom analysis failed:', err.message);
    return {
      possibleConditions: ['Unable to analyze — AI service temporarily unavailable'],
      recommendedSpeciality: 'General Physician',
      confidenceNote:
        'Analysis could not be completed. Please consult a healthcare professional.',
      precautions: ['Seek medical advice', 'Rest', 'Monitor symptoms'],
      urgency: 'moderate',
    };
  }
}

// ─── RAG: doctor search ───────────────────────────────────────────
/**
 * Search for doctors using MongoDB Atlas Vector Search (semantic).
 * Falls back to MongoDB keyword text search if vector search is unavailable.
 */
export async function searchDoctors(query, options = {}) {
  const { speciality, requestedDate, limit = 5 } = options;

  try {
    // Use RETRIEVAL_QUERY task type for better semantic matching
    const queryEmbedding = await generateQueryEmbedding(query);

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: limit * 2,
        },
      },
      {
        $project: {
          doctorId: 1,
          name: 1,
          speciality: 1,
          degree: 1,
          experience: 1,
          fees: 1,
          address: 1,
          image: 1,
          available: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    if (speciality) {
      pipeline.push({
        $match: { speciality: { $regex: new RegExp(speciality, 'i') } },
      });
    }

    pipeline.push({ $limit: limit });

    let doctors = await doctorEmbeddingModel.aggregate(pipeline);

    if (doctors.length > 0) {
      const doctorIds = doctors.map((d) => d.doctorId);
      const liveDoctors = await doctorModel
        .find({ _id: { $in: doctorIds } })
        .select('available slot_booked fees');

      const liveMap = new Map(liveDoctors.map((d) => [d._id.toString(), d]));
      const availabilityMap = requestedDate
        ? new Map(
            (await findDoctorsWithAvailableSlots(requestedDate)).map((d) => [
              d.doctorId.toString(),
              d,
            ])
          )
        : new Map();

      doctors = doctors
        .map((d) => {
          const live = liveMap.get(d.doctorId?.toString());
          if (!live) return null;
          const availability = availabilityMap.get(d.doctorId?.toString());
          return {
            ...d,
            available: live.available,
            fees: live.fees,
            availableSlots: availability?.availableSlots || [],
            hasAvailability: requestedDate ? Boolean(availability) : live.available,
          };
        })
        .filter(Boolean);

      if (requestedDate) {
        doctors = doctors.filter((d) => d.hasAvailability);
      }

      return { doctors: doctors.slice(0, limit), degradedMode: false };
    }
  } catch (err) {
    console.warn('Vector search failed, using MongoDB text search:', err.message);
  }

  // ── Degraded mode: keyword text matching ──────────────────────
  const terms = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((term) => term.length >= 3)
    .slice(0, 12);

  const filter = terms.length
    ? {
        $or: terms.map((term) => ({
          $or: [
            { name: { $regex: term, $options: 'i' } },
            { speciality: { $regex: term, $options: 'i' } },
            { degree: { $regex: term, $options: 'i' } },
            { experience: { $regex: term, $options: 'i' } },
            { about: { $regex: term, $options: 'i' } },
          ],
        })),
      }
    : {};

  if (speciality) {
    filter.speciality = { $regex: new RegExp(speciality, 'i') };
  }

  let fallbackDoctors = await doctorModel
    .find(filter)
    .select('-password -email')
    .limit(limit);

  let availableMap = new Map();
  if (requestedDate) {
    availableMap = new Map(
      (await findDoctorsWithAvailableSlots(requestedDate)).map((d) => [
        d.doctorId.toString(),
        d,
      ])
    );
    fallbackDoctors = fallbackDoctors.filter((d) => availableMap.has(d._id.toString()));
  }

  return {
    degradedMode: true,
    doctors: fallbackDoctors.map((d) => ({
      doctorId: d._id,
      name: d.name,
      speciality: d.speciality,
      degree: d.degree,
      experience: d.experience,
      fees: d.fees,
      address: d.address,
      image: d.image,
      available: d.available,
      hasAvailability: requestedDate ? true : d.available,
      availableSlots: requestedDate
        ? availableMap.get(d._id.toString())?.availableSlots || []
        : undefined,
    })),
  };
}

// ─── Main message processing ──────────────────────────────────────
/**
 * Orchestrates the full RAG pipeline for a single user message.
 */
export async function processMessage(userId, message, sessionId = null) {
  // Input validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { error: 'Message cannot be empty' };
  }
  const trimmedMessage = message.trim().slice(0, 2000);

  // 1. Emergency screening — always first
  const emergency = screenForEmergency(trimmedMessage);
  if (emergency.isEmergency) {
    if (sessionId) {
      await chatbotSessionModel.findOneAndUpdate(
        { _id: sessionId, userId },
        { emergencyDetected: true, phase: 'completed' }
      );
    }
    return {
      type: 'emergency',
      message: emergency.guidance,
      emergencyDetected: true,
    };
  }

  // 2. Direct availability requests bypass symptom flow
  if (isDoctorAvailabilityRequest(trimmedMessage)) {
    const requestedDate = getTodaySlotDate();
    const requestedSpeciality = extractRequestedSpeciality(trimmedMessage);
    const doctors = await findDoctorsWithAvailableSlots(requestedDate, requestedSpeciality);
    const messageText = doctors.length
      ? `${requestedSpeciality ? `${requestedSpeciality} doctors` : 'Doctors'} with genuinely bookable slots today (${requestedDate.replace(/_/g, '/')}):`
      : `There are no ${requestedSpeciality ? `${requestedSpeciality} ` : ''}doctors with bookable slots remaining today. Please try another date.`;

    return {
      type: 'doctor_availability',
      message: messageText,
      date: requestedDate,
      doctors: doctors.map((doctor) => ({
        _id: doctor.doctorId,
        name: doctor.name,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        fees: doctor.fees,
        address: doctor.address,
        image: doctor.image,
        available: true,
        hasAvailability: true,
        availableSlots: doctor.availableSlots,
      })),
    };
  }

  // 3. Get or create session
  let session;
  if (sessionId) {
    session = await chatbotSessionModel.findOne({ _id: sessionId, userId, active: true });
    if (!session) {
      const requested = await chatbotSessionModel.findById(sessionId).select('userId');
      if (requested && requested.userId.toString() !== userId.toString()) {
        const err = new Error('Unauthorized: session does not belong to user');
        err.statusCode = 403;
        throw err;
      }
      session = await chatbotSessionModel.create({ userId, phase: 'greeting' });
    }
  } else {
    session = await getOrCreateSession(userId);
  }

  // 4. Extract structured data from message
  const extracted = await extractFromMessage(trimmedMessage, session.symptoms);

  // Handle greetings
  if (extracted.isGreeting && session.symptoms.length === 0) {
    session.phase = 'greeting';
    await session.save();
    return {
      type: 'greeting',
      sessionId: session._id,
      message:
        "Hello! 👋 I'm your AI Health Assistant. I can help you understand your symptoms and find the right doctor.\n\nPlease describe what you're experiencing, and I'll guide you through some questions to better understand your situation.\n\n⚠️ *Remember: I provide suggestions for reference only, not medical diagnoses. Always consult a healthcare professional.*",
    };
  }

  if (extracted.isNonMedical && session.symptoms.length === 0) {
    return {
      type: 'non_medical',
      sessionId: session._id,
      message:
        "I'm designed to help with health-related questions. Could you describe any symptoms or health concerns you're experiencing? I can help find the right specialist for you.",
    };
  }

  // 5. Update session with extracted data
  if (extracted.newSymptoms?.length > 0) {
    const newUnique = extracted.newSymptoms.filter((s) => !session.symptoms.includes(s));
    session.symptoms.push(...newUnique);
  }
  if (extracted.duration) session.metadata.duration = extracted.duration;
  if (extracted.severity && extracted.severity !== 'unknown') {
    session.metadata.severity = extracted.severity;
  }
  if (extracted.bodyArea) session.metadata.bodyArea = extracted.bodyArea;
  if (extracted.requestedDate) session.metadata.requestedDate = extracted.requestedDate;
  if (extracted.requestedSlot) session.metadata.requestedSlot = extracted.requestedSlot;

  session.phase = 'collecting_symptoms';

  // 6. Decide: follow-up or analyze?
  const followUps = pickFollowUps(session);
  const isAnswerToFollowUp = session.phase === 'follow_up';
  const shouldAnalyze =
    isAnswerToFollowUp ||
    extracted.isAskingForDoctor ||
    session.symptoms.length >= 3 ||
    followUps.length === 0;

  if (!shouldAnalyze && followUps.length > 0) {
    session.phase = 'follow_up';
    const questionsToAsk = followUps.map((key) => FOLLOW_UP_TEMPLATES[key]);
    session.askedFollowUps.push(...followUps);
    await session.save();

    let responseMessage = '';
    if (extracted.newSymptoms?.length > 0) {
      responseMessage += `Thank you. I've noted your symptoms: **${session.symptoms.join(', ')}**.\n\nTo better understand your situation, I have a few questions:\n\n`;
    } else {
      responseMessage += 'To help me better understand your condition:\n\n';
    }
    questionsToAsk.forEach((q, i) => {
      responseMessage += `${i + 1}. ${q}\n`;
    });

    return {
      type: 'follow_up',
      sessionId: session._id,
      message: responseMessage,
      symptoms: session.symptoms,
      phase: session.phase,
    };
  }

  // 7. Analyze symptoms with Gemini
  session.phase = 'analyzing';
  await session.save();

  const analysis = await analyzeSymptoms(session.symptoms, session.metadata);

  session.analysis = {
    possibleConditions: analysis.possibleConditions || [],
    recommendedSpeciality: analysis.recommendedSpeciality || 'General Physician',
    confidenceNote: analysis.confidenceNote || '',
  };

  // 8. RAG: semantic doctor search for the recommended speciality
  session.phase = 'recommending';
  const searchQuery = `${session.symptoms.join(' ')} ${analysis.recommendedSpeciality || ''}`;
  const searchResult = await searchDoctors(searchQuery, {
    speciality: analysis.recommendedSpeciality,
    requestedDate: session.metadata.requestedDate,
    limit: 5,
  });
  const doctors = searchResult.doctors || searchResult;

  session.recommendedDoctors = doctors.map((d) => d.doctorId || d._id);
  session.phase = 'completed';
  session.active = false;
  await session.save();

  // 9. Build response message
  let responseMessage = '## 🔬 Health Assessment\n\n';
  responseMessage +=
    '> ⚠️ **Important:** This is an AI-assisted assessment, NOT a medical diagnosis. Please consult a healthcare professional for proper evaluation.\n\n';

  if (analysis.possibleConditions?.length > 0) {
    responseMessage += '**Possible conditions to discuss with your doctor:**\n';
    analysis.possibleConditions.forEach((c) => {
      responseMessage += `• ${c}\n`;
    });
    responseMessage += '\n';
  }

  if (analysis.confidenceNote) {
    responseMessage += `📋 *${analysis.confidenceNote}*\n\n`;
  }

  if (analysis.precautions?.length > 0) {
    responseMessage += '**Precautions:**\n';
    analysis.precautions.forEach((p) => {
      responseMessage += `• ${p}\n`;
    });
    responseMessage += '\n';
  }

  const recommendedSpeciality = analysis.recommendedSpeciality || 'General Physician';
  responseMessage += `**Recommended specialist:** ${recommendedSpeciality}\n\n`;

  if (analysis.urgency === 'high') {
    responseMessage +=
      '🔴 **Urgency: High** — Please see a doctor as soon as possible.\n\n';
  } else if (analysis.urgency === 'moderate') {
    responseMessage += '🟡 **Urgency: Moderate** — Schedule an appointment soon.\n\n';
  }

  return {
    type: 'analysis',
    sessionId: session._id,
    message: responseMessage,
    analysis: {
      possibleConditions: analysis.possibleConditions,
      recommendedSpeciality: analysis.recommendedSpeciality,
      confidenceNote: analysis.confidenceNote,
      precautions: analysis.precautions,
      urgency: analysis.urgency,
    },
    doctors: doctors.map((d) => ({
      _id: d.doctorId || d._id,
      name: d.name,
      speciality: d.speciality,
      degree: d.degree,
      experience: d.experience,
      fees: d.fees,
      address: d.address,
      image: d.image,
      available: d.available,
      hasAvailability: d.hasAvailability,
    })),
    recommendationAction: {
      label: `Find a ${recommendedSpeciality} available today`,
      speciality: recommendedSpeciality,
      date: getTodaySlotDate(),
    },
    degradedMode: searchResult.degradedMode || false,
    symptoms: session.symptoms,
  };
}
