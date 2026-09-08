import consultationModel from "../models/consultationModel.js";
import doctorModel from "../models/doctor.models.js";
import userModel from "../models/user.models.js";
import appointmentModel from "../models/appointment.models.js";

const initiateConsultation = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("Initiate consultation request:", {
      userId,
      headers: req.headers,
    });

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const doctorId = req.body.docId;

    // Validate user and doctor
    const user = await userModel.findById(userId);
    const doctor = await doctorModel.findById(doctorId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Validate appointment
    const appointment = await appointmentModel.findOne({
      userId,
      docId: doctorId,
    });
    if (!appointment) {
      return res
        .status(403)
        .json({ message: "No valid appointment with this user" });
    }

    // Create consultation
    const consultation = new consultationModel({
      userId,
      doctorId,
      status: "pending",
    });
    await consultation.save();

    // Emit consultation request via Socket.IO
    req.app
      .get("io")
      .to(userId.toString())
      .emit("consultation-request", {
        doctorName: doctor.name || "Dr. Unknown",
        roomId: consultation._id.toString(),
        doctorId: doctorId, // Assuming req.user contains doctor ID
      });
    res
      .status(201)
      .json({
        success: true,
        consultationId: consultation._id,
        message: "Consultation request sent",
      });
  } catch (error) {
    console.error("Error in initiateConsultation:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to initiate consultation" });
  }
};

const joinConsultation = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log("Join consultation request:", {
      roomId,
      userId: req.body.userId,
    });

    if (!req.body.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or missing token" });
    }

    const userId = req.body.userId;
    const consultation = await consultationModel.findById(roomId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (
      consultation.userId.toString() !== userId.toString() &&
      consultation.doctorId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    consultation.status = "active";
    await consultation.save();

    // Notify both parties
    req.app.get("io").to(consultation.userId.toString()).emit("call-accepted", {
      doctorId: consultation.doctorId.toString(),
      roomId: consultation._id.toString(),
    });
    req.app
      .get("io")
      .to(consultation.doctorId.toString())
      .emit("call-accepted", {
        userId: consultation.userId.toString(),
        roomId: consultation._id.toString(),
      });

    res
      .status(200)
      .json({ roomId: consultation._id, message: "Joined consultation" });
  } catch (error) {
    console.error("Error in joinConsultation:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to join consultation" });
  }
};

export { initiateConsultation, joinConsultation };
   

