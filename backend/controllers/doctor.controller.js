import doctorModel from '../models/doctor.models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointment.models.js'
import skinReviewModel from '../models/skinReview.model.js'
import { v2 as cloudinary } from 'cloudinary'
const changeAvailability = async (req,res) => {
    try {
        
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})

        res.json({success:true,message:'availability changed'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
    
}

const doctorList = async(req,res)=>{
    try {
        const doctors = await doctorModel.find({}).select(['-password','-email'])

        res.json({success:true,doctors})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for doctor login
const loginDoctor = async (req,res) => {
    try {
       const {email,password} = req.body

       const doctor = await doctorModel.findOne({email})

       if(!doctor){
        return res.json({success:false,message:"invalid credentials"})
       }
       const isMatch = await bcrypt.compare(password,doctor.password)

       if(isMatch){

        const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)

        res.json({success:true,token})
       }else{
        res.json({success:false,message:"invalid credentials"})
       }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})   
    }
}

//API to get doctor appointments for doctor panel

const appointmentsDoctor = async (req,res) => {
    try {
        const {docId} = req.body

        const appointments = await appointmentModel.find({docId})

        res.json({success:true,appointments})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})       
    }
}
//API to mark appointments completed for doctor panel
const appointmentComplete = async (req,res) => {
    try {
        const {docId,appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId , {isCompleted:true})

            return res.json({success:true,message:"Appointment Completed"})
        }
        else{
            return res.json({success:false,message:"Mark failed"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})       
    }
}

//API to cancel the appointments for doctor panel
const appointmentCancel = async (req,res) => {
    try {
        const {docId,appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.docId === docId){
            await appointmentModel.findByIdAndUpdate(appointmentId , {cancelled:true})

            return res.json({success:true,message:"Appointment Cancelled"})
        }
        else{
            return res.json({success:false,message:"Cancellation failed"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})       
    }
}

//API to get dashboard data for doctor panel

const doctorDashboard = async (req,res) => {
    try {
        const {docId} = req.body

        const appointments = await appointmentModel.find({docId})

        let earning = 0;
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earning+=item.amount
            }
        })

        let patients = []

        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData = {
            earning,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5),
        }

        // Count pending skin reviews for this doctor
        const pendingSkinReviews = await skinReviewModel.countDocuments({
            docId: docId,
            status: { $in: ['pending', 'in_review'] },
            payment: true,
        })
        dashData.pendingSkinReviews = pendingSkinReviews

        res.json({success:true,dashData})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})       
    }
}

//API to get doctor profile for doctor panel

const doctorProfile = async (req,res) => {
    try {
        const {docId} = req.body
        const profileData = await doctorModel.find({_id:docId}).select('-password')

        res.json({success:true,profileData})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})   
    }
}

//API to update doctor profile data from Doctor Panel
const updataDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available, password, lattitude, longitude } = req.body;

        const updateFields = { fees, address, available, lattitude, longitude };

        // Only update password if provided
        if (password) {
            if (password.length < 8) {
                return res.json({
                    success: false,
                    message: "Poor password. Try a stronger one.",
                });
            }
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        await doctorModel.findByIdAndUpdate(docId, updateFields, { new: true });

        res.json({ success: true, message: "Profile updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// get doctor data for api
const getDocData = async (req, res) => {
    try {
      const doctors = await doctorModel.find({}, "name speciality address lattitude longitude");
      res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

// API to get skin reviews assigned to a doctor
const getSkinReviews = async (req, res) => {
    try {
        const { docId } = req.body
        const reviews = await skinReviewModel.find({ docId, payment: true }).sort({ createdAt: -1 })
        res.json({ success: true, reviews })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor to submit skin evaluation
const submitSkinEvaluation = async (req, res) => {
    try {
        const { docId, reviewId, diagnosis, notes, severity, recommendation, flagType } = req.body

        const review = await skinReviewModel.findById(reviewId)
        if (!review) {
            return res.json({ success: false, message: 'Review not found' })
        }
        if (review.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized: This review is not assigned to you' })
        }

        const newStatus = flagType ? 'flagged' : 'completed'

        await skinReviewModel.findByIdAndUpdate(reviewId, {
            status: newStatus,
            doctorEvaluation: {
                diagnosis: diagnosis || '',
                notes: notes || '',
                severity: severity || '',
                recommendation: recommendation || '',
                flagType: flagType || '',
                reviewedAt: new Date(),
            },
        })

        // Cleanup: delete the skin image from Cloudinary after doctor reviews
        if (review.imageUrl) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = review.imageUrl.split('/')
                const fileWithExt = urlParts[urlParts.length - 1]
                const publicId = 'skin_reviews/' + fileWithExt.split('.')[0]
                await cloudinary.uploader.destroy(publicId)
            } catch (cleanupErr) {
                console.error('Cloudinary cleanup error:', cleanupErr.message)
            }
        }

        res.json({ success: true, message: 'Evaluation submitted successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updataDoctorProfile,
    getDocData,
    getSkinReviews,
    submitSkinEvaluation,
}