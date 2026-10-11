/**
 * Quick smoke test for the Gemini API key.
 * Run: node tests/test-gemini.js
 */
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// ── Test 1: Chat ──────────────────────────────────────────────────
console.log('=== TEST 1: Gemini Chat (gemini-1.5-flash) ===');
try {
  const chatModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const result = await chatModel.generateContent('Reply with exactly: {"status":"ok"}');
  const text = result.response.text().trim();
  console.log('Response:', text);
  console.log('✅ CHAT: OK\n');
} catch (e) {
  console.log('❌ CHAT FAILED:', e.message, '\n');
}

// ── Test 2: Embeddings ────────────────────────────────────────────
console.log('=== TEST 2: Gemini Embeddings (text-embedding-004) ===');
try {
  const embModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const res = await embModel.embedContent({
    content: { parts: [{ text: 'headache and fever' }], role: 'user' },
    taskType: 'RETRIEVAL_DOCUMENT',
  });
  const vec = res.embedding.values;
  console.log('Vector dims  :', vec.length);
  console.log('Sample values:', vec.slice(0, 3).map((v) => v.toFixed(4)).join(', '));
  console.log('✅ EMBEDDING: OK\n');
} catch (e) {
  console.log('❌ EMBEDDING FAILED:', e.message, '\n');
}
