/**
 * embedding.service.js
 *
 * Generates text embeddings using Hugging Face's Inference API.
 * Uses sentence-transformers/all-MiniLM-L6-v2 (384-dim) by default.
 * This is SEPARATE from the text-generation model used for chat.
 */

const HF_EMBEDDING_MODEL =
  process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

const HF_ROUTER_ORIGIN =
  process.env.HF_ROUTER_ORIGIN || 'https://router.huggingface.co';

const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_BASE ||
  `${HF_ROUTER_ORIGIN.replace(/\/$/, '')}/hf-inference`;

/**
 * Generate an embedding vector for a single text string.
 * @param {string} text - Input text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
export async function generateEmbedding(text) {
  if (!process.env.HUGGING_API_KEY) {
    throw new Error('HUGGING_API_KEY is required for embedding generation');
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text for embedding must be a non-empty string');
  }

  const url = `${HF_INFERENCE_BASE.replace(/\/$/, '')}/models/${encodeURIComponent(HF_EMBEDDING_MODEL)}`;

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
    throw new Error(
      `Embedding API error (${resp.status}): ${errBody.slice(0, 200)}`
    );
  }

  const data = await resp.json();

  // Response shape varies — handle both flat array and nested
  let embedding;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    // Nested: [[0.1, 0.2, ...]]
    embedding = data[0];
  } else if (Array.isArray(data) && typeof data[0] === 'number') {
    // Flat: [0.1, 0.2, ...]
    embedding = data;
  } else {
    throw new Error('Unexpected embedding response shape');
  }

  if (embedding.length !== 384) {
    console.warn(
      `Embedding dimension mismatch: expected 384, got ${embedding.length}`
    );
  }

  return embedding;
}

/**
 * Generate embeddings for multiple texts (batched).
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  // HF API supports batch inputs
  if (!process.env.HUGGING_API_KEY) {
    throw new Error('HUGGING_API_KEY is required for embedding generation');
  }

  const url = `${HF_INFERENCE_BASE.replace(/\/$/, '')}/models/${encodeURIComponent(HF_EMBEDDING_MODEL)}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGING_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: texts.map((t) => t.trim()),
      options: { wait_for_model: true },
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '');
    throw new Error(
      `Embedding API error (${resp.status}): ${errBody.slice(0, 200)}`
    );
  }

  const data = await resp.json();

  // Batch response: [[0.1, ...], [0.2, ...], ...]
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data;
  }

  throw new Error('Unexpected batch embedding response shape');
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

