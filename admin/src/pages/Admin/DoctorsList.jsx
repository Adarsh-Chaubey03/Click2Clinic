// import React from 'react'

import { useContext, useEffect } from "react"
import {AdminContext} from '../../context/AdminContext.jsx'
// import {assets} from '../../assets/assets.js'
const DoctorsList = () => {
  const {doctors,aToken,getAllDoctors,changeAvailability} = useContext(AdminContext)
  
  useEffect(()=>{
    if(aToken){
      getAllDoctors()
    }
  },[aToken])

  return (
    <div className="w-full min-w-0 max-h-[90vh] overflow-y-auto p-3 sm:p-5">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="grid w-full grid-cols-1 gap-4 gap-y-6 pt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {
          doctors.map((item,index)=>(
            <div 
            className="group min-w-0 overflow-hidden rounded-xl border border-indigo-200 bg-white"
            key={index}>
              <img
              className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
               src={item.image} alt="" />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">{item.name}</p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input 
                onChange={()=> changeAvailability(item._id)}
                type="checkbox" checked={item.available} />
                <p>Available</p>
              </div>
            </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DoctorsList
