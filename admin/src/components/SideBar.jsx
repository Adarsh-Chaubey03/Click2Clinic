// import React from 'react'
import {assets} from '../assets/assets.js'
import { useContext } from "react"
import {NavLink} from 'react-router-dom'
import {AdminContext} from '../context/AdminContext.jsx'
import { DoctorContext } from '../context/DoctorContext.jsx'
import { FaVideo ,FaFileMedical, FaFlask } from 'react-icons/fa';
const SideBar = () => {
 
  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)
  return (
    <div className='min-h-screen w-16 shrink-0 overflow-y-auto border-r bg-white md:w-72'>
      {
        aToken && <ul className='text-[#515151] mt-5'>
          <NavLink
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
           to='/admin-dashboard'>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/all-appointments'>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>Appointments</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/hire-doctor'>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>Verify Doctor</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/order'>
            <img className='w-[24px]' src={assets.order_icon} alt="" />
            <p className='hidden md:block'>Orders</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/add-doctor'>
            <img src={assets.add_icon} alt="" />
            <p className='hidden md:block'>Add Doctor</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/doctor-list'>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>Doctors List</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/add-medicine'>
            <svg 
    width="20"  
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
>
    <path 
        d="M16.24 7.76L7.76 16.24C6.69 17.31 5.1 17.83 3.54 17.54C2.31 17.32 1.32 16.33 1.1 15.1C0.81 13.54 1.33 11.95 2.4 10.88L10.88 2.4C11.95 1.33 13.54 0.81 15.1 1.1C16.33 1.32 17.32 2.31 17.54 3.54C17.83 5.1 17.31 6.69 16.24 7.76Z" 
        stroke="black" 
        strokeWidth="2"
    />
    <path 
        d="M14 10L10 14" 
        stroke="black" 
        strokeWidth="2"
    />
    <path 
        d="M19 12V16M21 14H17" 
        stroke="black" 
        strokeWidth="2" 
        strokeLinecap="round"
    />
</svg>

            <p className='hidden md:block'>Add medicine</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/add-lab'>
            <FaFlask/>
            <p className='hidden md:block'>Add-Lab</p>
          </NavLink>
        </ul>
      }

      {
        dToken && <ul className='text-[#515151] mt-5'>
          <NavLink
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
           to='/doctor-dashboard'>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/doctor-appointments'>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>Appointments</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/lab-report'>
            <img className='w-6' src={assets.lab_icon} alt="" />
            <p className='hidden md:block'>Lab Report</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/ai-prescription'>
            <FaFileMedical/>
            <p className='hidden md:block'>AI-Prescript</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/doctor-profile'>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>Profile</p>
          </NavLink>
          <NavLink 
          className={({isActive})=>`flex items-center justify-center gap-3 py-3.5 px-3 md:justify-start md:px-9 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary':''}`}
          to='/consult'>
            <FaVideo/>
            <p className='hidden md:block'>Consultation</p>
          </NavLink>
        </ul>
      }
    </div>
  )
} 

export default SideBar
