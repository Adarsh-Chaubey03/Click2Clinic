/**
 * embedding.service.js
 *
 * Gemini-powered embeddings for MongoDB Atlas Vector Search.
 *
 * Model  : text-embedding-004  (Google Gemini)
 * Dims   : 768
 * Replaces: Hugging Face sentence-transformers/all-MiniLM-L6-v2 (384-dim)
 *
 * ⚠️  If you previously had a 384-dim Atlas Vector Search index, you MUST
 *     delete it and recreate it with numDimensions: 768, then re-run:
 *       npm run generate-embeddings
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export const EMBEDDING_DIM = 3072;
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment');
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a 768-dimensional embedding vector via Gemini text-embedding-004.
 * Throws with code EMBEDDING_UNAVAILABLE if the API call fails so callers
 * can fall back to MongoDB keyword text search.
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text for embedding must be a non-empty string');
  }

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });

    const result = await model.embedContent({
      content: { parts: [{ text: text.trim() }], role: 'user' },
      taskType: 'RETRIEVAL_DOCUMENT',
    });

    const embedding = result?.embedding?.values;

    if (
      !Array.isArray(embedding) ||
      embedding.length !== EMBEDDING_DIM ||
      embedding.some((v) => typeof v !== 'number' || !Number.isFinite(v))
    ) {
      throw new Error(
        `Gemini embedding dimension mismatch: expected ${EMBEDDING_DIM}, got ${embedding?.length}`
      );
    }

    return embedding;
  } catch (err) {
    console.warn('Gemini embedding request failed:', err.message);
    const error = new Error(
      'Gemini embeddings are unavailable; MongoDB text search is required until the service recovers'
    );
    error.code = 'EMBEDDING_UNAVAILABLE';
    error.cause = err;
    throw error;
  }
}

/**
 * Generate a query embedding (uses RETRIEVAL_QUERY task type for better
 * semantic matching against RETRIEVAL_DOCUMENT vectors stored in Atlas).
 */
export async function generateQueryEmbedding(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text for query embedding must be a non-empty string');
  }

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });

    const result = await model.embedContent({
      content: { parts: [{ text: text.trim() }], role: 'user' },
      taskType: 'RETRIEVAL_QUERY',
    });

    const embedding = result?.embedding?.values;

    if (
      !Array.isArray(embedding) ||
      embedding.length !== EMBEDDING_DIM ||
      embedding.some((v) => typeof v !== 'number' || !Number.isFinite(v))
    ) {
      throw new Error(
        `Gemini query embedding dimension mismatch: expected ${EMBEDDING_DIM}, got ${embedding?.length}`
      );
    }

    return embedding;
  } catch (err) {
    console.warn('Gemini query embedding request failed:', err.message);
    const error = new Error(
      'Gemini embeddings are unavailable; MongoDB text search is required until the service recovers'
    );
    error.code = 'EMBEDDING_UNAVAILABLE';
    error.cause = err;
    throw error;
  }
}

/**
 * Batch-generate embeddings for multiple texts.
 * Processes sequentially to avoid rate limits.
 */
export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const results = [];
  for (const text of texts) {
    results.push(await generateEmbedding(text));
  }
  return results;
}

/**
 * Build a rich plain-text profile for a doctor to embed.
 * Uses verified DB fields only — no synthetic data.
 */
export function buildDoctorProfileText(doctor) {
  const parts = [];

  const name = doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
  if (doctor.name) parts.push(name);
  if (doctor.speciality) parts.push(`Speciality: ${doctor.speciality}`);
  if (doctor.degree) parts.push(`Degree: ${doctor.degree}`);
  if (doctor.experience) parts.push(`Experience: ${doctor.experience}`);
  if (doctor.about) parts.push(`About: ${doctor.about}`);
  if (doctor.fees) parts.push(`Consultation fee: ${doctor.fees}`);
  if (doctor.address) {
    const address =
      typeof doctor.address === 'object'
        ? [doctor.address.line1, doctor.address.line2].filter(Boolean).join(', ')
        : String(doctor.address);
    if (address) parts.push(`Location: ${address}`);
  }

  return parts.join('. ') || 'Doctor profile';
}
