import bcrypt from "bcrypt";
import userModel from "../models/user.models.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctor.models.js";
import appointmentModel from "../models/appointment.models.js";
import { createCanvas } from "canvas";
import cartModel from "../models/cart.model.js";
import medicineModel from '../models/medicine.models.js'
import razorpay from 'razorpay'
import labModel from "../models/labModel.js";
import labAppointmentModel from "../models/LabAppointmen.models.js";
import mongoose from "mongoose";
import axios from "axios";
import { getBookableSlotTimes } from "../services/chatbot.service.js";
//API to register user

// Hugging Face Router:
// - OpenAI-compatible chat: https://router.huggingface.co/v1/chat/completions
// - HF Inference-style models: https://router.huggingface.co/hf-inference/models/{model}
const HF_ROUTER_ORIGIN = process.env.HF_ROUTER_ORIGIN || "https://router.huggingface.co";
const HF_INFERENCE_BASE = process.env.HF_INFERENCE_BASE || `${HF_ROUTER_ORIGIN.replace(/\/$/, "")}/hf-inference`;

const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || "";
const HUGGINGFACE_FALLBACK_MODELS = process.env.HUGGINGFACE_FALLBACK_MODELS || "";

const parseModelList = (value) => {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/\r?\n|\s*,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
};

// A small, practical default set. Actual availability depends on your enabled HF Inference Providers.
const DEFAULT_HF_MODELS = [
  "meta-llama/Meta-Llama-3-8B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
  "meta-llama/Llama-3.2-3B-Instruct",
  "Qwen/Qwen2.5-7B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

const getModelCandidates = () => {
  const candidates = [
    ...parseModelList(HUGGINGFACE_MODEL),
    ...parseModelList(HUGGINGFACE_FALLBACK_MODELS),
    ...DEFAULT_HF_MODELS,
  ];

  const seen = new Set();
  return candidates.filter((m) => {
    if (!m) return false;
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });
};

const extractFirstJsonObject = (text) => {
  if (!text || typeof text !== "string") return null;

  const cleaned = text.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through
  }

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = cleaned.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

const normalizeToStringArray = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value !== "string") return [];

  const s = value.trim();
  if (!s) return [];

  if (s.includes(". ")) {
    return s.split(/(?<=\.)\s+/).map((x) => x.trim()).filter(Boolean);
  }

  return s
    .split(/\r?\n|\s*;\s*|\s*,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
};

const generateHuggingFaceJson = async ({ prompt }) => {
  if (!process.env.HUGGING_API_KEY) {
    const err = new Error("HUGGING_API_KEY is missing in environment variables");
    err.statusCode = 500;
    throw err;
  }

  const modelCandidates = getModelCandidates();

  const retryAfterHeaderToSeconds = (headerValue) => {
    if (!headerValue) return null;
    const asNumber = Number(headerValue);
    if (!Number.isNaN(asNumber) && asNumber > 0) return asNumber;
    return null;
  };

  const makeHttpError = async (resp, requestUrl, modelTried) => {
    const retryAfterSeconds = retryAfterHeaderToSeconds(resp.headers.get("retry-after"));
    const errBody = await resp.text().catch(() => "");
    let parsed;
    try {
      parsed = errBody ? JSON.parse(errBody) : undefined;
    } catch {
      parsed = undefined;
    }
    const hfCode = parsed?.error?.code || parsed?.code;
    const hfMessage = parsed?.error?.message || parsed?.message;
    const err = new Error(hfMessage || errBody || `Hugging Face request failed (${resp.status})`);
    err.statusCode = resp.status;
    err.retryAfterSeconds = retryAfterSeconds;
    err.requestUrl = requestUrl;
    err.modelTried = modelTried;
    err.hfCode = hfCode;
    err.hfRaw = errBody;
    throw err;
  };

  const isModelNotSupported = (err) => {
    const code = err?.hfCode || err?.code;
    if (code === "model_not_supported") return true;
    const msg = String(err?.message || "").toLowerCase();
    return msg.includes("model_not_supported") || msg.includes("not supported by any provider");
  };

  const isAuthOrPlanError = (err) => {
    const status = err?.statusCode;
    if (status === 401 || status === 403) return true;
    const msg = String(err?.message || "").toLowerCase();
    return msg.includes("insufficient permissions") || msg.includes("inference providers");
  };

  const headers = {
    Authorization: `Bearer ${process.env.HUGGING_API_KEY}`,
    "Content-Type": "application/json",
  };

  const tryParseToJson = (rawText) => {
    const json = extractFirstJsonObject(rawText);
    if (!json) {
      const err = new Error("Invalid JSON response from Hugging Face model");
      err.statusCode = 502;
      err.raw = rawText;
      throw err;
    }
    return json;
  };

  let lastError;

  // Prefer HF Inference-style endpoint first (most widely supported)
  for (const model of modelCandidates) {
    const modelUrl = `${HF_INFERENCE_BASE.replace(/\/$/, "")}/models/${encodeURIComponent(model)}`;
    try {
      const resp = await fetch(modelUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 768,
            temperature: 0.2,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          },
        }),
      });

      if (!resp.ok) {
        await makeHttpError(resp, modelUrl, model);
      }

      const data = await resp.json();
      const generated = Array.isArray(data) ? data?.[0]?.generated_text : data?.generated_text;
      if (typeof generated === "string" && generated.trim()) {
        return tryParseToJson(generated);
      }
      return tryParseToJson(JSON.stringify(data));
    } catch (err) {
      if (isAuthOrPlanError(err)) throw err;
      if (isModelNotSupported(err)) {
        lastError = err;
        continue;
      }
      lastError = err;
      // non-model-related failure: keep for now, but we still may succeed via chat endpoint
      break;
    }
  }

  // Fallback: OpenAI-compatible chat completions (NOTE: no /hf-inference prefix)
  const chatUrl = `${HF_ROUTER_ORIGIN.replace(/\/$/, "")}/v1/chat/completions`;
  for (const model of modelCandidates) {
    try {
      const resp = await fetch(chatUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 768,
        }),
      });

      if (!resp.ok) {
        await makeHttpError(resp, chatUrl, model);
      }

      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        return tryParseToJson(JSON.stringify(data));
      }
      return tryParseToJson(text);
    } catch (err) {
      if (isAuthOrPlanError(err)) throw err;
      if (isModelNotSupported(err)) {
        lastError = err;
        continue;
      }
      lastError = err;
      break;
    }
  }

  const finalErr = new Error(lastError?.message || "Hugging Face request failed");
  finalErr.statusCode = lastError?.statusCode || 500;
  finalErr.retryAfterSeconds = lastError?.retryAfterSeconds;
  finalErr.requestUrl = lastError?.requestUrl;
  throw finalErr;
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !password || !email) {
      return res.json({ success: false, message: "missing details" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password" });
    }
    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = await userModel(userData);

    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API for user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API for getuser data

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//API for update profile

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender, familyMembers } = req.body;
    const imageFile = req.files?.image?.[0] || null;
    const labFile = req.files?.labFile?.[0] || null;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data missing" });
    }

    let parsedFamilyMembers = [];
    if (familyMembers) {
      try {
        parsedFamilyMembers = JSON.parse(familyMembers);
      } catch (e) {
        parsedFamilyMembers = [];
      }
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
      familyMembers: parsedFamilyMembers,
    });

    if (labFile && !labFile.path) {
      return res.status(500).json({ success: false, message: "Lab file path not available" });
    }
    if (imageFile && !imageFile.path) {
      return res.status(500).json({ success: false, message: "Image file path not available" });
    }

    if (labFile) {
      const labUpload = await cloudinary.uploader.upload(labFile.path, {
        resource_type: "image",
        folder: "lab_reports",
      });
      const labUrl = labUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { labFile: labUrl });
    }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
        folder: "profile_images",
      });
      const imageUrl = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Update profile error:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to book an appointment

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotData, slotTime, patientData } = req.body;

    if (!/^\d{1,2}_\d{1,2}_\d{4}$/.test(slotData) || typeof slotTime !== "string" || !slotTime.trim()) {
      return res.json({
        success: false,
        message: "Invalid appointment slot.",
      });
    }

    // Fetch doctor data
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    const generatedSlots = getBookableSlotTimes(docData, slotData);
    if (!generatedSlots.includes(slotTime)) {
      return res.json({ success: false, message: "Invalid or expired appointment slot." });
    }

    const existingSlot = await appointmentModel.findOne({
      docId,
      slotData,
      slotTime,
      cancelled: { $ne: true },
    });
    if (existingSlot) {
      return res.json({ success: false, message: "Slot already booked by another user." });
    }

    // Atomically claim the slot so two users cannot book it concurrently.
    const claimedDoctor = await doctorModel.findOneAndUpdate(
      {
        _id: docId,
        available: true,
        [`slot_booked.${slotData}`]: { $ne: slotTime },
      },
      { $addToSet: { [`slot_booked.${slotData}`]: slotTime } },
      { new: true }
    ).select("-password");

    if (!claimedDoctor) {
      return res.json({ success: false, message: "Slot already booked by another user." });
    }

    const userData = await userModel.findById(userId).select("-password");

    // Default patientData to userData if not provided
    const finalPatientData = patientData || userData;

    const appointmentData = {
      userId,
      docId,
      userData,
      patientData: finalPatientData,
      docData,
      amount: docData.fees,
      slotTime,
      slotData,
      date: Date.now(),
    };

    try {
      const newAppointment = new appointmentModel(appointmentData);
      await newAppointment.save();
      return res.json({
        success: true,
        message: "Appointment booked successfully",
        appointmentId: newAppointment._id,
      });
    } catch (error) {
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slot_booked.${slotData}`]: slotTime },
      });
      throw error;
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//api to get user appointment for frontend my-appointment page

const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//API to cancel appointment

const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user

    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing doctor slot

    const { docId, slotData, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slot_booked = doctorData.slot_booked;
    // console.log(slot_booked)
    slot_booked[slotData] = slot_booked[slotData].filter((e) => e !== slotTime);
    // console.log(slot_booked)
    await doctorModel.findByIdAndUpdate(docId, { slot_booked });

    await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { $set: { "docData.slot_booked": slot_booked } }, // ✅ Correct way to update nested object
      { new: true } // ✅ Ensures you get the updated document
    );
    const up = await appointmentModel.findById(appointmentId);
    // console.log(up)

    res.json({ success: true, message: "appointment cancelled" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET
})

//API to make payment of appointment using razorpay

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData || appointmentData.cancelled == true) {
      return res.json({ success: false, message: "Appointment cancelled or not found" })
    }

    // creating options for razorpay Payments

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    }

    // creation of an order

    const order = await razorpayInstance.orders.create(options)

    res.json({ success: true, order })

  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message });
  }
}

// const paymentRazorpay = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;

//     // Fetch appointment data from database
//     const appointmentData = await appointmentModel.findById(appointmentId);

//     if (!appointmentData || appointmentData.cancelled) {
//       return res.json({
//         success: false,
//         message: "Appointment cancelled or not found",
//       });
//     }

//     // Dummy Razorpay-like response
//     const dummyOrder = {
//       id: `order_${Date.now()}`,
//       entity: "order",
//       amount: appointmentData.amount * 100, // Convert to paise
//       currency: "INR",
//       receipt: appointmentId,
//       status: "created",
//     };

//     res.json({ success: true, order: dummyOrder });
//   } catch (error) {
//     console.log(error);
//     return res.json({ success: false, message: error.message });
//   }
// };

// API to verify payment of razorpay
// const verifyRazorpay = async (req,res) => {
//     try {
//         const {razorpay_order_id} = req.body
//         const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

//         console.log(orderInfo)
//     } catch (error) {

//     }
// }
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
    if (orderInfo.status == 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
      res.json({ success: true, message: "Payment Successful" })
    }
    else {
      res.json({ success: false, message: "Payment failed!" })
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};
const chatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "No symptoms provided" });
    }

    const prompt = `User symptoms: ${message}

Task:
- Predict ONLY one most likely disease (best-effort).
- Provide exactly 3 precaution points and exactly 3 cure/treatment points.
- Suggest the type of doctor to consult.

If the input is not related to medical diagnosis, respond ONLY with:
{ "error": "Input not related to medical diagnosis" }

Otherwise respond ONLY with:
{ "disease": "", "precaution": ["", "", ""], "cure": ["", "", ""], "recommendedDoctor": "" }
`;

    const diagnosis = await generateHuggingFaceJson({ prompt });

    if (diagnosis?.error) {
      return res.json({ success: false, message: String(diagnosis.error) });
    }

    const normalized = {
      disease: String(diagnosis?.disease || "Unknown").trim() || "Unknown",
      precaution: normalizeToStringArray(diagnosis?.precaution).slice(0, 3),
      cure: normalizeToStringArray(diagnosis?.cure).slice(0, 3),
      recommendedDoctor: String(diagnosis?.recommendedDoctor || "General Physician").trim() || "General Physician",
    };

    // Keep a safe fallback shape
    if (normalized.precaution.length < 3) {
      normalized.precaution = ["Consult a doctor", "Monitor symptoms", "Stay hydrated"];
    }
    if (normalized.cure.length < 3) {
      normalized.cure = ["Seek medical advice", "Rest", "Follow prescribed treatment"];
    }

    return res.json({ success: true, response: normalized });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    if (statusCode === 429 && error?.retryAfterSeconds) {
      res.set("Retry-After", String(error.retryAfterSeconds));
    }
    console.error("chatbotResponse error:", error?.message || error, "url:", error?.requestUrl);
    return res.status(statusCode).json({
      success: false,
      message: (statusCode === 429)
        ? "Hugging Face rate limit reached. Please retry shortly."
        : ("Server error occurred: " + (error?.message || "Unknown error")),
      error: undefined,
      retryAfterSeconds: error?.retryAfterSeconds || undefined,
      requestUrl: error?.requestUrl || undefined,
    });
  }
};
//API to get verify user is submitted lab report or not
const verifyLab = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId); // Use findById instead of find

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const labFile = userData.labFile;
    if (!labFile) {
      return res.json({ success: false, message: "Lab file not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error occurred." });
  }
};
const generateAndSavePrescription = async (req, res) => {
  try {
    const { userId, docId, prescriptionDetails } = req.body;

    // Fetch doctor details
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Fetch user details (patient)
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 1: Create Prescription Template
    const canvas = createCanvas(800, 1000);
    const ctx = canvas.getContext("2d");

    // Background (White with subtle gradient)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header (Gradient with Clinic Name and Logo Placeholder)
    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, "#2B6CB0");
    gradient.addColorStop(1, "#3182CE");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 100);

    // Clinic Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px Helvetica";
    ctx.textAlign = "left";
    ctx.fillText("Click2Clinic", 40, 60);

    // Logo Placeholder (Circle with Medical Symbol)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(740, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2B6CB0";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✚", 740, 60);

    // Divider Line
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(760, 120);
    ctx.stroke();

    // Clinic & Doctor Details
    let y = 160;
    ctx.fillStyle = "#1A202C";
    ctx.font = "bold 18px Helvetica";
    ctx.textAlign = "left";
    ctx.fillText("Clinic Details", 40, y);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#4A5568";
    ctx.fillText(doctor.address.line1 || "1234 Health Street, City", 40, (y += 25));
    ctx.fillText(doctor.phone || "+91 123-456-7890", 40, (y += 20));
    ctx.fillText(` ${doctor.name}, ${doctor.speciality}`, 40, (y += 20));

    // Date (Right-aligned)
    ctx.fillStyle = "#2B6CB0";
    ctx.font = "bold 16px Helvetica";
    ctx.textAlign = "right";
    ctx.fillText(`Date: ${new Date().toDateString()}`, 760, 160);

    // Patient Details Section
    y += 40;
    ctx.fillStyle = "#1A202C";
    ctx.font = "bold 18px Helvetica";
    ctx.textAlign = "left";
    ctx.fillText("Patient Details", 40, y);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#4A5568";
    ctx.fillText(`Name: ${user.name}`, 40, (y += 25));
    ctx.fillText(`Date of Birth: ${user.dob || "N/A"}`, 40, (y += 20));
    ctx.fillText(`Address: ${user.address.line1 || "N/A"}`, 40, (y += 20));

    // Divider Line
    ctx.strokeStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.moveTo(40, (y += 20));
    ctx.lineTo(760, y);
    ctx.stroke();

    // Prescription Section
    y += 40;
    ctx.fillStyle = "#1A202C";
    ctx.font = "bold 18px Helvetica";
    ctx.fillText("Prescription", 40, y);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#4A5568";
    ctx.fillText(`Medication: ${prescriptionDetails.medication}`, 40, (y += 25));
    ctx.fillText(`Dosage: ${prescriptionDetails.dosage}`, 40, (y += 20));
    ctx.fillText(`Quantity: ${prescriptionDetails.quantity}`, 40, (y += 20));
    ctx.fillText(`Refills: ${prescriptionDetails.refills}`, 40, (y += 20));

    // Instructions Section
    y += 40;
    ctx.fillStyle = "#1A202C";
    ctx.font = "bold 18px Helvetica";
    ctx.fillText("Instructions", 40, y);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#4A5568";
    ctx.fillText("Take as prescribed by your physician.", 40, (y += 25));
    ctx.fillText("Contact your doctor for any concerns.", 40, (y += 20));

    // Footer (Signature and Clinic Info)
    ctx.strokeStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.moveTo(40, 900);
    ctx.lineTo(760, 900);
    ctx.stroke();

    ctx.fillStyle = "#1A202C";
    ctx.font = "italic 16px Helvetica";
    ctx.textAlign = "right";
    ctx.fillText(`${doctor.name}`, 760, 940);
    ctx.fillStyle = "#2B6CB0";
    ctx.beginPath();
    ctx.moveTo(600, 950);
    ctx.lineTo(760, 950);
    ctx.stroke();

    ctx.fillStyle = "#4A5568";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Click2Clinic | www.click2clinic.com | support@click2clinic.com", 40, 940);

    // Convert Canvas to Buffer
    const imageBuffer = canvas.toBuffer("image/jpeg");

    // Step 2: Upload Image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", format: "jpg" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(imageBuffer);
    });

    if (!result.secure_url) {
      return res
        .status(500)
        .json({ error: "Failed to upload prescription image" });
    }

    // Step 3: Save Image URL to MongoDB (Linked to User)
    await userModel.findByIdAndUpdate(userId, {
      prescription: result.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Prescription generated and saved successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error generating prescription:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserId = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "user id not fetched" });
    }
    const userId = user._id;
    return res.json({ success: true, userId });
  } catch (error) {
    console.error("Error generating prescription:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



const getLabData = async (req, res) => {
  try {
    const labData = await labModel.find()
    if (!labData) {
      res.json({ success: false, message: "failed to fetch lab data" })
    }

    res.json({ success: true, labData })

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const bookLabAppointment = async (req, res) => {
  try {
    const { labId } = req.body;
    const userId = req.body.userId;
    const labdata = await labModel.findById(labId)
    const userdata = await userModel.findById(userId)
    if (!userdata) {
      res.json({ success: false, message: "failed to fetch user data" })
    }
    const appointmentData = {
      userData: userdata,
      labData: labdata
    }

    const labAppointment = new labAppointmentModel(appointmentData)
    await labAppointment.save()

    res.json({ success: true, message: "Appointment Booked", appointmentId: labAppointment._id })

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const getUserAppointment = async (req, res) => {
  try {
    const userId = req.body.userId;

    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // ✅ Convert string to ObjectId for querying
    const userLabAppointments = await labAppointmentModel.find({
      "userData._id": new mongoose.Types.ObjectId(userId),
    });

    return res.status(200).json({ success: true, appointments: userLabAppointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const paymentLabRazorpay = async (req, res) => {
  try {
    const { labId } = req.body

    const LabappointmentData = await labAppointmentModel.findById(labId)

    if (!LabappointmentData || LabappointmentData.cancelled == true) {
      return res.json({ success: false, message: "Appointment cancelled or not found" })
    }

    // creating options for razorpay Payments

    const options = {
      amount: LabappointmentData.labData.price * 100,
      currency: process.env.CURRENCY,
      receipt: labId,
    }

    // creation of an order

    const order = await razorpayInstance.orders.create(options)

    res.json({ success: true, order })

  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message });
  }
}

const verifyLabRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
    if (orderInfo.status == 'paid') {
      await labAppointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
      res.json({ success: true, message: "Payment Successful" })
    }
    else {
      res.json({ success: false, message: "Payment failed!" })
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const cancelLabAppointment = async (req, res) => {
  try {
    const { labId } = req.body;
    const userId = req.body.userId
    const LabappointmentData = await labAppointmentModel.findById(labId);

    // verify appointment user

    if (!LabappointmentData.userData._id.equals(userId)) {
      return res.json({ success: false, message: "unauthorized action" });
    }


    await labAppointmentModel.findByIdAndUpdate(labId, {
      isCancelled: true,
    });


    res.json({ success: true, message: "LabAppointment Cancelled" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};


const addToCart = async (req, res) => {
  try {
    const { medicineId } = req.body;
    const userId = req.body.userId; // Use authenticated userId from middleware

    // Validate medicineId
    if (!medicineId) {
      return res.status(400).json({ success: false, message: 'Medicine ID is required' });
    }

    // Check if medicine exists and is available
    const medicine = await medicineModel.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    if (!medicine.available) {
      return res.status(400).json({ success: false, message: 'Medicine is out of stock' });
    }

    // Find or create cart for the user
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, items: [], totalPrice: 0 });
    }

    // Check if medicine is already in cart
    const existingItemIndex = cart.items.findIndex(item => item.medicineId.toString() === medicineId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += 1;
    } else {
      cart.items.push({
        medicineId,
        name: medicine.name,
        image: medicine.image,
        quantity: 1,
        priceAtPurchase: medicine.price,
      });
    }

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ success: true, message: 'Added to cart successfully', cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCartData = async (req, res) => {
  try {
    const userId = req.body.userId; // Use authenticated user ID from middleware

    const cartItem = await cartModel.findOne({ userId });
    if (!cartItem) {
      return res.status(200).json({ success: true, cart: null, message: "No cart found for this user" });
    }

    return res.status(200).json({ success: true, cart: cartItem, message: "Cart retrieved successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const cancelCart = async (req, res) => {
  try {
    const { medicineId } = req.body;
    const userId = req.body.userId; // Assuming user ID is available from authentication middleware

    // Find the user's cart
    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      item => item.medicineId.toString() === medicineId && !item.cancelled
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart or already cancelled'
      });
    }

    // Mark the item as cancelled
    cart.items[itemIndex].cancelled = true;

    // Save the cart (this will trigger the pre-save middleware to update totalPrice)
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item cancelled successfully',
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  chatbotResponse,
  verifyLab,
  generateAndSavePrescription,
  getUserId,
  getLabData,
  bookLabAppointment,
  getUserAppointment,
  paymentLabRazorpay,
  verifyLabRazorpay,
  cancelLabAppointment,
  addToCart,
  getCartData,
  cancelCart,
};
