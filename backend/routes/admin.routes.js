import express from 'express'
import { addDoctor,addLab,addMedicine,adminDashboard,allDoctors,appointmentAdmin,appointmentCancel,approveDoctor,getHireDoctor,loginAdmin, medicineList, rejectDoctor, setHireData} from '../controllers/admin.controller.js'
import upload from '../middleware/multer.middleware.js'
import authAdmin from '../middleware/authAdmin.middlewares.js'
import { changeAvailability } from '../controllers/doctor.controller.js'

const adminRouter = express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/appointments',authAdmin,appointmentAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)
adminRouter.post('/add-medicine',authAdmin,upload.single('image'),addMedicine)
adminRouter.get('/medicine-list',medicineList)
adminRouter.post('/hire-doctor',upload.single('photo'),setHireData)
adminRouter.get('/get-hireDoctor',authAdmin,getHireDoctor)
adminRouter.post('/reject-doctor',authAdmin,rejectDoctor)
adminRouter.post('/hireDoctor-add',authAdmin,approveDoctor)
adminRouter.post('/add-lab',authAdmin,addLab)

export default adminRouter