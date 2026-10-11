#!/usr/bin/env node

/**
 * generate-doctor-embeddings.js
 *
 * Generate and store 768-dim Gemini vector embeddings for all doctors.
 * Run this after adding/updating doctors, or on a schedule.
 *
 * Usage:
 *   node scripts/generate-doctor-embeddings.js
 *   (or: npm run generate-embeddings)
 *
 * Embedding strategy:
 *   Uses Gemini text-embedding-004 (768-dim) exclusively.
 *   A failed embedding must NOT write an incompatible vector into the Atlas index.
 *
 * Requires:
 *   - MONGODB_URI in .env
 *   - GEMINI_API_KEY in .env
 *
 * ⚠️  If you previously used Hugging Face (384-dim) embeddings, you MUST:
 *     1. Delete the old Atlas Vector Search index "doctor_vector_index"
 *     2. Re-create it with numDimensions: 768  (see IMPLEMENTATION.md)
 *     3. Re-run this script
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import doctorModel from '../models/doctor.models.js';
import doctorEmbeddingModel from '../models/doctorEmbedding.model.js';
import { generateEmbedding, buildDoctorProfileText, EMBEDDING_DIM } from '../services/embedding.service.js';

const BATCH_SIZE = 5;
const DELAY_MS = 600; // slight delay to respect Gemini free-tier rate limits

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔗 Connecting to MongoDB...');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is required to generate Gemini embeddings');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
  console.log(`📐 Embedding model: Gemini gemini-embedding-001 (${EMBEDDING_DIM}-dim)\n`);

  const doctors = await doctorModel.find({}).select('-password');
  console.log(`📋 Found ${doctors.length} doctors\n`);

  if (doctors.length === 0) {
    console.log('⚠️  No doctors found in database. Nothing to embed.');
    await mongoose.disconnect();
    return;
  }

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < doctors.length; i += BATCH_SIZE) {
    const batch = doctors.slice(i, i + BATCH_SIZE);

    for (const doctor of batch) {
      const idx = i + batch.indexOf(doctor) + 1;
      try {
        const profileText = buildDoctorProfileText(doctor);
        process.stdout.write(
          `  📝 [${idx}/${doctors.length}] ${doctor.name} — generating embedding...`
        );

        const embedding = await generateEmbedding(profileText);

        const embData = {
          profileText,
          embedding,
          speciality: doctor.speciality,
          available: doctor.available,
          name: doctor.name,
          degree: doctor.degree || '',
          experience: doctor.experience || '',
          fees: doctor.fees || 0,
          address: doctor.address || {},
          image: doctor.image || '',
        };

        const existingDoc = await doctorEmbeddingModel.findOne({ doctorId: doctor._id });
        if (existingDoc) {
          Object.assign(existingDoc, embData);
          await existingDoc.save();
          updated++;
        } else {
          await doctorEmbeddingModel.create({ doctorId: doctor._id, ...embData });
          created++;
        }

        console.log(` ✅ done (${embedding.length}-dim)`);
      } catch (err) {
        console.log('');
        console.error(`  ❌ ${doctor.name} — failed: ${err.message}`);
        failed++;
      }
    }

    if (i + BATCH_SIZE < doctors.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Created : ${created}`);
  console.log(`  Updated : ${updated}`);
  console.log(`  Failed  : ${failed}`);
  console.log(`  Total   : ${doctors.length}`);

  const embCount = await doctorEmbeddingModel.countDocuments();
  console.log(`\n📦 Total embeddings in database: ${embCount}`);

  // Clean up orphaned embeddings
  const doctorIds = doctors.map((d) => d._id);
  const orphaned = await doctorEmbeddingModel.deleteMany({
    doctorId: { $nin: doctorIds },
  });
  if (orphaned.deletedCount > 0) {
    console.log(`🗑️  Removed ${orphaned.deletedCount} orphaned embeddings`);
  }

  console.log('\n✅ Done!\n');
  console.log('─────────────────────────────────────────────────────');
  console.log('Next step: Update (or recreate) the MongoDB Atlas Vector Search index.');
  console.log('Index name  : vector_index');
  console.log('Collection  : doctor_embeddings');
  console.log('numDimensions: 3072   ← changed from 384 (Hugging Face) to 3072 (Gemini)');
  console.log('similarity  : cosine');
  console.log('See IMPLEMENTATION.md for the full index JSON.\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
