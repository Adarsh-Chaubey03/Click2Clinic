#!/usr/bin/env node

/**
 * generate-doctor-embeddings.js
 *
 * Script to generate and store vector embeddings for all doctors.
 * Run this after adding/updating doctors, or on a schedule.
 *
 * Usage:
 *   node scripts/generate-doctor-embeddings.js
 *
 * Requires:
 *   - MONGODB_URI in .env
 *   - HUGGING_API_KEY in .env
 *   - HF_EMBEDDING_MODEL in .env (defaults to sentence-transformers/all-MiniLM-L6-v2)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import doctorModel from '../models/doctor.models.js';
import doctorEmbeddingModel from '../models/doctorEmbedding.model.js';
import {
  generateEmbedding,
  buildDoctorProfileText,
} from '../services/embedding.service.js';

const BATCH_SIZE = 5; // Process in small batches to avoid rate limits
const DELAY_MS = 1000; // Delay between batches

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
    console.error('❌ HUGGING_API_KEY is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const doctors = await doctorModel.find({}).select('-password');
  console.log(`📋 Found ${doctors.length} doctors`);

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
      try {
        const profileText = buildDoctorProfileText(doctor);
        console.log(`  📝 [${i + batch.indexOf(doctor) + 1}/${doctors.length}] ${doctor.name} — generating embedding...`);

        const embedding = await generateEmbedding(profileText);

        const existingDoc = await doctorEmbeddingModel.findOne({ doctorId: doctor._id });

        if (existingDoc) {
          // Update existing embedding
          existingDoc.profileText = profileText;
          existingDoc.embedding = embedding;
          existingDoc.speciality = doctor.speciality;
          existingDoc.available = doctor.available;
          existingDoc.name = doctor.name;
          existingDoc.degree = doctor.degree;
          existingDoc.experience = doctor.experience;
          existingDoc.fees = doctor.fees;
          existingDoc.address = doctor.address;
          existingDoc.image = doctor.image;
          await existingDoc.save();
          updated++;
        } else {
          // Create new embedding document
          await doctorEmbeddingModel.create({
            doctorId: doctor._id,
            profileText,
            embedding,
            speciality: doctor.speciality,
            available: doctor.available,
            name: doctor.name,
            degree: doctor.degree,
            experience: doctor.experience,
            fees: doctor.fees,
            address: doctor.address,
            image: doctor.image,
          });
          created++;
        }

        console.log(`  ✅ ${doctor.name} — done (${embedding.length}-dim)`);
      } catch (err) {
        console.error(`  ❌ ${doctor.name} — failed: ${err.message}`);
        failed++;
      }
    }

    // Rate-limit delay between batches
    if (i + BATCH_SIZE < doctors.length) {
      console.log(`  ⏳ Waiting ${DELAY_MS}ms before next batch...`);
      await sleep(DELAY_MS);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Total:   ${doctors.length}`);

  // Verify count
  const embCount = await doctorEmbeddingModel.countDocuments();
  console.log(`\n📦 Total embeddings in database: ${embCount}`);

  // Clean up orphaned embeddings (doctors that no longer exist)
  const doctorIds = doctors.map((d) => d._id);
  const orphaned = await doctorEmbeddingModel.deleteMany({
    doctorId: { $nin: doctorIds },
  });
  if (orphaned.deletedCount > 0) {
    console.log(`🗑️ Removed ${orphaned.deletedCount} orphaned embeddings`);
  }

  console.log('\n✅ Done! Next steps:');
  console.log('1. Create a MongoDB Atlas Vector Search index named "doctor_vector_index"');
  console.log('   on the "doctor_embeddings" collection with this configuration:');
  console.log('   {');
  console.log('     "fields": [');
  console.log('       { "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" },');
  console.log('       { "type": "filter", "path": "speciality" },');
  console.log('       { "type": "filter", "path": "available" }');
  console.log('     ]');
  console.log('   }');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

