import { useContext } from "react"
import Login from "./pages/Login.jsx"
import { ToastContainer} from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import {AdminContext} from './context/AdminContext.jsx'
import Navbar from "./components/Navbar.jsx"
import SideBar from "./components/SideBar.jsx"
import { Route, Routes } from "react-router-dom"
import Dashboard from './pages/Admin/Dashboard.jsx'
import Appointment from './pages/Admin/Appointment.jsx'
import AddDoctor from './pages/Admin/AddDoctor.jsx'
import DoctorList from './pages/Admin/DoctorsList.jsx'
import { DoctorContext } from "./context/DoctorContext.jsx"
import DoctorDashboard from "./pages/Doctor/DoctorDashboard.jsx"
import DoctorAppointment from "./pages/Doctor/DoctorAppointment.jsx"
import DoctorProfile from "./pages/Doctor/DoctorProfile.jsx"
import AddMedicine from "./pages/Admin/AddMedicine.jsx"
import Orders from "./pages/Admin/Orders.jsx"
import LabReport from "./pages/Doctor/LabReport.jsx"
import AiPrescription from "./pages/Doctor/AiPrescription.jsx"
import VerifyDoctor from './pages/Admin/VerifyDoctor.jsx'
import Consultation from "./pages/Doctor/Consultation.jsx"
import AddLab from "./pages/Admin/AddLab.jsx"
import SkinReviewDashboard from "./pages/Doctor/SkinReviewDashboard.jsx"
const App = () => {

  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)
  return aToken || dToken ? (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9FD]">
    <ToastContainer/>
    <Navbar/>
    <div className="flex items-start overflow-x-hidden">
      <SideBar/>
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Routes>
        {/*Admin routes */}
          <Route path='/' element={<></>}/>
          <Route path='/admin-dashboard' element={<Dashboard/>}/>
          <Route path='/all-appointments' element={<Appointment/>}/>
          <Route path='/add-doctor' element={<AddDoctor/>}/>
          <Route path='/doctor-list' element={<DoctorList/>}/>
          <Route path='/add-medicine' element={<AddMedicine/>}/>
          <Route path='/order' element={<Orders/>}/>
          <Route path='/hire-doctor' element={<VerifyDoctor/>}/>
          <Route path="/add-lab" element={<AddLab/>}/>
        
        {/*Doctor routes */}
        <Route path='/doctor-dashboard' element={<DoctorDashboard/>}/>
        <Route path='/doctor-appointments' element={<DoctorAppointment/>}/>
        <Route path='/doctor-profile' element={<DoctorProfile/>}/>
        <Route path='/lab-report' element={<LabReport/>}/>
        <Route path='/ai-prescription' element={<AiPrescription/>}/>
        <Route path="/consult" element={<Consultation/>}/>
        <Route path="/skin-reviews" element={<SkinReviewDashboard/>}/>
        </Routes>
      </main>

    </div>
    </div>
  ):(
    <>
      <Login/>
      <ToastContainer/>
    </>
  )
}

export default App
