// import React from 'react'
import {AppContext} from '../../context/AppContext.jsx'
import { useContext, useEffect } from "react"
import {AdminContext} from '../../context/AdminContext.jsx'
import {assets} from '../../assets/assets.js'
const Appointment = () => {
  
  const {aToken,appointments,getAllAppointments,cancelAppointment} = useContext(AdminContext)
  const {calculateAge,slotDateFormat,currency} = useContext(AppContext)
 

  useEffect(()=>{
    if(aToken){
      getAllAppointments()
    }
  },[aToken])

  return (
    <div className="w-full min-w-0 max-w-6xl p-3 sm:p-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="min-h-[60vh] max-h-[80vh] overflow-y-auto rounded border bg-white text-sm">
      
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fee</p>
          <p>Action</p>
        </div>
      
      {appointments.map((item,index)=>(
        <div 
        className="grid grid-cols-1 gap-3 border-b px-4 py-3 text-gray-500 hover:bg-gray-50 sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] sm:items-center sm:gap-1 sm:px-6"
        key={index}>
        <p className="max-sm:hidden">{index+1}</p>
        <div className="flex min-w-0 items-center gap-2">
          <img className="w-8 rounded-full" src={item.userData.image} alt="" /> 
          <div>
            <p>{item.patientData?.name || item.userData.name}</p>
            {item.patientData?.relation && <p className="text-xs text-gray-400">({item.patientData.relation})</p>}
          </div>
        </div>
        <p className='max-sm:hidden'>{item.patientData?.age || calculateAge(item.userData.dob)}</p>
        <p>{slotDateFormat(item.slotData)}, {item.slotTime}</p>
        <div className="flex min-w-0 items-center gap-2">
          <img className="w-8 rounded-full bg-gray-200" src={item.docData.image} alt="" /> <p>{item.docData.name}</p>
        </div>
        <p>{currency}{item.amount}</p>
        {
          item.cancelled ?
          <p className='text-red-400 text-xs font-medium'>cancelled</p>:
          item.isCompleted ? <p className='text-green-500 text-xs font-medium'> Completed</p>
          :
          <img 
          onClick={()=> cancelAppointment(item._id)}
        className='w-10 cursor-pointer'
        src={assets.cancel_icon} alt="" />
        }
        
        
        </div>
      ))}

      </div>

    </div>
  )
}

export default Appointment
