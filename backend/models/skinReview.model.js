import mongoose, { Schema } from "mongoose";

const skinReviewSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  aiPrediction: {
    type: String,
    required: true,
  },
  aiConfidence: {
    type: Number,
    required: true,
  },
  aiProbabilities: {
    type: Object,
    default: {},
  },
  status: {
    type: String,
    enum: ["pending", "in_review", "completed", "flagged"],
    default: "pending",
  },
  amount: {
    type: Number,
    default: 30,
  },
  payment: {
    type: Boolean,
    default: false,
  },
  userData: {
    type: Object,
    default: {},
  },
  docData: {
    type: Object,
    default: {},
  },
  doctorEvaluation: {
    diagnosis: { type: String, default: "" },
    notes: { type: String, default: "" },
    severity: {
      type: String,
      enum: ["", "mild", "moderate", "severe", "critical"],
      default: "",
    },
    recommendation: { type: String, default: "" },
    flagType: {
      type: String,
      enum: ["", "physical_checkup", "lab_appointment"],
      default: "",
    },
    reviewedAt: { type: Date, default: null },
  },
}, { timestamps: true });

const skinReviewModel =
  mongoose.models.skinReview || mongoose.model("skinReview", skinReviewSchema);

export default skinReviewModel;
