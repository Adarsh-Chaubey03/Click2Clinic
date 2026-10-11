/**
 * embedding.service.js
 *
 * Generates text embeddings for MongoDB Atlas Vector Search.
 *
 * Strategy:
 *   1. Try Hugging Face Inference API (sentence-transformers/all-MiniLM-L6-v2)
 *   2. If API fails (no credits, rate-limited, key missing) → fall back to
 *      local hash-based embeddings that still produce meaningful 384-dim vectors
 *
 * The local fallback uses deterministic word-hashing: similar medical texts share
 * similar word/bigram patterns, so cosine similarity still provides useful ranking.
 * When HF credits are available, re-run `npm run generate-embeddings` for better
 * semantic quality.
 */

const EMBEDDING_DIM = 384;

const HF_EMBEDDING_MODEL =
  process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

const HF_ROUTER_ORIGIN =
  process.env.HF_ROUTER_ORIGIN || 'https://router.huggingface.co';

const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_BASE ||
  `${HF_ROUTER_ORIGIN.replace(/\/$/, '')}/hf-inference`;

// ─── Local hash-based embedding (zero-cost fallback) ──────────────

/**
 * Simple but effective hash function for distributing terms across dimensions.
 * Deterministic: same string → same hash every time.
 */
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h;
}

/**
 * Tokenize text into words and bigrams for richer representation.
 */
function tokenize(text) {
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = lower.split(/\s+/).filter((w) => w.length > 1);

  // Unigrams + bigrams for better semantic capture
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }
  return tokens;
}

/**
 * Generate a 384-dimensional embedding locally using hash-based term distribution.
 *
 * How it works:
 * - Each word/bigram is hashed to a dimension index (0–383)
 * - The vector accumulates TF-like weights at those positions
 * - A second hash determines the sign (+/-) to reduce collisions
 * - The final vector is L2-normalized for cosine similarity
 *
 * This captures keyword overlap effectively — similar medical descriptions
 * (e.g., "headache fever" vs "fever headache pain") produce similar vectors.
 */
function generateLocalEmbedding(text) {
  const tokens = tokenize(text);
  const vec = new Float64Array(EMBEDDING_DIM);

  for (const token of tokens) {
    const dimHash = Math.abs(hashCode(token)) % EMBEDDING_DIM;
    const signHash = hashCode(token + '_sign');
    const sign = signHash % 2 === 0 ? 1 : -1;
    // Weight unigrams and bigrams slightly differently
    const weight = token.includes('_') ? 1.5 : 1.0;
    vec[dimHash] += sign * weight;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  const result = new Array(EMBEDDING_DIM);
  for (let i = 0; i < EMBEDDING_DIM; i++) result[i] = vec[i] / norm;

  return result;
}

// ─── HF API embedding ─────────────────────────────────────────────

async function tryHFEmbedding(text) {
  if (!process.env.HUGGING_API_KEY) {
    return null; // No key → skip silently
  }

  const url = `${HF_INFERENCE_BASE.replace(/\/$/, '')}/models/${encodeURIComponent(HF_EMBEDDING_MODEL)}`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text.trim(),
        options: { wait_for_model: true },
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      console.warn(`HF Embedding API error (${resp.status}): ${errBody.slice(0, 150)}`);
      return null; // Fall back to local
    }

    const data = await resp.json();

    let embedding;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      embedding = data[0];
    } else if (Array.isArray(data) && typeof data[0] === 'number') {
      embedding = data;
    } else {
      console.warn('Unexpected HF embedding response shape');
      return null;
    }

    return embedding;
  } catch (err) {
    console.warn('HF Embedding API call failed:', err.message);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────

/** Track which mode was used (logged once per run) */
let _loggedMode = false;

/**
 * Generate an embedding vector for a single text string.
 * Tries HF API first, falls back to local hash-based embedding.
 *
 * @param {string} text - Input text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text for embedding must be a non-empty string');
  }

  // Try HF API
  const hfResult = await tryHFEmbedding(text.trim());
  if (hfResult) {
    if (!_loggedMode) {
      console.log('📡 Using HF Inference API for embeddings');
      _loggedMode = true;
    }
    return hfResult;
  }

  // Fallback to local
  if (!_loggedMode) {
    console.log('🔧 Using local hash-based embeddings (HF API unavailable — re-run when credits available for better semantic quality)');
    _loggedMode = true;
  }
  return generateLocalEmbedding(text.trim());
}

/**
 * Generate embeddings for multiple texts.
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }
  // Process one at a time (each tries HF then falls back)
  const results = [];
  for (const t of texts) {
    results.push(await generateEmbedding(t));
  }
  return results;
}

/**
 * Build a searchable profile text from verified doctor fields.
 * NEVER fabricates data — only uses what exists in the database.
 */
export function buildDoctorProfileText(doctor) {
  const parts = [];

  if (doctor.name) parts.push(`Dr. ${doctor.name}`);
  if (doctor.speciality) parts.push(`Speciality: ${doctor.speciality}`);
  if (doctor.degree) parts.push(`Degree: ${doctor.degree}`);
  if (doctor.experience) parts.push(`Experience: ${doctor.experience}`);
  if (doctor.about) parts.push(`About: ${doctor.about}`);
  if (doctor.fees) parts.push(`Consultation fee: ${doctor.fees}`);
  if (doctor.address) {
    const addr = typeof doctor.address === 'object'
      ? [doctor.address.line1, doctor.address.line2].filter(Boolean).join(', ')
      : String(doctor.address);
    if (addr) parts.push(`Location: ${addr}`);
  }

  return parts.join('. ') || 'Doctor profile';
}

/**
 * Reset the logged-mode flag (for testing).
 */
export function _resetLoggedMode() {
  _loggedMode = false;
}
