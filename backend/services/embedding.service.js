/**
 * Hugging Face embeddings used by MongoDB Atlas Vector Search.
 *
 * The configured model is the only source of vectors written to or queried
 * from the Atlas index. If it is unavailable, callers must use text search;
 * unrelated local vectors must never be mixed into this index.
 */

const EMBEDDING_DIM = 384;
const HF_EMBEDDING_MODEL =
  process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
const HF_ROUTER_ORIGIN =
  process.env.HF_ROUTER_ORIGIN || 'https://router.huggingface.co';
const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_BASE ||
  `${HF_ROUTER_ORIGIN.replace(/\/$/, '')}/hf-inference`;

async function tryHFEmbedding(text) {
  if (!process.env.HUGGING_API_KEY) return null;

  const url = `${HF_INFERENCE_BASE.replace(/\/$/, '')}/models/${encodeURIComponent(HF_EMBEDDING_MODEL)}`;
  try {
    const response = await fetch(url, {
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

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.warn(`HF embedding request failed (${response.status}): ${body.slice(0, 150)}`);
      return null;
    }
    const data = await response.json();
    const embedding = Array.isArray(data) && Array.isArray(data[0])
      ? data[0]
      : data;

    if (
      !Array.isArray(embedding) ||
      embedding.length !== EMBEDDING_DIM ||
      embedding.some((value) => typeof value !== 'number' || !Number.isFinite(value))
    ) {
      console.warn(`HF embedding dimension mismatch; expected ${EMBEDDING_DIM}`);
      return null;
    }

    return embedding;
  } catch (error) {
    console.warn('HF embedding request failed:', error.message);
    return null;
  }
}

export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Input text for embedding must be a non-empty string');
  }

  const embedding = await tryHFEmbedding(text.trim());
  if (embedding) return embedding;

  const error = new Error(
    'Hugging Face embeddings are unavailable; MongoDB text search is required until the service recovers'
  );
  error.code = 'EMBEDDING_UNAVAILABLE';
  throw error;
}

export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const results = [];
  for (const text of texts) results.push(await generateEmbedding(text));
  return results;
}

export function buildDoctorProfileText(doctor) {
  const parts = [];
  if (doctor.name) parts.push(`Dr. ${doctor.name}`);
  if (doctor.speciality) parts.push(`Speciality: ${doctor.speciality}`);
  if (doctor.degree) parts.push(`Degree: ${doctor.degree}`);
  if (doctor.experience) parts.push(`Experience: ${doctor.experience}`);
  if (doctor.about) parts.push(`About: ${doctor.about}`);
  if (doctor.fees) parts.push(`Consultation fee: ${doctor.fees}`);
  if (doctor.address) {
    const address = typeof doctor.address === 'object'
      ? [doctor.address.line1, doctor.address.line2].filter(Boolean).join(', ')
      : String(doctor.address);
    if (address) parts.push(`Location: ${address}`);
  }
  return parts.join('. ') || 'Doctor profile';
}
