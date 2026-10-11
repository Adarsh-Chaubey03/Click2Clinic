#!/usr/bin/env node

/**
 * generate-doctor-embeddings.js
 *
 * Script to generate and store vector embeddings for all doctors.
 * Run this after adding/updating doctors, or on a schedule.
 *
 * Usage:
 *   node scripts/generate-doctor-embeddings.js
 *   (or: npm run generate-embeddings)
 *
 * Embedding strategy:
 *   1. Tries HF Inference API (best semantic quality)
 *   2. Falls back to local hash-based embeddings if API is unavailable
 *   Both produce 384-dim vectors compatible with Atlas Vector Search.
 *
 * Requires:
 *   - MONGODB_URI in .env
 *   - HUGGING_API_KEY in .env (optional — local fallback works without it)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import doctorModel from '../models/doctor.models.js';
import doctorEmbeddingModel from '../models/doctorEmbedding.model.js';
import {
  generateEmbedding,
  buildDoctorProfileText,
} from '../services/embedding.service.js';

const BATCH_SIZE = 5;
const DELAY_MS = 500;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔗 Connecting to MongoDB...');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  if (!process.env.HUGGING_API_KEY) {
    console.warn('⚠️  HUGGING_API_KEY not set — will use local hash-based embeddings');
    console.warn('   (Re-run with a valid key for better semantic quality)\n');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const doctors = await doctorModel.find({}).select('-password');
  console.log(`📋 Found ${doctors.length} doctors\n`);

  if (doctors.length === 0) {
    console.log('⚠️ No doctors found in database. Nothing to embed.');
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
        console.log(`  📝 [${idx}/${doctors.length}] ${doctor.name} — generating embedding...`);

        const embedding = await generateEmbedding(profileText);

        const existingDoc = await doctorEmbeddingModel.findOne({ doctorId: doctor._id });

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

        if (existingDoc) {
          Object.assign(existingDoc, embData);
          await existingDoc.save();
          updated++;
        } else {
          await doctorEmbeddingModel.create({ doctorId: doctor._id, ...embData });
          created++;
        }

        console.log(`  ✅ ${doctor.name} — done (${embedding.length}-dim)`);
      } catch (err) {
        console.error(`  ❌ ${doctor.name} — failed: ${err.message}`);
        failed++;
      }
    }

    if (i + BATCH_SIZE < doctors.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Total:   ${doctors.length}`);

  const embCount = await doctorEmbeddingModel.countDocuments();
  console.log(`\n📦 Total embeddings in database: ${embCount}`);

  // Clean up orphaned embeddings
  const doctorIds = doctors.map((d) => d._id);
  const orphaned = await doctorEmbeddingModel.deleteMany({
    doctorId: { $nin: doctorIds },
  });
  if (orphaned.deletedCount > 0) {
    console.log(`🗑️ Removed ${orphaned.deletedCount} orphaned embeddings`);
  }

  console.log('\n✅ Done!');
  console.log('\nNext step: Create a MongoDB Atlas Vector Search index named "doctor_vector_index"');
  console.log('on the "doctor_embeddings" collection. See IMPLEMENTATION.md for the index JSON.\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
