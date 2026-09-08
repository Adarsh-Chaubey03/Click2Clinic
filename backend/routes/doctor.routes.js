import express from 'express'
import authDoctor from '../middleware/authDoctor.middlewares.js'
import {appointmentCancel, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorList, doctorProfile, getDocData, getSkinReviews, loginDoctor, submitSkinEvaluation, updataDoctorProfile} from '../controllers/doctor.controller.js'
const doctorRouter = express.Router()


doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updataDoctorProfile)
doctorRouter.get('/getDocData',getDocData)

// Skin Review Routes
doctorRouter.get('/skin-reviews',authDoctor,getSkinReviews)
doctorRouter.post('/submit-skin-evaluation',authDoctor,submitSkinEvaluation)

export default doctorRouter