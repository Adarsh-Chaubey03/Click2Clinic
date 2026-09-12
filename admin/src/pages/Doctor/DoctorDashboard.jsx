import { useContext, useEffect } from "react"
import {DoctorContext} from '../../context/DoctorContext.jsx'
import {assets} from '../../assets/assets.js'
import {AppContext} from '../../context/AppContext.jsx'
import { FaNotesMedical } from "react-icons/fa"

const DoctorDashboard = () => {
 
  const {dToken,dashData,getDashData,cancelAppointment,completeAppointment} = useContext(DoctorContext)
  const {slotDateFormat} = useContext(AppContext)
  useEffect(()=>{
    if(dToken){
      getDashData()
    }
  },[dToken])

  return dashData && (
    <div className="w-full min-w-0 p-3 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex min-w-0 items-center gap-2 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
            <img className="w-14" src={assets.earning_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
              ₹{dashData.earning}
              </p>
              <p className="text-gray-400">Earnings</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
            <img className="w-14" src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.appointments}
              </p>
              <p className="text-gray-400">Appointments</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
            <img className="w-14" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.patients}
              </p>
              <p className="text-gray-400">Patients</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-4 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center">
              <FaNotesMedical className="text-3xl text-indigo-500" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.pendingSkinReviews || 0}
              </p>
              <p className="text-gray-400">Skin Reviews</p>
            </div>
          </div>
        </div>
      {/* latest booking*/}
        <div className="min-w-0 bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold">Latest Bookings</p>
          </div>

          <div className="pt-4 border border-t-0">
            {dashData.latestAppointments.map((item, index) => (
              <div 
              className="flex min-w-0 items-center gap-3 px-4 py-3 hover:bg-gray-100 sm:px-6"
              key={index}>
                <img 
                className="rounded-full w-10"
                src={item.userData.image} alt="" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-gray-800 font-medium">
                    {item.patientData?.name || item.userData.name}
                    {item.patientData?.relation && <span className="text-xs text-gray-500 ml-1">({item.patientData.relation})</span>}
                  </p>
                  <p className="text-gray-600">{slotDateFormat(item.slotData)}</p>
                </div>
                {
              item.cancelled ?
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
              : item.isCompleted
              ? <p className="text-green-500 text-xs font-medium">Completed</p>
            : <div className="flex">
              <img onClick={()=> cancelAppointment(item._id)} className="w-10 cursor-pointer" src={assets.cancel_icon} alt="" />
              <img onClick={()=> completeAppointment(item._id)} className="w-10 cursor-pointer" src={assets.tick_icon} alt="" />
            </div>
              
            }
              </div>
            ))}
          </div>
        </div>

    </div>
  )
}

export default DoctorDashboard
