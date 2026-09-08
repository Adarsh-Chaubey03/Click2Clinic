import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});
const consultationModel = mongoose.model('Consultation', consultationSchema);
export default consultationModel; 
