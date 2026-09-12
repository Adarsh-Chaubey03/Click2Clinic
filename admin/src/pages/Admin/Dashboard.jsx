// import React from 'react'

import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";
import {useNavigate} from 'react-router-dom'
import { OrderContext } from "../../context/OrderContext.jsx";
const Dashboard = () => {
  const {
    aToken,
    getDashData,
    cancelAppointment,
    dashData,
    getAllAppointments,
  } = useContext(AdminContext);

  const { slotDateFormat } = useContext(AppContext);
  const {orderCount} = useContext(OrderContext)
  const navigate = useNavigate()
  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  useEffect(() => {
    if (aToken) getAllAppointments();
  }, [aToken]);

  return (
    dashData && (
      <div className="w-full min-w-0 p-3 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div onClick={()=> navigate('/doctor-list')} className="flex min-w-0 items-center gap-2 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
            <img className="w-14" src={assets.doctor_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.doctors}
              </p>
              <p className="text-gray-400">Doctors</p>
            </div>
          </div>

          <div onClick={()=> navigate('/all-appointments')} className="flex min-w-0 items-center gap-2 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
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

          <div onClick={()=> navigate('/order')} className="flex min-w-0 items-center gap-2 rounded border-2 border-gray-100 bg-white p-4 cursor-pointer transition-all hover:scale-[1.02]">
            <img className="w-14" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {orderCount}
              </p>
              <p className="text-gray-400">orders</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold">Latest Bookings</p>
          </div>

          <div className="pt-4 border border-t-0">
            {dashData.latestAppointments.map((item, index) => (
              <div
                className="flex min-w-0 items-center gap-3 px-4 py-3 hover:bg-gray-100 sm:px-6"
                key={index}
              >
                <img
                  className="rounded-full w-10"
                  src={item.docData.image}
                  alt=""
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-gray-800 font-medium">
                    {item.docData.name}
                  </p>
                  <p className="text-gray-600">
                    {slotDateFormat(item.slotData)}
                  </p>
                </div>
                {item.cancelled ? (
                  <p className="text-red-400 text-xs font-medium">cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-500 text-xs font-medium">
                    {" "}
                    Completed
                  </p>
                ) : (
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className="w-10 cursor-pointer"
                    src={assets.cancel_icon}
                    alt=""
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
