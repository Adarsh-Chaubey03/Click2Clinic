/**
 * chatbot.service.js
 *
 * Core RAG orchestration for the healthcare chatbot.
 * Handles: symptom collection, follow-up generation, emergency screening,
 * semantic doctor retrieval, and date-aware availability filtering.
 */

import doctorModel from '../models/doctor.models.js';
import doctorEmbeddingModel from '../models/doctorEmbedding.model.js';
import chatbotSessionModel from '../models/chatbotSession.model.js';
import { generateEmbedding, buildDoctorProfileText } from './embedding.service.js';

// ─── Emergency keywords ───────────────────────────────────────────
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

// ─── Follow-up question templates ─────────────────────────────────
const FOLLOW_UP_TEMPLATES = {
  duration: 'How long have you been experiencing these symptoms? (e.g., a few hours, days, weeks)',
  severity: 'On a scale of 1-10, how would you rate the severity of your symptoms?',
  location: 'Can you specify where exactly you feel the discomfort or pain?',
  onset: 'Did the symptoms start suddenly or gradually?',
  triggers: 'Have you noticed anything that makes the symptoms worse or better?',
  medications: 'Are you currently taking any medications or have you tried any remedies?',
  history: 'Do you have any pre-existing medical conditions?',
  additional: 'Are there any other symptoms you\'re experiencing that you haven\'t mentioned?',
};

// ─── Reuse the existing HF text-generation helper ─────────────────
// We import the shared generation function from user.controller indirectly
// by re-implementing a focused version here to avoid circular deps.

const HF_ROUTER_ORIGIN = process.env.HF_ROUTER_ORIGIN || 'https://router.huggingface.co';
const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_BASE || `${HF_ROUTER_ORIGIN.replace(/\/$/, '')}/hf-inference`;

const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || '';
const HUGGINGFACE_FALLBACK_MODELS = process.env.HUGGINGFACE_FALLBACK_MODELS || '';

const DEFAULT_HF_MODELS = [
  'meta-llama/Meta-Llama-3-8B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'meta-llama/Llama-3.2-3B-Instruct',
  'Qwen/Qwen2.5-7B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
];

function parseModelList(value) {
  if (!value || typeof value !== 'string') return [];
  return value.split(/\r?\n|\s*,\s*/).map(s => s.trim()).filter(Boolean);
}

function getModelCandidates() {
  const candidates = [
    ...parseModelList(HUGGINGFACE_MODEL),
    ...parseModelList(HUGGINGFACE_FALLBACK_MODELS),
    ...DEFAULT_HF_MODELS,
  ];
  const seen = new Set();
  return candidates.filter(m => { if (!m || seen.has(m)) return false; seen.add(m); return true; });
}

function extractFirstJsonObject(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```json|```/gi, '').trim();
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { return null; }
}

async function callHuggingFace(prompt) {
  if (!process.env.HUGGING_API_KEY) {
    throw new Error('HUGGING_API_KEY is required');
  }
  const headers = {
    Authorization: `Bearer ${process.env.HUGGING_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const modelCandidates = getModelCandidates();
  let lastError;

  // Try chat completions endpoint first
  const chatUrl = `${HF_ROUTER_ORIGIN.replace(/\/$/, '')}/v1/chat/completions`;
  for (const model of modelCandidates) {
    try {
      const resp = await fetch(chatUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a medical assistant AI. Always respond with valid JSON only. Never provide a definitive diagnosis — present findings as possibilities. Be cautious and recommend professional medical consultation.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        const err = new Error(errBody || `HF request failed (${resp.status})`);
        err.statusCode = resp.status;
        if (resp.status === 401 || resp.status === 403) throw err;
        lastError = err;
        continue;
      }
      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
      lastError = new Error('Empty response from HF');
    } catch (err) {
      if (err.statusCode === 401 || err.statusCode === 403) throw err;
      lastError = err;
      continue;
    }
  }

  // Fallback: HF Inference endpoint
  for (const model of modelCandidates) {
    const url = `${HF_INFERENCE_BASE.replace(/\/$/, '')}/models/${encodeURIComponent(model)}`;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 1024, temperature: 0.3, return_full_text: false },
          options: { wait_for_model: true },
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        lastError = new Error(errBody || `HF request failed (${resp.status})`);
        continue;
      }
      const data = await resp.json();
      const generated = Array.isArray(data) ? data?.[0]?.generated_text : data?.generated_text;
      if (typeof generated === 'string' && generated.trim()) return generated.trim();
      lastError = new Error('Empty response from HF inference');
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All HF model candidates failed');
}

// ─── Core service functions ───────────────────────────────────────

/**
 * Screen for emergency warning signs.
 */
export function screenForEmergency(message) {
  const lower = message.toLowerCase();
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(lower)) {
      return { isEmergency: true, guidance: EMERGENCY_GUIDANCE };
    }
  }
  return { isEmergency: false };
}

/**
 * Get or create an active session for the user.
 */
export async function getOrCreateSession(userId) {
  let session = await chatbotSessionModel.findOne({ userId, active: true }).sort({ updatedAt: -1 });
  if (!session) {
    session = await chatbotSessionModel.create({ userId, phase: 'greeting' });
  }
  return session;
}

/**
 * End a session (mark inactive).
 */
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

/**
 * Delete a session (enforces ownership).
 */
export async function deleteSession(sessionId, userId) {
  const session = await chatbotSessionModel.findById(sessionId);
  if (!session) throw new Error('Session not found');
  if (session.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized: session does not belong to user');
  }
  await chatbotSessionModel.findByIdAndDelete(sessionId);
  return { deleted: true };
}

/**
 * Determine which follow-up questions to ask based on current state.
 */
function pickFollowUps(session) {
  const asked = new Set(session.askedFollowUps || []);
  const needed = [];

  if (session.symptoms.length > 0) {
    if (!session.metadata?.duration && !asked.has('duration')) needed.push('duration');
    if (session.metadata?.severity === 'unknown' && !asked.has('severity')) needed.push('severity');
    if (!session.metadata?.bodyArea && !asked.has('location')) needed.push('location');
    if (!asked.has('onset')) needed.push('onset');
    if (!asked.has('additional')) needed.push('additional');
  }

  return needed.slice(0, 2); // Ask at most 2 follow-ups at a time
}

/**
 * Use AI to extract structured data from user message.
 */
async function extractFromMessage(message, existingSymptoms) {
  const prompt = `Analyze this patient message and extract structured data.

Patient says: "${message}"
Already known symptoms: ${existingSymptoms.length > 0 ? existingSymptoms.join(', ') : 'none yet'}

Respond ONLY with JSON:
{
  "newSymptoms": ["list of NEW symptoms mentioned, if any"],
  "severity": "mild|moderate|severe|unknown",
  "duration": "duration mentioned or empty string",
  "bodyArea": "body area mentioned or empty string",
  "requestedDate": "if patient mentions wanting an appointment on a specific date, extract it, else empty",
  "requestedSlot": "if patient mentions a time preference, extract it, else empty",
  "isAskingForDoctor": true/false,
  "isGreeting": true/false,
  "isNonMedical": true/false
}`;

  try {
    const raw = await callHuggingFace(prompt);
    const parsed = extractFirstJsonObject(raw);
    return parsed || { newSymptoms: [], severity: 'unknown', duration: '', bodyArea: '', requestedDate: '', requestedSlot: '', isAskingForDoctor: false, isGreeting: false, isNonMedical: false };
  } catch (err) {
    console.error('Extract from message failed:', err.message);
    return { newSymptoms: [message], severity: 'unknown', duration: '', bodyArea: '', requestedDate: '', requestedSlot: '', isAskingForDoctor: false, isGreeting: false, isNonMedical: false };
  }
}

/**
 * Use AI to analyze symptoms and suggest possible conditions.
 * NEVER presents as definitive diagnosis.
 */
async function analyzeSymptoms(symptoms, metadata) {
  const prompt = `You are a cautious medical assistant. Based on these symptoms, provide a preliminary analysis.

Symptoms: ${symptoms.join(', ')}
Duration: ${metadata.duration || 'not specified'}
Severity: ${metadata.severity || 'not specified'}
Body area: ${metadata.bodyArea || 'not specified'}

IMPORTANT: Do NOT provide a definitive diagnosis. Present everything as possibilities.
If you are uncertain, say so explicitly.

Respond ONLY with JSON:
{
  "possibleConditions": ["condition1 (note: this is a possibility, not a diagnosis)", "condition2"],
  "recommendedSpeciality": "type of specialist to consult",
  "confidenceNote": "a brief note about the confidence level and why professional evaluation is important",
  "precautions": ["precaution1", "precaution2", "precaution3"],
  "urgency": "low|moderate|high"
}`;

  try {
    const raw = await callHuggingFace(prompt);
    const parsed = extractFirstJsonObject(raw);
    if (!parsed) {
      return {
        possibleConditions: ['Unable to determine — please consult a doctor'],
        recommendedSpeciality: 'General Physician',
        confidenceNote: 'AI analysis was inconclusive. Please see a healthcare professional for proper evaluation.',
        precautions: ['Consult a doctor', 'Monitor your symptoms', 'Stay hydrated and rest'],
        urgency: 'moderate',
      };
    }
    return parsed;
  } catch (err) {
    console.error('Symptom analysis failed:', err.message);
    return {
      possibleConditions: ['Unable to analyze — AI service temporarily unavailable'],
      recommendedSpeciality: 'General Physician',
      confidenceNote: 'Analysis could not be completed. Please consult a healthcare professional.',
      precautions: ['Seek medical advice', 'Rest', 'Monitor symptoms'],
      urgency: 'moderate',
    };
  }
}

/**
 * Search for doctors using MongoDB Atlas Vector Search.
 * Falls back to text-based search if vector search is not configured.
 */
export async function searchDoctors(query, options = {}) {
  const { speciality, requestedDate, limit = 5 } = options;

  try {
    // Try vector search first
    const queryEmbedding = await generateEmbedding(query);

    const pipeline = [
      {
        $vectorSearch: {
          index: 'doctor_vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: limit * 2, // Fetch more for filtering
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

    // Add speciality filter if provided
    if (speciality) {
      pipeline.push({
        $match: { speciality: { $regex: new RegExp(speciality, 'i') } },
      });
    }

    pipeline.push({ $limit: limit });

    let doctors = await doctorEmbeddingModel.aggregate(pipeline);

    // If vector search returned results, enrich with live availability
    if (doctors.length > 0) {
      const doctorIds = doctors.map((d) => d.doctorId);
      const liveDoctors = await doctorModel
        .find({ _id: { $in: doctorIds } })
        .select('available slot_booked fees');

      const liveMap = new Map(liveDoctors.map((d) => [d._id.toString(), d]));

      doctors = doctors
        .map((d) => {
          const live = liveMap.get(d.doctorId?.toString());
          if (!live) return null;
          return {
            ...d,
            available: live.available,
            fees: live.fees,
            slot_booked: requestedDate ? (live.slot_booked?.[requestedDate] || []) : undefined,
            hasAvailability: requestedDate
              ? live.available && (!live.slot_booked?.[requestedDate] || live.slot_booked[requestedDate].length < 20)
              : live.available,
          };
        })
        .filter(Boolean);

      // Filter to only available doctors if date is specified
      if (requestedDate) {
        doctors = doctors.filter((d) => d.hasAvailability);
      }

      return doctors.slice(0, limit);
    }
  } catch (err) {
    console.warn('Vector search failed, falling back to text search:', err.message);
  }

  // Fallback: basic text search on doctor model
  const filter = { available: true };
  if (speciality) {
    filter.speciality = { $regex: new RegExp(speciality, 'i') };
  }

  const fallbackDoctors = await doctorModel
    .find(filter)
    .select('-password -email')
    .limit(limit);

  return fallbackDoctors.map((d) => ({
    doctorId: d._id,
    name: d.name,
    speciality: d.speciality,
    degree: d.degree,
    experience: d.experience,
    fees: d.fees,
    address: d.address,
    image: d.image,
    available: d.available,
    hasAvailability: true,
  }));
}

/**
 * Main message processing function.
 * Orchestrates the full RAG pipeline for a single user message.
 */
export async function processMessage(userId, message, sessionId = null) {
  // Input validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { error: 'Message cannot be empty' };
  }
  const trimmedMessage = message.trim().slice(0, 2000); // Limit input length

  // 1. Emergency screening — always first
  const emergency = screenForEmergency(trimmedMessage);
  if (emergency.isEmergency) {
    // Update session if exists
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

  // 2. Get or create session
  let session;
  if (sessionId) {
    session = await chatbotSessionModel.findOne({ _id: sessionId, userId, active: true });
    if (!session) {
      session = await chatbotSessionModel.create({ userId, phase: 'greeting' });
    }
  } else {
    session = await getOrCreateSession(userId);
  }

  // 3. Extract structured data from message
  const extracted = await extractFromMessage(trimmedMessage, session.symptoms);

  // Handle non-medical / greeting
  if (extracted.isGreeting && session.symptoms.length === 0) {
    session.phase = 'greeting';
    await session.save();
    return {
      type: 'greeting',
      sessionId: session._id,
      message: "Hello! 👋 I'm your AI Health Assistant. I can help you understand your symptoms and find the right doctor.\n\nPlease describe what you're experiencing, and I'll guide you through some questions to better understand your situation.\n\n⚠️ *Remember: I provide suggestions for reference only, not medical diagnoses. Always consult a healthcare professional.*",
    };
  }

  if (extracted.isNonMedical && session.symptoms.length === 0) {
    return {
      type: 'non_medical',
      sessionId: session._id,
      message: "I'm designed to help with health-related questions. Could you describe any symptoms or health concerns you're experiencing? I can help find the right specialist for you.",
    };
  }

  // 4. Update session with new data
  if (extracted.newSymptoms?.length > 0) {
    const newUnique = extracted.newSymptoms.filter(
      (s) => !session.symptoms.includes(s)
    );
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

  // 5. Determine if we need more info or can analyze
  const followUps = pickFollowUps(session);
  const shouldAnalyze = extracted.isAskingForDoctor || session.symptoms.length >= 3 || followUps.length === 0;

  if (!shouldAnalyze && followUps.length > 0) {
    // Ask follow-up questions
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

  // 6. Analyze symptoms
  session.phase = 'analyzing';
  await session.save();

  const analysis = await analyzeSymptoms(session.symptoms, session.metadata);

  session.analysis = {
    possibleConditions: analysis.possibleConditions || [],
    recommendedSpeciality: analysis.recommendedSpeciality || 'General Physician',
    confidenceNote: analysis.confidenceNote || '',
  };

  // 7. Search for doctors using RAG
  session.phase = 'recommending';
  const searchQuery = `${session.symptoms.join(' ')} ${analysis.recommendedSpeciality || ''}`;
  const doctors = await searchDoctors(searchQuery, {
    speciality: analysis.recommendedSpeciality,
    requestedDate: session.metadata.requestedDate,
    limit: 5,
  });

  session.recommendedDoctors = doctors.map((d) => d.doctorId || d._id);
  session.phase = 'completed';
  session.active = false;
  await session.save();

  // 8. Build response
  let responseMessage = '## 🔬 Health Assessment\n\n';
  responseMessage += '> ⚠️ **Important:** This is an AI-assisted assessment, NOT a medical diagnosis. Please consult a healthcare professional for proper evaluation.\n\n';

  // Possible conditions
  if (analysis.possibleConditions?.length > 0) {
    responseMessage += '**Possible conditions to discuss with your doctor:**\n';
    analysis.possibleConditions.forEach((c) => {
      responseMessage += `• ${c}\n`;
    });
    responseMessage += '\n';
  }

  // Confidence note
  if (analysis.confidenceNote) {
    responseMessage += `📋 *${analysis.confidenceNote}*\n\n`;
  }

  // Precautions
  if (analysis.precautions?.length > 0) {
    responseMessage += '**Precautions:**\n';
    analysis.precautions.forEach((p) => {
      responseMessage += `• ${p}\n`;
    });
    responseMessage += '\n';
  }

  // Doctor recommendation
  responseMessage += `**Recommended specialist:** ${analysis.recommendedSpeciality || 'General Physician'}\n\n`;

  // Urgency
  if (analysis.urgency === 'high') {
    responseMessage += '🔴 **Urgency: High** — Please see a doctor as soon as possible.\n\n';
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
    symptoms: session.symptoms,
  };
}

