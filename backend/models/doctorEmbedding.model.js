import mongoose, { Schema } from 'mongoose';

/**
 * DoctorEmbedding — stores vector embeddings of doctor profiles
 * for MongoDB Atlas Vector Search.
 *
 * Each document mirrors a doctor record with a 3072-dim embedding
 * built from Gemini gemini-embedding-001 using verified fields
 * (name, speciality, degree, experience, about).
 */
const doctorEmbeddingSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'doctor',
      required: true,
      unique: true,
      index: true,
    },
    /** The text that was embedded */
    profileText: {
      type: String,
      required: true,
    },
    /** 3072-dimensional vector from Gemini gemini-embedding-001 */
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.length === 3072,
        message: 'Embedding must be 3072-dimensional',
      },
    },
    /** Denormalized fields for filtering in vector search */
    speciality: { type: String, required: true },
    available: { type: Boolean, default: true },
    name: { type: String, required: true },
    degree: { type: String, default: '' },
    experience: { type: String, default: '' },
    fees: { type: Number, default: 0 },
    address: { type: Object, default: {} },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

const doctorEmbeddingModel =
  mongoose.models.doctor_embedding || mongoose.model('doctor_embedding', doctorEmbeddingSchema);

export default doctorEmbeddingModel;

